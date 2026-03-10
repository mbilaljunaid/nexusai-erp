
import { db } from "../db";
import { procurementContracts, contractClauses, contractTerms } from "@shared/schema";
import { eq, lte, and, desc } from "drizzle-orm";
import { format } from "date-fns";
import { auditService } from "./audit_service";

export class ContractService {

    // Helper to log audit
    private async log(action: string, entityId: string, details: any, userId: string = 'system') {
        await auditService.logAction({
            userId,
            action,
            entityType: 'contract',
            entityId,
            details
        });
    }

    async createContract(data: any) {
        // Auto-generate ID if needed, but primarily Confirmation Number
        const contractNumber = `CTR-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 1000)}`;

        // Map DTO to Schema
        // procurementContracts has: supplierId, contractNumber, title, status, startDate, endDate, totalAmount, etc.
        const [contract] = await db.insert(procurementContracts).values({
            supplierId: data.supplierId,
            title: data.title,
            contractNumber: contractNumber,
            type: data.type || 'MSA',
            totalAmountLimit: data.totalValue ? data.totalValue.toString() : "0",
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : null,
            status: "Draft",
            createdBy: "system"
        }).returning();

        await this.log('CREATE_CONTRACT', String(contract.id), { title: data.title, amount: data.totalValue });

        return contract;
    }

    async updateContract(id: string, data: any) {
        const updateData: any = { ...data, updatedAt: new Date() };
        // Map fields if needed. If data.status is passed
        if (data.status) updateData.status = data.status;

        const [contract] = await db.update(procurementContracts)
            .set(updateData)
            .where(eq(procurementContracts.id, id))
            .returning();
        return contract;
    }

    async getContract(id: string) {
        const contract = await db.select().from(procurementContracts).where(eq(procurementContracts.id, id));
        return contract[0];
    }

    async getContractDetails(id: string) {
        const contract = await this.getContract(id);
        if (!contract) return null;

        // Fetch terms
        const terms = await db.select().from(contractTerms).where(eq(contractTerms.contractId, id));

        return {
            ...contract,
            terms
        };
    }

    async listContractsBySupplier(supplierId: string) {
        return await db.select().from(procurementContracts).where(eq(procurementContracts.supplierId, supplierId));
    }

    async getExpiringContracts(daysThreshold = 30) {
        const warningDate = new Date();
        warningDate.setDate(warningDate.getDate() + daysThreshold);

        return await db.select()
            .from(procurementContracts)
            .where(
                and(
                    eq(procurementContracts.status, "Active"),
                    lte(procurementContracts.endDate, warningDate)
                )
            );
    }

    async getAllContracts(accountId?: string, page = 1, limit = 50, entBusinessUnitId?: string) {
        const offset = (page - 1) * limit;

        const conditions = [];
        if (entBusinessUnitId) conditions.push(eq(procurementContracts.entBusinessUnitId, entBusinessUnitId));

        let query = db.select().from(procurementContracts);
        let countQuery = db.select().from(procurementContracts);

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
            countQuery = countQuery.where(and(...conditions)) as any;
        }

        const data = await query.limit(limit).offset(offset);
        const all = await countQuery;

        return { data, total: all.length, page, limit };
    }

    // --- Clause Management ---

    async addClauseToContract(contractId: string, clauseId: string, amendedText?: string) {
        // Fetch clause details
        const [clause] = await db.select().from(contractClauses).where(eq(contractClauses.id, clauseId));
        if (!clause) throw new Error("Clause not found");

        const [term] = await db.insert(contractTerms).values({
            contractId: contractId,
            clauseId: clauseId,
            amendedText: amendedText || clause.clauseText
        }).returning();

        return term;
    }

    async seedClauseLibrary() {
        const standardClauses = [
            { title: "Confidentiality", category: "Legal", clauseText: "Standard confidentiality agreement...", isMandatory: "true" },
            { title: "Payment Terms", category: "Finance", clauseText: "Net 30 days...", isMandatory: "true" },
            { title: "Termination", category: "Legal", clauseText: "Termination for convenience with 30 days notice...", isMandatory: "false" }
        ];

        for (const c of standardClauses) {
            await db.insert(contractClauses).values(c).onConflictDoNothing();
        }
    }

    // --- AI & PDF Integration (Stubs) ---

    async analyzeContractCompliance(id: string) {
        // Mock AI analysis
        return {
            score: 85,
            risks: ["Missing liability cap", "Payment terms > 60 days"],
            recommendations: ["Add liability cap", "Negotiate Net 45"]
        };
    }

    async generateContractPDF(id: string) {
        // Mock PDF generation
        return `/tmp/contract_${id}.pdf`;
    }

    async updateEsignStatus(id: string, status: string, envelopeId: string) {
        const [updated] = await db.update(procurementContracts)
            .set({
                esignStatus: status,
                esignEnvelopeId: envelopeId,
                updatedAt: new Date()
            })
            .where(eq(procurementContracts.id, id))
            .returning();

        return updated;
    }
    async listContracts(limit: number, offset: number, filters?: any) {
        const page = Math.floor(offset / limit) + 1;
        return this.getAllContracts(undefined, page, limit);
    }

    async addLine(data: any) {
        return { id: "line-stub", ...data };
    }

    async addDocument(data: any) {
        return { id: "doc-stub", ...data };
    }
}

export const contractService = new ContractService();
