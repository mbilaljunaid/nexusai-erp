
import { pgTable, text, serial, integer, boolean, timestamp, uuid, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Work Definition Header (The Template)
export const maintWorkDefinitions = pgTable("maint_work_definitions", {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(), // Unique User-facing code e.g. "PM-500H-TRUCK"
    name: text("name").notNull(),
    description: text("description"),

    type: text("type").default("STANDARD"), // STANDARD, PM, SAFETY
    status: text("status").default("ACTIVE"), // ACTIVE, DRAFT, OBSOLETE

    version: integer("version").default(1),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. Work Definition Operations (Steps)
export const maintWorkDefinitionOperations = pgTable("maint_work_definition_ops", {

    id: uuid("id").defaultRandom().primaryKey(),
    workDefinitionId: uuid("work_definition_id").notNull(),

    sequenceNumber: integer("sequence_number").notNull(),
    name: text("name").notNull(),
    description: text("description"),

    longDescription: text("long_description"), // Detailed instructions

    standardHours: decimal("standard_hours", { precision: 10, scale: 2 }).default("0"),
    requiredHeadCount: integer("required_head_count").default(1),
});

// 3. Work Definition Materials (Parts)
export const maintWorkDefinitionMaterials = pgTable("maint_work_definition_materials", {
    id: uuid("id").defaultRandom().primaryKey(),
    workDefinitionId: uuid("work_definition_id").notNull(),
    // Ideally linked to Operation, but filtering by Header is simpler for MVP
    operationSequence: integer("operation_sequence"),

    itemId: uuid("item_id").notNull(), // Link to Inventory Item
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const maintWorkDefinitionsRelations = relations(maintWorkDefinitions, ({ many }) => ({
    operations: many(maintWorkDefinitionOperations),
    materials: many(maintWorkDefinitionMaterials),
}));

export const maintWorkDefinitionOperationsRelations = relations(maintWorkDefinitionOperations, ({ one }) => ({
    definition: one(maintWorkDefinitions, {
        fields: [maintWorkDefinitionOperations.workDefinitionId],
        references: [maintWorkDefinitions.id],
    }),
}));

export const maintWorkDefinitionMaterialsRelations = relations(maintWorkDefinitionMaterials, ({ one }) => ({
    definition: one(maintWorkDefinitions, {
        fields: [maintWorkDefinitionMaterials.workDefinitionId],
        references: [maintWorkDefinitions.id],
    }),
}));
