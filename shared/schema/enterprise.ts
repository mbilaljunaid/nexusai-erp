import { pgTable, varchar, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== LEGAL GROUPS (Legal Entities) ==========
export const entLegalGroups = pgTable("ent_legal_groups", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    name: varchar("name").notNull(), // Company Name / Legal Group Name
    description: text("description"),
    registrationNumber: varchar("registration_number"),
    taxId: varchar("tax_id"),
    currency: varchar("currency").notNull().default("USD"),
    status: varchar("status").default("Active"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertLegalGroupSchema = createInsertSchema(entLegalGroups).extend({
    tenantId: z.string().min(1),
    name: z.string().min(1, "Legal Group Name is required"),
    description: z.string().optional(),
    registrationNumber: z.string().optional(),
    taxId: z.string().optional(),
    currency: z.string().optional(),
    status: z.string().optional(),
    metadata: z.record(z.any()).optional()
});

export type InsertLegalGroup = z.infer<typeof insertLegalGroupSchema>;
export type LegalGroup = typeof entLegalGroups.$inferSelect;

// ========== BUSINESS UNITS ==========
export const entBusinessUnits = pgTable("ent_business_units", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    code: varchar("code").notNull(), // e.g., BU-001
    name: varchar("name").notNull(), // e.g., North America Operations
    description: text("description"),
    managerId: varchar("manager_id"), // Reference to a user/employee
    status: varchar("status").default("Active"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertBusinessUnitSchema = createInsertSchema(entBusinessUnits).extend({
    tenantId: z.string().min(1),
    code: z.string().min(1, "Business Unit Code is required"),
    name: z.string().min(1, "Business Unit Name is required"),
    description: z.string().optional(),
    managerId: z.string().optional(),
    status: z.string().optional(),
    metadata: z.record(z.any()).optional()
});

export type InsertBusinessUnit = z.infer<typeof insertBusinessUnitSchema>;
export type BusinessUnit = typeof entBusinessUnits.$inferSelect;

// ========== LEGAL GROUP TO BU MAPPING ==========
// A Legal Group can have many Business Units. A BU typically rolls up to one Legal Group.
export const entLegalGroupBuMapping = pgTable("ent_legal_group_bu_mapping", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    legalGroupId: varchar("legal_group_id").notNull(),
    businessUnitId: varchar("business_unit_id").notNull(),
    effectiveStartDate: timestamp("effective_start_date").default(sql`now()`),
    effectiveEndDate: timestamp("effective_end_date"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertLegalGrpBuMapSchema = createInsertSchema(entLegalGroupBuMapping).extend({
    tenantId: z.string().min(1),
    legalGroupId: z.string().min(1),
    businessUnitId: z.string().min(1),
    effectiveStartDate: z.string().or(z.date()).optional(),
    effectiveEndDate: z.string().or(z.date()).optional().nullable(),
    isActive: z.boolean().optional(),
});

export type InsertLegalGrpBuMap = z.infer<typeof insertLegalGrpBuMapSchema>;
export type LegalGrpBuMap = typeof entLegalGroupBuMapping.$inferSelect;

// ========== BU TO LEDGER MAPPING ==========
// Maps Business Units to GL Ledgers (defined in finance.ts)
export const entBuLedgerMapping = pgTable("ent_bu_ledger_mapping", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    businessUnitId: varchar("business_unit_id").notNull(),
    ledgerId: varchar("ledger_id").notNull(),
    isPrimary: boolean("is_primary").default(true),
    effectiveStartDate: timestamp("effective_start_date").default(sql`now()`),
    effectiveEndDate: timestamp("effective_end_date"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBuLedgerMapSchema = createInsertSchema(entBuLedgerMapping).extend({
    tenantId: z.string().min(1),
    businessUnitId: z.string().min(1),
    ledgerId: z.string().min(1),
    isPrimary: z.boolean().optional(),
    effectiveStartDate: z.string().or(z.date()).optional(),
    effectiveEndDate: z.string().or(z.date()).optional().nullable(),
    isActive: z.boolean().optional(),
});

export type InsertBuLedgerMap = z.infer<typeof insertBuLedgerMapSchema>;
export type BuLedgerMap = typeof entBuLedgerMapping.$inferSelect;

// ========== ENTERPRISE USER DATA ACCESS ==========
// Maps users to specific BUs, LEs, Inv Orgs, Ledgers, or SetIDs
export const entUserDataAccess = pgTable("ent_user_data_access", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    userId: varchar("user_id").notNull(),
    roleId: varchar("role_id").notNull(), // The role granting this access
    contextType: varchar("context_type").notNull(), // 'BU', 'LE', 'INV_ORG', 'LEDGER', 'SET_ID'
    contextValue: varchar("context_value").notNull(), // ID of the BU/LE/etc.
    isDefault: boolean("is_default").default(false), // Is this their default active context?
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserDataAccessSchema = createInsertSchema(entUserDataAccess).extend({
    tenantId: z.string().min(1),
    userId: z.string().min(1),
    roleId: z.string().min(1),
    contextType: z.enum(['BU', 'LE', 'INV_ORG', 'LEDGER', 'SET_ID', 'GLOBAL']),
    contextValue: z.string().min(1),
    isDefault: z.boolean().optional(),
});

export type InsertUserDataAccess = z.infer<typeof insertUserDataAccessSchema>;
export type UserDataAccess = typeof entUserDataAccess.$inferSelect;
