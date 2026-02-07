import { pgTable, text, integer, boolean, timestamp, jsonb, varchar, uuid, unique } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { glLedgers, glCodeCombinations } from "./finance";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. SLA Event Classes (e.g., "AP Invoice", "AP Payment")
export const slaEventClasses = pgTable("sla_event_classes", {
    id: varchar("id").primaryKey(), // e.g., "AP_INVOICE"
    applicationId: varchar("application_id").notNull(), // "AP"
    name: varchar("name").notNull(), // "Payables Invoice"
    description: text("description"),
    enabledFlag: boolean("enabled_flag").default(true),
});

// 1.1 SLA Event Types (e.g., "Validated", "Cancelled")
export const slaEventTypes = pgTable("sla_event_types", {
    id: varchar("id").primaryKey(), // e.g., "AP_INVOICE_VALIDATED"
    eventClassId: varchar("event_class_id").references(() => slaEventClasses.id).notNull(),
    name: varchar("name").notNull(), // "Invoice Validated"
    description: text("description"),
    accountingFlag: boolean("accounting_flag").default(true), // Does this event generate accounting?
});

// 2. Mapping Sets (Input Value -> Output Value)
export const slaMappingSets = pgTable("sla_mapping_sets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull().unique(), // "SUPPLIER_TYPE_ACCOUNT"
    name: varchar("name").notNull(),
    description: text("description"),
    inputType: varchar("input_type").notNull(), // "Segment", "Literal", "Lookup"
    outputType: varchar("output_type").notNull(), // "Segment", "Account"
});

export const slaMappingSetValues = pgTable("sla_mapping_set_values", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    mappingSetId: varchar("mapping_set_id").references(() => slaMappingSets.id).notNull(),
    inputValue: varchar("input_value").notNull(),
    outputValue: varchar("output_value").notNull(),
    startDateActive: timestamp("start_date_active"),
    endDateActive: timestamp("end_date_active"),
});

// 3. Account Rules (The Core Logic - ADR)
export const slaAccountingRules = pgTable("sla_accounting_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull().unique(), // "LIABILITY_ACCOUNT_RULE"
    name: varchar("name").notNull(),
    eventClassId: varchar("event_class_id").references(() => slaEventClasses.id),
    ruleType: varchar("rule_type").notNull(), // "Account", "Segment"
    segmentName: varchar("segment_name"), // If type is Segment, which one? (segment1..10)
    sourceType: varchar("source_type").notNull(), // "Constant", "MappingSet", "Source"
    constantValue: varchar("constant_value"), // If Constant
    mappingSetId: varchar("mapping_set_id").references(() => slaMappingSets.id), // If MappingSet
    sourceAttribute: varchar("source_attribute"), // If Source (e.g. "VendorType")
});

// 3.5 Journal Line Types (JLT) - The Template
export const slaJournalLineTypes = pgTable("sla_journal_line_types", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull(), // "LIABILITY", "ITEM_EXPENSE"
    eventClassId: varchar("event_class_id").references(() => slaEventClasses.id).notNull(),
    name: varchar("name").notNull(),
    balanceType: varchar("balance_type").default("Actual"), // Actual, Encumbrance, Budget
    side: varchar("side").notNull(), // "Dr" or "Cr" (Default side, can be dynamic in Oracle but fixed for now)
    accountingClass: varchar("accounting_class").notNull(), // "Liability", "Expense"
    accountRuleId: varchar("account_rule_id").references(() => slaAccountingRules.id), // The ADR utilized
    switchSideFlag: boolean("switch_side_flag").default(false), // Allow switching side based on sign?
    mergeFlag: boolean("merge_flag").default(true), // Summarize lines?
    condition: text("condition"), // JS-like condition string e.g. "source.taxAmount > 0"
    amountSource: varchar("amount_source").default("amount"), // Key in payload check e.g. "taxAmount"
    descriptionRule: text("description_rule"), // Template e.g. "Tax for Invoice {invoiceNumber}"
    priority: integer("priority").default(0), // Execution Order
});

