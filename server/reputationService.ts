import { db } from "./db";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";
import {
  userTrustLevels,
  reputationEvents,
  communityBadgeProgress,
  communityModerationActions,
  communityFlags,
} from "@shared/schema";
import {
  REPUTATION_POINTS,
  DIMINISHING_RETURNS,
  BADGE_THRESHOLDS,
  ANTI_SPAM,
  TRUST_LEVEL_LIMITS,
  calculateTrustLevel,
  getBadgeLevel,
  type BadgeCategory,
  type TrustLevel,
} from "@shared/communityConstants";

export type ReputationActionType =
  | "question_posted"
  | "answer_posted"
  | "answer_upvoted"
  | "accepted_answer"
  | "answer_downvoted"
  | "low_quality_flag"
  | "bug_resolved"
  | "form_created"
  | "app_published"
  | "app_installed"
  | "training_video_uploaded"
  | "video_100_views"
  | "documentation_merged"
  | "service_completed"
  | "service_dispute";

const ACTION_TO_POINTS: Record<ReputationActionType, number> = {
  question_posted: REPUTATION_POINTS.QUESTION_POSTED,
  answer_posted: REPUTATION_POINTS.ANSWER_POSTED,
  answer_upvoted: REPUTATION_POINTS.ANSWER_UPVOTED,
  accepted_answer: REPUTATION_POINTS.ACCEPTED_ANSWER,
  answer_downvoted: REPUTATION_POINTS.DOWNVOTED_ANSWER,
  low_quality_flag: REPUTATION_POINTS.LOW_QUALITY_FLAG,
  bug_resolved: REPUTATION_POINTS.BUG_RESOLVED,
  form_created: REPUTATION_POINTS.FORM_CREATED,
  app_published: REPUTATION_POINTS.APP_PUBLISHED,
  app_installed: REPUTATION_POINTS.APP_INSTALLED_PER_TENANT,
  training_video_uploaded: REPUTATION_POINTS.TRAINING_VIDEO_UPLOADED,
  video_100_views: REPUTATION_POINTS.VIDEO_100_VIEWS,
  documentation_merged: REPUTATION_POINTS.DOCUMENTATION_MERGED,
  service_completed: REPUTATION_POINTS.SERVICE_COMPLETED_POSITIVE,
  service_dispute: REPUTATION_POINTS.SERVICE_DISPUTE,
};

export async function checkDiminishingReturns(
  userId: string,
  actionType: ReputationActionType
): Promise<{ allowed: boolean; pointsToAward: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysActions = await db
    .select({ count: count() })
    .from(reputationEvents)
    .where(
      and(
        eq(reputationEvents.userId, userId),
        eq(reputationEvents.actionType, actionType),
        gte(reputationEvents.createdAt, today)
      )
    );

  const actionCount = todaysActions[0]?.count || 0;
  const basePoints = ACTION_TO_POINTS[actionType] || 0;

  if (actionCount >= DIMINISHING_RETURNS.MAX_SAME_ACTION_PER_DAY) {
    return { allowed: true, pointsToAward: DIMINISHING_RETURNS.EXCESS_POINTS };
  }

  return { allowed: true, pointsToAward: basePoints };
}

export async function awardReputation(
  userId: string,
  actionType: ReputationActionType,
  sourceType: string,
  sourceId: string,
  skipDiminishingReturns: boolean = false
): Promise<{ success: boolean; pointsAwarded: number; message?: string }> {
  try {
    let pointsToAward = ACTION_TO_POINTS[actionType] || 0;

    if (!skipDiminishingReturns && pointsToAward > 0) {
      const { pointsToAward: adjustedPoints } = await checkDiminishingReturns(userId, actionType);
      pointsToAward = adjustedPoints;
    }

    await db.insert(reputationEvents).values({
      userId,
      actionType,
      points: pointsToAward,
      sourceType,
      sourceId,
    });

    await db
      .update(userTrustLevels)
      .set({
        totalReputation: sql`COALESCE(total_reputation, 0) + ${pointsToAward}`,
        updatedAt: new Date(),
      })
      .where(eq(userTrustLevels.userId, userId));

    await recalculateTrustLevel(userId);

    return { success: true, pointsAwarded: pointsToAward };
  } catch (error) {
    console.error("Error awarding reputation:", error);
    return { success: false, pointsAwarded: 0, message: "Failed to award reputation" };
  }
}

