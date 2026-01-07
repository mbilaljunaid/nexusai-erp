import { pgTable, varchar, text, timestamp, integer, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== COMMUNITY & REPUTATION SYSTEM ==========
// Community Spaces - Discussion categories/forums
export const communitySpaces = pgTable("community_spaces", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull().unique(),
    description: text("description"),
    icon: varchar("icon"),
    postingGuidelines: text("posting_guidelines"),
    allowedPostTypes: text("allowed_post_types").array(), // question, answer, discussion, how-to, bug, feature, show-tell, announcement
    reputationWeight: numeric("reputation_weight", { precision: 3, scale: 2 }).default("1.0"), // multiplier for rep earned in this space
    isActive: boolean("is_active").default(true),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCommunitySpaceSchema = createInsertSchema(communitySpaces).omit({ id: true, createdAt: true }).extend({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
    postingGuidelines: z.string().optional(),
    allowedPostTypes: z.array(z.string()).optional(),
    reputationWeight: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
});

export type InsertCommunitySpace = z.infer<typeof insertCommunitySpaceSchema>;
export type CommunitySpace = typeof communitySpaces.$inferSelect;

// Community Posts - Questions, discussions, guides, etc.
export const communityPosts = pgTable("community_posts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    spaceId: varchar("space_id").notNull(),
    authorId: varchar("author_id").notNull(),
    postType: varchar("post_type").notNull(), // question, discussion, how-to, bug, feature, show-tell, announcement
    title: varchar("title").notNull(),
    content: text("content").notNull(),
    isPinned: boolean("is_pinned").default(false),
    isLocked: boolean("is_locked").default(false),
    upvotes: integer("upvotes").default(0),
    downvotes: integer("downvotes").default(0),
    viewCount: integer("view_count").default(0),
    answerCount: integer("answer_count").default(0),
    acceptedAnswerId: varchar("accepted_answer_id"),
    tags: text("tags").array(),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    spaceId: z.string().min(1),
    authorId: z.string().min(1),
    postType: z.enum(["question", "discussion", "how-to", "bug", "feature", "show-tell", "announcement"]),
    title: z.string().min(1),
    content: z.string().min(1),
    isPinned: z.boolean().optional(),
    isLocked: z.boolean().optional(),
    upvotes: z.number().optional(),
    downvotes: z.number().optional(),
    viewCount: z.number().optional(),
    answerCount: z.number().optional(),
    acceptedAnswerId: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
});

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// Community Comments/Answers
export const communityComments = pgTable("community_comments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    postId: varchar("post_id").notNull(),
    parentId: varchar("parent_id"), // For nested replies
    authorId: varchar("author_id").notNull(),
    content: text("content").notNull(),
    upvotes: integer("upvotes").default(0),
    downvotes: integer("downvotes").default(0),
    isAccepted: boolean("is_accepted").default(false), // Marked as accepted answer
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    postId: z.string().min(1),
    parentId: z.string().optional().nullable(),
    authorId: z.string().min(1),
    content: z.string().min(1),
    upvotes: z.number().optional(),
    downvotes: z.number().optional(),
    isAccepted: z.boolean().optional(),
});

export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
export type CommunityComment = typeof communityComments.$inferSelect;

