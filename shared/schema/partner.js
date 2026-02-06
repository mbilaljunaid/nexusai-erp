"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDealRegistrationSchema = exports.dealRegistrations = exports.insertPartnerSchema = exports.partners = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== PARTNER MANAGEMENT ==========
exports.partners = (0, pg_core_1.pgTable)("partners", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    company: (0, pg_core_1.varchar)("company").notNull(),
    email: (0, pg_core_1.varchar)("email").notNull(),
    phone: (0, pg_core_1.varchar)("phone"),
    website: (0, pg_core_1.varchar)("website"),
    type: (0, pg_core_1.varchar)("type").notNull().default("partner"), // partner, trainer
    tier: (0, pg_core_1.varchar)("tier").default("silver"), // gold, silver, platinum, diamond
    description: (0, pg_core_1.text)("description"),
    logo: (0, pg_core_1.varchar)("logo"),
    specializations: (0, pg_core_1.text)("specializations").array(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    isApproved: (0, pg_core_1.boolean)("is_approved").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPartnerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.partners).extend({
    name: zod_1.z.string().min(1, "Name is required"),
    company: zod_1.z.string().min(1, "Company is required"),
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().optional(),
    website: zod_1.z.string().optional(),
    type: zod_1.z.enum(["partner", "trainer"]).default("partner"),
    tier: zod_1.z.enum(["gold", "silver", "platinum", "diamond"]).default("silver"),
    description: zod_1.z.string().optional(),
    logo: zod_1.z.string().optional(),
    specializations: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().optional(),
    isApproved: zod_1.z.boolean().optional(),
});
exports.dealRegistrations = (0, pg_core_1.pgTable)("deal_registrations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    partnerId: (0, pg_core_1.varchar)("partner_id").references(() => exports.partners.id).notNull(),
    dealName: (0, pg_core_1.varchar)("deal_name").notNull(),
    customerName: (0, pg_core_1.varchar)("customer_name").notNull(),
    amount: (0, pg_core_1.varchar)("amount"), // String to avoid numeric issues for now, or numeric
    stage: (0, pg_core_1.varchar)("stage").default("Prospecting"),
    status: (0, pg_core_1.varchar)("status").default("Pending"), // Pending, Approved, Rejected
    expectedCloseDate: (0, pg_core_1.timestamp)("expected_close_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    notes: (0, pg_core_1.text)("notes")
});
exports.insertDealRegistrationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dealRegistrations).extend({
    dealName: zod_1.z.string().min(1, "Deal Name is required"),
    customerName: zod_1.z.string().min(1, "Customer Name is required"),
    amount: zod_1.z.string().optional(),
    expectedCloseDate: zod_1.z.coerce.date().optional(),
});
//# sourceMappingURL=partner.js.map