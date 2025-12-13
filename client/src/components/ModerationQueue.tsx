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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, 
  Clock, MessageSquare, Eye, Trash2, Ban
} from "lucide-react";

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

const ACTION_OPTIONS = [
  { value: "dismiss", label: "Dismiss (no action needed)", icon: XCircle },
  { value: "warn", label: "Warn the user", icon: AlertTriangle },
  { value: "hide", label: "Hide content", icon: Eye },
  { value: "delete", label: "Delete content", icon: Trash2 },
  { value: "ban", label: "Ban user", icon: Ban },
];

export function ModerationQueue() {
  const { toast } = useToast();
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [action, setAction] = useState("");
  const [actionReason, setActionReason] = useState("");

  const { data: pendingFlags, isLoading: flagsLoading } = useQuery<Flag[]>({
    queryKey: ["/api/community/moderation/queue"],
  });

  const { data: moderationHistory } = useQuery<ModerationAction[]>({
    queryKey: ["/api/community/moderation/history"],
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
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to take moderation action.", variant: "destructive" });
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

  const handleTakeAction = () => {
    if (!selectedFlag || !action) return;
    takeActionMutation.mutate({
      flagId: selectedFlag.id,
      action,
      reason: actionReason,
    });
  };

  return (
    <div className="space-y-6" data-testid="container-moderation-queue">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Moderation Queue</h2>
          <p className="text-muted-foreground">Review and take action on reported content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Actions</p>
              <p className="text-2xl font-bold" data-testid="text-total-actions">
                {moderationHistory?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending-flags">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingFlags?.filter(f => f.status === "pending").length || 0})
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
              {pendingFlags?.filter(f => f.status === "pending").map((flag) => (
                <Card key={flag.id} data-testid={`flag-card-${flag.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(flag.status)}
                          <Badge variant="outline">
                            {flag.targetType === "post" ? (
                              <MessageSquare className="w-3 h-3 mr-1" />
                            ) : (
                              <MessageSquare className="w-3 h-3 mr-1" />
                            )}
                            {flag.targetType}
                          </Badge>
                        </div>
                        <p className="font-medium">{flag.reason}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Reported {formatDate(flag.createdAt)}</span>
                          <span>Reporter: {flag.reporterId.slice(0, 8)}...</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setSelectedFlag(flag)}
                        data-testid={`button-review-flag-${flag.id}`}
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
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
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

      <Dialog open={!!selectedFlag} onOpenChange={(open) => !open && setSelectedFlag(null)}>
        <DialogContent className="max-w-md">
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
                <div className="flex items-center gap-2 mb-2">
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
            <Button variant="outline" onClick={() => setSelectedFlag(null)} data-testid="button-cancel-moderation">
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
    </div>
  );
}
