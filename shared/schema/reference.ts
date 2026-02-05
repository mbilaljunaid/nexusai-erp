
import { pgTable, varchar, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==========================================
// 1. FND_LOOKUP_TYPES (Header)
// ==========================================
export const fndLookupTypes = pgTable("fnd_lookup_types", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    lookupType: varchar("lookup_type", { length: 30 }).notNull().unique(), // e.g., 'HZ_PARTY_TYPE'
    applicationId: varchar("application_id"), // Module ID

    userLookupName: varchar("user_lookup_name").notNull(), // User friendly name
    description: text("description"),

    customizationLevel: varchar("customization_level", { length: 1 }).default("U"), // U=User, S=System, E=Extensible

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// 2. FND_LOOKUP_VALUES (Detail)
// ==========================================
export const fndLookupValues = pgTable("fnd_lookup_values", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    lookupTypeId: varchar("lookup_type_id").references(() => fndLookupTypes.id).notNull(),
    lookupCode: varchar("lookup_code", { length: 30 }).notNull(), // e.g., 'ORGANIZATION'

    meaning: varchar("meaning").notNull(), // Display Value
    description: text("description"),

    enabledFlag: boolean("enabled_flag").default(true),
    startDateActive: timestamp("start_date_active"),
    endDateActive: timestamp("end_date_active"),

    sortOrder: integer("sort_order"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});


// ==========================================
// Zod Schemas
// ==========================================

export const insertFndLookupTypeSchema = createInsertSchema(fndLookupTypes).extend({
    lookupType: z.string().min(1),
    userLookupName: z.string().min(1),
});

export const insertFndLookupValueSchema = createInsertSchema(fndLookupValues).extend({
    lookupTypeId: z.string().min(1),
    lookupCode: z.string().min(1),
    meaning: z.string().min(1),
});

// Types
export type FndLookupType = typeof fndLookupTypes.$inferSelect;
export type InsertFndLookupType = typeof fndLookupTypes.$inferInsert;

export type FndLookupValue = typeof fndLookupValues.$inferSelect;
export type InsertFndLookupValue = typeof fndLookupValues.$inferInsert;