export async function recalculateTrustLevel(userId: string): Promise<TrustLevel> {
  let [trust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, userId));

  if (!trust) {
    const [newTrust] = await db
      .insert(userTrustLevels)
      .values({
        userId,
        trustLevel: 0,
        totalReputation: 0,
        postsToday: 0,
        answersToday: 0,
      })
      .returning();
    trust = newTrust;
  }

  const reputation = trust.totalReputation || 0;

  const [user] = await db
    .selectDistinct()
    .from(reputationEvents)
    .where(eq(reputationEvents.userId, userId));

  const acceptedAnswers = await db
    .select({ count: count() })
    .from(reputationEvents)
    .where(
      and(
        eq(reputationEvents.userId, userId),
        eq(reputationEvents.actionType, "accepted_answer")
      )
    );

  const artifacts = await db
    .select({ count: count() })
    .from(reputationEvents)
    .where(
      and(
        eq(reputationEvents.userId, userId),
        sql`action_type IN ('form_created', 'app_published', 'training_video_uploaded')`
      )
    );

  const lastModAction = await db
    .select()
    .from(communityModerationActions)
    .where(eq(communityModerationActions.targetUserId, userId))
    .orderBy(desc(communityModerationActions.createdAt))
    .limit(1);

  let daysSinceLastModerationAction: number | null = null;
  if (lastModAction.length > 0 && lastModAction[0].createdAt) {
    const diff = Date.now() - new Date(lastModAction[0].createdAt).getTime();
    daysSinceLastModerationAction = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  const accountAgeDays = trust.createdAt
    ? Math.floor((Date.now() - new Date(trust.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const newTrustLevel = calculateTrustLevel(
    reputation,
    accountAgeDays,
    acceptedAnswers[0]?.count || 0,
    artifacts[0]?.count || 0,
    daysSinceLastModerationAction
  );

  if (newTrustLevel !== trust.trustLevel) {
    await db
      .update(userTrustLevels)
      .set({ trustLevel: newTrustLevel, updatedAt: new Date() })
      .where(eq(userTrustLevels.userId, userId));
  }

  return newTrustLevel;
}

export async function updateBadgeProgress(
  userId: string,
  category: BadgeCategory
): Promise<{ level: string; count: number }> {
  const countResult = await db
    .select({ count: count() })
    .from(reputationEvents)
    .where(
      and(
        eq(reputationEvents.userId, userId),
        eq(reputationEvents.actionType, categoryToActionType(category))
      )
    );

  const currentCount = countResult[0]?.count || 0;
  const newLevel = getBadgeLevel(category, currentCount);

  const [existing] = await db
    .select()
    .from(communityBadgeProgress)
    .where(
      and(
        eq(communityBadgeProgress.userId, userId),
        eq(communityBadgeProgress.badgeCategory, BADGE_THRESHOLDS[category].category)
      )
    );

  if (existing) {
    await db
      .update(communityBadgeProgress)
      .set({
        currentCount,
        currentLevel: newLevel,
        updatedAt: new Date(),
        unlockedAt: newLevel !== "none" && existing.currentLevel === "none" ? new Date() : existing.unlockedAt,
      })
      .where(eq(communityBadgeProgress.id, existing.id));
  } else {
    await db.insert(communityBadgeProgress).values({
      userId,
      badgeCategory: BADGE_THRESHOLDS[category].category,
      currentCount,
      currentLevel: newLevel,
      unlockedAt: newLevel !== "none" ? new Date() : null,
    });
  }

  return { level: newLevel, count: currentCount };
}

function categoryToActionType(category: BadgeCategory): string {
  const mapping: Record<BadgeCategory, string> = {
    PROBLEM_SOLVER: "accepted_answer",
    FORM_BUILDER: "form_created",
    APP_BUILDER: "app_published",
    EDUCATOR: "training_video_uploaded",
    BUG_RESOLVER: "bug_resolved",
  };
  return mapping[category];
}

export async function checkBurstDetection(userId: string): Promise<{
  triggered: boolean;
  reason?: string;
}> {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentAnswers = await db
    .select({ count: count() })
    .from(reputationEvents)
    .where(
      and(
        eq(reputationEvents.userId, userId),
        eq(reputationEvents.actionType, "answer_posted"),
        gte(reputationEvents.createdAt, tenMinutesAgo)
      )
    );

  if ((recentAnswers[0]?.count || 0) >= ANTI_SPAM.BURST_DETECTION.answersInMinutes.count) {
    return { triggered: true, reason: "Too many answers in short time" };
  }

  const recentDownvotes = await db
    .select({ count: count() })
    .from(reputationEvents)
    .where(
      and(
        eq(reputationEvents.userId, userId),
        eq(reputationEvents.actionType, "answer_downvoted"),
        gte(reputationEvents.createdAt, twentyFourHoursAgo)
      )
    );

  if ((recentDownvotes[0]?.count || 0) >= ANTI_SPAM.BURST_DETECTION.downvotesIn24Hours) {
    return { triggered: true, reason: "Too many downvotes received" };
  }

  return { triggered: false };
}

export async function applyAntiSpamThrottle(userId: string, reason: string): Promise<void> {
  const throttleUntil = new Date(Date.now() + ANTI_SPAM.BURST_DETECTION.action.throttleHours * 60 * 60 * 1000);

  await db
    .update(userTrustLevels)
    .set({
      banExpiresAt: throttleUntil,
      updatedAt: new Date(),
    })
    .where(eq(userTrustLevels.userId, userId));

  await db.insert(communityModerationActions).values({
    moderatorId: "system",
    targetUserId: userId,
    actionType: "throttle",
    reason,
  });
}

export async function checkLowQualityFlags(userId: string): Promise<boolean> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const flagCount = await db
    .select({ count: count() })
    .from(communityFlags)
    .where(
      and(
        eq(communityFlags.reporterId, userId),
        eq(communityFlags.reason, "low_quality"),
        gte(communityFlags.createdAt, sevenDaysAgo)
      )
    );

  return (flagCount[0]?.count || 0) >= ANTI_SPAM.LOW_QUALITY_CONTENT.flagsIn7Days;
}

export async function getTrustLevelLimits(trustLevel: number) {
  return TRUST_LEVEL_LIMITS[trustLevel as keyof typeof TRUST_LEVEL_LIMITS] || TRUST_LEVEL_LIMITS[0];
}
