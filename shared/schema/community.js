"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCommunityAIRecommendationSchema = exports.communityAIRecommendations = exports.insertCommunityVoteAnomalySchema = exports.communityVoteAnomalies = exports.insertCommunityVoteEventSchema = exports.communityVoteEvents = exports.insertUserEarnedBadgeSchema = exports.userEarnedBadges = exports.insertCommunityFlagSchema = exports.communityFlags = exports.insertCommunitySpaceMembershipSchema = exports.communitySpaceMemberships = exports.insertCommunityRateLimitSchema = exports.communityRateLimits = exports.insertCommunityModerationActionSchema = exports.communityModerationActions = exports.insertCommunityBadgeProgressSchema = exports.communityBadgeProgress = exports.insertReputationDimensionSchema = exports.reputationDimensions = exports.insertReputationEventSchema = exports.reputationEvents = exports.insertUserTrustLevelSchema = exports.userTrustLevels = exports.insertCommunityVoteSchema = exports.communityVotes = exports.insertCommunityCommentSchema = exports.communityComments = exports.insertCommunityPostSchema = exports.communityPosts = exports.insertCommunitySpaceSchema = exports.communitySpaces = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== COMMUNITY & REPUTATION SYSTEM ==========
// Community Spaces - Discussion categories/forums
exports.communitySpaces = (0, pg_core_1.pgTable)("community_spaces", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    slug: (0, pg_core_1.varchar)("slug").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    icon: (0, pg_core_1.varchar)("icon"),
    postingGuidelines: (0, pg_core_1.text)("posting_guidelines"),
    allowedPostTypes: (0, pg_core_1.text)("allowed_post_types").array(), // question, answer, discussion, how-to, bug, feature, show-tell, announcement
    reputationWeight: (0, pg_core_1.numeric)("reputation_weight", { precision: 3, scale: 2 }).default("1.0"), // multiplier for rep earned in this space
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunitySpaceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communitySpaces).extend({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    postingGuidelines: zod_1.z.string().optional(),
    allowedPostTypes: zod_1.z.array(zod_1.z.string()).optional(),
    reputationWeight: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    sortOrder: zod_1.z.number().optional(),
});
// Community Posts - Questions, discussions, guides, etc.
exports.communityPosts = (0, pg_core_1.pgTable)("community_posts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    spaceId: (0, pg_core_1.varchar)("space_id").notNull(),
    authorId: (0, pg_core_1.varchar)("author_id").notNull(),
    postType: (0, pg_core_1.varchar)("post_type").notNull(), // question, discussion, how-to, bug, feature, show-tell, announcement
    title: (0, pg_core_1.varchar)("title").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    isPinned: (0, pg_core_1.boolean)("is_pinned").default(false),
    isLocked: (0, pg_core_1.boolean)("is_locked").default(false),
    upvotes: (0, pg_core_1.integer)("upvotes").default(0),
    downvotes: (0, pg_core_1.integer)("downvotes").default(0),
    viewCount: (0, pg_core_1.integer)("view_count").default(0),
    answerCount: (0, pg_core_1.integer)("answer_count").default(0),
    acceptedAnswerId: (0, pg_core_1.varchar)("accepted_answer_id"),
    tags: (0, pg_core_1.text)("tags").array(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunityPostSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityPosts).extend({
    spaceId: zod_1.z.string().min(1),
    authorId: zod_1.z.string().min(1),
    postType: zod_1.z.enum(["question", "discussion", "how-to", "bug", "feature", "show-tell", "announcement"]),
    title: zod_1.z.string().min(1),
    content: zod_1.z.string().min(1),
    isPinned: zod_1.z.boolean().optional(),
    isLocked: zod_1.z.boolean().optional(),
    upvotes: zod_1.z.number().optional(),
    downvotes: zod_1.z.number().optional(),
    viewCount: zod_1.z.number().optional(),
    answerCount: zod_1.z.number().optional(),
    acceptedAnswerId: zod_1.z.string().optional().nullable(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
// Community Comments/Answers
exports.communityComments = (0, pg_core_1.pgTable)("community_comments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    postId: (0, pg_core_1.varchar)("post_id").notNull(),
    parentId: (0, pg_core_1.varchar)("parent_id"), // For nested replies
    authorId: (0, pg_core_1.varchar)("author_id").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    upvotes: (0, pg_core_1.integer)("upvotes").default(0),
    downvotes: (0, pg_core_1.integer)("downvotes").default(0),
    isAccepted: (0, pg_core_1.boolean)("is_accepted").default(false), // Marked as accepted answer
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunityCommentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityComments).extend({
    postId: zod_1.z.string().min(1),
    parentId: zod_1.z.string().optional().nullable(),
    authorId: zod_1.z.string().min(1),
    content: zod_1.z.string().min(1),
    upvotes: zod_1.z.number().optional(),
    downvotes: zod_1.z.number().optional(),
    isAccepted: zod_1.z.boolean().optional(),
});
// Community Votes
exports.communityVotes = (0, pg_core_1.pgTable)("community_votes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    targetType: (0, pg_core_1.varchar)("target_type").notNull(), // post, comment
    targetId: (0, pg_core_1.varchar)("target_id").notNull(),
    voteType: (0, pg_core_1.varchar)("vote_type").notNull(), // upvote, downvote
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunityVoteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityVotes).extend({
    userId: zod_1.z.string().min(1),
    targetType: zod_1.z.enum(["post", "comment"]),
    targetId: zod_1.z.string().min(1),
    voteType: zod_1.z.enum(["upvote", "downvote"]),
});
// User Trust Levels
exports.userTrustLevels = (0, pg_core_1.pgTable)("user_trust_levels", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull().unique(),
    trustLevel: (0, pg_core_1.integer)("trust_level").default(0), // 0=New, 1=Contributor, 2=Trusted, 3=Leader
    totalReputation: (0, pg_core_1.integer)("total_reputation").default(0),
    postsToday: (0, pg_core_1.integer)("posts_today").default(0),
    answersToday: (0, pg_core_1.integer)("answers_today").default(0),
    spacesJoinedToday: (0, pg_core_1.integer)("spaces_joined_today").default(0),
    lastResetAt: (0, pg_core_1.timestamp)("last_reset_at").default((0, drizzle_orm_1.sql) `now()`),
    lastCalculatedAt: (0, pg_core_1.timestamp)("last_calculated_at").default((0, drizzle_orm_1.sql) `now()`),
    isShadowBanned: (0, pg_core_1.boolean)("is_shadow_banned").default(false),
    banExpiresAt: (0, pg_core_1.timestamp)("ban_expires_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertUserTrustLevelSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userTrustLevels).extend({
    userId: zod_1.z.string().min(1),
    trustLevel: zod_1.z.number().optional(),
    totalReputation: zod_1.z.number().optional(),
    postsToday: zod_1.z.number().optional(),
    answersToday: zod_1.z.number().optional(),
    spacesJoinedToday: zod_1.z.number().optional(),
    lastResetAt: zod_1.z.date().optional(),
    lastCalculatedAt: zod_1.z.date().optional(),
    isShadowBanned: zod_1.z.boolean().optional(),
    banExpiresAt: zod_1.z.date().optional().nullable(),
});
// Reputation Events
exports.reputationEvents = (0, pg_core_1.pgTable)("reputation_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    actionType: (0, pg_core_1.varchar)("action_type").notNull(), // question_posted, answer_posted, answer_upvoted, accepted_answer, downvoted, etc.
    points: (0, pg_core_1.integer)("points").notNull(),
    sourceType: (0, pg_core_1.varchar)("source_type"), // post, comment, app, form, bug, video, docs, service
    sourceId: (0, pg_core_1.varchar)("source_id"),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertReputationEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.reputationEvents).extend({
    userId: zod_1.z.string().min(1),
    actionType: zod_1.z.string().min(1),
    points: zod_1.z.number(),
    sourceType: zod_1.z.string().optional(),
    sourceId: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
// Reputation Dimensions
exports.reputationDimensions = (0, pg_core_1.pgTable)("reputation_dimensions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull().unique(),
    technicalSkill: (0, pg_core_1.integer)("technical_skill").default(0),
    knowledgeSharing: (0, pg_core_1.integer)("knowledge_sharing").default(0),
    qualityAccuracy: (0, pg_core_1.integer)("quality_accuracy").default(0),
    consistency: (0, pg_core_1.integer)("consistency").default(0),
    communityTrust: (0, pg_core_1.integer)("community_trust").default(0),
    serviceReliability: (0, pg_core_1.integer)("service_reliability").default(0),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertReputationDimensionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.reputationDimensions).extend({
    userId: zod_1.z.string().min(1),
    technicalSkill: zod_1.z.number().optional(),
    knowledgeSharing: zod_1.z.number().optional(),
    qualityAccuracy: zod_1.z.number().optional(),
    consistency: zod_1.z.number().optional(),
    communityTrust: zod_1.z.number().optional(),
    serviceReliability: zod_1.z.number().optional(),
});
// Community Badge Progress
exports.communityBadgeProgress = (0, pg_core_1.pgTable)("community_badge_progress", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    badgeCategory: (0, pg_core_1.varchar)("badge_category").notNull(), // problem_solver, form_builder, app_builder, educator, bug_resolver
    currentCount: (0, pg_core_1.integer)("current_count").default(0),
    currentLevel: (0, pg_core_1.varchar)("current_level").default("none"), // none, bronze, silver, gold, platinum, legendary
    unlockedAt: (0, pg_core_1.timestamp)("unlocked_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunityBadgeProgressSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityBadgeProgress).extend({
    userId: zod_1.z.string().min(1),
    badgeCategory: zod_1.z.string().min(1),
    currentCount: zod_1.z.number().optional(),
    currentLevel: zod_1.z.enum(["none", "bronze", "silver", "gold", "platinum", "legendary"]).optional(),
    unlockedAt: zod_1.z.date().optional().nullable(),
});
// Moderation Actions
exports.communityModerationActions = (0, pg_core_1.pgTable)("community_moderation_actions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    moderatorId: (0, pg_core_1.varchar)("moderator_id").notNull(),
    targetUserId: (0, pg_core_1.varchar)("target_user_id"),
    actionType: (0, pg_core_1.varchar)("action_type").notNull(), // warn, mute, ban, unban, delete_post, lock_post, flag, hide, delete, suspend
    reason: (0, pg_core_1.text)("reason"),
    targetType: (0, pg_core_1.varchar)("target_type"), // user, post, comment
    targetId: (0, pg_core_1.varchar)("target_id"),
    duration: (0, pg_core_1.integer)("duration"), // in hours, for temporary actions
    flagId: (0, pg_core_1.varchar)("flag_id"), // related flag if applicable
    aiRecommendationId: (0, pg_core_1.varchar)("ai_recommendation_id"), // related AI recommendation if applicable
    anomalyId: (0, pg_core_1.varchar)("anomaly_id"), // related vote anomaly if applicable
    metadata: (0, pg_core_1.jsonb)("metadata"), // additional context data
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunityModerationActionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityModerationActions).extend({
    moderatorId: zod_1.z.string().min(1),
    targetUserId: zod_1.z.string().optional(),
    actionType: zod_1.z.enum(["warn", "mute", "ban", "unban", "delete_post", "lock_post", "flag", "hide", "delete", "suspend"]),
    reason: zod_1.z.string().optional(),
    targetType: zod_1.z.enum(["user", "post", "comment"]).optional(),
    targetId: zod_1.z.string().optional(),
    duration: zod_1.z.number().optional(),
    flagId: zod_1.z.string().optional(),
    aiRecommendationId: zod_1.z.string().optional(),
    anomalyId: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// Rate Limit Tracking
exports.communityRateLimits = (0, pg_core_1.pgTable)("community_rate_limits", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    actionType: (0, pg_core_1.varchar)("action_type").notNull(), // post, answer, space_join, link_post
    actionCount: (0, pg_core_1.integer)("action_count").default(0),
    windowStart: (0, pg_core_1.timestamp)("window_start").default((0, drizzle_orm_1.sql) `now()`),
    isThrottled: (0, pg_core_1.boolean)("is_throttled").default(false),
    throttleExpiresAt: (0, pg_core_1.timestamp)("throttle_expires_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunityRateLimitSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityRateLimits).extend({
    userId: zod_1.z.string().min(1),
    actionType: zod_1.z.string().min(1),
    actionCount: zod_1.z.number().optional(),
    windowStart: zod_1.z.date().optional(),
    isThrottled: zod_1.z.boolean().optional(),
    throttleExpiresAt: zod_1.z.date().optional().nullable(),
});
// User Space Memberships
exports.communitySpaceMemberships = (0, pg_core_1.pgTable)("community_space_memberships", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    spaceId: (0, pg_core_1.varchar)("space_id").notNull(),
    role: (0, pg_core_1.varchar)("role").default("member"), // member, moderator
    joinedAt: (0, pg_core_1.timestamp)("joined_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunitySpaceMembershipSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communitySpaceMemberships).extend({
    userId: zod_1.z.string().min(1),
    spaceId: zod_1.z.string().min(1),
    role: zod_1.z.enum(["member", "moderator"]).optional(),
});
// Community Flags
exports.communityFlags = (0, pg_core_1.pgTable)("community_flags", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    reporterId: (0, pg_core_1.varchar)("reporter_id").notNull(),
    targetType: (0, pg_core_1.varchar)("target_type").notNull(), // post, comment
    targetId: (0, pg_core_1.varchar)("target_id").notNull(),
    reason: (0, pg_core_1.varchar)("reason").notNull(), // spam, harassment, inappropriate, misleading, other
    details: (0, pg_core_1.text)("details"),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, reviewed, dismissed, actioned
    reviewedBy: (0, pg_core_1.varchar)("reviewed_by"),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at"),
    actionTaken: (0, pg_core_1.varchar)("action_taken"), // none, warning, hidden, deleted
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunityFlagSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityFlags).extend({
    reporterId: zod_1.z.string().min(1),
    targetType: zod_1.z.enum(["post", "comment"]),
    targetId: zod_1.z.string().min(1),
    reason: zod_1.z.enum(["spam", "harassment", "inappropriate", "misleading", "other"]),
    details: zod_1.z.string().optional(),
    status: zod_1.z.enum(["pending", "reviewed", "dismissed", "actioned"]).optional(),
    reviewedBy: zod_1.z.string().optional(),
    reviewedAt: zod_1.z.date().optional(),
    actionTaken: zod_1.z.string().optional(),
});
// User Earned Badges
exports.userEarnedBadges = (0, pg_core_1.pgTable)("user_earned_badges", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    badgeId: (0, pg_core_1.varchar)("badge_id").notNull(),
    earnedAt: (0, pg_core_1.timestamp)("earned_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertUserEarnedBadgeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userEarnedBadges).extend({
    userId: zod_1.z.string().min(1),
    badgeId: zod_1.z.string().min(1),
});
// ========== ABUSE DETECTION ==========
// Community Vote Events
exports.communityVoteEvents = (0, pg_core_1.pgTable)("community_vote_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    voterId: (0, pg_core_1.varchar)("voter_id").notNull(),
    targetType: (0, pg_core_1.varchar)("target_type").notNull(), // post, comment
    targetId: (0, pg_core_1.varchar)("target_id").notNull(),
    voteType: (0, pg_core_1.varchar)("vote_type").notNull(), // upvote, downvote
    ipHash: (0, pg_core_1.varchar)("ip_hash"), // hashed IP for pattern detection
    userAgent: (0, pg_core_1.varchar)("user_agent"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunityVoteEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityVoteEvents).extend({
    voterId: zod_1.z.string().min(1),
    targetType: zod_1.z.enum(["post", "comment"]),
    targetId: zod_1.z.string().min(1),
    voteType: zod_1.z.enum(["upvote", "downvote"]),
    ipHash: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
});
// Community Vote Anomalies
exports.communityVoteAnomalies = (0, pg_core_1.pgTable)("community_vote_anomalies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    anomalyType: (0, pg_core_1.varchar)("anomaly_type").notNull(), // vote_ring, rapid_voting, self_promotion, sock_puppet
    userId: (0, pg_core_1.varchar)("user_id"), // primary user involved
    relatedUserIds: (0, pg_core_1.text)("related_user_ids").array(), // other users in vote ring
    targetId: (0, pg_core_1.varchar)("target_id"), // content targeted
    targetType: (0, pg_core_1.varchar)("target_type"), // post, comment
    severity: (0, pg_core_1.varchar)("severity").default("medium"), // low, medium, high, critical
    evidence: (0, pg_core_1.jsonb)("evidence"), // detailed evidence data
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, investigating, confirmed, dismissed
    reviewedBy: (0, pg_core_1.varchar)("reviewed_by"),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at"),
    actionTaken: (0, pg_core_1.varchar)("action_taken"), // none, warning, reputation_penalty, suspension
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunityVoteAnomalySchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityVoteAnomalies).extend({
    anomalyType: zod_1.z.enum(["vote_ring", "rapid_voting", "self_promotion", "sock_puppet"]),
    userId: zod_1.z.string().optional(),
    relatedUserIds: zod_1.z.array(zod_1.z.string()).optional(),
    targetId: zod_1.z.string().optional(),
    targetType: zod_1.z.enum(["post", "comment"]).optional(),
    severity: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
    evidence: zod_1.z.record(zod_1.z.any()).optional(),
    status: zod_1.z.enum(["pending", "investigating", "confirmed", "dismissed"]).optional(),
    reviewedBy: zod_1.z.string().optional(),
    reviewedAt: zod_1.z.date().optional().nullable(),
    actionTaken: zod_1.z.string().optional(),
});
// ========== AI MODERATION ==========
// Community AI Recommendations
exports.communityAIRecommendations = (0, pg_core_1.pgTable)("community_ai_recommendations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    flagId: (0, pg_core_1.varchar)("flag_id").notNull(),
    contentAnalysis: (0, pg_core_1.jsonb)("content_analysis"), // detailed AI analysis
    severityScore: (0, pg_core_1.numeric)("severity_score", { precision: 3, scale: 2 }), // 0.00 - 1.00
    suggestedAction: (0, pg_core_1.varchar)("suggested_action"), // dismiss, warn, hide, delete, escalate
    confidence: (0, pg_core_1.numeric)("confidence", { precision: 3, scale: 2 }), // 0.00 - 1.00
    reasoning: (0, pg_core_1.text)("reasoning"),
    categories: (0, pg_core_1.text)("categories").array(), // detected categories: spam, harassment, hate_speech, etc.
    processingTime: (0, pg_core_1.integer)("processing_time"), // milliseconds
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCommunityAIRecommendationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityAIRecommendations).extend({
    flagId: zod_1.z.string().min(1),
    contentAnalysis: zod_1.z.record(zod_1.z.any()).optional(),
    severityScore: zod_1.z.string().optional(),
    suggestedAction: zod_1.z.enum(["dismiss", "warn", "hide", "delete", "escalate"]).optional(),
    confidence: zod_1.z.string().optional(),
    reasoning: zod_1.z.string().optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    processingTime: zod_1.z.number().optional(),
});
//# sourceMappingURL=community.js.map