import { pgTable, varchar, text, timestamp, jsonb, boolean, integer, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertFieldServiceJobSchema = createInsertSchema(fieldServiceJobs).extend({
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

// --- Technician Skills & Zones (Phase 31) ---
export const fieldServiceSkills = pgTable("field_service_skills", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const fieldServiceZones = pgTable("field_service_zones", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    region: varchar("region"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const fieldServiceTechnicianSkills = pgTable("field_service_technician_skills", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    technicianId: varchar("technician_id").notNull(), // User tracking
    skillId: varchar("skill_id").references(() => fieldServiceSkills.id).notNull(),
    certificationLevel: varchar("certification_level").default("Beginner"), // Beginner, Intermediate, Expert
    expiryDate: timestamp("expiry_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const fieldServiceTechnicianZones = pgTable("field_service_technician_zones", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    technicianId: varchar("technician_id").notNull(),
    zoneId: varchar("zone_id").references(() => fieldServiceZones.id).notNull(),
    isPrimary: boolean("is_primary").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertFieldServiceSkillSchema = createInsertSchema(fieldServiceSkills);
export const insertFieldServiceZoneSchema = createInsertSchema(fieldServiceZones);

export type FieldServiceSkill = typeof fieldServiceSkills.$inferSelect;
export type InsertFieldServiceSkill = z.infer<typeof insertFieldServiceSkillSchema>;

export type FieldServiceZone = typeof fieldServiceZones.$inferSelect;
export type InsertFieldServiceZone = z.infer<typeof insertFieldServiceZoneSchema>;

// --- Parts Usage & Van Stock (Phase 31) ---
export const fieldServiceVanStock = pgTable("field_service_van_stock", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    technicianId: varchar("technician_id").notNull(),
    productId: varchar("product_id").notNull(), // Links to products or items table
    quantityOnBoard: integer("quantity_on_board").notNull().default(0),
    minimumRequired: integer("minimum_required").notNull().default(0),
    safeStockLevel: integer("safe_stock_level").notNull().default(5),
    lastReplenishedDate: timestamp("last_replenished_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const fieldServiceReplenishmentOrders = pgTable("field_service_replenishment_orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    technicianId: varchar("technician_id").notNull(),
    status: varchar("status").default("Pending"), // Pending, Dispatched, Received
    createdAt: timestamp("created_at").default(sql`now()`),
    completedAt: timestamp("completed_at"),
});

export const fieldServiceReplenishmentLines = pgTable("field_service_replenishment_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderId: varchar("order_id").references(() => fieldServiceReplenishmentOrders.id).notNull(),
    productId: varchar("product_id").notNull(),
    requestedQuantity: integer("requested_quantity").notNull(),
    fulfilledQuantity: integer("fulfilled_quantity").default(0),
});

export const insertFieldServiceVanStockSchema = createInsertSchema(fieldServiceVanStock);

export type FieldServiceVanStock = typeof fieldServiceVanStock.$inferSelect;
export type InsertFieldServiceVanStock = z.infer<typeof insertFieldServiceVanStockSchema>;

// --- Mobile App Signatures (Phase 31) ---
export const fieldServiceJobSignatures = pgTable("field_service_job_signatures", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    jobId: varchar("job_id").references(() => fieldServiceJobs.id).notNull(),
    signerName: varchar("signer_name").notNull(),
    signatureDataUrl: text("signature_data_url").notNull(), // Base64 encoding
    ipAddress: varchar("ip_address"),
    signedAt: timestamp("signed_at").default(sql`now()`),
});

export const insertFieldServiceJobSignatureSchema = createInsertSchema(fieldServiceJobSignatures);

export type FieldServiceJobSignature = typeof fieldServiceJobSignatures.$inferSelect;
export type InsertFieldServiceJobSignature = z.infer<typeof insertFieldServiceJobSignatureSchema>;

// --- Time-Based SLAs (Phase 31) ---
export const fieldServiceSlas = pgTable("field_service_slas", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    businessHoursId: varchar("business_hours_id"), // Optional FK out to a schedule table
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const fieldServiceSlaMilestones = pgTable("field_service_sla_milestones", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    slaId: varchar("sla_id").references(() => fieldServiceSlas.id).notNull(),
    milestoneType: varchar("milestone_type").notNull(), // First Response, Resolution, Parts Delivered
    targetHours: numeric("target_hours").notNull(),
    warningThresholdMinutes: integer("warning_threshold_minutes").default(60),
    actionType: varchar("action_type").default("Escalate"), // Escalate, Notify, None
});

export const insertFieldServiceSlaSchema = createInsertSchema(fieldServiceSlas);

export type FieldServiceSla = typeof fieldServiceSlas.$inferSelect;
export type InsertFieldServiceSla = z.infer<typeof insertFieldServiceSlaSchema>;

// --- Dispatch Optimizer & Routing (Phase 8) ---
export const fieldServiceRoutingParameters = pgTable("field_service_routing_parameters", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    maxTravelTimeMinutes: integer("max_travel_time_minutes").default(60),
    slaPenaltyWeight: numeric("sla_penalty_weight").default('1.5'),
    overtimeAllowanceMinutes: integer("overtime_allowance_minutes").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const fieldServiceOptimizedRoutes = pgTable("field_service_optimized_routes", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    runDate: timestamp("run_date").default(sql`now()`),
    parameterId: varchar("parameter_id").references(() => fieldServiceRoutingParameters.id),
    status: varchar("status").default("Calculated"), // Calculated, Applied, Rejected
    routeData: jsonb("route_data"), // Contains the matrix of technician -> jobs -> times
    createdAt: timestamp("created_at").default(sql`now()`),
});
