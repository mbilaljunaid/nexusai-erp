"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPriceListItemSchema = exports.insertPriceListSchema = exports.insertHoldDefinitionSchema = exports.insertTransactionTypeSchema = exports.insertPriceAdjustmentSchema = exports.insertHoldSchema = exports.insertOrderLineSchema = exports.insertOrderHeaderSchema = exports.omPriceListRelations = exports.omOrderLinesRelations = exports.omOrderRelations = exports.omPriceListItems = exports.omPriceLists = exports.omHoldDefinitions = exports.omTransactionTypes = exports.omPriceAdjustments = exports.omHolds = exports.omOrderLines = exports.omOrderHeaders = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_1 = require("drizzle-orm");
// ========== ORDER MANAGEMENT (OM) MODULE ==========
// --- Order Headers ---
exports.omOrderHeaders = (0, pg_core_1.pgTable)("om_order_headers", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderNumber: (0, pg_core_1.text)("order_number").notNull().unique(),
    customerId: (0, pg_core_1.text)("customer_id").notNull(),
    orderType: (0, pg_core_1.text)("order_type").default('STANDARD'), // STANDARD, RMA, DROPSHIP
    status: (0, pg_core_1.text)("status", { enum: ['DRAFT', 'BOOKED', 'AWAITING_FULFILLMENT', 'SHIPPED', 'INVOICED', 'CLOSED', 'CANCELLED', 'HOLD'] }).default('DRAFT'),
    orderCurrency: (0, pg_core_1.text)("order_currency").default('USD'),
    // Amounts
    totalAmount: (0, pg_core_1.decimal)("total_amount", { precision: 16, scale: 2 }).default("0"),
    taxAmount: (0, pg_core_1.decimal)("tax_amount", { precision: 16, scale: 2 }).default("0"),
    discountAmount: (0, pg_core_1.decimal)("discount_amount", { precision: 16, scale: 2 }).default("0"),
    // Dates
    orderedDate: (0, pg_core_1.timestamp)("ordered_date").defaultNow(),
    requestedDate: (0, pg_core_1.timestamp)("requested_date"),
    // Supply Chain & Project Links
    orgId: (0, pg_core_1.text)("org_id").notNull(),
    warehouseId: (0, pg_core_1.text)("warehouse_id"),
    shippingMethod: (0, pg_core_1.text)("shipping_method"),
    paymentTerms: (0, pg_core_1.text)("payment_terms"),
    // Audit
    createdBy: (0, pg_core_1.text)("created_by"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
// --- Order Lines ---
exports.omOrderLines = (0, pg_core_1.pgTable)("om_order_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    headerId: (0, pg_core_1.varchar)("header_id").notNull(), // FK
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    // Item
    itemId: (0, pg_core_1.varchar)("item_id").notNull(), // Link to inventory items
    description: (0, pg_core_1.text)("description"),
    // Quantity
    orderedQuantity: (0, pg_core_1.numeric)("ordered_quantity", { precision: 18, scale: 4 }).notNull(),
    shippedQuantity: (0, pg_core_1.numeric)("shipped_quantity", { precision: 18, scale: 4 }).default("0"),
    cancelledQuantity: (0, pg_core_1.numeric)("cancelled_quantity", { precision: 18, scale: 4 }).default("0"),
    uom: (0, pg_core_1.varchar)("uom").default("EA"),
    // Pricing
    unitListPrice: (0, pg_core_1.numeric)("unit_list_price", { precision: 18, scale: 4 }).default("0"),
    unitSellingPrice: (0, pg_core_1.decimal)("unit_selling_price", { precision: 16, scale: 2 }).notNull(),
    extendedAmount: (0, pg_core_1.numeric)("extended_amount", { precision: 18, scale: 2 }).default("0"),
    // Fulfillment
    status: (0, pg_core_1.text)("status", { enum: ['AWAITING_FULFILLMENT', 'PICKED', 'SHIPPED', 'INVOICED', 'CLOSED', 'RETURNED', 'CANCELLED'] }).default('AWAITING_FULFILLMENT'),
    // shippedQuantity removed (duplicate)
    projectId: (0, pg_core_1.text)("project_id"),
    taskId: (0, pg_core_1.text)("task_id"),
    orgId: (0, pg_core_1.text)("org_id").notNull(),
});
// --- Holds ---
exports.omHolds = (0, pg_core_1.pgTable)("om_holds", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    headerId: (0, pg_core_1.text)("header_id").references(() => exports.omOrderHeaders.id),
    lineId: (0, pg_core_1.text)("line_id").references(() => exports.omOrderLines.id), // Optional, can be header or line level
    holdName: (0, pg_core_1.text)("hold_name").notNull(),
    holdType: (0, pg_core_1.text)("hold_type").notNull(), // 'CREDIT', 'MARGIN', 'MANUAL'
    appliedDate: (0, pg_core_1.timestamp)("applied_date").defaultNow(),
    releasedDate: (0, pg_core_1.timestamp)("released_date"),
    releasedBy: (0, pg_core_1.text)("released_by"),
    reason: (0, pg_core_1.text)("reason")
});
// --- Price Adjustments (Discounts) ---
exports.omPriceAdjustments = (0, pg_core_1.pgTable)("om_price_adjustments", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    lineId: (0, pg_core_1.text)("line_id").references(() => exports.omOrderLines.id).notNull(),
    adjustmentName: (0, pg_core_1.text)("adjustment_name").notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 16, scale: 2 }).notNull(),
    type: (0, pg_core_1.text)("type").notNull() // 'DISCOUNT', 'SURCHARGE', 'TAX'
});
// --- Phase 7: Configuration & Master Data ---
exports.omTransactionTypes = (0, pg_core_1.pgTable)("om_transaction_types", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    typeName: (0, pg_core_1.text)("type_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    workflow: (0, pg_core_1.text)("workflow").notNull(), // 'STANDARD', 'DROP_SHIP', 'RMA'
    isActive: (0, pg_core_1.boolean)("is_active").default(true)
});
exports.omHoldDefinitions = (0, pg_core_1.pgTable)("om_hold_definitions", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    holdName: (0, pg_core_1.text)("hold_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    type: (0, pg_core_1.text)("type").notNull(), // 'SYSTEM', 'USER'
    isActive: (0, pg_core_1.boolean)("is_active").default(true)
});
exports.omPriceLists = (0, pg_core_1.pgTable)("om_price_lists", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, pg_core_1.text)("name").notNull(),
    currencyCode: (0, pg_core_1.text)("currency_code").notNull(),
    status: (0, pg_core_1.text)("status").default('ACTIVE'), // 'ACTIVE', 'INACTIVE'
    startDate: (0, pg_core_1.timestamp)("start_date"),
    endDate: (0, pg_core_1.timestamp)("end_date")
});
exports.omPriceListItems = (0, pg_core_1.pgTable)("om_price_list_items", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    priceListId: (0, pg_core_1.text)("price_list_id").references(() => exports.omPriceLists.id).notNull(),
    itemId: (0, pg_core_1.text)("item_id").notNull(),
    unitPrice: (0, pg_core_1.decimal)("unit_price", { precision: 16, scale: 2 }).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true)
});
exports.omOrderRelations = (0, drizzle_orm_1.relations)(exports.omOrderHeaders, ({ many }) => ({
    lines: many(exports.omOrderLines),
    holds: many(exports.omHolds)
}));
exports.omOrderLinesRelations = (0, drizzle_orm_1.relations)(exports.omOrderLines, ({ one }) => ({
    header: one(exports.omOrderHeaders, {
        fields: [exports.omOrderLines.headerId],
        references: [exports.omOrderHeaders.id],
    }),
}));
exports.omPriceListRelations = (0, drizzle_orm_1.relations)(exports.omPriceLists, ({ many }) => ({
    items: many(exports.omPriceListItems)
}));
// Zod Schemas
exports.insertOrderHeaderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.omOrderHeaders);
exports.insertOrderLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.omOrderLines);
exports.insertHoldSchema = (0, drizzle_zod_1.createInsertSchema)(exports.omHolds);
exports.insertPriceAdjustmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.omPriceAdjustments);
exports.insertTransactionTypeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.omTransactionTypes);
exports.insertHoldDefinitionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.omHoldDefinitions);
exports.insertPriceListSchema = (0, drizzle_zod_1.createInsertSchema)(exports.omPriceLists);
exports.insertPriceListItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.omPriceListItems);
//# sourceMappingURL=order_management.js.map