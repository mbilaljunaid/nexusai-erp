import { pgTable, varchar, timestamp, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== CRM MODULE ==========
export const leads = pgTable("leads", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    email: varchar("email"),
    company: varchar("company"),
    score: numeric("score", { precision: 5, scale: 2 }).default("0"),
    status: varchar("status").default("new"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true }).extend({
    name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    company: z.string().optional().nullable(),
    score: z.string().optional(),
    status: z.string().optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
