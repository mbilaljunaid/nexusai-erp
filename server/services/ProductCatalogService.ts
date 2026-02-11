import { db } from "../db";
import { eq, and, desc, like, or } from "drizzle-orm";
import { products, priceBooks, priceBookEntries, type Product, type InsertProduct, type PriceBook, type InsertPriceBook } from "@shared/schema";

export class ProductService {

    /**
     * Get all products with optional filters
     */
    async getAllProducts(filters?: {
        tenantId?: string;
        category?: string;
        status?: string;
        search?: string;
    }): Promise<Product[]> {
        const conditions = [];

        if (filters?.tenantId) {
            conditions.push(eq(products.tenantId, filters.tenantId));
        }
        if (filters?.category) {
            conditions.push(eq(products.category, filters.category));
        }
        if (filters?.status) {
            conditions.push(eq(products.status, filters.status));
        }
        if (filters?.search) {
            conditions.push(
                or(
                    like(products.name, `%${filters.search}%`),
                    like(products.productCode, `%${filters.search}%`)
                )
            );
        }

        return await db
            .select()
            .from(products)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(products.createdAt));
    }

    /**
     * Get product by ID
     */
    async getProductById(id: string): Promise<Product | null> {
        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, id));

        return product || null;
    }

    /**
     * Create new product
     */
    async createProduct(data: InsertProduct): Promise<Product> {
        const [product] = await db
            .insert(products)
            .values(data)
            .returning();

        return product;
    }

    /**
     * Update product
     */
    async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product> {
        const [product] = await db
            .update(products)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(products.id, id))
            .returning();

        return product;
    }

    /**
     * Delete product
     */
    async deleteProduct(id: string): Promise<boolean> {
        const result = await db
            .delete(products)
            .where(eq(products.id, id));

        return result.rowCount > 0;
    }

    /**
     * Get all price books
     */
    async getAllPriceBooks(filters?: { tenantId?: string }): Promise<PriceBook[]> {
        const conditions = [];

        if (filters?.tenantId) {
            conditions.push(eq(priceBooks.tenantId, filters.tenantId));
        }

        return await db
            .select()
            .from(priceBooks)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
    }

    /**
     * Create price book
     */
    async createPriceBook(data: InsertPriceBook): Promise<PriceBook> {
        const [priceBook] = await db
            .insert(priceBooks)
            .values(data)
            .returning();

        return priceBook;
    }

    /**
     * Add product to price book with pricing
     */
    async addProductToPriceBook(priceBookId: string, productId: string, unitPrice: number): Promise<any> {
        const [entry] = await db
            .insert(priceBookEntries)
            .values({
                priceBookId,
                productId,
                unitPrice: unitPrice.toString(),
                isActive: 1
            })
            .returning();

        return entry;
    }
}

export const productService = new ProductService();
