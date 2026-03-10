import { db } from "../db";
import { eq, and, desc, or } from "drizzle-orm";
import { quotes, quoteLineItems, type Quote, type InsertQuote, type QuoteLineItem, type InsertQuoteLineItem } from "@shared/schema";

export class QuoteService {

    /**
     * Get all quotes with optional filters
     */
    async getAll(filters?: {
        tenantId?: string;
        status?: string;
        opportunityId?: string;
    }): Promise<Quote[]> {
        const conditions = [];

        if (filters?.tenantId) {
            conditions.push(eq(quotes.tenantId, filters.tenantId));
        }
        if (filters?.status) {
            conditions.push(eq(quotes.status, filters.status));
        }
        if (filters?.opportunityId) {
            conditions.push(eq(quotes.opportunityId, filters.opportunityId));
        }

        return await db
            .select()
            .from(quotes)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(quotes.createdAt));
    }

    /**
     * Get quote by ID with line items
     */
    async getById(id: string): Promise<{ quote: Quote; lineItems: QuoteLineItem[] } | null> {
        const [quote] = await db
            .select()
            .from(quotes)
            .where(eq(quotes.id, id));

        if (!quote) return null;

        const lineItems = await db
            .select()
            .from(quoteLineItems)
            .where(eq(quoteLineItems.quoteId, id));

        return { quote, lineItems };
    }

    /**
     * Create new quote
     */
    async create(data: InsertQuote): Promise<Quote> {
        const [quote] = await db
            .insert(quotes)
            .values(data)
            .returning();

        return quote;
    }

    /**
     * Update quote
     */
    async update(id: string, data: Partial<InsertQuote>): Promise<Quote> {
        const [quote] = await db
            .update(quotes)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(quotes.id, id))
            .returning();

        return quote;
    }

    /**
     * Delete quote
     */
    async delete(id: string): Promise<boolean> {
        // Line items will cascade delete
        const result = await db
            .delete(quotes)
            .where(eq(quotes.id, id));

        return result.rowCount > 0;
    }

    /**
     * Add line item to quote
     */
    async addLineItem(quoteId: string, item: InsertQuoteLineItem): Promise<QuoteLineItem> {
        // Calculate total price
        const totalPrice = Number(item.unitPrice) * item.quantity;

        const [lineItem] = await db
            .insert(quoteLineItems)
            .values({
                ...item,
                quoteId,
                totalPrice: totalPrice.toString()
            })
            .returning();

        // Update quote total
        await this.recalculateTotal(quoteId);

        return lineItem;
    }

    /**
     * Update line item
     */
    async updateLineItem(itemId: string, data: Partial<InsertQuoteLineItem>): Promise<QuoteLineItem> {
        // Recalculate total if quantity or price changed
        if (data.quantity || data.unitPrice) {
            const [existing] = await db
                .select()
                .from(quoteLineItems)
                .where(eq(quoteLineItems.id, itemId));

            const quantity = data.quantity ?? existing.quantity;
            const unitPrice = data.unitPrice !== undefined ? Number(data.unitPrice) : Number(existing.unitPrice);
            data.totalPrice = (quantity * unitPrice).toString();
        }

        const [lineItem] = await db
            .update(quoteLineItems)
            .set(data)
            .where(eq(quoteLineItems.id, itemId))
            .returning();

        // Update quote total
        await this.recalculateTotal(lineItem.quoteId);

        return lineItem;
    }

    /**
     * Remove line item
     */
    async removeLineItem(itemId: string): Promise<boolean> {
        const [item] = await db
            .select()
            .from(quoteLineItems)
            .where(eq(quoteLineItems.id, itemId));

        if (!item) return false;

        await db.delete(quoteLineItems).where(eq(quoteLineItems.id, itemId));

        // Update quote total
        await this.recalculateTotal(item.quoteId);

        return true;
    }

    /**
     * Recalculate quote total amount
     */
    private async recalculateTotal(quoteId: string): Promise<void> {
        const items = await db
            .select()
            .from(quoteLineItems)
            .where(eq(quoteLineItems.quoteId, quoteId));

        const total = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);

        await db
            .update(quotes)
            .set({ totalAmount: total.toString(), updatedAt: new Date() })
            .where(eq(quotes.id, quoteId));
    }

    /**
     * Update quote status (Draft, Pending, Approved, Rejected, Sent)
     */
    async updateStatus(id: string, status: string, metadata?: { approvedBy?: string; rejectionReason?: string }): Promise<Quote> {
        const updateData: any = {
            status,
            updatedAt: new Date()
        };

        if (metadata?.approvedBy) {
            updateData.approvedBy = metadata.approvedBy;
        }
        if (metadata?.rejectionReason) {
            updateData.rejectionReason = metadata.rejectionReason;
        }

        const [quote] = await db
            .update(quotes)
            .set(updateData)
            .where(eq(quotes.id, id))
            .returning();

        return quote;
    }

    /**
     * Approve quote
     */
    async approve(id: string, approvedBy: string): Promise<Quote> {
        return this.updateStatus(id, 'APPROVED', { approvedBy });
    }

    /**
     * Reject quote
     */
    async reject(id: string, rejectionReason: string): Promise<Quote> {
        return this.updateStatus(id, ' REJECTED', { rejectionReason });
    }
}

export const quoteService = new QuoteService();
