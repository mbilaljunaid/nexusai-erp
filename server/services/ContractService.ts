import { db } from "../db";
import { procurementContracts, contractClauses, contractTerms, purchaseOrders } from "../../shared/schema/scm";
import { eq, and, sql } from "drizzle-orm";
import { openai } from "./ai";

export class ContractService {
    /**
     * Create a new contract header
     */
    async createContract(data: any) {
        const [contract] = await db.insert(procurementContracts).values({
            supplierId: data.supplierId,
            contractNumber: data.contractNumber,
            title: data.title,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            totalAmountLimit: data.totalAmountLimit,
            paymentTerms: data.paymentTerms,
            status: 'DRAFT'
        }).returning();
        return contract;
    }

    /**
     * Add a clause from the library to a specific contract
     */
    async addClauseToContract(contractId: string, clauseId: string, amendedText?: string) {
        const [term] = await db.insert(contractTerms).values({
            contractId,
            clauseId,
            amendedText
        }).returning();
        return term;
    }

    /**
     * List all contracts for a supplier
     */
    async listContractsBySupplier(supplierId: string) {
        return await db.select().from(procurementContracts).where(eq(procurementContracts.supplierId, supplierId));
    }

    /**
     * Get full contract details including terms and clauses
     */
    async getContractDetails(contractId: string) {
        const [contract] = await db.select().from(procurementContracts).where(eq(procurementContracts.id, contractId));
        if (!contract) return null;

        const terms = await db.select({
            id: contractTerms.id,
            amendedText: contractTerms.amendedText,
            clauseTitle: contractClauses.title,
            standardText: contractClauses.clauseText,
            category: contractClauses.category
        })
            .from(contractTerms)
            .innerJoin(contractClauses, eq(contractTerms.clauseId, contractClauses.id))
            .where(eq(contractTerms.contractId, contractId));

        return { ...contract, terms };
    }

    /**
     * AI Analysis: Compare contract text against standard library
     */
    async analyzeContractCompliance(contractId: string) {
        const contract = await this.getContractDetails(contractId);
        if (!contract || !contract.terms.length) return { riskScore: 0, flags: [] };

        const analysisResults = [];
        for (const term of contract.terms) {
            if (term.amendedText) {
                // Call OpenAI to analyze deviation
                const prompt = `Compare the following amended contract clause with the standard version and identify risks or deviations.
                Standard: ${term.standardText}
                Amended: ${term.amendedText}
                Provide a risk level (LOW, MEDIUM, HIGH) and a short explanation.`;

                try {
                    const response = await openai.chat.completions.create({
                        model: "gpt-4",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0
                    });

                    analysisResults.push({
                        clauseTitle: term.clauseTitle,
                        analysis: response.choices[0].message.content,
                        isAmended: true
                    });
                } catch (e) {
                    analysisResults.push({
                        clauseTitle: term.clauseTitle,
                        error: "AI Analysis failed",
                        isAmended: true
                    });
                }
            }
        }

        return analysisResults;
    }

    /**
     * Transactional Compliance: Validate PO against Contract limits
     */
    async validatePOCompliance(poId: string) {
        // Find PO and linked contract (assuming PO has a contractId field, if not we search by supplier)
        // For now, listing POs for a supplier and finding the active contract
        const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, poId));
        if (!po) throw new Error("PO not found");

        const [contract] = await db.select()
            .from(procurementContracts)
            .where(and(
                eq(procurementContracts.supplierId, po.supplierId),
                eq(procurementContracts.status, 'ACTIVE')
            ))
            .limit(1);

        if (!contract) return { compliant: true, message: "No active contract found" };

        const poTotal = Number(po.totalAmount || 0);
        const limit = Number(contract.totalAmountLimit || 0);

        if (limit > 0 && poTotal > limit) {
            return {
                compliant: false,
                reason: "LIMIT_BREACH",
                message: `PO amount (${poTotal}) exceeds contract limit (${limit})`
            };
        }

        return { compliant: true, message: "PO is compliant with contract terms" };
    }

    /**
     * Seed Clause Library
     */
    async seedClauseLibrary() {
        const standardClauses = [
            { title: "Net-30 Payment", category: "PAYMENT", clauseText: "Payments shall be made within thirty (30) days from the receipt of a valid invoice." },
            { title: "Confidentiality", category: "LEGAL", clauseText: "The parties shall maintain strict confidentiality regarding all business information exchanged." },
            { title: "Termination for Convenience", category: "TERMINATION", clauseText: "Either party may terminate this agreement with sixty (60) days written notice." }
        ];

        for (const clause of standardClauses) {
            const [existing] = await db.select().from(contractClauses).where(eq(contractClauses.title, clause.title));
            if (!existing) {
                await db.insert(contractClauses).values(clause);
            }
        }
    }
}

export const contractService = new ContractService();
