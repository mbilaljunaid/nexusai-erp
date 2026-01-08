import { pgTable, varchar, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== GAMIFICATION ==========
// User Dashboard Widgets (Note: dashboardWidgets in common.ts is similar, but this one is tied to gamification context in original schema)
export const userDashboardWidgets = pgTable("user_dashboard_widgets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    widgetType: varchar("widget_type").notNull(), // "app" | "stat" | "chart" | "activity" | "quick_action"
    appId: varchar("app_id"), // For app widgets
    title: varchar("title").notNull(),
    config: jsonb("config"), // Widget-specific configuration
    position: integer("position").default(0),
    size: varchar("size").default("medium"), // "small" | "medium" | "large"
    isVisible: boolean("is_visible").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserDashboardWidgetSchema = createInsertSchema(userDashboardWidgets).extend({
    userId: z.string().min(1),
    widgetType: z.enum(["app", "stat", "chart", "activity", "quick_action"]),
    appId: z.string().optional().nullable(),
    title: z.string().min(1),
    config: z.record(z.any()).optional(),
    position: z.number().optional(),
    size: z.enum(["small", "medium", "large"]).optional(),
    isVisible: z.boolean().optional(),
});

export type InsertUserDashboardWidget = z.infer<typeof insertUserDashboardWidgetSchema>;
export type UserDashboardWidget = typeof userDashboardWidgets.$inferSelect;

// User Badges
export const userBadges = pgTable("user_badges", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    badgeId: varchar("badge_id").notNull(),
    badgeName: varchar("badge_name").notNull(),
    badgeDescription: text("badge_description"),
    badgeIcon: varchar("badge_icon"),
    badgeCategory: varchar("badge_category"), // "contributor" | "reviewer" | "developer" | "power_user"
    points: integer("points").default(0),
    earnedAt: timestamp("earned_at").default(sql`now()`),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).extend({
    userId: z.string().min(1),
    badgeId: z.string().min(1),
    badgeName: z.string().min(1),
    badgeDescription: z.string().optional(),
    badgeIcon: z.string().optional(),
    badgeCategory: z.string().optional(),
    points: z.number().optional(),
});

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// Badge Definitions
export const badgeDefinitions = pgTable("badge_definitions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    description: text("description"),
    icon: varchar("icon"),
    category: varchar("category").notNull(), // "contributor" | "reviewer" | "developer" | "power_user"
    points: integer("points").default(10),
    criteria: jsonb("criteria"), // Rules for earning badge
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBadgeDefinitionSchema = createInsertSchema(badgeDefinitions).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
    category: z.string().min(1),
    points: z.number().optional(),
    criteria: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
});

export type InsertBadgeDefinition = z.infer<typeof insertBadgeDefinitionSchema>;
export type BadgeDefinition = typeof badgeDefinitions.$inferSelect;

// User Activity Points
export const userActivityPoints = pgTable("user_activity_points", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    activityType: varchar("activity_type").notNull(), // "app_install" | "review" | "app_publish" | "contribution"
    points: integer("points").default(0),
    description: text("description"),
    referenceId: varchar("reference_id"), // app_id, review_id, etc.
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserActivityPointSchema = createInsertSchema(userActivityPoints).extend({
    userId: z.string().min(1),
    activityType: z.string().min(1),
    points: z.number().optional(),
    description: z.string().optional(),
    referenceId: z.string().optional(),
});

export type InsertUserActivityPoint = z.infer<typeof insertUserActivityPointSchema>;
export type UserActivityPoint = typeof userActivityPoints.$inferSelect;
