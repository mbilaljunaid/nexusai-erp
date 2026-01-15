import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, numeric, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";

// ========== ORDER MANAGEMENT (OM) MODULE ==========

// --- Order Headers ---
export const omOrderHeaders = pgTable("om_order_headers", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderNumber: text("order_number").notNull().unique(),
    customerId: text("customer_id").notNull(),
    orderType: text("order_type").default('STANDARD'), // STANDARD, RMA, DROPSHIP
    status: text("status", { enum: ['DRAFT', 'BOOKED', 'AWAITING_FULFILLMENT', 'SHIPPED', 'INVOICED', 'CLOSED', 'CANCELLED', 'HOLD'] }).default('DRAFT'),
    orderCurrency: text("order_currency").default('USD'),




    // Amounts
    totalAmount: decimal("total_amount", { precision: 16, scale: 2 }).default("0"),
    taxAmount: decimal("tax_amount", { precision: 16, scale: 2 }).default("0"),
    discountAmount: decimal("discount_amount", { precision: 16, scale: 2 }).default("0"),

    // Dates
    orderedDate: timestamp("ordered_date").defaultNow(),
    requestedDate: timestamp("requested_date"),

    // Supply Chain & Project Links
    orgId: text("org_id").notNull(),
    warehouseId: text("warehouse_id"),
    shippingMethod: text("shipping_method"),

    paymentTerms: text("payment_terms"),

    // Audit
    createdBy: text("created_by"),
    updatedAt: timestamp("updated_at").defaultNow()
});


// --- Order Lines ---
export const omOrderLines = pgTable("om_order_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    headerId: varchar("header_id").notNull(), // FK
    lineNumber: integer("line_number").notNull(),

    // Item
    itemId: varchar("item_id").notNull(), // Link to inventory items
    description: text("description"),

    // Quantity
    orderedQuantity: numeric("ordered_quantity", { precision: 18, scale: 4 }).notNull(),
    shippedQuantity: numeric("shipped_quantity", { precision: 18, scale: 4 }).default("0"),
    cancelledQuantity: numeric("cancelled_quantity", { precision: 18, scale: 4 }).default("0"),
    uom: varchar("uom").default("EA"),

    // Pricing
    unitListPrice: numeric("unit_list_price", { precision: 18, scale: 4 }).default("0"),
    unitSellingPrice: decimal("unit_selling_price", { precision: 16, scale: 2 }).notNull(),
    extendedAmount: numeric("extended_amount", { precision: 18, scale: 2 }).default("0"),

    // Fulfillment
    status: text("status", { enum: ['AWAITING_FULFILLMENT', 'PICKED', 'SHIPPED', 'INVOICED', 'CLOSED', 'RETURNED', 'CANCELLED'] }).default('AWAITING_FULFILLMENT'),
    // shippedQuantity removed (duplicate)

    projectId: text("project_id"),
    taskId: text("task_id"),

    orgId: text("org_id").notNull(),
});


// --- Holds ---
export const omHolds = pgTable("om_holds", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    headerId: text("header_id").references(() => omOrderHeaders.id),
    lineId: text("line_id").references(() => omOrderLines.id), // Optional, can be header or line level
    holdName: text("hold_name").notNull(),
    holdType: text("hold_type").notNull(), // 'CREDIT', 'MARGIN', 'MANUAL'
    appliedDate: timestamp("applied_date").defaultNow(),
    releasedDate: timestamp("released_date"),
    releasedBy: text("released_by"),
    reason: text("reason")
});


// --- Price Adjustments (Discounts) ---
export const omPriceAdjustments = pgTable("om_price_adjustments", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    lineId: text("line_id").references(() => omOrderLines.id).notNull(),
    adjustmentName: text("adjustment_name").notNull(),
    amount: decimal("amount", { precision: 16, scale: 2 }).notNull(),
    type: text("type").notNull() // 'DISCOUNT', 'SURCHARGE', 'TAX'
});


// --- Phase 7: Configuration & Master Data ---

export const omTransactionTypes = pgTable("om_transaction_types", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    typeName: text("type_name").notNull(),
    description: text("description"),
    workflow: text("workflow").notNull(), // 'STANDARD', 'DROP_SHIP', 'RMA'
    isActive: boolean("is_active").default(true)
});

export const omHoldDefinitions = pgTable("om_hold_definitions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    holdName: text("hold_name").notNull(),
    description: text("description"),
    type: text("type").notNull(), // 'SYSTEM', 'USER'
    isActive: boolean("is_active").default(true)
});

export const omPriceLists = pgTable("om_price_lists", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    currencyCode: text("currency_code").notNull(),

    status: text("status").default('ACTIVE'), // 'ACTIVE', 'INACTIVE'
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date")
});

export const omPriceListItems = pgTable("om_price_list_items", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    priceListId: text("price_list_id").references(() => omPriceLists.id).notNull(),
    itemId: text("item_id").notNull(),
    unitPrice: decimal("unit_price", { precision: 16, scale: 2 }).notNull(),
    isActive: boolean("is_active").default(true)
});

export const omOrderRelations = relations(omOrderHeaders, ({ many }) => ({
    lines: many(omOrderLines),
    holds: many(omHolds)
}));

export const omOrderLinesRelations = relations(omOrderLines, ({ one }) => ({
    header: one(omOrderHeaders, {
        fields: [omOrderLines.headerId],
        references: [omOrderHeaders.id],
    }),
}));

export const omPriceListRelations = relations(omPriceLists, ({ many }) => ({
    items: many(omPriceListItems)
}));


// Zod Schemas
export const insertOrderHeaderSchema = createInsertSchema(omOrderHeaders);
export const insertOrderLineSchema = createInsertSchema(omOrderLines);
export const insertHoldSchema = createInsertSchema(omHolds);
export const insertPriceAdjustmentSchema = createInsertSchema(omPriceAdjustments);
export const insertTransactionTypeSchema = createInsertSchema(omTransactionTypes);
export const insertHoldDefinitionSchema = createInsertSchema(omHoldDefinitions);
export const insertPriceListSchema = createInsertSchema(omPriceLists);
export const insertPriceListItemSchema = createInsertSchema(omPriceListItems);

export type OmOrderHeader = typeof omOrderHeaders.$inferSelect;
export type OmOrderLine = typeof omOrderLines.$inferSelect;
export type OmHold = typeof omHolds.$inferSelect;
export type OmPriceAdjustment = typeof omPriceAdjustments.$inferSelect;
export type OmTransactionType = typeof omTransactionTypes.$inferSelect;
export type OmHoldDefinition = typeof omHoldDefinitions.$inferSelect;
export type OmPriceList = typeof omPriceLists.$inferSelect;
export type OmPriceListItem = typeof omPriceListItems.$inferSelect;
