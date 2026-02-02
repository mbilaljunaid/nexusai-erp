import { pgTable, varchar, timestamp, date, boolean, integer, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrPersons } from "./hr_worker";

// ========== CHECKLISTS & JOURNEYS ==========
// Managing Onboarding, Offboarding, and Transition Tasks

// 1. CHECKLIST TEMPLATES (The Definition)
export const hrChecklists = pgTable("hr_checklists", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(),       // e.g. "Standard US Onboarding"
    description: varchar("description"),
    category: varchar("category").notNull(), // ONBOARDING, OFFBOARDING, TRANSFER, PROMOTION

    status: varchar("status").default("ACTIVE"), // ACTIVE, INACTIVE

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 2. CHECKLIST ITEMS (The Tasks in the Definition)
export const hrChecklistItems = pgTable("hr_checklist_items", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    checklistId: varchar("checklist_id").notNull().references(() => hrChecklists.id),

    taskName: varchar("task_name").notNull(), // e.g. "Upload Passport"
    description: varchar("description"),

    sequence: integer("sequence").notNull().default(1),
    mandatory: boolean("mandatory").default(true),

    // Role Responsibility
    performer: varchar("performer").default("WORKER"), // WORKER, MANAGER, HR, IT

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 3. ALLOCATED CHECKLISTS (The Instance assigned to a Person)
export const hrAllocatedChecklists = pgTable("hr_allocated_checklists", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull().references(() => hrPersons.id),
    checklistId: varchar("checklist_id").notNull().references(() => hrChecklists.id),

    status: varchar("status").default("IN_PROGRESS"), // IN_PROGRESS, COMPLETED, CANCELLED
    progress: numeric("progress").default("0"),       // 0-100

    assignedDate: date("assigned_date").default(sql`now()`),
    completedDate: date("completed_date"),

    initiatorId: varchar("initiator_id"), // Who assigned it?

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 4. ALLOCATED TASKS (The Runtime Items)
export const hrAllocatedTasks = pgTable("hr_allocated_tasks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    allocatedChecklistId: varchar("allocated_checklist_id").notNull().references(() => hrAllocatedChecklists.id),
    checklistItemId: varchar("checklist_item_id").references(() => hrChecklistItems.id), // Link back to definition

    taskName: varchar("task_name").notNull(), // Copied from definition
    status: varchar("status").default("PENDING"), // PENDING, DONE, SKIPPED, REJECTED

    completedBy: varchar("completed_by"),
    completedAt: timestamp("completed_at"),

    comments: varchar("comments"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Schemas
export const insertChecklistSchema = createInsertSchema(hrChecklists);
export const insertChecklistItemSchema = createInsertSchema(hrChecklistItems);
export const insertAllocatedChecklistSchema = createInsertSchema(hrAllocatedChecklists);
export const insertAllocatedTaskSchema = createInsertSchema(hrAllocatedTasks);
