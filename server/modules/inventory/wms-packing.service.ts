
import { db } from "@db";
import { wmsHandlingUnits, wmsTasks, inventory, wmsLpnContents } from "@shared/schema/scm";
import { eq, and } from "drizzle-orm";

export class WmsPackingService {

    // 1. Pack Item into LPN
    async packItem(warehouseId: string, lpnNumber: string, itemId: string, quantity: number) {
        return await db.transaction(async (tx) => {
            // Find or Create LPN (Container)
            let [lpn] = await tx.select().from(wmsHandlingUnits)
                .where(and(
                    eq(wmsHandlingUnits.lpnNumber, lpnNumber),
                    eq(wmsHandlingUnits.warehouseId, warehouseId)
                ));

            if (!lpn) {
                [lpn] = await tx.insert(wmsHandlingUnits).values({
                    warehouseId,
                    lpnNumber,
                    type: "BOX",
                    status: "ACTIVE"
                }).returning();
            }

            // 2. Check content
            const [existingContent] = await tx.select().from(wmsLpnContents)
                .where(and(
                    eq(wmsLpnContents.lpnId, lpn.id),
                    eq(wmsLpnContents.itemId, itemId)
                ));

            if (existingContent) {
                // Update quantity
                await tx.update(wmsLpnContents)
                    .set({ quantity: (Number(existingContent.quantity) + Number(quantity)).toString() })
                    .where(eq(wmsLpnContents.id, existingContent.id));
            } else {
                // Insert new content
                await tx.insert(wmsLpnContents).values({
                    lpnId: lpn.id,
                    itemId: itemId,
                    quantity: quantity.toString()
                });
            }

            return lpn;
        });
    }

    // 2. Close LPN
    async closeLpn(lpnId: string) {
        const [lpn] = await db.update(wmsHandlingUnits)
            .set({ status: "CLOSED" })
            .where(eq(wmsHandlingUnits.id, lpnId))
            .returning();
        return lpn;
    }

    // 3. Get LPN Details
    async getLpnDetails(lpnNumber: string) {
        // Find LPN
        const [lpn] = await db.select().from(wmsHandlingUnits)
            .where(eq(wmsHandlingUnits.lpnNumber, lpnNumber));

        if (!lpn) return null;

        // Get Contents
        const contents = await db.select().from(wmsLpnContents)
            .where(eq(wmsLpnContents.lpnId, lpn.id));

        return { ...lpn, contents };
    }
}

export const wmsPackingService = new WmsPackingService();
