
import { pgTable, text, timestamp, decimal, varchar, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Minimal Costing Schema for O2C Integration
export const cstTransactions = pgTable("cst_transactions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionType: text("transaction_type").notNull(), // 'COGS', 'RECEIPT'
    itemId: text("item_id").notNull(),
    quantity: decimal("quantity", { precision: 16, scale: 4 }).notNull(),
    unitCost: decimal("unit_cost", { precision: 16, scale: 4 }).default("0"),
    totalCost: decimal("total_cost", { precision: 16, scale: 2 }).default("0"),

    sourceType: text("source_type"), // 'ORDER', 'PO'
    sourceId: text("source_id"),     // Order ID or PO ID
    sourceLineId: text("source_line_id"),

    orgId: text("org_id").notNull(),
    transactionDate: timestamp("transaction_date").defaultNow(),
    glStatus: text("gl_status").default("PENDING")
});

export const insertCstTransactionSchema = createInsertSchema(cstTransactions);
export type CstTransaction = typeof cstTransactions.$inferSelect;
