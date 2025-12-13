import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, Star, Shield, Users, Award, MessageSquare, 
  ThumbsUp, CheckCircle, Clock, TrendingUp
} from "lucide-react";

interface UserProfileProps {
  userId: string;
  onClose?: () => void;
}

interface ProfileData {
  user: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
    createdAt?: Date;
  };
  trustLevel: {
    userId: string;
    trustLevel: number;
    totalReputation: number;
  };
  reputationHistory: Array<{
    id: string;
    actionType: string;
    points: number;
    description: string | null;
    createdAt: Date | null;
  }>;
  badgeProgress: Array<{
    id: string;
    badgeCategory: string;
    currentCount: number;
    currentLevel: string;
  }>;
  earnedBadges: Array<{
    id: string;
    badgeId: string;
    earnedAt: Date;
    badgeName: string;
    badgeDescription: string;
    badgeIcon: string;
    badgeCategory: string;
    badgePoints: number;
  }>;
  stats: {
    totalPosts: number;
    totalComments: number;
    acceptedAnswers: number;
  };
}

export function UserProfile({ userId }: UserProfileProps) {
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["/api/community/user", userId, "profile"],
    queryFn: async () => {
      const res = await fetch(`/api/community/user/${userId}/profile`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  const getTrustLevelInfo = (level: number) => {
    const levels = [
      { name: "New Member", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: Users },
      { name: "Contributor", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Star },
      { name: "Trusted", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: Shield },
      { name: "Leader", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: Trophy },
    ];
    return levels[level] || levels[0];
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const getBadgeIcon = (icon: string) => {
    const icons: Record<string, typeof Trophy> = {
      trophy: Trophy,
      star: Star,
      award: Award,
      shield: Shield,
    };
    const Icon = icons[icon] || Award;
    return <Icon className="w-5 h-5" />;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      none: "text-gray-400",
      bronze: "text-amber-600",
      silver: "text-gray-400",
      gold: "text-yellow-500",
      platinum: "text-cyan-400",
      legendary: "text-purple-500",
    };
    return colors[level] || colors.none;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-8 text-muted-foreground">User not found</div>;
  }

  const { user, trustLevel, reputationHistory, badgeProgress, earnedBadges, stats } = profile;
  const trustInfo = getTrustLevelInfo(trustLevel.trustLevel || 0);
  const TrustIcon = trustInfo.icon;
  const displayName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Community Member";

  return (
    <div className="space-y-6" data-testid="container-user-profile">
      <div className="flex items-start gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user.profileImageUrl || undefined} />
          <AvatarFallback className="text-2xl">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-2xl font-bold" data-testid="text-profile-name">{displayName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={trustInfo.color}>
              <TrustIcon className="w-3 h-3 mr-1" />
              {trustInfo.name}
            </Badge>
            <span className="text-muted-foreground">
              {trustLevel.totalReputation || 0} reputation
            </span>
          </div>
          {user.createdAt && (
            <p className="text-sm text-muted-foreground mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <MessageSquare className="w-6 h-6 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold" data-testid="text-total-posts">{stats.totalPosts}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <ThumbsUp className="w-6 h-6 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold" data-testid="text-total-comments">{stats.totalComments}</div>
            <div className="text-sm text-muted-foreground">Answers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold" data-testid="text-accepted-answers">{stats.acceptedAnswers}</div>
            <div className="text-sm text-muted-foreground">Accepted</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="badges">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges" data-testid="tab-badges">
            <Award className="w-4 h-4 mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">
            <TrendingUp className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <Clock className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-4">
          {earnedBadges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No badges earned yet</p>
              <p className="text-sm">Keep contributing to earn badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {earnedBadges.map((badge) => (
                <Card key={badge.id} className="hover-elevate" data-testid={`badge-${badge.badgeId}`}>
                  <CardContent className="pt-4 flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-muted ${getLevelColor(badge.badgeCategory)}`}>
                      {getBadgeIcon(badge.badgeIcon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{badge.badgeName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {badge.badgeDescription}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        +{badge.badgePoints} pts • {formatDate(badge.earnedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="mt-4 space-y-4">
          {badgeProgress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No badge progress tracked yet</p>
            </div>
          ) : (
            badgeProgress.map((progress) => {
              const thresholds: Record<string, number[]> = {
                problem_solver: [5, 25, 100, 500, 1000],
                educator: [10, 50, 200, 500, 1000],
                contributor: [50, 200, 500, 1000, 5000],
              };
              const levelIndex = ["none", "bronze", "silver", "gold", "platinum", "legendary"].indexOf(progress.currentLevel);
              const nextThreshold = thresholds[progress.badgeCategory]?.[levelIndex] || 100;
              const progressPercent = Math.min((progress.currentCount / nextThreshold) * 100, 100);

              return (
                <Card key={progress.id} data-testid={`progress-${progress.badgeCategory}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium capitalize">{progress.badgeCategory.replace("_", " ")}</div>
                      <Badge variant="outline" className={getLevelColor(progress.currentLevel)}>
                        {progress.currentLevel}
                      </Badge>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {progress.currentCount} / {nextThreshold} to next level
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {reputationHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No reputation history yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {reputationHistory.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  data-testid={`rep-event-${event.id}`}
                >
                  <div>
                    <div className="font-medium text-sm">{event.description || event.actionType}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</div>
                  </div>
                  <Badge variant={event.points >= 0 ? "default" : "destructive"}>
                    {event.points >= 0 ? "+" : ""}{event.points}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
