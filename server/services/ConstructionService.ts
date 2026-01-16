import { db } from "../db";
import {
    constructionContracts,
    constructionContractLines,
    constructionVariations,
    constructionPayApps,
    constructionPayAppLines,
    InsertConstructionContract,
    InsertConstructionContractLine,
    InsertConstructionVariation,
    InsertConstructionPayApp,
    InsertConstructionPayAppLine,
    ppmProjects
} from "@shared/schema";
import { eq, desc, sum, sql, and } from "drizzle-orm";
import {
    constructionPayApps,
    constructionPayAppLines,
    InsertConstructionPayApp,
    InsertConstructionPayAppLine
} from "@shared/schema";

export class ConstructionService {

    // -- Contracts --

    async createContract(data: InsertConstructionContract) {
        const [contract] = await db.insert(constructionContracts)
            .values(data)
            .returning();
        return contract;
    }

    async getContracts(projectId: string) {
        return await db.select()
            .from(constructionContracts)
            .where(eq(constructionContracts.projectId, projectId))
            .orderBy(desc(constructionContracts.createdAt));
    }

    async getContract(id: string) {
        const [contract] = await db.select()
            .from(constructionContracts)
            .where(eq(constructionContracts.id, id));

        if (!contract) return null;

        const lines = await this.getContractLines(id);
        const variations = await this.getVariations(id);

        return { ...contract, lines, variations };
    }

    async updateContractAmount(id: string, amount: string) {
        const [contract] = await db.update(constructionContracts)
            .set({ revisedAmount: amount, updatedAt: new Date() })
            .where(eq(constructionContracts.id, id))
            .returning();
        return contract;
    }

    // -- SoV Lines --

    async addContractLine(data: InsertConstructionContractLine) {
        const [line] = await db.insert(constructionContractLines)
            .values(data)
            .returning();

        // Recalculate Contract Total
        await this.recalculateContractTotal(data.contractId);

        return line;
    }

    async getContractLines(contractId: string) {
        return await db.select()
            .from(constructionContractLines)
            .where(eq(constructionContractLines.contractId, contractId))
            .orderBy(constructionContractLines.lineNumber);
    }

    private async recalculateContractTotal(contractId: string) {
        const result = await db.select({
            total: sum(constructionContractLines.scheduledValue)
        })
            .from(constructionContractLines)
            .where(eq(constructionContractLines.contractId, contractId));

        const total = result[0]?.total || "0";

        // Update Original Amount (assuming lines = original scope)
        // For variations, we will have a separate logic
        await db.update(constructionContracts)
            .set({
                originalAmount: total,
                revisedAmount: total // Initial sync, needs variaiton logic later
            })
            .where(eq(constructionContracts.id, contractId));
    }

    // -- Variations (Change Orders) --

    async createVariation(data: InsertConstructionVariation) {
        const [variation] = await db.insert(constructionVariations)
            .values(data)
            .returning();
        return variation;
    }

    async getVariations(contractId: string) {
        return await db.select()
            .from(constructionVariations)
            .where(eq(constructionVariations.contractId, contractId))
            .orderBy(desc(constructionVariations.createdAt));
    }

    async approveVariation(id: string) {
        const [variation] = await db.update(constructionVariations)
            .set({
                status: "APPROVED",
                approvedDate: new Date()
            })
            .where(eq(constructionVariations.id, id))
            .returning();

        // Update Contract Revised Amount
        // Logic: Revised = Original + Approved Variations
        await this.updateContractWithVariations(variation.contractId);

        return variation;
    }

    private async updateContractWithVariations(contractId: string) {
        const [contract] = await db.select().from(constructionContracts).where(eq(constructionContracts.id, contractId));
        if (!contract) return;

        const variationResult = await db.select({
            total: sum(constructionVariations.amount)
        })
            .from(constructionVariations)
            .where(eq(constructionVariations.contractId, contractId))
            .where(eq(constructionVariations.status, "APPROVED"));

        const variationTotal = Number(variationResult[0]?.total || 0);
        const original = Number(contract.originalAmount || 0);

        await db.update(constructionContracts)
            .set({ revisedAmount: (original + variationTotal).toString(), updatedAt: new Date() })
            .where(eq(constructionContracts.id, contractId));
    }

