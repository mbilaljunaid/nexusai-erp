import { pgTable, varchar, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== SERVICE MARKETPLACE ==========
// Service Categories
export const serviceCategories = pgTable("service_categories", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    icon: varchar("icon"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({ id: true, createdAt: true }).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
    sortOrder: z.number().optional(),
});

export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;

// Service Packages - services offered by trust level >= 3 users
export const servicePackages = pgTable("service_packages", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    providerId: varchar("provider_id").notNull(),
    categoryId: varchar("category_id").notNull(),
    title: varchar("title").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    deliveryDays: integer("delivery_days").default(7),
    status: varchar("status").default("active"), // active, paused, deleted
    totalOrders: integer("total_orders").default(0),
    averageRating: numeric("average_rating", { precision: 3, scale: 2 }).default("0"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertServicePackageSchema = createInsertSchema(servicePackages).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    providerId: z.string().min(1),
    categoryId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    price: z.string().min(1),
    deliveryDays: z.number().optional(),
    status: z.enum(["active", "paused", "deleted"]).optional(),
    totalOrders: z.number().optional(),
    averageRating: z.string().optional(),
});

export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;
export type ServicePackage = typeof servicePackages.$inferSelect;

// Service Orders - purchase records
export const serviceOrders = pgTable("service_orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    packageId: varchar("package_id").notNull(),
    buyerId: varchar("buyer_id").notNull(),
    providerId: varchar("provider_id").notNull(),
    status: varchar("status").default("pending"), // pending, in_progress, delivered, completed, cancelled, disputed
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    requirements: text("requirements"),
    deliveryNotes: text("delivery_notes"),
    deliveredAt: timestamp("delivered_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({ id: true, createdAt: true }).extend({
    packageId: z.string().min(1),
    buyerId: z.string().min(1),
    providerId: z.string().min(1),
    status: z.enum(["pending", "in_progress", "delivered", "completed", "cancelled", "disputed"]).optional(),
    price: z.string().min(1),
    requirements: z.string().optional(),
    deliveryNotes: z.string().optional(),
    deliveredAt: z.date().optional().nullable(),
    completedAt: z.date().optional().nullable(),
});

export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;
export type ServiceOrder = typeof serviceOrders.$inferSelect;

// Service Reviews - reviews for completed services
export const serviceReviews = pgTable("service_reviews", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderId: varchar("order_id").notNull(),
    reviewerId: varchar("reviewer_id").notNull(),
    providerId: varchar("provider_id").notNull(),
    rating: integer("rating").notNull(), // 1-5
    comment: text("comment"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertServiceReviewSchema = createInsertSchema(serviceReviews).omit({ id: true, createdAt: true }).extend({
    orderId: z.string().min(1),
    reviewerId: z.string().min(1),
    providerId: z.string().min(1),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

export type InsertServiceReview = z.infer<typeof insertServiceReviewSchema>;
export type ServiceReview = typeof serviceReviews.$inferSelect;

// Job Postings - buyers post service requests for providers to bid on
export const jobPostings = pgTable("job_postings", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    buyerId: varchar("buyer_id").notNull(),
    categoryId: varchar("category_id").notNull(),
    title: varchar("title").notNull(),
    description: text("description").notNull(),
    budgetMin: numeric("budget_min", { precision: 10, scale: 2 }),
    budgetMax: numeric("budget_max", { precision: 10, scale: 2 }),
    currency: varchar("currency").default("USD"),
    deadline: timestamp("deadline"),
    status: varchar("status").default("open"), // open, in_progress, completed, cancelled, expired
    skills: text("skills").array(),
    urgency: varchar("urgency").default("normal"), // low, normal, high, urgent
    totalProposals: integer("total_proposals").default(0),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    buyerId: z.string().min(1),
    categoryId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    budgetMin: z.string().optional(),
    budgetMax: z.string().optional(),
    currency: z.string().optional(),
    deadline: z.date().optional().nullable(),
    status: z.enum(["open", "in_progress", "completed", "cancelled", "expired"]).optional(),
    skills: z.array(z.string()).optional(),
    urgency: z.enum(["low", "normal", "high", "urgent"]).optional(),
    totalProposals: z.number().optional(),
});

export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;

// Job Proposals - providers submit proposals to job postings
export const jobProposals = pgTable("job_proposals", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    jobPostingId: varchar("job_posting_id").notNull(),
    providerId: varchar("provider_id").notNull(),
    packageId: varchar("package_id"), // optional link to existing service package
    proposalMessage: text("proposal_message").notNull(),
    bidAmount: numeric("bid_amount", { precision: 10, scale: 2 }).notNull(),
    estimatedDeliveryDays: integer("estimated_delivery_days").notNull(),
    status: varchar("status").default("pending"), // pending, shortlisted, accepted, rejected, withdrawn
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertJobProposalSchema = createInsertSchema(jobProposals).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    jobPostingId: z.string().min(1),
    providerId: z.string().min(1),
    packageId: z.string().optional().nullable(),
    proposalMessage: z.string().min(1),
    bidAmount: z.string().min(1),
    estimatedDeliveryDays: z.number().min(1),
    status: z.enum(["pending", "shortlisted", "accepted", "rejected", "withdrawn"]).optional(),
});

export type InsertJobProposal = z.infer<typeof insertJobProposalSchema>;
export type JobProposal = typeof jobProposals.$inferSelect;
