import { db } from "../../db";
import { priceBooks, priceBookEntries, products } from "../../../shared/schema/crm";
import { eq, and, ilike } from "drizzle-orm";

export class PriceBookService {
    /**
     * Get all active price books
     */
    static async getActivePriceBooks() {
        return db
            .select()
            .from(priceBooks)
            .where(eq(priceBooks.isActive, 1))
            .orderBy(priceBooks.name);
    }

    /**
     * Get price book entries for a specific price book
     * Optionally search by product name
     */
    static async getPriceBookEntries(priceBookId: string, search?: string) {
        let query = db
            .select({
                id: priceBookEntries.id,
                priceBookId: priceBookEntries.priceBookId,
                productId: priceBookEntries.productId,
                unitPrice: priceBookEntries.unitPrice,
                isActive: priceBookEntries.isActive,
                productName: products.name,
                productCode: products.productCode,
                description: products.description,
            })
            .from(priceBookEntries)
            .innerJoin(products, eq(priceBookEntries.productId, products.id))
            .where(
                and(
                    eq(priceBookEntries.priceBookId, priceBookId),
                    eq(priceBookEntries.isActive, 1)
                )
            );

        if (search) {
            // Note: This is a basic search. For production, consider full-text search.
            // Drizzle doesn't have a direct 'ilike' on the join result in this syntax easily without aliasing,
            // but assuming standard usage:
            return db
                .select({
                    id: priceBookEntries.id,
                    priceBookId: priceBookEntries.priceBookId,
                    productId: priceBookEntries.productId,
                    unitPrice: priceBookEntries.unitPrice,
                    isActive: priceBookEntries.isActive,
                    productName: products.name,
                    productCode: products.productCode,
                    description: products.description,
                })
                .from(priceBookEntries)
                .innerJoin(products, eq(priceBookEntries.productId, products.id))
                .where(
                    and(
                        eq(priceBookEntries.priceBookId, priceBookId),
                        eq(priceBookEntries.isActive, 1),
                        ilike(products.name, `%${search}%`)
                    )
                );
        }

        return query;
    }

    /**
     * Resolve unit price for a product in a specific price book
     */
    static async resolvePrice(productId: string, priceBookId: string) {
        const [entry] = await db
            .select()
            .from(priceBookEntries)
            .where(
                and(
                    eq(priceBookEntries.priceBookId, priceBookId),
                    eq(priceBookEntries.productId, productId),
                    eq(priceBookEntries.isActive, 1)
                )
            )
            .limit(1);

        return entry ? Number(entry.unitPrice) : null;
    }

    /**
     * Get the standard price book (fallback)
     */
    static async getStandardPriceBook() {
        const [book] = await db
            .select()
            .from(priceBooks)
            .where(eq(priceBooks.isStandard, 1))
            .limit(1);

        return book;
    }
}
