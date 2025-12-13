import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, 
  Clock, MessageSquare, Eye, Trash2, Ban, Sparkles, 
  Users, Activity, Loader2, AlertOctagon, Search
} from "lucide-react";
import type { CommunityVoteAnomaly, CommunityAIRecommendation } from "@shared/schema";

interface Flag {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: Date | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  actionTaken?: string | null;
}

interface ModerationAction {
  id: string;
  moderatorId: string;
  actionType: string;
  reason: string | null;
  targetType: string;
  targetId: string;
  createdAt: Date | null;
}

interface AIRecommendation extends CommunityAIRecommendation {
  processingTime?: number | null;
}

const ACTION_OPTIONS = [
  { value: "dismiss", label: "Dismiss (no action needed)", icon: XCircle },
  { value: "warn", label: "Warn the user", icon: AlertTriangle },
  { value: "hide", label: "Hide content", icon: Eye },
  { value: "delete", label: "Delete content", icon: Trash2 },
  { value: "ban", label: "Ban user", icon: Ban },
];

const ANOMALY_ACTIONS = [
  { value: "none", label: "No action" },
  { value: "warning", label: "Warning" },
  { value: "reputation_penalty", label: "Reputation penalty" },
  { value: "suspension", label: "Suspension" },
];

export function ModerationQueue() {
  const { toast } = useToast();
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [action, setAction] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [analyzingFlagId, setAnalyzingFlagId] = useState<string | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<CommunityVoteAnomaly | null>(null);
  const [anomalyAction, setAnomalyAction] = useState("");

  const { data: pendingFlags, isLoading: flagsLoading } = useQuery<Flag[]>({
    queryKey: ["/api/community/moderation/queue"],
  });

  const { data: moderationHistory } = useQuery<ModerationAction[]>({
    queryKey: ["/api/community/moderation/history"],
  });

  const { data: anomalies, isLoading: anomaliesLoading } = useQuery<CommunityVoteAnomaly[]>({
    queryKey: ["/api/community/moderation/anomalies"],
  });

  const { data: aiRecommendations } = useQuery<AIRecommendation[]>({
    queryKey: ["/api/community/moderation/ai-recommendations"],
  });

  const takeActionMutation = useMutation({
    mutationFn: async ({ flagId, action, reason }: { flagId: string; action: string; reason: string }) => {
      return apiRequest("POST", "/api/community/moderation/action", {
        flagId,
        action,
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/moderation/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/moderation/history"] });
      toast({ title: "Action taken", description: "The moderation action has been applied." });
      setSelectedFlag(null);
      setAction("");
      setActionReason("");
      setAiRecommendation(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to take moderation action.", variant: "destructive" });
    },
  });

  const analyzeWithAIMutation = useMutation({
    mutationFn: async (flagId: string) => {
      const res = await apiRequest("POST", `/api/community/moderation/ai-analyze/${flagId}`, {});
      return res.json();
    },
    onSuccess: (data) => {
      setAiRecommendation(data);
      setAnalyzingFlagId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/community/moderation/ai-recommendations"] });
      toast({ title: "AI Analysis Complete", description: "Review the recommendation below." });
    },
    onError: () => {
      setAnalyzingFlagId(null);
      toast({ title: "Error", description: "AI analysis failed. Please try again.", variant: "destructive" });
    },
  });

  const anomalyActionMutation = useMutation({
    mutationFn: async ({ anomalyId, action, status }: { anomalyId: string; action: string; status: string }) => {
      return apiRequest("POST", `/api/community/moderation/anomalies/${anomalyId}/action`, {
        action,
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/moderation/anomalies"] });
      toast({ title: "Anomaly resolved", description: "Action has been taken on the anomaly." });
      setSelectedAnomaly(null);
      setAnomalyAction("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to take action on anomaly.", variant: "destructive" });
    },
  });

  const detectAnomaliesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/community/moderation/detect-anomalies", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/moderation/anomalies"] });
      toast({ title: "Detection Complete", description: "Anomaly detection has finished." });
    },
    onError: () => {
      toast({ title: "Error", description: "Anomaly detection failed.", variant: "destructive" });
    },
  });

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: typeof Clock }> = {
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
      reviewed: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
      dismissed: { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: XCircle },
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return (
      <Badge className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string | null) => {
    const variants: Record<string, string> = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      <Badge className={variants[severity || "medium"] || variants.medium}>
        {severity || "medium"}
      </Badge>
    );
  };

  const getAnomalyTypeBadge = (type: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      vote_ring: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Vote Ring" },
      rapid_voting: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", label: "Rapid Voting" },
      self_promotion: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", label: "Self Promotion" },
      sock_puppet: { color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200", label: "Sock Puppet" },
    };
    const variant = variants[type] || { color: "bg-muted", label: type };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const handleTakeAction = () => {
    if (!selectedFlag || !action) return;
    takeActionMutation.mutate({
      flagId: selectedFlag.id,
      action,
      reason: actionReason,
    });
  };

  const handleAnalyzeWithAI = (flagId: string) => {
    setAnalyzingFlagId(flagId);
    analyzeWithAIMutation.mutate(flagId);
  };

  const getFlagAIRecommendation = (flagId: string) => {
    return aiRecommendations?.find(r => r.flagId === flagId);
  };

  const pendingAnomalies = anomalies?.filter(a => a.status === "pending" || a.status === "investigating") || [];

  return (
    <div className="space-y-6" data-testid="container-moderation-queue">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Moderation Queue</h2>
          <p className="text-muted-foreground">Review and take action on reported content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Reports</p>
              <p className="text-2xl font-bold" data-testid="text-pending-count">
                {pendingFlags?.filter(f => f.status === "pending").length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Reviewed Today</p>
              <p className="text-2xl font-bold" data-testid="text-reviewed-count">
                {moderationHistory?.filter(a => {
                  if (!a.createdAt) return false;
                  const d = new Date(a.createdAt);
                  const today = new Date();
                  return d.toDateString() === today.toDateString();
                }).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Vote Anomalies</p>
              <p className="text-2xl font-bold" data-testid="text-anomaly-count">
                {pendingAnomalies.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">AI Analyses</p>
              <p className="text-2xl font-bold" data-testid="text-ai-count">
                {aiRecommendations?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pending" data-testid="tab-pending-flags">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingFlags?.filter(f => f.status === "pending").length || 0})
          </TabsTrigger>
          <TabsTrigger value="anomalies" data-testid="tab-anomalies">
            <AlertOctagon className="w-4 h-4 mr-2" />
            Anomalies ({pendingAnomalies.length})
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-moderation-history">
            <CheckCircle className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {flagsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !pendingFlags?.filter(f => f.status === "pending").length ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-500" />
                <p className="font-medium">All clear!</p>
                <p className="text-sm">No pending reports to review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingFlags?.filter(f => f.status === "pending").map((flag) => {
                const existingRec = getFlagAIRecommendation(flag.id);
                return (
                  <Card key={flag.id} data-testid={`flag-card-${flag.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {getStatusBadge(flag.status)}
                            <Badge variant="outline">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {flag.targetType}
                            </Badge>
                            {existingRec && (
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Analyzed
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">{flag.reason}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                            <span>Reported {formatDate(flag.createdAt)}</span>
                            <span>Reporter: {flag.reporterId.slice(0, 8)}...</span>
                          </div>
                          {existingRec && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="text-sm font-medium">AI Recommendation:</span>
                                <Badge variant="secondary">{existingRec.suggestedAction}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  Confidence: {(Number(existingRec.confidence || 0) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress value={Number(existingRec.severityScore || 0) * 100} className="h-2 mb-2" />
                              <p className="text-xs text-muted-foreground">
                                Severity: {(Number(existingRec.severityScore || 0) * 100).toFixed(0)}%
                              </p>
                              {existingRec.categories && existingRec.categories.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {existingRec.categories.map((cat, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{cat}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnalyzeWithAI(flag.id)}
                            disabled={analyzingFlagId === flag.id}
                            data-testid={`button-ai-analyze-${flag.id}`}
                          >
                            {analyzingFlagId === flag.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI Analyze
                              </>
                            )}
                          </Button>
                          <Button 
                            onClick={() => {
                              setSelectedFlag(flag);
                              if (existingRec) setAiRecommendation(existingRec);
                            }}
                            data-testid={`button-review-flag-${flag.id}`}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="anomalies" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => detectAnomaliesMutation.mutate()}
              disabled={detectAnomaliesMutation.isPending}
              data-testid="button-detect-anomalies"
            >
              {detectAnomaliesMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Scan for Anomalies
                </>
              )}
            </Button>
          </div>

          {anomaliesLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !pendingAnomalies.length ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-500" />
                <p className="font-medium">No anomalies detected</p>
                <p className="text-sm">Voting patterns look healthy.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingAnomalies.map((anomaly) => (
                <Card key={anomaly.id} data-testid={`anomaly-card-${anomaly.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {getAnomalyTypeBadge(anomaly.anomalyType)}
                          {getSeverityBadge(anomaly.severity)}
                          <Badge variant="outline">{anomaly.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {anomaly.userId && (
                            <p className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Primary User: {anomaly.userId.slice(0, 8)}...
                            </p>
                          )}
                          {anomaly.relatedUserIds && anomaly.relatedUserIds.length > 0 && (
                            <p className="flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              Related Users: {anomaly.relatedUserIds.length}
                            </p>
                          )}
                          {anomaly.targetId && (
                            <p>Target: {anomaly.targetType} - {anomaly.targetId.slice(0, 8)}...</p>
                          )}
                          <p>Detected {formatDate(anomaly.createdAt)}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setSelectedAnomaly(anomaly)}
                        data-testid={`button-review-anomaly-${anomaly.id}`}
                      >
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {!moderationHistory?.length ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No moderation actions yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {moderationHistory?.slice(0, 20).map((action) => (
                <Card key={action.id} data-testid={`action-card-${action.id}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="secondary">{action.actionType}</Badge>
                          <Badge variant="outline">{action.targetType}</Badge>
                        </div>
                        {action.reason && (
                          <p className="text-sm text-muted-foreground">{action.reason}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{formatDate(action.createdAt)}</p>
                        <p>by {action.moderatorId.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedFlag} onOpenChange={(open) => { 
        if (!open) { setSelectedFlag(null); setAiRecommendation(null); }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Review Report
            </DialogTitle>
            <DialogDescription>
              Choose an appropriate action for this reported content.
            </DialogDescription>
          </DialogHeader>

          {selectedFlag && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline">{selectedFlag.targetType}</Badge>
                  <span className="text-xs text-muted-foreground">
                    ID: {selectedFlag.targetId.slice(0, 12)}...
                  </span>
                </div>
                <p className="font-medium">{selectedFlag.reason}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Reported {formatDate(selectedFlag.createdAt)}
                </p>
              </div>

              {aiRecommendation && (
                <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800 dark:text-purple-200">AI Recommendation</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm">Suggested Action:</span>
                      <Badge className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                        {aiRecommendation.suggestedAction}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Severity Score</span>
                        <span>{(Number(aiRecommendation.severityScore || 0) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={Number(aiRecommendation.severityScore || 0) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Confidence</span>
                        <span>{(Number(aiRecommendation.confidence || 0) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={Number(aiRecommendation.confidence || 0) * 100} className="h-2" />
                    </div>
                    {aiRecommendation.categories && aiRecommendation.categories.length > 0 && (
                      <div>
                        <p className="text-sm mb-2">Categories:</p>
                        <div className="flex gap-1 flex-wrap">
                          {aiRecommendation.categories.map((cat, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{cat}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {aiRecommendation.reasoning && (
                      <div>
                        <p className="text-sm mb-1">Reasoning:</p>
                        <p className="text-xs text-muted-foreground">{aiRecommendation.reasoning}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger data-testid="select-moderation-action">
                    <SelectValue placeholder="Select an action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {opt.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason (optional)</label>
                <Textarea
                  placeholder="Add notes about this action..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  data-testid="input-moderation-reason"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedFlag(null); setAiRecommendation(null); }} data-testid="button-cancel-moderation">
              Cancel
            </Button>
            <Button 
              onClick={handleTakeAction}
              disabled={!action || takeActionMutation.isPending}
              data-testid="button-confirm-action"
            >
              {takeActionMutation.isPending ? "Processing..." : "Take Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedAnomaly} onOpenChange={(open) => !open && setSelectedAnomaly(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5" />
              Review Anomaly
            </DialogTitle>
            <DialogDescription>
              Investigate and take action on this voting anomaly.
            </DialogDescription>
          </DialogHeader>

          {selectedAnomaly && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {getAnomalyTypeBadge(selectedAnomaly.anomalyType)}
                  {getSeverityBadge(selectedAnomaly.severity)}
                </div>
                <div className="text-sm space-y-2">
                  {selectedAnomaly.userId && (
                    <p><strong>Primary User:</strong> {selectedAnomaly.userId}</p>
                  )}
                  {selectedAnomaly.relatedUserIds && selectedAnomaly.relatedUserIds.length > 0 && (
                    <div>
                      <p className="font-medium">Related Users:</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {selectedAnomaly.relatedUserIds.slice(0, 5).map((uid, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {uid.slice(0, 8)}...
                          </Badge>
                        ))}
                        {selectedAnomaly.relatedUserIds.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{selectedAnomaly.relatedUserIds.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedAnomaly.targetId && (
                    <p><strong>Target:</strong> {selectedAnomaly.targetType} - {selectedAnomaly.targetId}</p>
                  )}
                  {selectedAnomaly.evidence && (
                    <div>
                      <p className="font-medium">Evidence:</p>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(selectedAnomaly.evidence, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select value={anomalyAction} onValueChange={setAnomalyAction}>
                  <SelectTrigger data-testid="select-anomaly-action">
                    <SelectValue placeholder="Select an action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ANOMALY_ACTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSelectedAnomaly(null)} data-testid="button-cancel-anomaly">
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => selectedAnomaly && anomalyActionMutation.mutate({
                anomalyId: selectedAnomaly.id,
                action: "none",
                status: "dismissed",
              })}
              disabled={anomalyActionMutation.isPending}
              data-testid="button-dismiss-anomaly"
            >
              Dismiss
            </Button>
            <Button 
              onClick={() => selectedAnomaly && anomalyAction && anomalyActionMutation.mutate({
                anomalyId: selectedAnomaly.id,
                action: anomalyAction,
                status: "confirmed",
              })}
              disabled={!anomalyAction || anomalyActionMutation.isPending}
              data-testid="button-confirm-anomaly-action"
            >
              {anomalyActionMutation.isPending ? "Processing..." : "Confirm & Take Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
