import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CheckCircle, XCircle, Package, Eye, Clock, DollarSign, 
  TrendingUp, Users, Settings, Percent, Building2, ExternalLink
} from "lucide-react";
import type { MarketplaceApp, MarketplaceDeveloper } from "@shared/schema";

interface AppReviewDialogProps {
  app: MarketplaceApp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (appId: string) => void;
  onReject: (appId: string, reason: string) => void;
  isPending: boolean;
}

function AppReviewDialog({ app, open, onOpenChange, onApprove, onReject, isPending }: AppReviewDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!app) return null;

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(app.id, rejectionReason);
      setRejectionReason("");
      setShowRejectForm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Review App Submission</DialogTitle>
          <DialogDescription>
            Review the app details before approving or rejecting
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {app.icon ? (
                  <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-lg" />
                ) : (
                  <Package className="w-8 h-8" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{app.name}</h3>
                <p className="text-muted-foreground">{app.shortDescription}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{app.pricingModel}</Badge>
                  <Badge variant="outline">{app.licenseType}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {app.longDescription || app.shortDescription || "No description provided."}
              </p>
            </div>

            {app.tags && app.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {app.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Pricing:</span>{" "}
                {app.pricingModel === "free" ? "Free" : 
                 app.pricingModel === "subscription" ? `$${app.subscriptionPriceMonthly}/mo` :
                 `$${app.price}`}
              </div>
              <div>
                <span className="text-muted-foreground">Deployment:</span>{" "}
                {app.deploymentType === "saas" ? "Cloud (SaaS)" : "Self-Hosted"}
              </div>
              {app.demoUrl && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Demo:</span>{" "}
                  <a href={app.demoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {app.demoUrl}
                  </a>
                </div>
              )}
              {app.documentationUrl && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Documentation:</span>{" "}
                  <a href={app.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {app.documentationUrl}
                  </a>
                </div>
              )}
            </div>

            {showRejectForm && (
              <div className="space-y-2 border-t pt-4">
                <Label>Rejection Reason</Label>
                <Textarea
                  placeholder="Explain why this app is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="input-rejection-reason"
                />
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {showRejectForm ? (
            <>
              <Button variant="ghost" onClick={() => setShowRejectForm(false)}>
                Back
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isPending}
                data-testid="button-confirm-reject"
              >
                {isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="destructive" 
                onClick={() => setShowRejectForm(true)}
                data-testid="button-reject-app"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={() => onApprove(app.id)}
                disabled={isPending}
                data-testid="button-approve-app"
              >
                {isPending ? "Approving..." : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MarketplaceAdmin() {
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<MarketplaceApp | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [commissionRate, setCommissionRate] = useState("");

  const { data: pendingApps = [], isLoading: loadingPending } = useQuery<MarketplaceApp[]>({
    queryKey: ["/api/marketplace/admin/pending-apps"],
  });

  const { data: allApps = [], isLoading: loadingApps } = useQuery<MarketplaceApp[]>({
    queryKey: ["/api/marketplace/apps"],
  });

  const { data: commissionSettings } = useQuery<{ defaultCommissionRate: string }>({
    queryKey: ["/api/marketplace/commission-settings"],
  });

  const approveMutation = useMutation({
    mutationFn: async (appId: string) => {
      return apiRequest("POST", `/api/marketplace/apps/${appId}/approve`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "App approved and published!" });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/admin/pending-apps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/apps"] });
      setReviewDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to approve app", 
        variant: "destructive" 
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ appId, reason }: { appId: string; reason: string }) => {
      return apiRequest("POST", `/api/marketplace/apps/${appId}/reject`, { reason });
    },
    onSuccess: () => {
      toast({ title: "App Rejected", description: "The developer has been notified." });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/admin/pending-apps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/apps"] });
      setReviewDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to reject app", 
        variant: "destructive" 
      });
    },
  });

  const commissionMutation = useMutation({
    mutationFn: async (rate: string) => {
      return apiRequest("PUT", "/api/marketplace/commission-settings", { 
        defaultCommissionRate: rate 
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Commission rate updated!" });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/commission-settings"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update settings", 
        variant: "destructive" 
      });
    },
  });

  const handleReview = (app: MarketplaceApp) => {
    setSelectedApp(app);
    setReviewDialogOpen(true);
  };

  const approvedApps = allApps.filter(app => app.status === "approved");
  const totalRevenue = approvedApps.reduce((sum, app) => sum + parseFloat(app.totalRevenue || "0"), 0);
  const totalInstalls = approvedApps.reduce((sum, app) => sum + (app.totalInstalls || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-marketplace-admin-title">Marketplace Administration</h1>
        <p className="text-muted-foreground mt-1">
          Review submissions, manage apps, and configure marketplace settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Pending Review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApps.length}</div>
            <p className="text-xs text-muted-foreground">apps waiting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              Published Apps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedApps.length}</div>
            <p className="text-xs text-muted-foreground">{allApps.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Total Installs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstalls.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Platform Revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue * parseFloat(commissionSettings?.defaultCommissionRate || "0") / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {commissionSettings?.defaultCommissionRate || 0}% commission
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending-apps">
            Pending Review
            {pendingApps.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingApps.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all-apps-admin">All Apps</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-marketplace-settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {loadingPending ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : pendingApps.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-muted-foreground mt-1">No apps pending review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App</TableHead>
                    <TableHead>Developer</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {app.icon ? (
                              <img src={app.icon} alt={app.name} className="w-6 h-6 rounded" />
                            ) : (
                              <Package className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{app.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {app.shortDescription || "No description"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{app.developerId}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{app.pricingModel}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm"
                          onClick={() => handleReview(app)}
                          data-testid={`button-review-app-${app.id}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {loadingApps ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead className="text-right">Installs</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {app.icon ? (
                              <img src={app.icon} alt={app.name} className="w-6 h-6 rounded" />
                            ) : (
                              <Package className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{app.name}</div>
                            <div className="text-sm text-muted-foreground">{app.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={app.status === "approved" ? "default" : 
                                  app.status === "rejected" ? "destructive" : "secondary"}
                          className={app.status === "approved" ? "bg-green-500/10 text-green-600 border-green-200" : ""}
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{app.pricingModel}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{app.totalInstalls || 0}</TableCell>
                      <TableCell className="text-right">${parseFloat(app.totalRevenue || "0").toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Commission Settings
                </CardTitle>
                <CardDescription>
                  Configure the platform's revenue share from app sales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Commission Rate (%)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder={commissionSettings?.defaultCommissionRate || "0"}
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      data-testid="input-commission-rate"
                    />
                    <Button 
                      onClick={() => commissionMutation.mutate(commissionRate)}
                      disabled={!commissionRate || commissionMutation.isPending}
                      data-testid="button-save-commission"
                    >
                      {commissionMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current rate: {commissionSettings?.defaultCommissionRate || 0}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Marketplace Policies
                </CardTitle>
                <CardDescription>
                  Configure submission requirements and policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Require app description
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Require documentation URL
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Manual review required
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Developer verification
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AppReviewDialog
        app={selectedApp}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onApprove={(appId) => approveMutation.mutate(appId)}
        onReject={(appId, reason) => rejectMutation.mutate({ appId, reason })}
        isPending={approveMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
}
