"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertUserActivityPointSchema = exports.userActivityPoints = exports.insertBadgeDefinitionSchema = exports.badgeDefinitions = exports.insertUserBadgeSchema = exports.userBadges = exports.insertUserDashboardWidgetSchema = exports.userDashboardWidgets = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== GAMIFICATION ==========
// User Dashboard Widgets (Note: dashboardWidgets in common.ts is similar, but this one is tied to gamification context in original schema)
exports.userDashboardWidgets = (0, pg_core_1.pgTable)("user_dashboard_widgets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    widgetType: (0, pg_core_1.varchar)("widget_type").notNull(), // "app" | "stat" | "chart" | "activity" | "quick_action"
    appId: (0, pg_core_1.varchar)("app_id"), // For app widgets
    title: (0, pg_core_1.varchar)("title").notNull(),
    config: (0, pg_core_1.jsonb)("config"), // Widget-specific configuration
    position: (0, pg_core_1.integer)("position").default(0),
    size: (0, pg_core_1.varchar)("size").default("medium"), // "small" | "medium" | "large"
    isVisible: (0, pg_core_1.boolean)("is_visible").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertUserDashboardWidgetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userDashboardWidgets).extend({
    userId: zod_1.z.string().min(1),
    widgetType: zod_1.z.enum(["app", "stat", "chart", "activity", "quick_action"]),
    appId: zod_1.z.string().optional().nullable(),
    title: zod_1.z.string().min(1),
    config: zod_1.z.record(zod_1.z.any()).optional(),
    position: zod_1.z.number().optional(),
    size: zod_1.z.enum(["small", "medium", "large"]).optional(),
    isVisible: zod_1.z.boolean().optional(),
});
// User Badges
exports.userBadges = (0, pg_core_1.pgTable)("user_badges", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    badgeId: (0, pg_core_1.varchar)("badge_id").notNull(),
    badgeName: (0, pg_core_1.varchar)("badge_name").notNull(),
    badgeDescription: (0, pg_core_1.text)("badge_description"),
    badgeIcon: (0, pg_core_1.varchar)("badge_icon"),
    badgeCategory: (0, pg_core_1.varchar)("badge_category"), // "contributor" | "reviewer" | "developer" | "power_user"
    points: (0, pg_core_1.integer)("points").default(0),
    earnedAt: (0, pg_core_1.timestamp)("earned_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertUserBadgeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userBadges).extend({
    userId: zod_1.z.string().min(1),
    badgeId: zod_1.z.string().min(1),
    badgeName: zod_1.z.string().min(1),
    badgeDescription: zod_1.z.string().optional(),
    badgeIcon: zod_1.z.string().optional(),
    badgeCategory: zod_1.z.string().optional(),
    points: zod_1.z.number().optional(),
});
// Badge Definitions
exports.badgeDefinitions = (0, pg_core_1.pgTable)("badge_definitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    icon: (0, pg_core_1.varchar)("icon"),
    category: (0, pg_core_1.varchar)("category").notNull(), // "contributor" | "reviewer" | "developer" | "power_user"
    points: (0, pg_core_1.integer)("points").default(10),
    criteria: (0, pg_core_1.jsonb)("criteria"), // Rules for earning badge
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertBadgeDefinitionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.badgeDefinitions).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1),
    points: zod_1.z.number().optional(),
    criteria: zod_1.z.record(zod_1.z.any()).optional(),
    isActive: zod_1.z.boolean().optional(),
});
// User Activity Points
exports.userActivityPoints = (0, pg_core_1.pgTable)("user_activity_points", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    activityType: (0, pg_core_1.varchar)("activity_type").notNull(), // "app_install" | "review" | "app_publish" | "contribution"
    points: (0, pg_core_1.integer)("points").default(0),
    description: (0, pg_core_1.text)("description"),
    referenceId: (0, pg_core_1.varchar)("reference_id"), // app_id, review_id, etc.
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertUserActivityPointSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userActivityPoints).extend({
    userId: zod_1.z.string().min(1),
    activityType: zod_1.z.string().min(1),
    points: zod_1.z.number().optional(),
    description: zod_1.z.string().optional(),
    referenceId: zod_1.z.string().optional(),
});
//# sourceMappingURL=gamification.js.map