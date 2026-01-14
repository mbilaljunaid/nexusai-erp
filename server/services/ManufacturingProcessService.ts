import { db } from "../db";
import { formulas, formulaIngredients, manufacturingBatches, batchTransactions, recipes, qualityResults } from "../../shared/schema/manufacturing";
import { eq, sql, desc, inArray } from "drizzle-orm";
import { type InsertQualityResult } from "../../shared/schema/manufacturing";

export class ManufacturingProcessService {
    /**
     * Explodes a formula for a given batch size.
     * Tier-1: Handles both fixed quantities and percentage-based distributions.
     */
    async calculateFormulaRequirements(formulaId: string, targetBatchSize: number) {
        const [formula] = await db.select().from(formulas).where(eq(formulas.id, formulaId));
        if (!formula) throw new Error("Formula not found");

        const ingredients = await db.query.formulaIngredients.findMany({
            where: eq(formulaIngredients.formulaId, formulaId)
        });

        const standardBatchSize = Number(formula.totalBatchSize);

        return ingredients.map(ing => {
            let reqQty = 0;
            if (ing.percentage) {
                // Percentage based: (Batch Size * %) / 100
                reqQty = (targetBatchSize * Number(ing.percentage)) / 100;
            } else {
                // Proportional scale based on original formula size
                // (Target / Standard) * Base Quantity
                reqQty = (targetBatchSize / standardBatchSize) * Number(ing.quantity);
            }

            // Apply Loss Factor: Qty / (1 - Loss%)
            const lossFactor = Number(ing.lossFactor || 0);
            const totalQty = reqQty / (1 - lossFactor / 100);

            return {
                productId: ing.productId,
                quantity: totalQty.toFixed(4)
            };
        });
    }


    /**
     * Creates a new manufacturing batch from a recipe.
     */
    async releaseBatch(recipeId: string, quantity: number) {
        const [recipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId));
        if (!recipe) throw new Error("Recipe not found");

        const batchNumber = `BAT-${Date.now()}`;
        const [batch] = await db.insert(manufacturingBatches).values({
            batchNumber,
            recipeId,
            targetQuantity: quantity.toString(),
            status: "released",
            startDate: new Date()
        } as any).returning();

        // Auto-Issue ingredients (Scale Formula)
        const requirements = await this.calculateFormulaRequirements(recipe.formulaId, quantity);
        for (const req of requirements) {
            await db.insert(batchTransactions).values({
                batchId: batch.id,
                transactionType: "FEED",
                productId: req.productId,
                quantity: req.quantity
            } as any);
        }

        return batch;
    }

    /**
     * Records production yield and batch loss.
     */
    async recordYield(batchId: string, productId: string, quantity: number, type: "YIELD" | "LOSS" | "BYPRODUCT") {
        const [batch] = await db.select().from(manufacturingBatches).where(eq(manufacturingBatches.id, batchId));
        if (!batch) throw new Error("Batch not found");

        await db.insert(batchTransactions).values({
            batchId,
            transactionType: type,
            productId,
            quantity: quantity.toString()
        } as any);

        if (type === "YIELD") {
            const currentActual = Number(batch.actualQuantity || 0);
            await db.update(manufacturingBatches)
                .set({ actualQuantity: (currentActual + quantity).toString() })
                .where(eq(manufacturingBatches.id, batchId));
        }
    }

    /**
     * Closes a batch and calculates final yield variance.
     */
    async closeBatch(batchId: string) {
        const [batch] = await db.select().from(manufacturingBatches).where(eq(manufacturingBatches.id, batchId));
        if (!batch) throw new Error("Batch not found");

        const target = Number(batch.targetQuantity);
        const actual = Number(batch.actualQuantity);
        const variance = actual - target;

        await db.update(manufacturingBatches)
            .set({
                status: "closed",
                endDate: new Date()
            })
            .where(eq(manufacturingBatches.id, batchId));

        return {
            batchNumber: batch.batchNumber,
            target,
            actual,
            variance,
            yieldPercentage: (actual / target) * 100
        };
    }

    /**
     * Retrieves the genealogy tree for a specific lot.
     * Backwards traceability: What went into this?
     * Forwards traceability: Where did this go?
     */
    async getBatchGenealogy(lotNumber: string) {
        // Find the primary transaction for this lot
        const transactions = await db.select().from(batchTransactions).where(eq(batchTransactions.lotNumber, lotNumber));
        if (transactions.length === 0) return [];

        // For now, let's return the transactions and their immediate parents
        const parentLotIds = transactions.map(t => t.parentLotId).filter(Boolean) as string[];

        let parentTransactions: any[] = [];
        if (parentLotIds.length > 0) {
            parentTransactions = await db.select().from(batchTransactions).where(inArray(batchTransactions.lotNumber, parentLotIds));
        }

        // Downstream usage
        const childTransactions = await db.select().from(batchTransactions).where(eq(batchTransactions.parentLotId, lotNumber));

        return [...transactions, ...parentTransactions, ...childTransactions];
    }

    /**
     * Quality Results (LIMS)
     */
    async getQualityResults(inspectionId: string) {
        return await db.select().from(qualityResults).where(eq(qualityResults.inspectionId, inspectionId));
    }

    async saveQualityResults(inspectionId: string, results: InsertQualityResult[]) {
        return await db.transaction(async (tx) => {
            // Clear existing results for this inspection
            await tx.delete(qualityResults).where(eq(qualityResults.inspectionId, inspectionId));
            if (results.length > 0) {
                await tx.insert(qualityResults).values(results);
            }
        });
    }
}

export const manufacturingProcessService = new ManufacturingProcessService();
