export const TRUST_LEVEL = {
  NEW_USER: 0,
  CONTRIBUTOR: 1,
  TRUSTED: 2,
  LEADER: 3,
} as const;

export const TRUST_LEVEL_REQUIREMENTS = {
  [TRUST_LEVEL.NEW_USER]: {
    minReputation: 0,
    minAccountAgeDays: 0,
    minAcceptedAnswers: 0,
    minContributionArtifacts: 0,
  },
  [TRUST_LEVEL.CONTRIBUTOR]: {
    minReputation: 50,
    minAccountAgeDays: 7,
    minAcceptedAnswers: 0,
    minContributionArtifacts: 0,
  },
  [TRUST_LEVEL.TRUSTED]: {
    minReputation: 200,
    minAccountAgeDays: 30,
    minAcceptedAnswers: 10,
    minContributionArtifacts: 0,
    noModerationFlagsDays: 14,
  },
  [TRUST_LEVEL.LEADER]: {
    minReputation: 1000,
    minAccountAgeDays: 60,
    minAcceptedAnswers: 50,
    minContributionArtifacts: 5,
    noModerationFlagsDays: 60,
  },
} as const;

export const TRUST_LEVEL_LIMITS = {
  [TRUST_LEVEL.NEW_USER]: {
    maxPostsPerDay: 2,
    maxAnswersPerDay: 3,
    maxCommentsPerDay: 5,
    maxSpacesJoinedPerDay: 2,
    externalLinksAllowed: false,
    votingAllowed: false,
    acceptedAnswersAllowed: false,
    votingWeight: 0,
  },
  [TRUST_LEVEL.CONTRIBUTOR]: {
    maxPostsPerDay: 5,
    maxAnswersPerDay: 10,
    maxCommentsPerDay: 20,
    maxSpacesJoinedPerDay: 3,
    externalLinksAllowed: false,
    votingAllowed: true,
    acceptedAnswersAllowed: true,
    votingWeight: 1,
  },
  [TRUST_LEVEL.TRUSTED]: {
    maxPostsPerDay: 10,
    maxAnswersPerDay: 20,
    maxCommentsPerDay: 50,
    maxSpacesJoinedPerDay: 5,
    externalLinksAllowed: true,
    votingAllowed: true,
    acceptedAnswersAllowed: true,
    canFlagContent: true,
    votingWeight: 1.5,
  },
  [TRUST_LEVEL.LEADER]: {
    maxPostsPerDay: Infinity,
    maxAnswersPerDay: Infinity,
    maxCommentsPerDay: Infinity,
    maxSpacesJoinedPerDay: Infinity,
    externalLinksAllowed: true,
    votingAllowed: true,
    acceptedAnswersAllowed: true,
    canFlagContent: true,
    canModerateSpaces: true,
    canLockThreads: true,
    votingWeight: 2,
  },
} as const;

export const REPUTATION_POINTS = {
  QUESTION_POSTED: 2,
  ANSWER_POSTED: 5,
  ANSWER_UPVOTED: 2,
  ACCEPTED_ANSWER: 15,
  DOWNVOTED_ANSWER: -5,
  LOW_QUALITY_FLAG: -10,
  BUG_RESOLVED: 20,
  FORM_CREATED: 10,
  APP_PUBLISHED: 50,
  APP_INSTALLED_PER_TENANT: 5,
  APP_INSTALLED_CAP: 100,
  TRAINING_VIDEO_UPLOADED: 20,
  VIDEO_100_VIEWS: 10,
  DOCUMENTATION_MERGED: 15,
  SERVICE_COMPLETED_POSITIVE: 30,
  SERVICE_DISPUTE: -50,
} as const;

export const DIMINISHING_RETURNS = {
  MAX_SAME_ACTION_PER_DAY: 5,
  EXCESS_POINTS: 0,
} as const;

export const BADGE_THRESHOLDS = {
  PROBLEM_SOLVER: {
    category: "problem_solver",
    name: "Problem Solver",
    description: "For accepted answers",
    thresholds: {
      bronze: 5,
      silver: 15,
      gold: 40,
      platinum: 80,
      legendary: 150,
    },
  },
  FORM_BUILDER: {
    category: "form_builder",
    name: "Form Builder",
    description: "For creating forms",
    thresholds: {
      bronze: 5,
      silver: 15,
      gold: 30,
      platinum: 60,
      legendary: 100,
    },
  },
  APP_BUILDER: {
    category: "app_builder",
    name: "App Builder",
    description: "For publishing apps",
    thresholds: {
      bronze: 1,
      silver: 3,
      gold: 5,
      platinum: 10,
      legendary: 20,
    },
  },
  EDUCATOR: {
    category: "educator",
    name: "Educator",
    description: "For training content",
    thresholds: {
      bronze: 2,
      silver: 5,
      gold: 10,
      platinum: 20,
      legendary: 40,
    },
  },
  BUG_RESOLVER: {
    category: "bug_resolver",
    name: "Bug Resolver",
    description: "For resolving bugs",
    thresholds: {
      bronze: 3,
      silver: 10,
      gold: 25,
      platinum: 50,
      legendary: 100,
    },
  },
} as const;

export const SERVICE_MARKETPLACE_REQUIREMENTS = {
  minTrustLevel: TRUST_LEVEL.TRUSTED,
  minReputation: 300,
  minAcceptedAnswers: 15,
  minContributionArtifacts: 2,
  noModerationFlagsDays: 30,
} as const;

