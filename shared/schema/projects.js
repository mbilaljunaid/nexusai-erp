"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPaCostDistributionLineSchema = exports.paCostDistributionLines = exports.insertIssueSchema = exports.issues = exports.insertSprintSchema = exports.sprints = exports.insertProject2Schema = exports.projects2 = exports.insertWorkOrderSchema = exports.workOrders = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== PROJECT MANAGEMENT MODULE ==========
exports.workOrders = (0, pg_core_1.pgTable)("work_orders", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status").default("open"),
    assignedTo: (0, pg_core_1.varchar)("assigned_to"),
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertWorkOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workOrders).extend({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional().nullable(),
    dueDate: zod_1.z.date().optional().nullable(),
});
exports.projects2 = (0, pg_core_1.pgTable)("projects2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    startDate: (0, pg_core_1.timestamp)("start_date"),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertProject2Schema = (0, drizzle_zod_1.createInsertSchema)(exports.projects2).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    startDate: zod_1.z.date().optional().nullable(),
    endDate: zod_1.z.date().optional().nullable(),
});
// ========== AGILE PROJECT MANAGEMENT ==========
exports.sprints = (0, pg_core_1.pgTable)("sprints", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    goal: (0, pg_core_1.text)("goal"),
    startDate: (0, pg_core_1.timestamp)("start_date"),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    status: (0, pg_core_1.varchar)("status").default("planned"), // planned, active, completed
    velocity: (0, pg_core_1.integer)("velocity"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertSprintSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sprints).extend({
    projectId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    goal: zod_1.z.string().optional(),
    startDate: zod_1.z.date().optional().nullable(),
    endDate: zod_1.z.date().optional().nullable(),
    status: zod_1.z.string().optional(),
    velocity: zod_1.z.number().optional(),
});
exports.issues = (0, pg_core_1.pgTable)("issues", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    sprintId: (0, pg_core_1.varchar)("sprint_id"),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    type: (0, pg_core_1.varchar)("type").default("task"), // task, bug, story, epic
    status: (0, pg_core_1.varchar)("status").default("todo"), // todo, in_progress, review, done
    priority: (0, pg_core_1.varchar)("priority").default("medium"),
    assigneeId: (0, pg_core_1.varchar)("assignee_id"),
    reporterId: (0, pg_core_1.varchar)("reporter_id"),
    storyPoints: (0, pg_core_1.integer)("story_points"),
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertIssueSchema = (0, drizzle_zod_1.createInsertSchema)(exports.issues).extend({
    projectId: zod_1.z.string().min(1),
    sprintId: zod_1.z.string().optional().nullable(),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    priority: zod_1.z.string().optional(),
    assigneeId: zod_1.z.string().optional().nullable(),
    reporterId: zod_1.z.string().optional().nullable(),
    storyPoints: zod_1.z.number().optional(),
    dueDate: zod_1.z.date().optional().nullable(),
});
// ========== PROJECT ACCOUNTING (PA) ==========
exports.paCostDistributionLines = (0, pg_core_1.pgTable)("pa_cost_distribution_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(), // FK to projects2
    taskId: (0, pg_core_1.varchar)("task_id"), // FK to issues
    costDistributionId: (0, pg_core_1.varchar)("cost_distribution_id").notNull(), // FK to cst_cost_distributions
    amount: (0, pg_core_1.decimal)("amount", { precision: 18, scale: 4 }).notNull(),
    currencyCode: (0, pg_core_1.varchar)("currency_code").notNull(),
    billableFlag: (0, pg_core_1.boolean)("billable_flag").default(true),
    billedFlag: (0, pg_core_1.boolean)("billed_flag").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPaCostDistributionLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.paCostDistributionLines);
//# sourceMappingURL=projects.js.map