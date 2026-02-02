
import { db } from "../../db";
import { omPriceLists, omPriceListItems } from "../../../shared/schema/order_management";
import { eq } from "drizzle-orm";

export class PriceListService {

    async createPriceList(data: any) {
        return await db.transaction(async (tx) => {
            const [header] = await tx.insert(omPriceLists).values({
                name: data.name,
                currencyCode: data.currency,

                status: 'ACTIVE',
                startDate: new Date()
            }).returning();

            if (data.items && data.items.length > 0) {
                await tx.insert(omPriceListItems).values(data.items.map((item: any) => ({
                    priceListId: header.id,
                    itemId: item.itemId,
                    unitPrice: item.unitPrice
                })));
            }
            return header;
        });
    }

    async getPriceLists() {
        const lists = await db.query.omPriceLists.findMany({
            with: { items: true }
        });

        // Map to include item count for UI convenience
        return lists.map(list => ({
            ...list,
            items: list.items.length
        }));
    }

    async addItemToPriceList(priceListId: string, item: { itemId: string, unitPrice: number }) {
        return await db.insert(omPriceListItems).values({
            priceListId,
            itemId: item.itemId,
            unitPrice: item.unitPrice
        }).returning();
    }
}

export const priceListService = new PriceListService();
