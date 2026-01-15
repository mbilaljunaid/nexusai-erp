
import { db } from "../../db";
import { db } from "../../db";
import { omPriceAdjustments, omPriceLists, omPriceListItems } from "../../../shared/schema/order_management";
import { eq, and } from "drizzle-orm";

export class PricingService {

    /**
     * Get List Price for an Item from a Price Book
     */
    async getListPrice(itemId: string, priceListId: string): Promise<number> {
        // Find item in the specified (or any active) price list
        const query = db.select({ price: omPriceListItems.unitPrice })
            .from(omPriceListItems)
            .innerJoin(omPriceLists, eq(omPriceLists.id, omPriceListItems.priceListId))
            .where(and(
                eq(omPriceListItems.itemId, itemId),
                eq(omPriceLists.status, 'ACTIVE')
            ));

        if (priceListId) {
            // If ID is provided, filter by it. If it's a name, we might need name lookup.
            // For now assuming ID is passed.
            // query.where(eq(omPriceLists.id, priceListId)); // This would need dynamic query building which implies modifying the where clause above.

            // Simplified:
            const [item] = await db.select({ price: omPriceListItems.unitPrice })
                .from(omPriceListItems)
                .innerJoin(omPriceLists, eq(omPriceLists.id, omPriceListItems.priceListId))
                .where(and(
                    eq(omPriceListItems.itemId, itemId),
                    eq(omPriceLists.id, priceListId),
                    eq(omPriceLists.status, 'ACTIVE')
                ))
                .limit(1);
            return item ? Number(item.price) : 0;
        }

        // Fallback: Get any active price
        const [item] = await query.limit(1);
        return item ? Number(item.price) : 0;
    }

    /**
     * Calculate Order Line Totals (Extended Amount)
     */
    calculateLineTotal(quantity: number, unitSellingPrice: number): number {
        return quantity * unitSellingPrice;
    }

    /**
     * Calculate Tax for an Order (Header Level)
     * Integration with TaxService (Stub for now)
     */
    async calculateOrderTax(orderId: string, lines: any[]): Promise<number> {
        // Flat 10% tax for simplicity in V1
        const totalNet = lines.reduce((sum, line) => sum + (line.extendedAmount || 0), 0);
        return totalNet * 0.10;
    }

}

export const pricingService = new PricingService();
