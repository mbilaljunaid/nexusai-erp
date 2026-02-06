"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDeveloperSpotlightSchema = exports.developerSpotlight = exports.insertTrainingFilterRequestSchema = exports.trainingFilterRequests = exports.insertTrainingResourceLikeSchema = exports.trainingResourceLikes = exports.insertTrainingResourceSchema = exports.trainingResources = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== TRAINING RESOURCES ==========
exports.trainingResources = (0, pg_core_1.pgTable)("training_resources", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    type: (0, pg_core_1.varchar)("type").notNull(), // video, api, guide, material, tutorial
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    resourceUrl: (0, pg_core_1.varchar)("resource_url"),
    thumbnailUrl: (0, pg_core_1.varchar)("thumbnail_url"),
    duration: (0, pg_core_1.varchar)("duration"), // for videos: "10:30", for guides: "15 min read"
    difficulty: (0, pg_core_1.varchar)("difficulty").default("beginner"), // beginner, intermediate, advanced
    modules: (0, pg_core_1.text)("modules").array(), // related module slugs
    industries: (0, pg_core_1.text)("industries").array(), // related industry slugs
    apps: (0, pg_core_1.text)("apps").array(), // related app IDs
    tags: (0, pg_core_1.text)("tags").array(),
    submittedBy: (0, pg_core_1.varchar)("submitted_by").notNull(),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, approved, rejected, archived
    reviewedBy: (0, pg_core_1.varchar)("reviewed_by"),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at"),
    reviewNotes: (0, pg_core_1.text)("review_notes"),
    likes: (0, pg_core_1.integer)("likes").default(0),
    views: (0, pg_core_1.integer)("views").default(0),
    featured: (0, pg_core_1.boolean)("featured").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTrainingResourceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trainingResources).extend({
    type: zod_1.z.enum(["video", "api", "guide", "material", "tutorial"]),
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    resourceUrl: zod_1.z.string().url().optional(),
    thumbnailUrl: zod_1.z.string().url().optional(),
    duration: zod_1.z.string().optional(),
    difficulty: zod_1.z.enum(["beginner", "intermediate", "advanced"]).optional(),
    modules: zod_1.z.array(zod_1.z.string()).optional(),
    industries: zod_1.z.array(zod_1.z.string()).optional(),
    apps: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    submittedBy: zod_1.z.string().min(1),
    status: zod_1.z.enum(["pending", "approved", "rejected", "archived"]).optional(),
    reviewedBy: zod_1.z.string().optional(),
    reviewedAt: zod_1.z.date().optional().nullable(),
    reviewNotes: zod_1.z.string().optional(),
    likes: zod_1.z.number().optional(),
    views: zod_1.z.number().optional(),
    featured: zod_1.z.boolean().optional(),
});
// Training Resource Likes
exports.trainingResourceLikes = (0, pg_core_1.pgTable)("training_resource_likes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    resourceId: (0, pg_core_1.varchar)("resource_id").notNull(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTrainingResourceLikeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trainingResourceLikes).extend({
    resourceId: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1),
});
// Training Filter Requests
exports.trainingFilterRequests = (0, pg_core_1.pgTable)("training_filter_requests", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    filterType: (0, pg_core_1.varchar)("filter_type").notNull(), // module, industry, app, tag
    filterValue: (0, pg_core_1.varchar)("filter_value").notNull(),
    description: (0, pg_core_1.text)("description"),
    requestedBy: (0, pg_core_1.varchar)("requested_by").notNull(),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, approved, rejected
    reviewedBy: (0, pg_core_1.varchar)("reviewed_by"),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTrainingFilterRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trainingFilterRequests).extend({
    filterType: zod_1.z.enum(["module", "industry", "app", "tag"]),
    filterValue: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    requestedBy: zod_1.z.string().min(1),
    status: zod_1.z.enum(["pending", "approved", "rejected"]).optional(),
    reviewedBy: zod_1.z.string().optional(),
    reviewedAt: zod_1.z.date().optional().nullable(),
});
// Developer Spotlight
exports.developerSpotlight = (0, pg_core_1.pgTable)("developer_spotlight", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    developerId: (0, pg_core_1.varchar)("developer_id").notNull(),
    featuredReason: (0, pg_core_1.text)("featured_reason"),
    isTrending: (0, pg_core_1.boolean)("is_trending").default(false),
    isNew: (0, pg_core_1.boolean)("is_new").default(false),
    isFeatured: (0, pg_core_1.boolean)("is_featured").default(false),
    displayOrder: (0, pg_core_1.integer)("display_order").default(0),
    featuredFrom: (0, pg_core_1.timestamp)("featured_from").default((0, drizzle_orm_1.sql) `now()`),
    featuredUntil: (0, pg_core_1.timestamp)("featured_until"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertDeveloperSpotlightSchema = (0, drizzle_zod_1.createInsertSchema)(exports.developerSpotlight).extend({
    developerId: zod_1.z.string().min(1),
    featuredReason: zod_1.z.string().optional(),
    isTrending: zod_1.z.boolean().optional(),
    isNew: zod_1.z.boolean().optional(),
    isFeatured: zod_1.z.boolean().optional(),
    displayOrder: zod_1.z.number().optional(),
    featuredFrom: zod_1.z.date().optional(),
    featuredUntil: zod_1.z.date().optional().nullable(),
});
//# sourceMappingURL=content.js.map