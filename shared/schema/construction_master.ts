import { pgTable, varchar, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const constructionCostCodes = pgTable("construction_cost_codes", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code").notNull().unique(), // e.g., '03-30-00'
    name: varchar("name").notNull(), // e.g., 'Cast-in-Place Concrete'
    description: text("description"),
    category: varchar("category"), // e.g., 'Div 03 - Concrete'
    status: varchar("status").default("ACTIVE"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCostCodeSchema = createInsertSchema(constructionCostCodes);
export const selectCostCodeSchema = createSelectSchema(constructionCostCodes);

export type CostCode = typeof constructionCostCodes.$inferSelect;
