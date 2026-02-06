"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSlaPeriodStatusSchema = exports.slaPeriodStatuses = exports.slaJournalLineRelations = exports.slaJournalHeaderRelations = exports.slaJournalLines = exports.slaJournalHeaders = exports.slaJournalLineTypes = exports.slaAccountingRules = exports.slaMappingSetValues = exports.slaMappingSets = exports.slaEventTypes = exports.slaEventClasses = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const finance_1 = require("./finance");
const drizzle_zod_1 = require("drizzle-zod");
// 1. SLA Event Classes (e.g., "AP Invoice", "AP Payment")
exports.slaEventClasses = (0, pg_core_1.pgTable)("sla_event_classes", {
    id: (0, pg_core_1.varchar)("id").primaryKey(), // e.g., "AP_INVOICE"
    applicationId: (0, pg_core_1.varchar)("application_id").notNull(), // "AP"
    name: (0, pg_core_1.varchar)("name").notNull(), // "Payables Invoice"
    description: (0, pg_core_1.text)("description"),
    enabledFlag: (0, pg_core_1.boolean)("enabled_flag").default(true),
});
// 1.1 SLA Event Types (e.g., "Validated", "Cancelled")
exports.slaEventTypes = (0, pg_core_1.pgTable)("sla_event_types", {
    id: (0, pg_core_1.varchar)("id").primaryKey(), // e.g., "AP_INVOICE_VALIDATED"
    eventClassId: (0, pg_core_1.varchar)("event_class_id").references(() => exports.slaEventClasses.id).notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // "Invoice Validated"
    description: (0, pg_core_1.text)("description"),
    accountingFlag: (0, pg_core_1.boolean)("accounting_flag").default(true), // Does this event generate accounting?
});
// 2. Mapping Sets (Input Value -> Output Value)
exports.slaMappingSets = (0, pg_core_1.pgTable)("sla_mapping_sets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull().unique(), // "SUPPLIER_TYPE_ACCOUNT"
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    inputType: (0, pg_core_1.varchar)("input_type").notNull(), // "Segment", "Literal", "Lookup"
    outputType: (0, pg_core_1.varchar)("output_type").notNull(), // "Segment", "Account"
});
exports.slaMappingSetValues = (0, pg_core_1.pgTable)("sla_mapping_set_values", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    mappingSetId: (0, pg_core_1.varchar)("mapping_set_id").references(() => exports.slaMappingSets.id).notNull(),
    inputValue: (0, pg_core_1.varchar)("input_value").notNull(),
    outputValue: (0, pg_core_1.varchar)("output_value").notNull(),
    startDateActive: (0, pg_core_1.timestamp)("start_date_active"),
    endDateActive: (0, pg_core_1.timestamp)("end_date_active"),
});
// 3. Account Rules (The Core Logic - ADR)
exports.slaAccountingRules = (0, pg_core_1.pgTable)("sla_accounting_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull().unique(), // "LIABILITY_ACCOUNT_RULE"
    name: (0, pg_core_1.varchar)("name").notNull(),
    eventClassId: (0, pg_core_1.varchar)("event_class_id").references(() => exports.slaEventClasses.id),
    ruleType: (0, pg_core_1.varchar)("rule_type").notNull(), // "Account", "Segment"
    segmentName: (0, pg_core_1.varchar)("segment_name"), // If type is Segment, which one? (segment1..10)
    sourceType: (0, pg_core_1.varchar)("source_type").notNull(), // "Constant", "MappingSet", "Source"
    constantValue: (0, pg_core_1.varchar)("constant_value"), // If Constant
    mappingSetId: (0, pg_core_1.varchar)("mapping_set_id").references(() => exports.slaMappingSets.id), // If MappingSet
    sourceAttribute: (0, pg_core_1.varchar)("source_attribute"), // If Source (e.g. "VendorType")
});
// 3.5 Journal Line Types (JLT) - The Template
exports.slaJournalLineTypes = (0, pg_core_1.pgTable)("sla_journal_line_types", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull(), // "LIABILITY", "ITEM_EXPENSE"
    eventClassId: (0, pg_core_1.varchar)("event_class_id").references(() => exports.slaEventClasses.id).notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    balanceType: (0, pg_core_1.varchar)("balance_type").default("Actual"), // Actual, Encumbrance, Budget
    side: (0, pg_core_1.varchar)("side").notNull(), // "Dr" or "Cr" (Default side, can be dynamic in Oracle but fixed for now)
    accountingClass: (0, pg_core_1.varchar)("accounting_class").notNull(), // "Liability", "Expense"
    accountRuleId: (0, pg_core_1.varchar)("account_rule_id").references(() => exports.slaAccountingRules.id), // The ADR utilized
    switchSideFlag: (0, pg_core_1.boolean)("switch_side_flag").default(false), // Allow switching side based on sign?
    mergeFlag: (0, pg_core_1.boolean)("merge_flag").default(true), // Summarize lines?
    condition: (0, pg_core_1.text)("condition"), // JS-like condition string e.g. "source.taxAmount > 0"
    amountSource: (0, pg_core_1.varchar)("amount_source").default("amount"), // Key in payload check e.g. "taxAmount"
    descriptionRule: (0, pg_core_1.text)("description_rule"), // Template e.g. "Tax for Invoice {invoiceNumber}"
    priority: (0, pg_core_1.integer)("priority").default(0), // Execution Order
});
// 4. Subledger Journal Entry (The Result)
exports.slaJournalHeaders = (0, pg_core_1.pgTable)("sla_journal_headers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull().references(() => finance_1.glLedgers.id),
    transactionSource: (0, pg_core_1.varchar)("transaction_source"), // "MANUAL", "AP", etc.
    eventClassId: (0, pg_core_1.varchar)("event_class_id").references(() => exports.slaEventClasses.id),
    eventTypeId: (0, pg_core_1.varchar)("event_type_id").references(() => exports.slaEventTypes.id), // New link
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(), // ID of the transaction (Invoice ID)
    entityTable: (0, pg_core_1.varchar)("entity_table").notNull(), // "ap_invoices"
    eventDate: (0, pg_core_1.timestamp)("event_date").notNull(),
    glDate: (0, pg_core_1.timestamp)("gl_date").notNull(),
    currencyCode: (0, pg_core_1.varchar)("currency_code").notNull(),
    status: (0, pg_core_1.varchar)("status").default("Draft"), // Draft, Final, Posted
    completedFlag: (0, pg_core_1.boolean)("completed_flag").default(false),
    description: (0, pg_core_1.text)("description"),
    transferStatus: (0, pg_core_1.varchar)("transfer_status").default("Not Transferred"), // Not Transferred, Transferred
    glJournalId: (0, pg_core_1.varchar)("gl_journal_id"), // Link to GL if transferred
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.slaJournalLines = (0, pg_core_1.pgTable)("sla_journal_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    headerId: (0, pg_core_1.varchar)("header_id").references(() => exports.slaJournalHeaders.id).notNull(),
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    accountingClass: (0, pg_core_1.varchar)("accounting_class").notNull(), // "Liability", "Item Expense", "Tax"
    codeCombinationId: (0, pg_core_1.varchar)("code_combination_id").references(() => finance_1.glCodeCombinations.id),
    enteredDr: (0, pg_core_1.varchar)("entered_dr"), // Stored as string decimal
    enteredCr: (0, pg_core_1.varchar)("entered_cr"),
    accountedDr: (0, pg_core_1.varchar)("accounted_dr"),
    accountedCr: (0, pg_core_1.varchar)("accounted_cr"),
    currencyCode: (0, pg_core_1.varchar)("currency_code").notNull(),
    description: (0, pg_core_1.text)("description"),
});
// Relations
exports.slaJournalHeaderRelations = (0, drizzle_orm_1.relations)(exports.slaJournalHeaders, ({ many }) => ({
    lines: many(exports.slaJournalLines),
}));
exports.slaJournalLineRelations = (0, drizzle_orm_1.relations)(exports.slaJournalLines, ({ one }) => ({
    header: one(exports.slaJournalHeaders, {
        fields: [exports.slaJournalLines.headerId],
        references: [exports.slaJournalHeaders.id],
    }),
    codeCombination: one(finance_1.glCodeCombinations, {
        fields: [exports.slaJournalLines.codeCombinationId],
        references: [finance_1.glCodeCombinations.id],
    })
}));
// 5. Period Statuses (Application Level)
exports.slaPeriodStatuses = (0, pg_core_1.pgTable)("sla_period_statuses", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    applicationId: (0, pg_core_1.varchar)("application_id").notNull(), // AP, AR, FA
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    periodName: (0, pg_core_1.varchar)("period_name").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("Open"), // Open, Closed, Permanently Closed
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
}, (t) => ({
    unq: (0, pg_core_1.unique)("sla_period_statuses_unq").on(t.ledgerId, t.periodName, t.applicationId),
}));
exports.insertSlaPeriodStatusSchema = (0, drizzle_zod_1.createInsertSchema)(exports.slaPeriodStatuses);
//# sourceMappingURL=sla.js.map