export const SERVICE_PRICING_TIERS = {
  BASE: { trustLevel: TRUST_LEVEL.TRUSTED, multiplier: 1.0 },
  PREMIUM: { trustLevel: TRUST_LEVEL.LEADER, multiplier: 1.3 },
  FEATURED: { requiresLegendaryBadge: true },
} as const;

export const ANTI_SPAM = {
  BURST_DETECTION: {
    answersInMinutes: { count: 5, minutes: 10 },
    similarAnswersPerDay: 10,
    downvotesIn24Hours: 3,
    action: {
      throttleHours: 24,
      freezeReputation: true,
    },
  },
  SPACE_JOIN_ABUSE: {
    spacesInHour: 3,
    cooldownHours: 48,
  },
  LINK_ABUSE: {
    attemptsBeforeTrigger: 3,
    postingFreezedays: 7,
    reputationPenalty: -20,
  },
  LOW_QUALITY_CONTENT: {
    flagsIn7Days: 5,
    action: {
      shadowBan: true,
      pauseBadgeProgression: true,
    },
  },
} as const;

export const MODERATION_ACTIONS = {
  SPAM_ANSWERING: { action: "throttle", repFreeze: true },
  PROMOTIONAL_CONTENT: { action: "post_removal", repPenalty: -20 },
  VOTE_MANIPULATION: { action: "rep_rollback", suspension: true },
  REPEATED_ABUSE: { action: "permanent_ban" },
} as const;

export const TIME_DECAY = {
  inactiveMonths: 6,
  reputationDecayPercent: 10,
  badgesDecay: false,
  trustLevelCanDowngrade: true,
} as const;

export const VISIBILITY_RANKING_WEIGHTS = {
  acceptedAnswers: 0.30,
  recentActivity: 0.25,
  badgeLevel: 0.20,
  communityTrust: 0.15,
  serviceOutcomes: 0.10,
} as const;

export const EXIT_CRITERIA = {
  LEVEL_0_TO_1: {
    anyTwoRequired: [
      { type: "reputation", value: 50 },
      { type: "acceptedAnswers", value: 3 },
      { type: "contributionArtifacts", value: 1 },
    ],
  },
  LEVEL_1_TO_2: {
    allRequired: [
      { type: "reputation", value: 200 },
      { type: "acceptedAnswers", value: 10 },
      { type: "noModerationFlags", days: 14 },
    ],
  },
} as const;

export type TrustLevel = typeof TRUST_LEVEL[keyof typeof TRUST_LEVEL];
export type BadgeLevel = "none" | "bronze" | "silver" | "gold" | "platinum" | "legendary";
export type BadgeCategory = keyof typeof BADGE_THRESHOLDS;

export function getBadgeLevel(category: BadgeCategory, count: number): BadgeLevel {
  const thresholds = BADGE_THRESHOLDS[category].thresholds;
  if (count >= thresholds.legendary) return "legendary";
  if (count >= thresholds.platinum) return "platinum";
  if (count >= thresholds.gold) return "gold";
  if (count >= thresholds.silver) return "silver";
  if (count >= thresholds.bronze) return "bronze";
  return "none";
}

export function canAccessServiceMarketplace(
  trustLevel: number,
  reputation: number,
  acceptedAnswers: number,
  contributionArtifacts: number,
  daysSinceLastFlag: number | null
): boolean {
  const req = SERVICE_MARKETPLACE_REQUIREMENTS;
  return (
    trustLevel >= req.minTrustLevel &&
    reputation >= req.minReputation &&
    acceptedAnswers >= req.minAcceptedAnswers &&
    contributionArtifacts >= req.minContributionArtifacts &&
    (daysSinceLastFlag === null || daysSinceLastFlag >= req.noModerationFlagsDays)
  );
}

export function calculateTrustLevel(
  reputation: number,
  accountAgeDays: number,
  acceptedAnswers: number,
  contributionArtifacts: number,
  daysSinceLastModerationAction: number | null
): TrustLevel {
  const req3 = TRUST_LEVEL_REQUIREMENTS[TRUST_LEVEL.LEADER];
  if (
    reputation >= req3.minReputation &&
    accountAgeDays >= req3.minAccountAgeDays &&
    acceptedAnswers >= req3.minAcceptedAnswers &&
    contributionArtifacts >= req3.minContributionArtifacts &&
    (daysSinceLastModerationAction === null || daysSinceLastModerationAction >= req3.noModerationFlagsDays)
  ) {
    return TRUST_LEVEL.LEADER;
  }

  const req2 = TRUST_LEVEL_REQUIREMENTS[TRUST_LEVEL.TRUSTED];
  if (
    reputation >= req2.minReputation &&
    accountAgeDays >= req2.minAccountAgeDays &&
    acceptedAnswers >= req2.minAcceptedAnswers &&
    (daysSinceLastModerationAction === null || daysSinceLastModerationAction >= req2.noModerationFlagsDays)
  ) {
    return TRUST_LEVEL.TRUSTED;
  }

  const req1 = TRUST_LEVEL_REQUIREMENTS[TRUST_LEVEL.CONTRIBUTOR];
  if (
    reputation >= req1.minReputation &&
    accountAgeDays >= req1.minAccountAgeDays
  ) {
    return TRUST_LEVEL.CONTRIBUTOR;
  }

  return TRUST_LEVEL.NEW_USER;
}