// Community Votes
export const communityVotes = pgTable("community_votes", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    targetType: varchar("target_type").notNull(), // post, comment
    targetId: varchar("target_id").notNull(),
    voteType: varchar("vote_type").notNull(), // upvote, downvote
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCommunityVoteSchema = createInsertSchema(communityVotes).omit({ id: true, createdAt: true }).extend({
    userId: z.string().min(1),
    targetType: z.enum(["post", "comment"]),
    targetId: z.string().min(1),
    voteType: z.enum(["upvote", "downvote"]),
});

export type InsertCommunityVote = z.infer<typeof insertCommunityVoteSchema>;
export type CommunityVote = typeof communityVotes.$inferSelect;

// User Trust Levels
export const userTrustLevels = pgTable("user_trust_levels", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().unique(),
    trustLevel: integer("trust_level").default(0), // 0=New, 1=Contributor, 2=Trusted, 3=Leader
    totalReputation: integer("total_reputation").default(0),
    postsToday: integer("posts_today").default(0),
    answersToday: integer("answers_today").default(0),
    spacesJoinedToday: integer("spaces_joined_today").default(0),
    lastResetAt: timestamp("last_reset_at").default(sql`now()`),
    lastCalculatedAt: timestamp("last_calculated_at").default(sql`now()`),
    isShadowBanned: boolean("is_shadow_banned").default(false),
    banExpiresAt: timestamp("ban_expires_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserTrustLevelSchema = createInsertSchema(userTrustLevels).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    userId: z.string().min(1),
    trustLevel: z.number().optional(),
    totalReputation: z.number().optional(),
    postsToday: z.number().optional(),
    answersToday: z.number().optional(),
    spacesJoinedToday: z.number().optional(),
    lastResetAt: z.date().optional(),
    lastCalculatedAt: z.date().optional(),
    isShadowBanned: z.boolean().optional(),
    banExpiresAt: z.date().optional().nullable(),
});

export type InsertUserTrustLevel = z.infer<typeof insertUserTrustLevelSchema>;
export type UserTrustLevel = typeof userTrustLevels.$inferSelect;

// Reputation Events
export const reputationEvents = pgTable("reputation_events", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    actionType: varchar("action_type").notNull(), // question_posted, answer_posted, answer_upvoted, accepted_answer, downvoted, etc.
    points: integer("points").notNull(),
    sourceType: varchar("source_type"), // post, comment, app, form, bug, video, docs, service
    sourceId: varchar("source_id"),
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertReputationEventSchema = createInsertSchema(reputationEvents).omit({ id: true, createdAt: true }).extend({
    userId: z.string().min(1),
    actionType: z.string().min(1),
    points: z.number(),
    sourceType: z.string().optional(),
    sourceId: z.string().optional(),
    description: z.string().optional(),
});

export type InsertReputationEvent = z.infer<typeof insertReputationEventSchema>;
export type ReputationEvent = typeof reputationEvents.$inferSelect;

// Reputation Dimensions
export const reputationDimensions = pgTable("reputation_dimensions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().unique(),
    technicalSkill: integer("technical_skill").default(0),
    knowledgeSharing: integer("knowledge_sharing").default(0),
    qualityAccuracy: integer("quality_accuracy").default(0),
    consistency: integer("consistency").default(0),
    communityTrust: integer("community_trust").default(0),
    serviceReliability: integer("service_reliability").default(0),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertReputationDimensionSchema = createInsertSchema(reputationDimensions).omit({ id: true, updatedAt: true }).extend({
    userId: z.string().min(1),
    technicalSkill: z.number().optional(),
    knowledgeSharing: z.number().optional(),
    qualityAccuracy: z.number().optional(),
    consistency: z.number().optional(),
    communityTrust: z.number().optional(),
    serviceReliability: z.number().optional(),
});

export type InsertReputationDimension = z.infer<typeof insertReputationDimensionSchema>;
export type ReputationDimension = typeof reputationDimensions.$inferSelect;

// Community Badge Progress
export const communityBadgeProgress = pgTable("community_badge_progress", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    badgeCategory: varchar("badge_category").notNull(), // problem_solver, form_builder, app_builder, educator, bug_resolver
    currentCount: integer("current_count").default(0),
    currentLevel: varchar("current_level").default("none"), // none, bronze, silver, gold, platinum, legendary
    unlockedAt: timestamp("unlocked_at"),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertCommunityBadgeProgressSchema = createInsertSchema(communityBadgeProgress).omit({ id: true, updatedAt: true }).extend({
    userId: z.string().min(1),
    badgeCategory: z.string().min(1),
    currentCount: z.number().optional(),
    currentLevel: z.enum(["none", "bronze", "silver", "gold", "platinum", "legendary"]).optional(),
    unlockedAt: z.date().optional().nullable(),
});

export type InsertCommunityBadgeProgress = z.infer<typeof insertCommunityBadgeProgressSchema>;
export type CommunityBadgeProgress = typeof communityBadgeProgress.$inferSelect;

// Moderation Actions
export const communityModerationActions = pgTable("community_moderation_actions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    moderatorId: varchar("moderator_id").notNull(),
    targetUserId: varchar("target_user_id"),
    actionType: varchar("action_type").notNull(), // warn, mute, ban, unban, delete_post, lock_post, flag, hide, delete, suspend
    reason: text("reason"),
    targetType: varchar("target_type"), // user, post, comment
    targetId: varchar("target_id"),
    duration: integer("duration"), // in hours, for temporary actions
    flagId: varchar("flag_id"), // related flag if applicable
    aiRecommendationId: varchar("ai_recommendation_id"), // related AI recommendation if applicable
    anomalyId: varchar("anomaly_id"), // related vote anomaly if applicable
    metadata: jsonb("metadata"), // additional context data
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCommunityModerationActionSchema = createInsertSchema(communityModerationActions).omit({ id: true, createdAt: true }).extend({
    moderatorId: z.string().min(1),
    targetUserId: z.string().optional(),
    actionType: z.enum(["warn", "mute", "ban", "unban", "delete_post", "lock_post", "flag", "hide", "delete", "suspend"]),
    reason: z.string().optional(),
    targetType: z.enum(["user", "post", "comment"]).optional(),
    targetId: z.string().optional(),
    duration: z.number().optional(),
    flagId: z.string().optional(),
    aiRecommendationId: z.string().optional(),
    anomalyId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export type InsertCommunityModerationAction = z.infer<typeof insertCommunityModerationActionSchema>;
export type CommunityModerationAction = typeof communityModerationActions.$inferSelect;

// Rate Limit Tracking
export const communityRateLimits = pgTable("community_rate_limits", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    actionType: varchar("action_type").notNull(), // post, answer, space_join, link_post
    actionCount: integer("action_count").default(0),
    windowStart: timestamp("window_start").default(sql`now()`),
    isThrottled: boolean("is_throttled").default(false),
    throttleExpiresAt: timestamp("throttle_expires_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCommunityRateLimitSchema = createInsertSchema(communityRateLimits).omit({ id: true, createdAt: true }).extend({
    userId: z.string().min(1),
    actionType: z.string().min(1),
    actionCount: z.number().optional(),
    windowStart: z.date().optional(),
    isThrottled: z.boolean().optional(),
    throttleExpiresAt: z.date().optional().nullable(),
});

export type InsertCommunityRateLimit = z.infer<typeof insertCommunityRateLimitSchema>;
export type CommunityRateLimit = typeof communityRateLimits.$inferSelect;

// User Space Memberships
export const communitySpaceMemberships = pgTable("community_space_memberships", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    spaceId: varchar("space_id").notNull(),
    role: varchar("role").default("member"), // member, moderator
    joinedAt: timestamp("joined_at").default(sql`now()`),
});

export const insertCommunitySpaceMembershipSchema = createInsertSchema(communitySpaceMemberships).omit({ id: true, joinedAt: true }).extend({
    userId: z.string().min(1),
    spaceId: z.string().min(1),
    role: z.enum(["member", "moderator"]).optional(),
});

export type InsertCommunitySpaceMembership = z.infer<typeof insertCommunitySpaceMembershipSchema>;
export type CommunitySpaceMembership = typeof communitySpaceMemberships.$inferSelect;

// Community Flags
export const communityFlags = pgTable("community_flags", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reporterId: varchar("reporter_id").notNull(),
    targetType: varchar("target_type").notNull(), // post, comment
    targetId: varchar("target_id").notNull(),
    reason: varchar("reason").notNull(), // spam, harassment, inappropriate, misleading, other
    details: text("details"),
    status: varchar("status").default("pending"), // pending, reviewed, dismissed, actioned
    reviewedBy: varchar("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    actionTaken: varchar("action_taken"), // none, warning, hidden, deleted
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCommunityFlagSchema = createInsertSchema(communityFlags).omit({ id: true, createdAt: true }).extend({
    reporterId: z.string().min(1),
    targetType: z.enum(["post", "comment"]),
    targetId: z.string().min(1),
    reason: z.enum(["spam", "harassment", "inappropriate", "misleading", "other"]),
    details: z.string().optional(),
    status: z.enum(["pending", "reviewed", "dismissed", "actioned"]).optional(),
    reviewedBy: z.string().optional(),
    reviewedAt: z.date().optional(),
    actionTaken: z.string().optional(),
});

export type InsertCommunityFlag = z.infer<typeof insertCommunityFlagSchema>;
export type CommunityFlag = typeof communityFlags.$inferSelect;

// User Earned Badges
export const userEarnedBadges = pgTable("user_earned_badges", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    badgeId: varchar("badge_id").notNull(),
    earnedAt: timestamp("earned_at").default(sql`now()`),
});

export const insertUserEarnedBadgeSchema = createInsertSchema(userEarnedBadges).omit({ id: true, earnedAt: true }).extend({
    userId: z.string().min(1),
    badgeId: z.string().min(1),
});

export type InsertUserEarnedBadge = z.infer<typeof insertUserEarnedBadgeSchema>;
export type UserEarnedBadge = typeof userEarnedBadges.$inferSelect;

// ========== ABUSE DETECTION ==========
// Community Vote Events
export const communityVoteEvents = pgTable("community_vote_events", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    voterId: varchar("voter_id").notNull(),
    targetType: varchar("target_type").notNull(), // post, comment
    targetId: varchar("target_id").notNull(),
    voteType: varchar("vote_type").notNull(), // upvote, downvote
    ipHash: varchar("ip_hash"), // hashed IP for pattern detection
    userAgent: varchar("user_agent"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCommunityVoteEventSchema = createInsertSchema(communityVoteEvents).omit({ id: true, createdAt: true }).extend({
    voterId: z.string().min(1),
    targetType: z.enum(["post", "comment"]),
    targetId: z.string().min(1),
    voteType: z.enum(["upvote", "downvote"]),
    ipHash: z.string().optional(),
    userAgent: z.string().optional(),
});

export type InsertCommunityVoteEvent = z.infer<typeof insertCommunityVoteEventSchema>;
export type CommunityVoteEvent = typeof communityVoteEvents.$inferSelect;

// Community Vote Anomalies
export const communityVoteAnomalies = pgTable("community_vote_anomalies", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    anomalyType: varchar("anomaly_type").notNull(), // vote_ring, rapid_voting, self_promotion, sock_puppet
    userId: varchar("user_id"), // primary user involved
    relatedUserIds: text("related_user_ids").array(), // other users in vote ring
    targetId: varchar("target_id"), // content targeted
    targetType: varchar("target_type"), // post, comment
    severity: varchar("severity").default("medium"), // low, medium, high, critical
    evidence: jsonb("evidence"), // detailed evidence data
    status: varchar("status").default("pending"), // pending, investigating, confirmed, dismissed
    reviewedBy: varchar("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    actionTaken: varchar("action_taken"), // none, warning, reputation_penalty, suspension
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCommunityVoteAnomalySchema = createInsertSchema(communityVoteAnomalies).omit({ id: true, createdAt: true }).extend({
    anomalyType: z.enum(["vote_ring", "rapid_voting", "self_promotion", "sock_puppet"]),
    userId: z.string().optional(),
    relatedUserIds: z.array(z.string()).optional(),
    targetId: z.string().optional(),
    targetType: z.enum(["post", "comment"]).optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
    evidence: z.record(z.any()).optional(),
    status: z.enum(["pending", "investigating", "confirmed", "dismissed"]).optional(),
    reviewedBy: z.string().optional(),
    reviewedAt: z.date().optional().nullable(),
    actionTaken: z.string().optional(),
});

export type InsertCommunityVoteAnomaly = z.infer<typeof insertCommunityVoteAnomalySchema>;
export type CommunityVoteAnomaly = typeof communityVoteAnomalies.$inferSelect;

// ========== AI MODERATION ==========
// Community AI Recommendations
export const communityAIRecommendations = pgTable("community_ai_recommendations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    flagId: varchar("flag_id").notNull(),
    contentAnalysis: jsonb("content_analysis"), // detailed AI analysis
    severityScore: numeric("severity_score", { precision: 3, scale: 2 }), // 0.00 - 1.00
    suggestedAction: varchar("suggested_action"), // dismiss, warn, hide, delete, escalate
    confidence: numeric("confidence", { precision: 3, scale: 2 }), // 0.00 - 1.00
    reasoning: text("reasoning"),
    categories: text("categories").array(), // detected categories: spam, harassment, hate_speech, etc.
    processingTime: integer("processing_time"), // milliseconds
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCommunityAIRecommendationSchema = createInsertSchema(communityAIRecommendations).omit({ id: true, createdAt: true }).extend({
    flagId: z.string().min(1),
    contentAnalysis: z.record(z.any()).optional(),
    severityScore: z.string().optional(),
    suggestedAction: z.enum(["dismiss", "warn", "hide", "delete", "escalate"]).optional(),
    confidence: z.string().optional(),
    reasoning: z.string().optional(),
    categories: z.array(z.string()).optional(),
    processingTime: z.number().optional(),
});

export type InsertCommunityAIRecommendation = z.infer<typeof insertCommunityAIRecommendationSchema>;
export type CommunityAIRecommendation = typeof communityAIRecommendations.$inferSelect;