    // -- Progress Billing / Pay Apps --

    async createPayApp(data: InsertConstructionPayApp) {
        // 1. Create Header
        const [payApp] = await db.insert(constructionPayApps)
            .values(data)
            .returning();

        // 2. Initialize Lines based on Contract Lines (SOV)
        const contractLines = await this.getContractLines(data.contractId);

        // Fetch previous pay app lines to calculate previous progress (if any)
        // For simplicity in this first pass, assuming generic initialization

        const lineInserts = contractLines.map(line => ({
            payAppId: payApp.id,
            contractLineId: line.id,
            workCompletedThisPeriod: "0",
            materialsStored: "0",
            totalCompletedToDate: "0",
            percentageComplete: "0"
        }));

        if (lineInserts.length > 0) {
            await db.insert(constructionPayAppLines).values(lineInserts);
        }

        return payApp;
    }

    async getPayApps(contractId: string) {
        return await db.select()
            .from(constructionPayApps)
            .where(eq(constructionPayApps.contractId, contractId))
            .orderBy(desc(constructionPayApps.applicationNumber));
    }

    async getPayApp(id: string) {
        const [app] = await db.select()
            .from(constructionPayApps)
            .where(eq(constructionPayApps.id, id));

        if (!app) return null;

        const lines = await db.select({
            id: constructionPayAppLines.id,
            contractLineId: constructionPayAppLines.contractLineId,
            description: constructionContractLines.description,
            scheduledValue: constructionContractLines.scheduledValue,
            totalCompletedToDate: constructionPayAppLines.totalCompletedToDate,
            percentageComplete: constructionPayAppLines.percentageComplete,
            workCompletedThisPeriod: constructionPayAppLines.workCompletedThisPeriod,
            materialsStored: constructionPayAppLines.materialsStored
        })
            .from(constructionPayAppLines)
            .leftJoin(constructionContractLines, eq(constructionPayAppLines.contractLineId, constructionContractLines.id))
            .where(eq(constructionPayAppLines.payAppId, id));

        return { ...app, lines };
    }

    async updatePayAppLine(lineId: string, data: Partial<InsertConstructionPayAppLine>) {
        // logic to update line
        // when updating totalCompletedToDate, we should recalc percentage
        const [line] = await db.update(constructionPayAppLines)
            .set(data)
            .where(eq(constructionPayAppLines.id, lineId))
            .returning();

        // Trigger recalc of Pay App Header
        await this.calculatePayApp(line.payAppId);

        return line;
    }

    async calculatePayApp(payAppId: string) {
        // 1. Get Header and Contract
        const [app] = await db.select().from(constructionPayApps).where(eq(constructionPayApps.id, payAppId));
        if (!app) return;
        const [contract] = await db.select().from(constructionContracts).where(eq(constructionContracts.id, app.contractId));

        // 2. Sum up Total Completed from lines
        const result = await db.select({
            totalCompleted: sum(constructionPayAppLines.totalCompletedToDate)
        })
            .from(constructionPayAppLines)
            .where(eq(constructionPayAppLines.payAppId, payAppId));

        const totalCompleted = Number(result[0]?.totalCompleted || 0);
        const retentionRate = Number(contract.retentionPercentage || 10) / 100;
        const retentionAmount = totalCompleted * retentionRate;
        const previousPayments = Number(app.previousPayments || 0); // This logic needs robustness to fetch from prev apps

        const currentPaymentDue = totalCompleted - retentionAmount - previousPayments;

        // 3. Update Header
        await db.update(constructionPayApps)
            .set({
                totalCompleted: totalCompleted.toString(),
                retentionAmount: retentionAmount.toString(),
                currentPaymentDue: currentPaymentDue.toString(),
                // previousPayments logic to be refined: verify prev app total paid
            })
            .where(eq(constructionPayApps.id, payAppId));
    }
}
