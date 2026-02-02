
import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const revenueGlAccounts = pgTable("revenue_gl_accounts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),

    // Default Accounts
    revenueAccountCCID: varchar("revenue_account_ccid").notNull(), // Credit Revenue
    deferredRevenueAccountCCID: varchar("deferred_revenue_account_ccid").notNull(), // Debit/Credit Liability
    contractAssetAccountCCID: varchar("contract_asset_account_ccid"), // Debit Asset
    clearingAccountCCID: varchar("clearing_account_ccid"), // For unbilled

    description: text("description"),
    lastUpdated: timestamp("last_updated").default(sql`now()`),
});

export const insertRevenueGlAccountsSchema = createInsertSchema(revenueGlAccounts);
