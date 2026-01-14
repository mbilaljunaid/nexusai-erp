import { db } from "../db";
import { formulas, formulaIngredients, manufacturingBatches, batchTransactions, recipes } from "../../shared/schema/manufacturing";
import { eq, sql } from "drizzle-orm";

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
}

export const manufacturingProcessService = new ManufacturingProcessService();
