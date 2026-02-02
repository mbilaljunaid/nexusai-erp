import { pgTable, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== PROJECT MANAGEMENT MODULE ==========
export const workOrders = pgTable("work_orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    title: varchar("title").notNull(),
    description: text("description"),
    status: varchar("status").default("open"),
    assignedTo: varchar("assigned_to"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).extend({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.string().optional(),
    assignedTo: z.string().optional().nullable(),
    dueDate: z.date().optional().nullable(),
});

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

export const projects2 = pgTable("projects2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    status: varchar("status").default("active"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertProject2Schema = createInsertSchema(projects2).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.string().optional(),
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
});

export type InsertProject2 = z.infer<typeof insertProject2Schema>;
export type Project2 = typeof projects2.$inferSelect;

// ========== AGILE PROJECT MANAGEMENT ==========
export const sprints = pgTable("sprints", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar("project_id").notNull(),
    name: varchar("name").notNull(),
    goal: text("goal"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    status: varchar("status").default("planned"), // planned, active, completed
    velocity: integer("velocity"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertSprintSchema = createInsertSchema(sprints).extend({
    projectId: z.string().min(1),
    name: z.string().min(1),
    goal: z.string().optional(),
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
    status: z.string().optional(),
    velocity: z.number().optional(),
});

export type InsertSprint = z.infer<typeof insertSprintSchema>;
export type Sprint = typeof sprints.$inferSelect;

export const issues = pgTable("issues", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar("project_id").notNull(),
    sprintId: varchar("sprint_id"),
    title: varchar("title").notNull(),
    description: text("description"),
    type: varchar("type").default("task"), // task, bug, story, epic
    status: varchar("status").default("todo"), // todo, in_progress, review, done
    priority: varchar("priority").default("medium"),
    assigneeId: varchar("assignee_id"),
    reporterId: varchar("reporter_id"),
    storyPoints: integer("story_points"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertIssueSchema = createInsertSchema(issues).extend({
    projectId: z.string().min(1),
    sprintId: z.string().optional().nullable(),
    title: z.string().min(1),
    description: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    assigneeId: z.string().optional().nullable(),
    reporterId: z.string().optional().nullable(),
    storyPoints: z.number().optional(),
    dueDate: z.date().optional().nullable(),
});

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;
