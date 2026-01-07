import { pgTable, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== TRAINING RESOURCES ==========
export const trainingResources = pgTable("training_resources", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    type: varchar("type").notNull(), // video, api, guide, material, tutorial
    title: varchar("title").notNull(),
    description: text("description"),
    resourceUrl: varchar("resource_url"),
    thumbnailUrl: varchar("thumbnail_url"),
    duration: varchar("duration"), // for videos: "10:30", for guides: "15 min read"
    difficulty: varchar("difficulty").default("beginner"), // beginner, intermediate, advanced
    modules: text("modules").array(), // related module slugs
    industries: text("industries").array(), // related industry slugs
    apps: text("apps").array(), // related app IDs
    tags: text("tags").array(),
    submittedBy: varchar("submitted_by").notNull(),
    status: varchar("status").default("pending"), // pending, approved, rejected, archived
    reviewedBy: varchar("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),
    likes: integer("likes").default(0),
    views: integer("views").default(0),
    featured: boolean("featured").default(false),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertTrainingResourceSchema = createInsertSchema(trainingResources).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    type: z.enum(["video", "api", "guide", "material", "tutorial"]),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    resourceUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    duration: z.string().optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    modules: z.array(z.string()).optional(),
    industries: z.array(z.string()).optional(),
    apps: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    submittedBy: z.string().min(1),
    status: z.enum(["pending", "approved", "rejected", "archived"]).optional(),
    reviewedBy: z.string().optional(),
    reviewedAt: z.date().optional().nullable(),
    reviewNotes: z.string().optional(),
    likes: z.number().optional(),
    views: z.number().optional(),
    featured: z.boolean().optional(),
});

export type InsertTrainingResource = z.infer<typeof insertTrainingResourceSchema>;
export type TrainingResource = typeof trainingResources.$inferSelect;

// Training Resource Likes
export const trainingResourceLikes = pgTable("training_resource_likes", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    resourceId: varchar("resource_id").notNull(),
    userId: varchar("user_id").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTrainingResourceLikeSchema = createInsertSchema(trainingResourceLikes).omit({ id: true, createdAt: true }).extend({
    resourceId: z.string().min(1),
    userId: z.string().min(1),
});

export type InsertTrainingResourceLike = z.infer<typeof insertTrainingResourceLikeSchema>;
export type TrainingResourceLike = typeof trainingResourceLikes.$inferSelect;

// Training Filter Requests
export const trainingFilterRequests = pgTable("training_filter_requests", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    filterType: varchar("filter_type").notNull(), // module, industry, app, tag
    filterValue: varchar("filter_value").notNull(),
    description: text("description"),
    requestedBy: varchar("requested_by").notNull(),
    status: varchar("status").default("pending"), // pending, approved, rejected
    reviewedBy: varchar("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTrainingFilterRequestSchema = createInsertSchema(trainingFilterRequests).omit({ id: true, createdAt: true }).extend({
    filterType: z.enum(["module", "industry", "app", "tag"]),
    filterValue: z.string().min(1).max(100),
    description: z.string().optional(),
    requestedBy: z.string().min(1),
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    reviewedBy: z.string().optional(),
    reviewedAt: z.date().optional().nullable(),
});

export type InsertTrainingFilterRequest = z.infer<typeof insertTrainingFilterRequestSchema>;
export type TrainingFilterRequest = typeof trainingFilterRequests.$inferSelect;

// Developer Spotlight
export const developerSpotlight = pgTable("developer_spotlight", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    developerId: varchar("developer_id").notNull(),
    featuredReason: text("featured_reason"),
    isTrending: boolean("is_trending").default(false),
    isNew: boolean("is_new").default(false),
    isFeatured: boolean("is_featured").default(false),
    displayOrder: integer("display_order").default(0),
    featuredFrom: timestamp("featured_from").default(sql`now()`),
    featuredUntil: timestamp("featured_until"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertDeveloperSpotlightSchema = createInsertSchema(developerSpotlight).omit({ id: true, createdAt: true }).extend({
    developerId: z.string().min(1),
    featuredReason: z.string().optional(),
    isTrending: z.boolean().optional(),
    isNew: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    displayOrder: z.number().optional(),
    featuredFrom: z.date().optional(),
    featuredUntil: z.date().optional().nullable(),
});

export type InsertDeveloperSpotlight = z.infer<typeof insertDeveloperSpotlightSchema>;
export type DeveloperSpotlight = typeof developerSpotlight.$inferSelect;
