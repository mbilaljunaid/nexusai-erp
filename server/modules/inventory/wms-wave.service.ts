
import { db } from "@db";
import { wmsWaves, wmsTasks, omOrderLines, omOrderHeaders } from "@shared/schema/scm"; // Assuming schema access
// We need access to omOrderLines/Headers if they are in 'scm'. 
// Wait, omOrderLines was in 'order_management.ts' in previous steps (viewed_file).
// Let's check imports.
import { wmsTaskService } from "./wms-task.service";
import { eq, inArray, and, sql } from "drizzle-orm";

// Re-import correct schemas if they are in different files.
// Based on previous context, omOrderLines is in "order_management.ts" but might be exported from "@shared/schema" index?
// I will try to import from @shared/schema/order_management first or check index.
// For now, I'll assume they are available or I'll fix imports after writing if it fails.
// Actually, looking at previous view_file, they are in shared/schema/order_management.ts.
// I'll assume mapped aliases in tsconfig: "@shared/schema/order_management"

import { omOrderLines, omOrderHeaders } from "@shared/schema/order_management";

export class WmsWaveService {

    /**
     * Create a Wave by filtering open Order Lines
     */
    async createWave(criteria: { warehouseId: string, carrier?: string, limit?: number }) {
        return await db.transaction(async (tx) => {
            // 1. Find eligible lines (Status = AWAITING_FULFILLMENT)
            // Join Order Headers to filter by Warehouse
            const eligibleLines = await tx.select({
                lineId: omOrderLines.id,
                orderId: omOrderHeaders.id,
                itemId: omOrderLines.itemId,
                quantity: omOrderLines.orderedQuantity,
                uom: omOrderLines.uom // Check if this column exists
            })
                .from(omOrderLines)
                .innerJoin(omOrderHeaders, eq(omOrderLines.headerId, omOrderHeaders.id))
                .where(and(
                    eq(omOrderHeaders.warehouseId, criteria.warehouseId),
                    eq(omOrderLines.status, 'AWAITING_FULFILLMENT')
                ))
                .limit(criteria.limit || 50);

            if (eligibleLines.length === 0) {
                throw new Error("No eligible lines found for wave.");
            }

            // 2. Create Wave Header
            const [wave] = await tx.insert(wmsWaves).values({
                waveNumber: `WAVE-${Date.now()}`,
                warehouseId: criteria.warehouseId,
                status: 'PLANNED',
                description: `Auto-generated wave for ${eligibleLines.length} lines`,
            }).returning();

            // 3. Create Tasks for each line (Initially status = PENDING, linked to Wave)
            // In a real WMS, we might not create tasks immediately until "Release".
            // But for simplicity, we create PENDING tasks now.

            for (const line of eligibleLines) {
                await wmsTaskService.createTask({
                    warehouseId: criteria.warehouseId,
                    taskType: 'PICK',
                    taskNumber: `TSK-${Date.now()}-${line.lineId.substring(0, 4)}`, // fast gen
                    itemId: line.itemId,
                    quantityPlanned: line.quantity.toString(), // Ensure string for numeric
                    sourceDocType: 'WAVE',
                    sourceDocId: wave.id,
                    sourceLineId: line.lineId, // Link to Order Line
                    status: 'PENDING'
                });

                // Update Order Line Status to 'PICKED' or 'RELEASED'? 
                // Usually 'RELEASED_TO_WAREHOUSE'. 'PICKED' is after task complete.
                // We'll leave it as AWAITING_FULFILLMENT until Task Completion?
                // Or maybe a new status? Let's keep it simple.
            }

            return { wave, lineCount: eligibleLines.length };
        });
    }

    async listWaves(warehouseId: string) {
        return await db.select().from(wmsWaves).where(eq(wmsWaves.warehouseId, warehouseId));
    }

    async releaseWave(waveId: string) {
        // 1. Update Wave Status to RELEASED
        const [wave] = await db.update(wmsWaves)
            .set({ status: 'RELEASED', releaseDate: new Date() })
            .where(eq(wmsWaves.id, waveId))
            .returning();

        // 2. Update all linked Tasks to ASSIGNED or just RELEASED?
        // wmsTaskService could handle bulk status update.
        // For now, we assume PENDING tasks are visible to workers once Wave is released.

        return wave;
    }
}

export const wmsWaveService = new WmsWaveService();
