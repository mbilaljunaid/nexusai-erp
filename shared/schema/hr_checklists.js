"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAllocatedTaskSchema = exports.insertAllocatedChecklistSchema = exports.insertChecklistItemSchema = exports.insertChecklistSchema = exports.hrAllocatedTasks = exports.hrAllocatedChecklists = exports.hrChecklistItems = exports.hrChecklists = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_worker_1 = require("./hr_worker");
// ========== CHECKLISTS & JOURNEYS ==========
// Managing Onboarding, Offboarding, and Transition Tasks
// 1. CHECKLIST TEMPLATES (The Definition)
exports.hrChecklists = (0, pg_core_1.pgTable)("hr_checklists", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g. "Standard US Onboarding"
    description: (0, pg_core_1.varchar)("description"),
    category: (0, pg_core_1.varchar)("category").notNull(), // ONBOARDING, OFFBOARDING, TRANSFER, PROMOTION
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"), // ACTIVE, INACTIVE
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. CHECKLIST ITEMS (The Tasks in the Definition)
exports.hrChecklistItems = (0, pg_core_1.pgTable)("hr_checklist_items", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    checklistId: (0, pg_core_1.varchar)("checklist_id").notNull().references(() => exports.hrChecklists.id),
    taskName: (0, pg_core_1.varchar)("task_name").notNull(), // e.g. "Upload Passport"
    description: (0, pg_core_1.varchar)("description"),
    sequence: (0, pg_core_1.integer)("sequence").notNull().default(1),
    mandatory: (0, pg_core_1.boolean)("mandatory").default(true),
    // Role Responsibility
    performer: (0, pg_core_1.varchar)("performer").default("WORKER"), // WORKER, MANAGER, HR, IT
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. ALLOCATED CHECKLISTS (The Instance assigned to a Person)
exports.hrAllocatedChecklists = (0, pg_core_1.pgTable)("hr_allocated_checklists", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => hr_worker_1.hrPersons.id),
    checklistId: (0, pg_core_1.varchar)("checklist_id").notNull().references(() => exports.hrChecklists.id),
    status: (0, pg_core_1.varchar)("status").default("IN_PROGRESS"), // IN_PROGRESS, COMPLETED, CANCELLED
    progress: (0, pg_core_1.numeric)("progress").default("0"), // 0-100
    assignedDate: (0, pg_core_1.date)("assigned_date").default((0, drizzle_orm_1.sql) `now()`),
    completedDate: (0, pg_core_1.date)("completed_date"),
    initiatorId: (0, pg_core_1.varchar)("initiator_id"), // Who assigned it?
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. ALLOCATED TASKS (The Runtime Items)
exports.hrAllocatedTasks = (0, pg_core_1.pgTable)("hr_allocated_tasks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    allocatedChecklistId: (0, pg_core_1.varchar)("allocated_checklist_id").notNull().references(() => exports.hrAllocatedChecklists.id),
    checklistItemId: (0, pg_core_1.varchar)("checklist_item_id").references(() => exports.hrChecklistItems.id), // Link back to definition
    taskName: (0, pg_core_1.varchar)("task_name").notNull(), // Copied from definition
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // PENDING, DONE, SKIPPED, REJECTED
    completedBy: (0, pg_core_1.varchar)("completed_by"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    comments: (0, pg_core_1.varchar)("comments"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// Schemas
exports.insertChecklistSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrChecklists);
exports.insertChecklistItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrChecklistItems);
exports.insertAllocatedChecklistSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrAllocatedChecklists);
exports.insertAllocatedTaskSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrAllocatedTasks);
//# sourceMappingURL=hr_checklists.js.map