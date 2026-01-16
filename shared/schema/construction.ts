import { pgTable, varchar, text, timestamp, numeric, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== CONSTRUCTION MANAGEMENT MODULE ==========

// 1. Construction Contracts (Prime & Subcontracts)
export const constructionContracts = pgTable("construction_contracts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar("project_id").notNull(), // Link to PPM Project
    contractNumber: varchar("contract_number").notNull().unique(),
    vendorId: varchar("vendor_id"), // Link to Supplier (for Subcontracts) or Client (for Prime)
    type: varchar("type").default("PRIME"), // PRIME, SUBCONTRACT
    status: varchar("status").default("DRAFT"), // DRAFT, ACTIVE, CLOSED
    subject: varchar("subject").notNull(),
    description: text("description"),
    awardedDate: timestamp("awarded_date"),
    startDate: timestamp("start_date"),
    completionDate: timestamp("completion_date"),
    originalAmount: numeric("original_amount", { precision: 18, scale: 2 }).default("0.00"),
    revisedAmount: numeric("revised_amount", { precision: 18, scale: 2 }).default("0.00"), // Includes variations
    retentionPercentage: numeric("retention_percentage", { precision: 5, scale: 2 }).default("10.00"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertConstructionContractSchema = createInsertSchema(constructionContracts);
export type InsertConstructionContract = z.infer<typeof insertConstructionContractSchema>;
export type ConstructionContract = typeof constructionContracts.$inferSelect;

// 2. Schedule of Values (SOV) / Contract Lines
export const constructionContractLines = pgTable("construction_contract_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: varchar("contract_id").notNull(),
    lineNumber: integer("line_number").notNull(),
    taskId: varchar("task_id"), // Link to PPM Task
    description: varchar("description").notNull(),
    uom: varchar("uom").default("LS"), // Lump Sum, Each, etc.
    quantity: numeric("quantity", { precision: 18, scale: 4 }).default("1"),
    unitRate: numeric("unit_rate", { precision: 18, scale: 2 }).default("0.00"),
    scheduledValue: numeric("scheduled_value", { precision: 18, scale: 2 }).notNull(),
    status: varchar("status").default("APPROVED"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertConstructionContractLineSchema = createInsertSchema(constructionContractLines);
export type InsertConstructionContractLine = z.infer<typeof insertConstructionContractLineSchema>;
export type ConstructionContractLine = typeof constructionContractLines.$inferSelect;

// 3. Variations / Change Orders
export const constructionVariations = pgTable("construction_variations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: varchar("contract_id").notNull(),
    variationNumber: varchar("variation_number").notNull(),
    title: varchar("title").notNull(),
    description: text("description"),
    type: varchar("type").default("PCO"), // PCO (Potential), COR (Request), CO (Approved Change Order)
    status: varchar("status").default("DRAFT"), // DRAFT, SUBMITTED, APPROVED, REJECTED
    amount: numeric("amount", { precision: 18, scale: 2 }).default("0.00"),
    scheduleImpactDays: integer("schedule_impact_days").default(0),
    approvedDate: timestamp("approved_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertConstructionVariationSchema = createInsertSchema(constructionVariations);
export type InsertConstructionVariation = z.infer<typeof insertConstructionVariationSchema>;
export type ConstructionVariation = typeof constructionVariations.$inferSelect;

// 4. Applications for Payment / Pay Apps (G702 style)
export const constructionPayApps = pgTable("construction_pay_apps", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: varchar("contract_id").notNull(),
    applicationNumber: integer("application_number").notNull(),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    status: varchar("status").default("DRAFT"), // DRAFT, CERTIFIED, PAID

    // Financials
    totalCompleted: numeric("total_completed", { precision: 18, scale: 2 }).default("0.00"), // Work in Place + Stored Materials
    retentionAmount: numeric("retention_amount", { precision: 18, scale: 2 }).default("0.00"),
    previousPayments: numeric("previous_payments", { precision: 18, scale: 2 }).default("0.00"),
    currentPaymentDue: numeric("current_payment_due", { precision: 18, scale: 2 }).default("0.00"),

    certifiedBy: varchar("certified_by"), // Architect/Engineer
    certifiedDate: timestamp("certified_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertConstructionPayAppSchema = createInsertSchema(constructionPayApps);
export type InsertConstructionPayApp = z.infer<typeof insertConstructionPayAppSchema>;
export type ConstructionPayApp = typeof constructionPayApps.$inferSelect;

// 5. Pay App Lines (G703 style) - Progress per SOV line
export const constructionPayAppLines = pgTable("construction_pay_app_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    payAppId: varchar("pay_app_id").notNull(),
    contractLineId: varchar("contract_line_id").notNull(),

    workCompletedThisPeriod: numeric("work_completed_this_period", { precision: 18, scale: 2 }).default("0.00"),
    materialsStored: numeric("materials_stored", { precision: 18, scale: 2 }).default("0.00"),
    totalCompletedToDate: numeric("total_completed_to_date", { precision: 18, scale: 2 }).default("0.00"),
    percentageComplete: numeric("percentage_complete", { precision: 5, scale: 2 }).default("0.00"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertConstructionPayAppLineSchema = createInsertSchema(constructionPayAppLines);
export type InsertConstructionPayAppLine = z.infer<typeof insertConstructionPayAppLineSchema>;
export type ConstructionPayAppLine = typeof constructionPayAppLines.$inferSelect;
