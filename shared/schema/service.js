"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertJobProposalSchema = exports.jobProposals = exports.insertJobPostingSchema = exports.jobPostings = exports.insertServiceReviewSchema = exports.serviceReviews = exports.insertServiceOrderSchema = exports.serviceOrders = exports.insertServicePackageSchema = exports.servicePackages = exports.insertServiceCategorySchema = exports.serviceCategories = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== SERVICE MARKETPLACE ==========
// Service Categories
exports.serviceCategories = (0, pg_core_1.pgTable)("service_categories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    icon: (0, pg_core_1.varchar)("icon"),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertServiceCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.serviceCategories).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    sortOrder: zod_1.z.number().optional(),
});
// Service Packages - services offered by trust level >= 3 users
exports.servicePackages = (0, pg_core_1.pgTable)("service_packages", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    providerId: (0, pg_core_1.varchar)("provider_id").notNull(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    price: (0, pg_core_1.numeric)("price", { precision: 10, scale: 2 }).notNull(),
    deliveryDays: (0, pg_core_1.integer)("delivery_days").default(7),
    status: (0, pg_core_1.varchar)("status").default("active"), // active, paused, deleted
    totalOrders: (0, pg_core_1.integer)("total_orders").default(0),
    averageRating: (0, pg_core_1.numeric)("average_rating", { precision: 3, scale: 2 }).default("0"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertServicePackageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.servicePackages).extend({
    providerId: zod_1.z.string().min(1),
    categoryId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    price: zod_1.z.string().min(1),
    deliveryDays: zod_1.z.number().optional(),
    status: zod_1.z.enum(["active", "paused", "deleted"]).optional(),
    totalOrders: zod_1.z.number().optional(),
    averageRating: zod_1.z.string().optional(),
});
// Service Orders - purchase records
exports.serviceOrders = (0, pg_core_1.pgTable)("service_orders", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    packageId: (0, pg_core_1.varchar)("package_id").notNull(),
    buyerId: (0, pg_core_1.varchar)("buyer_id").notNull(),
    providerId: (0, pg_core_1.varchar)("provider_id").notNull(),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, in_progress, delivered, completed, cancelled, disputed
    price: (0, pg_core_1.numeric)("price", { precision: 10, scale: 2 }).notNull(),
    requirements: (0, pg_core_1.text)("requirements"),
    deliveryNotes: (0, pg_core_1.text)("delivery_notes"),
    deliveredAt: (0, pg_core_1.timestamp)("delivered_at"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertServiceOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.serviceOrders).extend({
    packageId: zod_1.z.string().min(1),
    buyerId: zod_1.z.string().min(1),
    providerId: zod_1.z.string().min(1),
    status: zod_1.z.enum(["pending", "in_progress", "delivered", "completed", "cancelled", "disputed"]).optional(),
    price: zod_1.z.string().min(1),
    requirements: zod_1.z.string().optional(),
    deliveryNotes: zod_1.z.string().optional(),
    deliveredAt: zod_1.z.date().optional().nullable(),
    completedAt: zod_1.z.date().optional().nullable(),
});
// Service Reviews - reviews for completed services
exports.serviceReviews = (0, pg_core_1.pgTable)("service_reviews", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    orderId: (0, pg_core_1.varchar)("order_id").notNull(),
    reviewerId: (0, pg_core_1.varchar)("reviewer_id").notNull(),
    providerId: (0, pg_core_1.varchar)("provider_id").notNull(),
    rating: (0, pg_core_1.integer)("rating").notNull(), // 1-5
    comment: (0, pg_core_1.text)("comment"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertServiceReviewSchema = (0, drizzle_zod_1.createInsertSchema)(exports.serviceReviews).extend({
    orderId: zod_1.z.string().min(1),
    reviewerId: zod_1.z.string().min(1),
    providerId: zod_1.z.string().min(1),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().optional(),
});
// Job Postings - buyers post service requests for providers to bid on
exports.jobPostings = (0, pg_core_1.pgTable)("job_postings", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    buyerId: (0, pg_core_1.varchar)("buyer_id").notNull(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    budgetMin: (0, pg_core_1.numeric)("budget_min", { precision: 10, scale: 2 }),
    budgetMax: (0, pg_core_1.numeric)("budget_max", { precision: 10, scale: 2 }),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    deadline: (0, pg_core_1.timestamp)("deadline"),
    status: (0, pg_core_1.varchar)("status").default("open"), // open, in_progress, completed, cancelled, expired
    skills: (0, pg_core_1.text)("skills").array(),
    urgency: (0, pg_core_1.varchar)("urgency").default("normal"), // low, normal, high, urgent
    totalProposals: (0, pg_core_1.integer)("total_proposals").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertJobPostingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.jobPostings).extend({
    buyerId: zod_1.z.string().min(1),
    categoryId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    budgetMin: zod_1.z.string().optional(),
    budgetMax: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
    deadline: zod_1.z.date().optional().nullable(),
    status: zod_1.z.enum(["open", "in_progress", "completed", "cancelled", "expired"]).optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    urgency: zod_1.z.enum(["low", "normal", "high", "urgent"]).optional(),
    totalProposals: zod_1.z.number().optional(),
});
// Job Proposals - providers submit proposals to job postings
exports.jobProposals = (0, pg_core_1.pgTable)("job_proposals", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    jobPostingId: (0, pg_core_1.varchar)("job_posting_id").notNull(),
    providerId: (0, pg_core_1.varchar)("provider_id").notNull(),
    packageId: (0, pg_core_1.varchar)("package_id"), // optional link to existing service package
    proposalMessage: (0, pg_core_1.text)("proposal_message").notNull(),
    bidAmount: (0, pg_core_1.numeric)("bid_amount", { precision: 10, scale: 2 }).notNull(),
    estimatedDeliveryDays: (0, pg_core_1.integer)("estimated_delivery_days").notNull(),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, shortlisted, accepted, rejected, withdrawn
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertJobProposalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.jobProposals).extend({
    jobPostingId: zod_1.z.string().min(1),
    providerId: zod_1.z.string().min(1),
    packageId: zod_1.z.string().optional().nullable(),
    proposalMessage: zod_1.z.string().min(1),
    bidAmount: zod_1.z.string().min(1),
    estimatedDeliveryDays: zod_1.z.number().min(1),
    status: zod_1.z.enum(["pending", "shortlisted", "accepted", "rejected", "withdrawn"]).optional(),
});
//# sourceMappingURL=service.js.map