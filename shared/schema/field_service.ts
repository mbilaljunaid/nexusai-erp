import { pgTable, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== FIELD SERVICE ==========
export const fieldServiceJobs = pgTable("field_service_jobs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    jobNumber: varchar("job_number").notNull(),
    customerId: varchar("customer_id"),
    technicianId: varchar("technician_id"),
    jobType: varchar("job_type"), // installation, repair, maintenance
    status: varchar("status").default("scheduled"), // scheduled, in_progress, completed, cancelled
    priority: varchar("priority").default("medium"),
    scheduledDate: timestamp("scheduled_date"),
    completedDate: timestamp("completed_date"),
    location: jsonb("location"),
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertFieldServiceJobSchema = createInsertSchema(fieldServiceJobs).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    jobNumber: z.string().min(1),
    customerId: z.string().optional().nullable(),
    technicianId: z.string().optional().nullable(),
    jobType: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    scheduledDate: z.date().optional().nullable(),
    completedDate: z.date().optional().nullable(),
    location: z.record(z.any()).optional(),
    notes: z.string().optional(),
});

export type InsertFieldServiceJob = z.infer<typeof insertFieldServiceJobSchema>;
export type FieldServiceJob = typeof fieldServiceJobs.$inferSelect;
