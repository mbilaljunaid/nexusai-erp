"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCorporateCardTransactionSchema = exports.insertExpensePerDiemSchema = exports.insertExpensePolicySchema = exports.insertExpenseLineSchema = exports.insertExpenseReportSchema = exports.corporateCardTransactions = exports.expensePerDiems = exports.expensePolicies = exports.expenseLines = exports.expenseReports = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
exports.expenseReports = (0, pg_core_1.pgTable)("expense_reports", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    reportNumber: (0, pg_core_1.varchar)("report_number").notNull().unique(),
    employeeId: (0, pg_core_1.varchar)("employee_id").notNull(),
    purpose: (0, pg_core_1.text)("purpose"),
    status: (0, pg_core_1.varchar)("status").notNull().default("DRAFT"), // DRAFT, SUBMITTED, APPROVED, PAID, REJECTED
    totalAmount: (0, pg_core_1.decimal)("total_amount", { precision: 20, scale: 2 }).notNull().default("0"),
    currency: (0, pg_core_1.varchar)("currency").notNull().default("USD"),
    submittedAt: (0, pg_core_1.timestamp)("submitted_at"),
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    approvedBy: (0, pg_core_1.varchar)("approved_by"),
    paymentDate: (0, pg_core_1.timestamp)("payment_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.expenseLines = (0, pg_core_1.pgTable)("expense_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    reportId: (0, pg_core_1.varchar)("report_id").notNull().references(() => exports.expenseReports.id),
    date: (0, pg_core_1.timestamp)("expense_date").notNull(),
    category: (0, pg_core_1.varchar)("category").notNull(), // TRAVEL, MEALS, SUPPLIES, etc.
    merchant: (0, pg_core_1.varchar)("merchant"),
    amount: (0, pg_core_1.decimal)("amount", { precision: 20, scale: 2 }).notNull(),
    taxAmount: (0, pg_core_1.decimal)("tax_amount", { precision: 20, scale: 2 }).default("0"),
    currency: (0, pg_core_1.varchar)("currency").notNull().default("USD"),
    description: (0, pg_core_1.text)("description"),
    receiptUrl: (0, pg_core_1.text)("receipt_url"),
    status: (0, pg_core_1.varchar)("status").notNull().default("PENDING"), // PENDING, VALIDATED, FLAGGED
    justification: (0, pg_core_1.text)("justification"),
    glCodeCombinationId: (0, pg_core_1.varchar)("gl_code_combination_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.expensePolicies = (0, pg_core_1.pgTable)("expense_policies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    category: (0, pg_core_1.varchar)("category"),
    limitAmount: (0, pg_core_1.decimal)("limit_amount", { precision: 20, scale: 2 }),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    requiresReceiptAbove: (0, pg_core_1.decimal)("requires_receipt_above", { precision: 20, scale: 2 }).default("0"),
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.expensePerDiems = (0, pg_core_1.pgTable)("expense_per_diems", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    locationCode: (0, pg_core_1.varchar)("location_code").notNull(), // e.g. "PARIS", "LONDON"
    rate: (0, pg_core_1.decimal)("rate", { precision: 20, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency").notNull().default("USD"),
    effectiveStartDate: (0, pg_core_1.timestamp)("effective_start_date").notNull(),
    effectiveEndDate: (0, pg_core_1.timestamp)("effective_end_date"),
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.corporateCardTransactions = (0, pg_core_1.pgTable)("corporate_card_transactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    cardId: (0, pg_core_1.varchar)("card_id").notNull(), // e.g. "VISA-1234"
    employeeId: (0, pg_core_1.varchar)("employee_id").notNull(),
    transactionDate: (0, pg_core_1.timestamp)("transaction_date").notNull(),
    merchant: (0, pg_core_1.varchar)("merchant").notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 20, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency").notNull().default("USD"),
    status: (0, pg_core_1.varchar)("status").notNull().default("UNRECONCILED"), // UNRECONCILED, MATCHED, EXCLUDED
    expenseLineId: (0, pg_core_1.varchar)("expense_line_id"),
    externalReference: (0, pg_core_1.varchar)("external_reference"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.insertExpenseReportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.expenseReports);
exports.insertExpenseLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.expenseLines);
exports.insertExpensePolicySchema = (0, drizzle_zod_1.createInsertSchema)(exports.expensePolicies);
exports.insertExpensePerDiemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.expensePerDiems);
exports.insertCorporateCardTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.corporateCardTransactions);
//# sourceMappingURL=finance_expenses.js.map