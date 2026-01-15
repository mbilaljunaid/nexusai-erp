
import { pgTable, text, timestamp, varchar, boolean, integer, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { maintWorkOrders } from "./maintenance";
import { faAssets } from "./fixedAssets";

// Enums
export const maintPermitTypeEnum = pgEnum("maint_permit_type", [
    "HOT_WORK",
    "COLD_WORK",
    "CONFINED_SPACE",
    "ELECTRICAL_ISOLATION",
    "WORKING_AT_HEIGHT"
]);

export const maintInspectionStatusEnum = pgEnum("maint_inspection_status", [
    "PENDING",
    "IN_PROGRESS",
    "PASS",
    "FAIL"
]);

// 1. Inspection Templates (Definitions)
export const maintInspectionDefinitions = pgTable("maint_inspection_definitions", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    type: varchar("type", { length: 50 }).default("Standard"), // e.g. Pre-Start, Monthly

    // JSONB for Questions: Array of { id: string, text: string, type: 'YES_NO' | 'TEXT' | 'NUMBER', required: boolean }
    questions: jsonb("questions").notNull().default([]),

    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// 2. Inspection Executions
export const maintInspections = pgTable("maint_inspections", {
    id: uuid("id").defaultRandom().primaryKey(),
    definitionId: uuid("definition_id").references(() => maintInspectionDefinitions.id).notNull(),

    workOrderId: uuid("work_order_id").references(() => maintWorkOrders.id),
    assetId: uuid("asset_id").references(() => faAssets.id),

    status: maintInspectionStatusEnum("status").default("PENDING"),

    // JSONB for Results: Array of { questionId: string, answer: any, comment: string }
    results: jsonb("results").default([]),

    conductedByUserId: uuid("conducted_by_user_id"), // Ideally FK to users, but focusing on Schema independence
    conductedAt: timestamp("conducted_at"),

    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// 3. Work Permtis (Safety)
export const maintPermits = pgTable("maint_permits", {
    id: uuid("id").defaultRandom().primaryKey(),
    permitNumber: varchar("permit_number", { length: 50 }).notNull().unique(), // Auto-gen

    workOrderId: uuid("work_order_id").references(() => maintWorkOrders.id).notNull(),
    type: maintPermitTypeEnum("type").notNull(),

    status: varchar("status", { length: 30 }).default("ACTIVE"), // ACTIVE, CLOSED, EXPIRED

    validFrom: timestamp("valid_from").notNull(),
    validTo: timestamp("valid_to").notNull(),

    authorizedByUserId: uuid("authorized_by_user_id"),

    hazards: text("hazards"),
    precautions: text("precautions"),

    createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const maintInspectionDefinitionsRelations = relations(maintInspectionDefinitions, ({ many }) => ({
    inspections: many(maintInspections),
}));

export const maintInspectionsRelations = relations(maintInspections, ({ one }) => ({
    definition: one(maintInspectionDefinitions, {
        fields: [maintInspections.definitionId],
        references: [maintInspectionDefinitions.id],
    }),
    workOrder: one(maintWorkOrders, {
        fields: [maintInspections.workOrderId],
        references: [maintWorkOrders.id],
    }),
}));

export const maintPermitsRelations = relations(maintPermits, ({ one }) => ({
    workOrder: one(maintWorkOrders, {
        fields: [maintPermits.workOrderId],
        references: [maintWorkOrders.id],
    })
}));

export const insertMaintInspectionDefSchema = createInsertSchema(maintInspectionDefinitions);
export const insertMaintInspectionSchema = createInsertSchema(maintInspections);
export const insertMaintPermitSchema = createInsertSchema(maintPermits);
