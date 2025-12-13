import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Search, Star, Package, Trash2, MessageSquare, 
  ExternalLink, Settings, CheckCircle, Clock, AlertCircle
} from "lucide-react";
import type { MarketplaceApp, AppInstallation, AppReview } from "@shared/schema";

interface InstalledAppCardProps {
  installation: AppInstallation & { app?: MarketplaceApp };
  onUninstall: (appId: string) => void;
  onReview: (app: MarketplaceApp) => void;
  isUninstalling: boolean;
}

function InstalledAppCard({ installation, onUninstall, onReview, isUninstalling }: InstalledAppCardProps) {
  const app = installation.app;
  if (!app) return null;

  const getStatusBadge = () => {
    switch (installation.status) {
      case "active":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "suspended":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="group" data-testid={`card-installed-app-${app.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {app.icon ? (
                <img src={app.icon} alt={app.name} className="w-8 h-8 rounded" />
              ) : (
                <Package className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{app.name}</CardTitle>
              <CardDescription className="text-xs truncate">
                {app.shortDescription || "No description"}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{app.averageRating ? parseFloat(app.averageRating).toFixed(1) : "0.0"}</span>
          </div>
          <div className="text-xs">
            Installed: {installation.installedAt ? new Date(installation.installedAt).toLocaleDateString() : "N/A"}
          </div>
        </div>
        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {app.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onReview(app)}
          data-testid={`button-review-app-${app.id}`}
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          Review
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          data-testid={`button-settings-app-${app.id}`}
        >
          <Settings className="w-4 h-4 mr-1" />
          Settings
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onUninstall(app.id)}
          disabled={isUninstalling}
          data-testid={`button-uninstall-app-${app.id}`}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          {isUninstalling ? "Removing..." : "Uninstall"}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ReviewDialogProps {
  app: MarketplaceApp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ReviewDialog({ app, open, onOpenChange }: ReviewDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data: reviews, isLoading: reviewsLoading } = useQuery<AppReview[]>({
    queryKey: ['/api/marketplace/apps', app?.id, 'reviews'],
    enabled: open && !!app,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ appId, data }: { appId: string; data: { rating: number; comment: string } }) => {
      return apiRequest(`/api/marketplace/apps/${appId}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Review submitted", description: "Thank you for your feedback!" });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/apps', app?.id, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/my-installs'] });
      setRating(5);
      setComment("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to submit review", description: error.message, variant: "destructive" });
    },
  });

  if (!app) return null;

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast({ title: "Please write a review", variant: "destructive" });
      return;
    }
    submitReviewMutation.mutate({ 
      appId: app.id, 
      data: { rating, comment: comment.trim() } 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Review {app.name}
          </DialogTitle>
          <DialogDescription>
            Share your experience with this app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 hover-elevate rounded"
                  data-testid={`button-rating-star-${star}`}
                >
                  <Star 
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating) 
                        ? "text-yellow-500 fill-yellow-500" 
                        : "text-muted-foreground"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Your Review</label>
            <Textarea
              placeholder="Tell others what you think about this app..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              data-testid="input-review-comment"
            />
          </div>

          {reviewsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Reviews</h4>
              <ScrollArea className="h-[150px]">
                <div className="space-y-3 pr-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating 
                                  ? "text-yellow-500 fill-yellow-500" 
                                  : "text-muted-foreground"
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-review">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitReviewMutation.isPending}
            data-testid="button-submit-review"
          >
            {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AppStore() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewApp, setReviewApp] = useState<MarketplaceApp | null>(null);
  const [uninstallingAppId, setUninstallingAppId] = useState<string | null>(null);

  const { data: installations, isLoading } = useQuery<(AppInstallation & { app?: MarketplaceApp })[]>({
    queryKey: ['/api/marketplace/my-installs'],
  });

  const uninstallMutation = useMutation({
    mutationFn: async (appId: string) => {
      setUninstallingAppId(appId);
      return apiRequest(`/api/marketplace/apps/${appId}/uninstall`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({ title: "App uninstalled", description: "The app has been removed successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/my-installs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/apps'] });
      setUninstallingAppId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to uninstall", description: error.message, variant: "destructive" });
      setUninstallingAppId(null);
    },
  });

  const filteredInstallations = installations?.filter((inst) => {
    if (!searchQuery) return true;
    const app = inst.app;
    if (!app) return false;
    const query = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(query) ||
      app.shortDescription?.toLowerCase().includes(query) ||
      app.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const activeApps = filteredInstallations?.filter((inst) => inst.status === "active") || [];
  const pendingApps = filteredInstallations?.filter((inst) => inst.status === "pending") || [];
  const suspendedApps = filteredInstallations?.filter((inst) => inst.status === "suspended") || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Installed Apps</h1>
          <p className="text-muted-foreground mt-1">Manage your installed enterprise applications</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search installed apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-installed"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-5 w-32 mt-2" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !installations || installations.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Apps Installed</h3>
          <p className="text-muted-foreground mb-4">
            Browse our marketplace to find and install apps for your organization.
          </p>
          <Button asChild data-testid="button-browse-marketplace">
            <a href="/modules/marketplace">
              <ExternalLink className="w-4 h-4 mr-2" />
              Browse Marketplace
            </a>
          </Button>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active" data-testid="tab-active-apps">
              Active ({activeApps.length})
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending-apps">
              Pending ({pendingApps.length})
            </TabsTrigger>
            <TabsTrigger value="suspended" data-testid="tab-suspended-apps">
              Suspended ({suspendedApps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {activeApps.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active apps</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeApps.map((installation) => (
                  <InstalledAppCard
                    key={installation.id}
                    installation={installation}
                    onUninstall={(appId) => uninstallMutation.mutate(appId)}
                    onReview={(app) => setReviewApp(app)}
                    isUninstalling={uninstallingAppId === installation.appId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            {pendingApps.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending apps</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingApps.map((installation) => (
                  <InstalledAppCard
                    key={installation.id}
                    installation={installation}
                    onUninstall={(appId) => uninstallMutation.mutate(appId)}
                    onReview={(app) => setReviewApp(app)}
                    isUninstalling={uninstallingAppId === installation.appId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suspended" className="mt-4">
            {suspendedApps.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No suspended apps</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suspendedApps.map((installation) => (
                  <InstalledAppCard
                    key={installation.id}
                    installation={installation}
                    onUninstall={(appId) => uninstallMutation.mutate(appId)}
                    onReview={(app) => setReviewApp(app)}
                    isUninstalling={uninstallingAppId === installation.appId}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <ReviewDialog
        app={reviewApp}
        open={!!reviewApp}
        onOpenChange={(open) => !open && setReviewApp(null)}
      />
    </div>
  );
}
