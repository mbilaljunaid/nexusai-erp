import { pgTable, varchar, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { ppmProjects } from "./ppm";

export const constructionResources = pgTable("construction_resources", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    type: varchar("type").notNull(), // LABOR, EQUIPMENT, MATERIAL
    category: varchar("category"), // e.g. Operator, Excavator, Structural Steel
    hourlyRate: numeric("hourly_rate", { precision: 18, scale: 2 }),
    unitOfMeasure: varchar("uom").default("HOUR"), // HOUR, DAY, TON, etc.
    status: varchar("status").default("AVAILABLE"), // AVAILABLE, IN_USE, MAINTENANCE, RETIRED
    metadata: varchar("metadata"), // JSON-like string for specific details (serial numbers, certifications)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const constructionResourceAllocations = pgTable("construction_resource_allocations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    resourceId: varchar("resource_id").references(() => constructionResources.id).notNull(),
    projectId: varchar("project_id").references(() => ppmProjects.id).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    allocationPercent: integer("allocation_percent").default(100),
    actualUsage: numeric("actual_usage", { precision: 18, scale: 2 }).default("0.00"),
    status: varchar("status").default("PLANNED"), // PLANNED, ACTIVE, COMPLETED, CANCELLED
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ConstructionResource = typeof constructionResources.$inferSelect;
export type InsertConstructionResource = typeof constructionResources.$inferInsert;
export type ConstructionResourceAllocation = typeof constructionResourceAllocations.$inferSelect;
export type InsertConstructionResourceAllocation = typeof constructionResourceAllocations.$inferInsert;
