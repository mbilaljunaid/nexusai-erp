import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, uuid } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { glLedgers, glCodeCombinations } from "./finance";

// 1. SLA Event Classes (e.g., "AP Invoice", "AP Payment")
export const slaEventClasses = pgTable("sla_event_classes", {
    id: varchar("id").primaryKey(), // e.g., "AP_INVOICE"
    applicationId: varchar("application_id").notNull(), // "AP"
    name: varchar("name").notNull(), // "Payables Invoice"
    description: text("description"),
    enabledFlag: boolean("enabled_flag").default(true),
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

// 3. Account Rules (The Core Logic)
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

// 4. Subledger Journal Entry (The Result)
export const slaJournalHeaders = pgTable("sla_journal_headers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull().references(() => glLedgers.id),
    eventClassId: varchar("event_class_id").references(() => slaEventClasses.id),
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
export type InsertSlaMappingSet = typeof slaMappingSets.$inferInsert;
export type InsertSlaMappingSetValue = typeof slaMappingSetValues.$inferInsert;
export type InsertSlaAccountingRule = typeof slaAccountingRules.$inferInsert;
export type InsertSlaJournalHeader = typeof slaJournalHeaders.$inferInsert;
export type InsertSlaJournalLine = typeof slaJournalLines.$inferInsert;

export type SlaEventClass = typeof slaEventClasses.$inferSelect;
export type SlaMappingSet = typeof slaMappingSets.$inferSelect;
export type SlaMappingSetValue = typeof slaMappingSetValues.$inferSelect;
export type SlaAccountingRule = typeof slaAccountingRules.$inferSelect;
export type SlaJournalHeader = typeof slaJournalHeaders.$inferSelect;
export type SlaJournalLine = typeof slaJournalLines.$inferSelect;
