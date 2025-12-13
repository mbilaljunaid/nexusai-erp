import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header, Footer } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, Star, Download, Package, Grid3X3, List, 
  ExternalLink, Check, Tag, Layers, Shield, Zap, 
  Code, BookOpen, Mail, Globe, DollarSign, LogIn, Building2,
  Sparkles, Share2, Twitter, Linkedin, Link2, GitCompare, X, Clock, Trash2
} from "lucide-react";
import type { MarketplaceApp, MarketplaceCategory } from "@shared/schema";
import { TutorialOverlay } from "@/components/TutorialOverlay";

interface Industry {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface AppCardProps {
  app: MarketplaceApp;
  onViewDetails: (app: MarketplaceApp) => void;
  onInstall: (appId: string) => void;
  isInstalling: boolean;
  isInstalled: boolean;
  compareMode?: boolean;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (app: MarketplaceApp) => void;
}

function AppCard({ app, onViewDetails, onInstall, isInstalling, isInstalled, compareMode, isSelectedForCompare, onToggleCompare }: AppCardProps) {
  const getPriceDisplay = () => {
    if (app.pricingModel === "free") return "Free";
    if (app.pricingModel === "freemium") return "Freemium";
    if (app.pricingModel === "subscription") {
      return app.subscriptionPriceMonthly ? `$${app.subscriptionPriceMonthly}/mo` : "Contact";
    }
    return app.price && parseFloat(app.price) > 0 ? `$${app.price}` : "Free";
  };

  const getStatusBadge = () => {
    switch (app.status) {
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Published</Badge>;
      case "submitted":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={`group hover-elevate transition-all ${isSelectedForCompare ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {compareMode && onToggleCompare && (
            <Checkbox
              checked={isSelectedForCompare}
              onCheckedChange={() => onToggleCompare(app)}
              className="mt-1"
              data-testid={`checkbox-compare-${app.id}`}
            />
          )}
          <div className="flex items-center gap-3 flex-1">
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
            <span className="text-xs">({app.totalReviews || 0})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{app.totalInstalls || 0}</span>
          </div>
          <div className="ml-auto font-medium text-foreground">
            {getPriceDisplay()}
          </div>
        </div>
        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {app.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {app.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{app.tags.length - 3}</Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onViewDetails(app)}
          data-testid={`button-view-app-${app.id}`}
        >
          View Details
        </Button>
        {isInstalled ? (
          <Button size="sm" variant="secondary" disabled className="flex-1">
            <Check className="w-4 h-4 mr-1" />
            Installed
          </Button>
        ) : (
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onInstall(app.id)}
            disabled={isInstalling}
            data-testid={`button-install-app-${app.id}`}
          >
            {isInstalling ? "Installing..." : "Install"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function AppDetailDialog({ 
  app, 
  open, 
  onOpenChange, 
  onInstall, 
  isInstalling, 
  isInstalled,
  onShare
}: { 
  app: MarketplaceApp | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onInstall: (appId: string) => void;
  isInstalling: boolean;
  isInstalled: boolean;
  onShare?: (platform: string, app: MarketplaceApp) => void;
}) {
  if (!app) return null;

  const getPriceDisplay = () => {
    if (app.pricingModel === "free") return "Free";
    if (app.pricingModel === "freemium") return "Freemium";
    if (app.pricingModel === "subscription") {
      const monthly = app.subscriptionPriceMonthly ? `$${app.subscriptionPriceMonthly}/mo` : "";
      const yearly = app.subscriptionPriceYearly ? `$${app.subscriptionPriceYearly}/yr` : "";
      return [monthly, yearly].filter(Boolean).join(" or ") || "Contact";
    }
    return app.price && parseFloat(app.price) > 0 ? `$${app.price}` : "Free";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {app.icon ? (
                <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-lg" />
              ) : (
                <Package className="w-8 h-8" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl">{app.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {app.shortDescription}
              </DialogDescription>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{app.averageRating ? parseFloat(app.averageRating).toFixed(1) : "0.0"}</span>
                  <span className="text-muted-foreground">({app.totalReviews || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span>{app.totalInstalls || 0} installs</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {app.screenshots && app.screenshots.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Screenshots</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {app.screenshots.map((screenshot, i) => (
                    <img 
                      key={i} 
                      src={screenshot} 
                      alt={`Screenshot ${i + 1}`}
                      className="h-32 rounded-lg border object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {app.longDescription || app.shortDescription || "No description available."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Pricing
                </h4>
                <p className="text-sm">
                  <span className="font-medium">{getPriceDisplay()}</span>
                  <span className="text-muted-foreground ml-2 capitalize">({app.pricingModel})</span>
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  License
                </h4>
                <p className="text-sm capitalize">{app.licenseType || "Commercial"}</p>
              </div>
            </div>

            {app.tags && app.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1">
                  {app.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {app.permissions && app.permissions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Required Permissions
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {app.permissions.map((perm, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {app.supportedIndustries && app.supportedIndustries.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Supported Industries
                </h4>
                <div className="flex flex-wrap gap-1">
                  {app.supportedIndustries.map((industry, i) => (
                    <Badge key={i} variant="outline" className="capitalize">{industry.replace(/-/g, ' ')}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {app.demoUrl && (
                <a href={app.demoUrl} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 text-primary hover:underline"
                   data-testid="link-app-demo">
                  <Zap className="w-4 h-4" />
                  Live Demo
                </a>
              )}
              {app.documentationUrl && (
                <a href={app.documentationUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-primary hover:underline"
                   data-testid="link-app-docs">
                  <BookOpen className="w-4 h-4" />
                  Documentation
                </a>
              )}
              {app.githubUrl && (
                <a href={app.githubUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-primary hover:underline"
                   data-testid="link-app-github">
                  <Code className="w-4 h-4" />
                  Source Code
                </a>
              )}
              {app.supportUrl && (
                <a href={app.supportUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-primary hover:underline"
                   data-testid="link-app-support">
                  <Globe className="w-4 h-4" />
                  Support
                </a>
              )}
              {app.supportEmail && (
                <a href={`mailto:${app.supportEmail}`}
                   className="flex items-center gap-1 text-primary hover:underline"
                   data-testid="link-app-contact">
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
              )}
            </div>

            {onShare && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share This App
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShare('twitter', app)}
                    data-testid="button-share-twitter"
                  >
                    <Twitter className="w-4 h-4 mr-1" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShare('linkedin', app)}
                    data-testid="button-share-linkedin"
                  >
                    <Linkedin className="w-4 h-4 mr-1" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShare('copy', app)}
                    data-testid="button-share-copy"
                  >
                    <Link2 className="w-4 h-4 mr-1" />
                    Copy Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-app-details">
            Close
          </Button>
          {isInstalled ? (
            <Button disabled variant="secondary" data-testid="button-already-installed">
              <Check className="w-4 h-4 mr-2" />
              Already Installed
            </Button>
          ) : (
            <Button onClick={() => onInstall(app.id)} disabled={isInstalling} data-testid="button-install-app-dialog">
              {isInstalling ? "Installing..." : `Install ${getPriceDisplay() !== "Free" ? `(${getPriceDisplay()})` : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompareDialog({
  apps,
  open,
  onOpenChange
}: {
  apps: MarketplaceApp[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (apps.length < 2) return null;

  const getPriceDisplay = (app: MarketplaceApp) => {
    if (app.pricingModel === "free") return "Free";
    if (app.pricingModel === "freemium") return "Freemium";
    if (app.pricingModel === "subscription") {
      return app.subscriptionPriceMonthly ? `$${app.subscriptionPriceMonthly}/mo` : "Contact";
    }
    return app.price && parseFloat(app.price) > 0 ? `$${app.price}` : "Free";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            App Comparison
          </DialogTitle>
          <DialogDescription>
            Compare features and details side by side
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-medium text-muted-foreground w-32">Feature</th>
                  {apps.map(app => (
                    <th key={app.id} className="text-left p-3 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          {app.icon ? (
                            <img src={app.icon} alt={app.name} className="w-6 h-6 rounded" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-semibold">{app.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b text-sm text-muted-foreground">Rating</td>
                  {apps.map(app => (
                    <td key={app.id} className="p-3 border-b">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{app.averageRating ? parseFloat(app.averageRating).toFixed(1) : "0.0"}</span>
                        <span className="text-xs text-muted-foreground">({app.totalReviews || 0})</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 border-b text-sm text-muted-foreground">Installs</td>
                  {apps.map(app => (
                    <td key={app.id} className="p-3 border-b">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{app.totalInstalls || 0}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 border-b text-sm text-muted-foreground">Pricing</td>
                  {apps.map(app => (
                    <td key={app.id} className="p-3 border-b">
                      <Badge variant="outline">{getPriceDisplay(app)}</Badge>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 border-b text-sm text-muted-foreground">License</td>
                  {apps.map(app => (
                    <td key={app.id} className="p-3 border-b text-sm capitalize">
                      {app.licenseType || "Commercial"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 border-b text-sm text-muted-foreground">Description</td>
                  {apps.map(app => (
                    <td key={app.id} className="p-3 border-b text-sm text-muted-foreground">
                      {app.shortDescription || "No description"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 border-b text-sm text-muted-foreground">Tags</td>
                  {apps.map(app => (
                    <td key={app.id} className="p-3 border-b">
                      <div className="flex flex-wrap gap-1">
                        {app.tags?.slice(0, 4).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                        {(app.tags?.length || 0) > 4 && (
                          <Badge variant="secondary" className="text-xs">+{(app.tags?.length || 0) - 4}</Badge>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 border-b text-sm text-muted-foreground">Permissions</td>
                  {apps.map(app => (
                    <td key={app.id} className="p-3 border-b">
                      <ul className="text-sm space-y-1">
                        {app.permissions?.slice(0, 3).map((perm, i) => (
                          <li key={i} className="flex items-center gap-1 text-xs">
                            <Check className="w-3 h-3 text-green-500" />
                            {perm}
                          </li>
                        ))}
                        {(app.permissions?.length || 0) > 3 && (
                          <li className="text-xs text-muted-foreground">+{(app.permissions?.length || 0) - 3} more</li>
                        )}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 border-b text-sm text-muted-foreground">Industries</td>
                  {apps.map(app => (
                    <td key={app.id} className="p-3 border-b">
                      <div className="flex flex-wrap gap-1">
                        {app.supportedIndustries?.slice(0, 3).map((ind, i) => (
                          <Badge key={i} variant="outline" className="text-xs capitalize">
                            {ind.replace(/-/g, ' ')}
                          </Badge>
                        ))}
                        {(app.supportedIndustries?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(app.supportedIndustries?.length || 0) - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-compare">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Marketplace() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pricingFilter, setPricingFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedApp, setSelectedApp] = useState<MarketplaceApp | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [aiFilter, setAiFilter] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<MarketplaceApp[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  
  const RECENTLY_VIEWED_KEY = "nexusai-recently-viewed-apps";
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewedIds));
    } catch {
      // Ignore localStorage errors
    }
  }, [recentlyViewedIds]);

  const addToRecentlyViewed = (appId: string) => {
    setRecentlyViewedIds(prev => {
      const filtered = prev.filter(id => id !== appId);
      return [appId, ...filtered].slice(0, 10);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
  };

  const { data: categories = [], isLoading: loadingCategories } = useQuery<MarketplaceCategory[]>({
    queryKey: ["/api/marketplace/categories"],
  });

  const { data: industries = [] } = useQuery<Industry[]>({
    queryKey: ["/api/industries"],
  });

  const { data: apps = [], isLoading: loadingApps } = useQuery<MarketplaceApp[]>({
    queryKey: ["/api/marketplace/apps", selectedCategory, searchQuery, pricingFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (pricingFilter && pricingFilter !== "all") {
        params.append("pricing", pricingFilter);
      }
      const url = `/api/marketplace/apps${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch apps");
      return res.json();
    },
  });

  const { data: installedApps = [] } = useQuery<any[]>({
    queryKey: ["/api/marketplace/my-installs"],
    enabled: isAuthenticated,
  });

  const installedAppIds = new Set(installedApps.map((i: any) => i.appId));

  const installMutation = useMutation({
    mutationFn: async (appId: string) => {
      return apiRequest("POST", `/api/marketplace/apps/${appId}/install`, {
        tenantId: "default-tenant",
        installedBy: "current-user",
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "App installed successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/my-installs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/apps"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to install app", 
        variant: "destructive" 
      });
    },
  });

  const handleInstall = (appId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to install apps from the marketplace.",
        action: (
          <Button size="sm" onClick={() => window.location.href = '/api/login'} data-testid="button-toast-login">
            <LogIn className="w-4 h-4 mr-1" />
            Log In
          </Button>
        ),
      });
      return;
    }
    installMutation.mutate(appId);
  };

  const handleViewDetails = (app: MarketplaceApp) => {
    setSelectedApp(app);
    setDetailsOpen(true);
    addToRecentlyViewed(app.id);
  };

  const getIndustrySlug = (industryId: string) => {
    return industries.find((i) => i.id === industryId)?.slug;
  };

  const selectedIndustrySlug = industryFilter !== "all" ? getIndustrySlug(industryFilter) : null;
  const selectedIndustryName = industryFilter !== "all" 
    ? industries.find((i) => i.id === industryFilter)?.name 
    : null;

  const industryRecommendedApps = industryFilter !== "all"
    ? apps.filter((app) => 
        app.status === "approved" && 
        app.supportedIndustries?.includes(selectedIndustrySlug || industryFilter)
      )
    : [];

  const filteredApps = apps.filter((app) => {
    if (app.status !== "approved") return false;
    if (searchQuery && !app.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== "all" && app.categoryId !== selectedCategory) return false;
    if (pricingFilter !== "all" && app.pricingModel !== pricingFilter) return false;
    if (aiFilter && !app.tags?.some(t => 
      t.toLowerCase().includes('ai') || 
      t.toLowerCase().includes('openai') || 
      t.toLowerCase().includes('machine learning') ||
      t.toLowerCase().includes('ml') ||
      t.toLowerCase().includes('automation')
    )) return false;
    return true;
  });

  const toggleCompareApp = (app: MarketplaceApp) => {
    setSelectedForCompare(prev => {
      const isSelected = prev.some(a => a.id === app.id);
      if (isSelected) {
        return prev.filter(a => a.id !== app.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, app];
    });
  };

  const handleShare = (platform: string, app: MarketplaceApp) => {
    const appUrl = `${window.location.origin}/marketplace?app=${app.id}`;
    const text = `Check out ${app.name} on NexusAI Marketplace!`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(appUrl);
        toast({ title: "Link Copied", description: "App link copied to clipboard!" });
        break;
    }
  };

  const featuredApps = filteredApps.filter(app => app.featuredOrder != null).sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
  const regularApps = filteredApps.filter(app => app.featuredOrder == null);

  const recentlyViewedApps = recentlyViewedIds
    .map(id => apps.find(app => app.id === id))
    .filter((app): app is MarketplaceApp => app !== undefined && app.status === "approved")
    .slice(0, 6);

  useEffect(() => {
    document.title = "App Marketplace | NexusAI";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-marketplace-title">App Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Discover and install apps to extend your platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")} data-testid="button-view-grid">
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")} data-testid="button-view-list">
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-apps"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={pricingFilter} onValueChange={setPricingFilter}>
          <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-pricing">
            <SelectValue placeholder="Pricing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pricing</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="freemium">Freemium</SelectItem>
            <SelectItem value="one_time">One-time</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
          </SelectContent>
        </Select>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-industry-filter">
            <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.filter((i) => i.isActive).map((industry) => (
              <SelectItem key={industry.id} value={industry.id}>{industry.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background">
          <Sparkles className="w-4 h-4 text-primary" />
          <Label htmlFor="ai-filter" className="text-sm cursor-pointer whitespace-nowrap">AI-Powered</Label>
          <Switch 
            id="ai-filter" 
            checked={aiFilter} 
            onCheckedChange={setAiFilter} 
            data-testid="switch-ai-filter"
          />
        </div>
        <Button 
          variant={compareMode ? "default" : "outline"} 
          onClick={() => {
            setCompareMode(!compareMode);
            if (compareMode) {
              setSelectedForCompare([]);
            }
          }}
          className="gap-2"
          data-testid="button-compare-mode"
        >
          <GitCompare className="w-4 h-4" />
          {compareMode ? "Exit Compare" : "Compare Apps"}
        </Button>
      </div>

      {compareMode && selectedForCompare.length > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50" data-testid="compare-selection-bar">
          <span className="text-sm font-medium">
            {selectedForCompare.length} of 3 apps selected
          </span>
          <div className="flex gap-2 flex-1">
            {selectedForCompare.map(app => (
              <Badge key={app.id} variant="secondary" className="gap-1">
                {app.name}
                <button 
                  onClick={() => toggleCompareApp(app)}
                  className="ml-1 hover:text-destructive"
                  data-testid={`button-remove-compare-${app.id}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Button 
            onClick={() => setCompareDialogOpen(true)} 
            disabled={selectedForCompare.length < 2}
            data-testid="button-open-compare"
          >
            Compare ({selectedForCompare.length})
          </Button>
        </div>
      )}

      {!loadingApps && recentlyViewedApps.length > 0 && (
        <Card className="p-6" data-testid="section-recently-viewed">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Recently Viewed</h2>
                <p className="text-sm text-muted-foreground">
                  Quick access to apps you've explored
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRecentlyViewed}
              className="text-muted-foreground"
              data-testid="button-clear-recently-viewed"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {recentlyViewedApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onViewDetails={handleViewDetails}
                onInstall={handleInstall}
                isInstalling={installMutation.isPending}
                isInstalled={installedAppIds.has(app.id)}
                compareMode={compareMode}
                isSelectedForCompare={selectedForCompare.some(a => a.id === app.id)}
                onToggleCompare={toggleCompareApp}
              />
            ))}
          </div>
        </Card>
      )}

      {industryFilter !== "all" && !loadingApps && industryRecommendedApps.length > 0 && (
        <Card className="p-6 bg-primary/5 border-primary/20" data-testid="section-industry-recommendations">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Recommended for {selectedIndustryName}</h2>
              <p className="text-sm text-muted-foreground">
                {industryRecommendedApps.length} app{industryRecommendedApps.length !== 1 ? 's' : ''} tailored for your industry
              </p>
            </div>
          </div>
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {industryRecommendedApps.slice(0, 6).map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onViewDetails={handleViewDetails}
                onInstall={handleInstall}
                isInstalling={installMutation.isPending}
                isInstalled={installedAppIds.has(app.id)}
                compareMode={compareMode}
                isSelectedForCompare={selectedForCompare.some(a => a.id === app.id)}
                onToggleCompare={toggleCompareApp}
              />
            ))}
          </div>
          {industryRecommendedApps.length > 6 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 6 of {industryRecommendedApps.length} recommended apps. Browse all apps below.
            </p>
          )}
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-apps">All Apps</TabsTrigger>
          <TabsTrigger value="featured" data-testid="tab-featured">Featured</TabsTrigger>
          <TabsTrigger value="popular" data-testid="tab-popular">Popular</TabsTrigger>
          <TabsTrigger value="new" data-testid="tab-new">New</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loadingApps ? (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium">Discover Amazing Apps</h3>
              <p className="text-muted-foreground mt-1">Adjust your filters to explore our growing collection of powerful integrations</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onViewDetails={handleViewDetails}
                  onInstall={handleInstall}
                  isInstalling={installMutation.isPending}
                  isInstalled={installedAppIds.has(app.id)}
                  compareMode={compareMode}
                  isSelectedForCompare={selectedForCompare.some(a => a.id === app.id)}
                  onToggleCompare={toggleCompareApp}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          {featuredApps.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Featured Apps Coming Soon</h3>
              <p className="text-muted-foreground mt-1">Our team is handpicking the best apps for you - stay tuned for curated recommendations!</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {featuredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onViewDetails={handleViewDetails}
                  onInstall={handleInstall}
                  isInstalling={installMutation.isPending}
                  isInstalled={installedAppIds.has(app.id)}
                  compareMode={compareMode}
                  isSelectedForCompare={selectedForCompare.some(a => a.id === app.id)}
                  onToggleCompare={toggleCompareApp}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {[...filteredApps].sort((a, b) => (b.totalInstalls || 0) - (a.totalInstalls || 0)).slice(0, 12).map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onViewDetails={handleViewDetails}
                onInstall={handleInstall}
                isInstalling={installMutation.isPending}
                isInstalled={installedAppIds.has(app.id)}
                compareMode={compareMode}
                isSelectedForCompare={selectedForCompare.some(a => a.id === app.id)}
                onToggleCompare={toggleCompareApp}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {[...filteredApps].sort((a, b) => 
              new Date(b.publishedAt || b.createdAt || 0).getTime() - 
              new Date(a.publishedAt || a.createdAt || 0).getTime()
            ).slice(0, 12).map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onViewDetails={handleViewDetails}
                onInstall={handleInstall}
                isInstalling={installMutation.isPending}
                isInstalled={installedAppIds.has(app.id)}
                compareMode={compareMode}
                isSelectedForCompare={selectedForCompare.some(a => a.id === app.id)}
                onToggleCompare={toggleCompareApp}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

        <AppDetailDialog
          app={selectedApp}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onInstall={handleInstall}
          isInstalling={installMutation.isPending}
          isInstalled={selectedApp ? installedAppIds.has(selectedApp.id) : false}
          onShare={handleShare}
        />

        <CompareDialog
          apps={selectedForCompare}
          open={compareDialogOpen}
          onOpenChange={setCompareDialogOpen}
        />

        <TutorialOverlay 
          storageKey="marketplace-tutorial-completed"
          onComplete={() => console.log('Tutorial completed')}
        />
      </main>
      <Footer />
    </div>
  );
}
