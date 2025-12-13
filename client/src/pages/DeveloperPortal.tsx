import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, Package, Building2, Mail, Globe, DollarSign, 
  Edit, Trash2, Send, Eye, Star, Download, Clock,
  CheckCircle, XCircle, AlertCircle, Code, FileText, ExternalLink
} from "lucide-react";
import type { MarketplaceDeveloper, MarketplaceApp, MarketplaceCategory } from "@shared/schema";

const developerSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
});

const appSchema = z.object({
  name: z.string().min(1, "App name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  shortDescription: z.string().max(200, "Max 200 characters").optional(),
  longDescription: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
  pricingModel: z.enum(["free", "one_time", "subscription", "freemium"]),
  price: z.string().optional(),
  subscriptionPriceMonthly: z.string().optional(),
  subscriptionPriceYearly: z.string().optional(),
  demoUrl: z.string().url().optional().or(z.literal("")),
  documentationUrl: z.string().url().optional().or(z.literal("")),
  supportEmail: z.string().email().optional().or(z.literal("")),
  supportUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  licenseType: z.enum(["open_source", "commercial", "dual"]),
  deploymentType: z.enum(["saas", "self_hosted"]),
});

type DeveloperFormValues = z.infer<typeof developerSchema>;
type AppFormValues = z.infer<typeof appSchema>;

function DeveloperRegistrationForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const form = useForm<DeveloperFormValues>({
    resolver: zodResolver(developerSchema),
    defaultValues: {
      companyName: "",
      displayName: "",
      email: "",
      website: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: DeveloperFormValues) => {
      return apiRequest("POST", "/api/marketplace/developers/register", {
        ...data,
        userId: "current-user",
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Developer account created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/my-developer"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to register", 
        variant: "destructive" 
      });
    },
  });

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Register as Developer
        </CardTitle>
        <CardDescription>
          Create your developer account to publish apps on the marketplace
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} data-testid="input-company-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Apps" {...field} data-testid="input-display-name" />
                    </FormControl>
                    <FormDescription>Shown publicly on your apps</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="dev@acme.com" {...field} data-testid="input-dev-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://acme.com" {...field} data-testid="input-dev-website" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Your Company</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your company and the apps you plan to build..."
                      className="min-h-[100px]"
                      {...field} 
                      data-testid="input-dev-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={mutation.isPending} className="w-full" data-testid="button-register-developer">
              {mutation.isPending ? "Registering..." : "Register Developer Account"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function AppFormDialog({ 
  open, 
  onOpenChange, 
  developerId,
  editApp,
  categories
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  developerId: string;
  editApp?: MarketplaceApp | null;
  categories: MarketplaceCategory[];
}) {
  const { toast } = useToast();
  const form = useForm<AppFormValues>({
    resolver: zodResolver(appSchema),
    defaultValues: {
      name: editApp?.name || "",
      slug: editApp?.slug || "",
      shortDescription: editApp?.shortDescription || "",
      longDescription: editApp?.longDescription || "",
      categoryId: editApp?.categoryId || "",
      tags: editApp?.tags?.join(", ") || "",
      pricingModel: (editApp?.pricingModel as any) || "free",
      price: editApp?.price || "",
      subscriptionPriceMonthly: editApp?.subscriptionPriceMonthly || "",
      subscriptionPriceYearly: editApp?.subscriptionPriceYearly || "",
      demoUrl: editApp?.demoUrl || "",
      documentationUrl: editApp?.documentationUrl || "",
      supportEmail: editApp?.supportEmail || "",
      supportUrl: editApp?.supportUrl || "",
      githubUrl: editApp?.githubUrl || "",
      licenseType: (editApp?.licenseType as any) || "commercial",
      deploymentType: (editApp?.deploymentType as any) || "saas",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AppFormValues) => {
      const payload = {
        ...data,
        developerId,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        price: data.price || "0",
      };
      if (editApp) {
        return apiRequest("PUT", `/api/marketplace/apps/${editApp.id}`, payload);
      }
      return apiRequest("POST", "/api/marketplace/apps", payload);
    },
    onSuccess: () => {
      toast({ title: "Success", description: editApp ? "App updated!" : "App created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/my-apps"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save app", 
        variant: "destructive" 
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{editApp ? "Edit App" : "Create New App"}</DialogTitle>
          <DialogDescription>
            {editApp ? "Update your app details" : "Fill in the details to create a new app listing"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My Awesome App" {...field} data-testid="input-app-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="my-awesome-app" {...field} data-testid="input-app-slug" />
                          </FormControl>
                          <FormDescription>URL-friendly identifier</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Input placeholder="A brief description (max 200 chars)" {...field} data-testid="input-app-short-desc" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of your app, features, and benefits..."
                            className="min-h-[120px]"
                            {...field} 
                            data-testid="input-app-long-desc"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-app-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input placeholder="crm, sales, automation" {...field} data-testid="input-app-tags" />
                          </FormControl>
                          <FormDescription>Comma-separated</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pricingModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pricing Model</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-pricing-model">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="freemium">Freemium</SelectItem>
                              <SelectItem value="one_time">One-time Purchase</SelectItem>
                              <SelectItem value="subscription">Subscription</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch("pricingModel") === "one_time" && (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (USD)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="29.99" {...field} data-testid="input-app-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  {form.watch("pricingModel") === "subscription" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="subscriptionPriceMonthly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Price (USD)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="9.99" {...field} data-testid="input-monthly-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscriptionPriceYearly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Yearly Price (USD)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="99.99" {...field} data-testid="input-yearly-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Links & Support</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="demoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Demo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://demo.myapp.com" {...field} data-testid="input-demo-url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="documentationUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Documentation URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://docs.myapp.com" {...field} data-testid="input-docs-url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supportEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="support@myapp.com" {...field} data-testid="input-support-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supportUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://support.myapp.com" {...field} data-testid="input-support-url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="githubUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/org/repo" {...field} data-testid="input-github-url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Technical Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="licenseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-license">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="open_source">Open Source</SelectItem>
                              <SelectItem value="dual">Dual License</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deploymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deployment Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-deployment">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="saas">SaaS (Cloud)</SelectItem>
                              <SelectItem value="self_hosted">Self-Hosted</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-app">
                {mutation.isPending ? "Saving..." : editApp ? "Update App" : "Create App"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeveloperDashboard({ developer }: { developer: MarketplaceDeveloper }) {
  const { toast } = useToast();
  const [appFormOpen, setAppFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<MarketplaceApp | null>(null);

  const { data: myApps = [], isLoading: loadingApps } = useQuery<MarketplaceApp[]>({
    queryKey: ["/api/marketplace/my-apps"],
  });

  const { data: categories = [] } = useQuery<MarketplaceCategory[]>({
    queryKey: ["/api/marketplace/categories"],
  });

  const submitMutation = useMutation({
    mutationFn: async (appId: string) => {
      return apiRequest("POST", `/api/marketplace/apps/${appId}/submit`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "App submitted for review!" });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/my-apps"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to submit app", 
        variant: "destructive" 
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "submitted":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Published</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "submitted":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pending Review</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const totalRevenue = myApps.reduce((sum, app) => sum + parseFloat(app.totalRevenue || "0"), 0);
  const totalInstalls = myApps.reduce((sum, app) => sum + (app.totalInstalls || 0), 0);
  const publishedApps = myApps.filter(app => app.status === "approved").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-developer-portal-title">Developer Portal</h1>
          <p className="text-muted-foreground mt-1">
            Manage your apps and track performance
          </p>
        </div>
        <Button onClick={() => { setEditingApp(null); setAppFormOpen(true); }} data-testid="button-create-app">
          <Plus className="w-4 h-4 mr-2" />
          Create New App
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Developer Status</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge className={developer.status === "approved" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}>
              {developer.status === "approved" ? "Verified" : "Pending Approval"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published Apps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedApps}</div>
            <p className="text-xs text-muted-foreground">{myApps.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Installs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Download className="w-5 h-5 text-muted-foreground" />
              {totalInstalls.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <DollarSign className="w-5 h-5 text-green-500" />
              {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="apps">
        <TabsList>
          <TabsTrigger value="apps" data-testid="tab-my-apps">My Apps</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-dev-settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="apps" className="mt-6">
          {loadingApps ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : myApps.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No apps yet</h3>
                <p className="text-muted-foreground mt-1 mb-4">Create your first app to get started</p>
                <Button onClick={() => { setEditingApp(null); setAppFormOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create App
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Installs</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myApps.map((app) => (
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
                      <TableCell>{getStatusBadge(app.status || "draft")}</TableCell>
                      <TableCell className="text-right">{app.totalInstalls || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {app.averageRating ? parseFloat(app.averageRating).toFixed(1) : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${parseFloat(app.totalRevenue || "0").toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => { setEditingApp(app); setAppFormOpen(true); }}
                            data-testid={`button-edit-app-${app.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {app.status === "draft" && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => submitMutation.mutate(app.id)}
                              disabled={submitMutation.isPending}
                              data-testid={`button-submit-app-${app.id}`}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>App Analytics</CardTitle>
              <CardDescription>Track your app performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Analytics dashboard coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Developer Settings</CardTitle>
              <CardDescription>Manage your developer account and payout settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <p className="text-muted-foreground">{developer.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Display Name</label>
                  <p className="text-muted-foreground">{developer.displayName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground">{developer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <p className="text-muted-foreground">{developer.website || "Not set"}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Payout Information</h4>
                <p className="text-sm text-muted-foreground">
                  Total Revenue: ${parseFloat(developer.totalRevenue || "0").toFixed(2)}<br/>
                  Total Payouts: ${parseFloat(developer.totalPayouts || "0").toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AppFormDialog
        open={appFormOpen}
        onOpenChange={setAppFormOpen}
        developerId={developer.id}
        editApp={editingApp}
        categories={categories}
      />
    </div>
  );
}

export default function DeveloperPortal() {
  const { data: developer, isLoading } = useQuery<MarketplaceDeveloper>({
    queryKey: ["/api/marketplace/my-developer"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-2">Developer Portal</h1>
          <p className="text-muted-foreground mb-8">
            Register as a developer to publish apps on the marketplace
          </p>
        </div>
        <DeveloperRegistrationForm onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/marketplace/my-developer"] });
        }} />
      </div>
    );
  }

  return <DeveloperDashboard developer={developer} />;
}
