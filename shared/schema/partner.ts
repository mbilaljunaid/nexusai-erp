import { pgTable, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== PARTNER MANAGEMENT ==========
export const partners = pgTable("partners", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    company: varchar("company").notNull(),
    email: varchar("email").notNull(),
    phone: varchar("phone"),
    website: varchar("website"),
    type: varchar("type").notNull().default("partner"), // partner, trainer
    tier: varchar("tier").default("silver"), // gold, silver, platinum, diamond
    description: text("description"),
    logo: varchar("logo"),
    specializations: text("specializations").array(),
    isActive: boolean("is_active").default(true),
    isApproved: boolean("is_approved").default(false),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertPartnerSchema = createInsertSchema(partners).extend({
    name: z.string().min(1, "Name is required"),
    company: z.string().min(1, "Company is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    website: z.string().optional(),
    type: z.enum(["partner", "trainer"]).default("partner"),
    tier: z.enum(["gold", "silver", "platinum", "diamond"]).default("silver"),
    description: z.string().optional(),
    logo: z.string().optional(),
    specializations: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isApproved: z.boolean().optional(),
});

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;
