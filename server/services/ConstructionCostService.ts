
import { db } from "../db";
import {
    constructionDailyLogs,
    constructionDailyLabor,
    constructionDailyEquipment,
    ppmExpenditureItems,
    ppmBillRates,
    ppmProjectTemplates,
    ppmTasks,
    ppmExpenditureTypes
} from "@shared/schema";
import { eq, and, isNull, like } from "drizzle-orm";

export class ConstructionCostService {

    /**
     * Processing Engine: Converts Operational Logs (Labor/Equipment) into Financial Transactions (Expenditure Items).
     * This bridges Phase 6 (Ops) and Phase 42 (Finance).
     */
    async importDailyLogCosts(dailyLogId: string) {
        // 1. Fetch Log Header
        const [log] = await db.select().from(constructionDailyLogs).where(eq(constructionDailyLogs.id, dailyLogId));
        if (!log) throw new Error("Daily Log not found");

        const projectId = log.projectId;

        // Find a default task for "General Construction" if specific task linking is missing
        const [defaultTask] = await db.select().from(ppmTasks)
            .where(and(eq(ppmTasks.projectId, projectId), eq(ppmTasks.chargeableFlag, true)))
            .limit(1);

        if (!defaultTask) throw new Error("No chargeable task found for Project. Cannot import costs.");

        const transactionSource = "CONSTRUCTION_DAILY_LOG";
        const transactionReference = dailyLogId;

        // 2. Process Labor Logs
        await this.processLaborCosts(dailyLogId, projectId, defaultTask.id, transactionSource, transactionReference);

        // 3. Process Equipment Logs
        await this.processEquipmentCosts(dailyLogId, projectId, defaultTask.id, transactionSource, transactionReference);

        return { success: true };
    }

    private async processLaborCosts(logId: string, projectId: string, taskId: string, source: string, ref: string) {
        const laborLines = await db.select().from(constructionDailyLabor).where(eq(constructionDailyLabor.dailyLogId, logId));

        for (const line of laborLines) {
            // Check if already costed (deduplication by Line ID)
            const existing = await db.select().from(ppmExpenditureItems)
                .where(and(
                    eq(ppmExpenditureItems.transactionSource, source),
                    eq(ppmExpenditureItems.transactionReference, line.id)
                ));

            if (existing.length > 0) continue;

            const rate = await this.findRate(line.trade, "LABOR");
            const cost = Number(line.hoursWorked) * rate;

            const expTypeId = await this.resolveExpenditureType("Labor", line.trade);
            if (!expTypeId) {
                console.warn(`Skipping Labor Cost: No Expenditrure Type found for ${line.trade}`);
                continue;
            }

            await db.insert(ppmExpenditureItems).values({
                taskId: taskId,
                expenditureTypeId: expTypeId,
                expenditureItemDate: new Date(),
                quantity: line.hoursWorked,
                unitCost: rate.toString(),
                rawCost: cost.toString(),
                status: "UNCOSTED",
                transactionSource: source,
                transactionReference: line.id,
                denomCurrencyCode: "USD"
            });
        }
    }

    private async processEquipmentCosts(logId: string, projectId: string, taskId: string, source: string, ref: string) {
        const equipmentLines = await db.select()
            .from(constructionDailyEquipment)
            .where(and(
                eq(constructionDailyEquipment.dailyLogId, logId),
                eq(constructionDailyEquipment.costStatus, "UNCOSTED")
            ));

        for (const line of equipmentLines) {
            const rate = await this.findRate(line.equipmentType, "EQUIPMENT");
            const cost = Number(line.hoursUsed) * rate;

            const expTypeId = await this.resolveExpenditureType("Equipment", line.equipmentType);
            if (!expTypeId) {
                console.warn(`Skipping Equip Cost: No Expenditure Type found for ${line.equipmentType}`);
                continue;
            }

            await db.insert(ppmExpenditureItems).values({
                taskId: taskId,
                expenditureTypeId: expTypeId,
                expenditureItemDate: new Date(),
                quantity: line.hoursUsed,
                unitCost: rate.toString(),
                rawCost: cost.toString(),
                status: "UNCOSTED",
                transactionSource: source,
                transactionReference: line.id,
                denomCurrencyCode: "USD"
            });

            await db.update(constructionDailyEquipment)
                .set({ costStatus: "COSTED" })
                .where(eq(constructionDailyEquipment.id, line.id));
        }
    }

    private async findRate(keyword: string, type: "LABOR" | "EQUIPMENT"): Promise<number> {
        // Simplified Rate Lookup
        if (type === "LABOR") {
            if (keyword.includes("Electrician")) return 85.00;
            if (keyword.includes("Plumber")) return 80.00;
            if (keyword.includes("Carpenter")) return 75.00;
            if (keyword.includes("General")) return 45.00;
            return 50.00;
        } else {
            if (keyword.includes("Excavator")) return 150.00;
            if (keyword.includes("Crane")) return 300.00;
            if (keyword.includes("Dozer")) return 200.00;
            return 100.00;
        }
    }

    private async resolveExpenditureType(category: string, subCategory: string): Promise<string | null> {
        // Try to find a matching Expenditure Type
        const searchName = category === "Labor" ? "Labor" : "Equipment";

        // 1. Try exact match on Category
        const [exact] = await db.select().from(ppmExpenditureTypes)
            .where(eq(ppmExpenditureTypes.name, searchName))
            .limit(1);

        if (exact) return exact.id;

        // 2. Try partial match
        const [partial] = await db.select().from(ppmExpenditureTypes)
            .where(like(ppmExpenditureTypes.name, `%${searchName}%`))
            .limit(1);

        if (partial) return partial.id;

        // 3. Fallback: Return any type (Just for MVP resilience) or null
        const [anyType] = await db.select().from(ppmExpenditureTypes).limit(1);
        if (anyType) return anyType.id;

        return null;
    }
}