// 4. Subledger Journal Entry (The Result)
export const slaJournalHeaders = pgTable("sla_journal_headers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull().references(() => glLedgers.id),
    transactionSource: varchar("transaction_source"), // "MANUAL", "AP", etc.
    eventClassId: varchar("event_class_id").references(() => slaEventClasses.id),
    eventTypeId: varchar("event_type_id").references(() => slaEventTypes.id), // New link
    entityId: varchar("entity_id").notNull(), // ID of the transaction (Invoice ID)
    entityTable: varchar("entity_table").notNull(), // "ap_invoices"
    eventDate: timestamp("event_date").notNull(),
    glDate: timestamp("gl_date").notNull(),
    currencyCode: varchar("currency_code").notNull(),
    status: varchar("status").default("Draft"), // Draft, Final, Posted
    completedFlag: boolean("completed_flag").default(false),
    description: text("description"),
    transferStatus: varchar("transfer_status").default("Not Transferred"), // Not Transferred, Transferred
    glJournalId: varchar("gl_journal_id"), // Link to GL if transferred
    createdAt: timestamp("created_at").defaultNow(),
});

export const slaJournalLines = pgTable("sla_journal_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    headerId: varchar("header_id").references(() => slaJournalHeaders.id).notNull(),
    lineNumber: integer("line_number").notNull(),
    accountingClass: varchar("accounting_class").notNull(), // "Liability", "Item Expense", "Tax"
    codeCombinationId: varchar("code_combination_id").references(() => glCodeCombinations.id),
    enteredDr: varchar("entered_dr"), // Stored as string decimal
    enteredCr: varchar("entered_cr"),
    accountedDr: varchar("accounted_dr"),
    accountedCr: varchar("accounted_cr"),
    currencyCode: varchar("currency_code").notNull(),
    description: text("description"),
});

// Relations
export const slaJournalHeaderRelations = relations(slaJournalHeaders, ({ many }) => ({
    lines: many(slaJournalLines),
}));

export const slaJournalLineRelations = relations(slaJournalLines, ({ one }) => ({
    header: one(slaJournalHeaders, {
        fields: [slaJournalLines.headerId],
        references: [slaJournalHeaders.id],
    }),
    codeCombination: one(glCodeCombinations, {
        fields: [slaJournalLines.codeCombinationId],
        references: [glCodeCombinations.id],
    })
}));

// Types
export type InsertSlaEventClass = typeof slaEventClasses.$inferInsert;
export type InsertSlaEventType = typeof slaEventTypes.$inferInsert; // New
export type InsertSlaMappingSet = typeof slaMappingSets.$inferInsert;
export type InsertSlaMappingSetValue = typeof slaMappingSetValues.$inferInsert;
export type InsertSlaAccountingRule = typeof slaAccountingRules.$inferInsert;
export type InsertSlaJournalLineType = typeof slaJournalLineTypes.$inferInsert; // New
export type InsertSlaJournalHeader = typeof slaJournalHeaders.$inferInsert;
export type InsertSlaJournalLine = typeof slaJournalLines.$inferInsert;

export type SlaEventClass = typeof slaEventClasses.$inferSelect;
export type SlaEventType = typeof slaEventTypes.$inferSelect; // New
export type SlaMappingSet = typeof slaMappingSets.$inferSelect;
export type SlaMappingSetValue = typeof slaMappingSetValues.$inferSelect;
export type SlaAccountingRule = typeof slaAccountingRules.$inferSelect;
export type SlaJournalLineType = typeof slaJournalLineTypes.$inferSelect; // New
export type SlaJournalHeader = typeof slaJournalHeaders.$inferSelect;
// 5. Period Statuses (Application Level)
export const slaPeriodStatuses = pgTable("sla_period_statuses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    applicationId: varchar("application_id").notNull(), // AP, AR, FA
    ledgerId: varchar("ledger_id").notNull(),
    periodName: varchar("period_name").notNull(),
    status: varchar("status", { length: 20 }).default("Open"), // Open, Closed, Permanently Closed
    updatedAt: timestamp("updated_at").default(sql`now()`),
}, (t) => ({
    unq: unique("sla_period_statuses_unq").on(t.ledgerId, t.periodName, t.applicationId),
}));

export const insertSlaPeriodStatusSchema = createInsertSchema(slaPeriodStatuses);
export type SlaPeriodStatus = typeof slaPeriodStatuses.$inferSelect;
export type InsertSlaPeriodStatus = typeof slaPeriodStatuses.$inferInsert;
