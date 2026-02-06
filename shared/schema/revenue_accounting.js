"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertRevenueGlAccountsSchema = exports.revenueGlAccounts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
exports.revenueGlAccounts = (0, pg_core_1.pgTable)("revenue_gl_accounts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    // Default Accounts
    revenueAccountCCID: (0, pg_core_1.varchar)("revenue_account_ccid").notNull(), // Credit Revenue
    deferredRevenueAccountCCID: (0, pg_core_1.varchar)("deferred_revenue_account_ccid").notNull(), // Debit/Credit Liability
    contractAssetAccountCCID: (0, pg_core_1.varchar)("contract_asset_account_ccid"), // Debit Asset
    clearingAccountCCID: (0, pg_core_1.varchar)("clearing_account_ccid"), // For unbilled
    description: (0, pg_core_1.text)("description"),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRevenueGlAccountsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.revenueGlAccounts);
//# sourceMappingURL=revenue_accounting.js.map