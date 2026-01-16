import { db } from "../db";
import { procurementContracts, contractClauses, contractTerms, purchaseOrders } from "../../shared/schema/scm";
import { eq, and, sql, desc } from "drizzle-orm";
import { openai } from "./ai";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

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
     * Get full contract details including terms, clauses, and consumption tracking
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

        // Consumption Tracking: Get linked POs and sum of totalAmount
        const linkedPOs = await db.select()
            .from(purchaseOrders)
            .where(eq(purchaseOrders.supplierId, contract.supplierId)) // In real app, we might have explicit po.contract_id
            .orderBy(desc(purchaseOrders.createdAt));

        const currentSpend = linkedPOs.reduce((acc, po) => acc + Number(po.totalAmount || 0), 0);

        return { ...contract, terms, linkedPOs, currentSpend };
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
    async validatePOCompliance(poId: string, transaction?: any) {
        const d = transaction || db;
        // Find PO and linked contract
        const [po] = await d.select().from(purchaseOrders).where(eq(purchaseOrders.id, poId));
        if (!po) throw new Error("PO not found");

        const [contract] = await d.select()
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
     * Generate PDF for a contract
     */
    async generateContractPDF(contractId: string): Promise<string> {
        const contract = await this.getContractDetails(contractId);
        if (!contract) throw new Error("Contract not found");

        const doc = new PDFDocument({ margin: 50 });
        const exportDir = path.join(process.cwd(), "uploads", "contracts");
        if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

        const fileName = `Contract_${contract.contractNumber}_${Date.now()}.pdf`;
        const filePath = path.join(exportDir, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text("PROCUREMENT CONTRACT", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Contract Number: ${contract.contractNumber}`);
        doc.text(`Title: ${contract.title}`);
        doc.text(`Status: ${contract.status}`);
        doc.moveDown();
        doc.text(`Limit: ${contract.totalAmountLimit ? `$${contract.totalAmountLimit}` : "Unlimited"}`);
        doc.text(`Payment Terms: ${contract.paymentTerms || "N/A"}`);
        doc.moveDown();
        doc.text(`Start Date: ${contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "N/A"}`);
        doc.text(`End Date: ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "N/A"}`);
        doc.moveDown(2);

        // Detailed Terms
        doc.fontSize(16).text("Agreement Terms & Clauses", { underline: true });
        doc.moveDown();

        contract.terms.forEach((term: any, index: number) => {
            doc.fontSize(12).text(`${index + 1}. ${term.clauseTitle}`, { bold: true } as any);
            doc.moveDown(0.5);
            doc.fontSize(10).text(term.amendedText || term.standardText, { align: "justify" });
            doc.moveDown();
        });

        // Signatures Placeholder
        doc.moveDown(4);
        doc.fontSize(12).text("__________________________", { align: "left" });
        doc.text("Supplier Signature", { align: "left" });

        doc.moveUp(2);
        doc.text("__________________________", { align: "right" });
        doc.text("Company Authority", { align: "right" });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on("finish", () => {
                // Update contract with PDF path
                db.update(procurementContracts)
                    .set({ pdfFilePath: filePath })
                    .where(eq(procurementContracts.id, contractId))
                    .then(() => resolve(filePath))
                    .catch(reject);
            });
            stream.on("error", reject);
        });
    }

    /**
     * Update E-Signature Status
     */
    async updateEsignStatus(contractId: string, status: string, envelopeId?: string) {
        const [updated] = await db.update(procurementContracts)
            .set({ esignStatus: status, esignEnvelopeId: envelopeId })
            .where(eq(procurementContracts.id, contractId))
            .returning();
        return updated;
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
