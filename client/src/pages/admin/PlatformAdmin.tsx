import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { IconNavigation } from "@/components/IconNavigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  Settings,
  Shield,
  Database,
  Zap,
  AlertTriangle,
  TrendingUp,
  Plus,
  MoreVertical,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tenant {
  id: string;
  name: string;
  company: string;
  status: "active" | "trial" | "inactive";
  users: number;
  storage: number;
  plan: "starter" | "professional" | "enterprise";
  createdAt: string;
  aiCreditsUsed: number;
}

export default function PlatformAdmin() {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("overview");
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [isSavingPayments, setIsSavingPayments] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    lemonSqueezy: {
      apiKey: "",
      storeId: "",
      variantId: "",
      webhookSecret: "",
    },
    stripe: {
      secretKey: "",
      publishableKey: "",
      webhookSecret: "",
    },
  });

  const toggleShowKey = (key: string) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePaymentSettings = async () => {
    setIsSavingPayments(true);
    try {
      toast({
        title: "Settings Saved",
        description: "Payment provider settings have been updated. Note: API keys should be set as environment variables for security.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save payment settings. Please try again.",
        variant: "destructive",
      });
    }
    setIsSavingPayments(false);
  };
  
  const navItems = [
    { id: "overview", label: "Overview", icon: Building2, color: "text-blue-500" },
    { id: "tenants", label: "Tenants", icon: Users, color: "text-green-500" },
    { id: "features", label: "Features & Licensing", icon: Zap, color: "text-yellow-500" },
    { id: "payments", label: "Payment Settings", icon: CreditCard, color: "text-emerald-500" },
    { id: "system", label: "System Config", icon: Settings, color: "text-purple-500" },
    { id: "security", label: "Security & Compliance", icon: Shield, color: "text-red-500" },
  ];

  // todo: remove mock functionality
  const tenants: Tenant[] = [
    {
      id: "tenant-1",
      name: "Acme Corp",
      company: "Acme Corporation",
      status: "active",
      users: 245,
      storage: 450,
      plan: "enterprise",
      createdAt: "2024-01-15",
      aiCreditsUsed: 12500,
    },
    {
      id: "tenant-2",
      name: "TechStart Inc",
      company: "TechStart Industries",
      status: "active",
      users: 78,
      storage: 120,
      plan: "professional",
      createdAt: "2024-03-20",
      aiCreditsUsed: 2300,
    },
    {
      id: "tenant-3",
      name: "Global Solutions",
      company: "Global Solutions Ltd",
      status: "trial",
      users: 15,
      storage: 25,
      plan: "starter",
      createdAt: "2024-11-20",
      aiCreditsUsed: 450,
    },
  ];

  const systemStats = {
    totalTenants: 247,
    activeUsers: 5234,
    totalStorage: 12480,
    systemUptime: 99.98,
    aiRequestsToday: 45230,
    avgResponseTime: 142,
  };

  const statusConfig = {
    active: { bg: "bg-green-500/10", text: "text-green-600", label: "Active" },
    trial: { bg: "bg-blue-500/10", text: "text-blue-600", label: "Trial" },
    inactive: { bg: "bg-red-500/10", text: "text-red-600", label: "Inactive" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Platform Admin</h1>
        <p className="text-muted-foreground text-sm">Manage all tenants, system configuration, and platform health</p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <Building2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{systemStats.totalTenants}</p>
                    <p className="text-xs text-muted-foreground">Total Tenants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-green-500/10">
                    <Users className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{systemStats.activeUsers}K</p>
                    <p className="text-xs text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-purple-500/10">
                    <Zap className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{systemStats.aiRequestsToday}K</p>
                    <p className="text-xs text-muted-foreground">AI Requests Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Platform Uptime</span>
                  <span className="font-mono">{systemStats.systemUptime}%</span>
                </div>
                <Progress value={systemStats.systemUptime} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Avg Response Time</span>
                  <span className="font-mono">{systemStats.avgResponseTime}ms</span>
                </div>
                <Progress value={Math.min((1000 - systemStats.avgResponseTime) / 10, 100)} className="h-2" />
              </div>
              <div className="pt-2 border-t text-xs text-muted-foreground">
                All systems operational. Last checked: 2 minutes ago
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resource Utilization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Storage Used</span>
                  <span className="font-mono">{systemStats.totalStorage}GB</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Database Capacity</span>
                  <span className="font-mono">8.2TB / 10TB</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "tenants" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Input placeholder="Search tenants..." className="max-w-sm" data-testid="input-search-tenants" />
            <Button data-testid="button-add-tenant">
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Tenant</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Plan</th>
                  <th className="px-4 py-2 text-left font-medium">Users</th>
                  <th className="px-4 py-2 text-left font-medium">AI Credits</th>
                  <th className="px-4 py-2 text-left font-medium">Created</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => {
                  const statusCfg = statusConfig[tenant.status];
                  return (
                    <tr key={tenant.id} className="border-b hover:bg-muted/50" data-testid={`row-tenant-${tenant.id}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.company}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={`${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs capitalize">{tenant.plan}</td>
                      <td className="px-4 py-3 font-mono">{tenant.users}</td>
                      <td className="px-4 py-3 font-mono">{tenant.aiCreditsUsed.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">{tenant.createdAt}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" data-testid={`button-tenant-actions-${tenant.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === "features" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Features</CardTitle>
              <CardDescription>Enable/disable features available to all tenants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "ERP & Finance Module", enabled: true },
                { name: "CRM & Sales", enabled: true },
                { name: "Project Management", enabled: true },
                { name: "HR & Talent", enabled: true },
                { name: "Service & Support", enabled: true },
                { name: "Marketing Automation", enabled: false },
                { name: "Analytics & BI", enabled: true },
                { name: "BPM & Workflow", enabled: true },
                { name: "AI Copilot", enabled: true },
                { name: "Integration Hub", enabled: true },
              ].map((feature) => (
                <div key={feature.name} className="flex items-center justify-between p-3 rounded-md border">
                  <span className="text-sm font-medium">{feature.name}</span>
                  <Switch checked={feature.enabled} data-testid={`switch-feature-${feature.name.toLowerCase()}`} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Plan Tiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Starter", tenants: 42, monthlyARR: "$51,200" },
                { name: "Professional", tenants: 156, monthlyARR: "$234,500" },
                { name: "Enterprise", tenants: 49, monthlyARR: "$892,300" },
              ].map((plan) => (
                <div key={plan.name} className="p-4 rounded-md border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.tenants} tenants</p>
                    </div>
                    <p className="font-mono font-semibold">{plan.monthlyARR}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "payments" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                LemonSqueezy Configuration
              </CardTitle>
              <CardDescription>Configure LemonSqueezy for payment processing and sponsorships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showApiKeys.lsApiKey ? "text" : "password"}
                    placeholder="Enter LemonSqueezy API Key"
                    value={paymentSettings.lemonSqueezy.apiKey}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      lemonSqueezy: { ...prev.lemonSqueezy, apiKey: e.target.value }
                    }))}
                    data-testid="input-lemonsqueezy-api-key"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => toggleShowKey("lsApiKey")}
                    data-testid="button-toggle-ls-api-key"
                  >
                    {showApiKeys.lsApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Environment variable: LEMONSQUEEZY_API_KEY</p>
              </div>
              <div className="space-y-2">
                <Label>Store ID</Label>
                <Input 
                  placeholder="Enter Store ID"
                  value={paymentSettings.lemonSqueezy.storeId}
                  onChange={(e) => setPaymentSettings(prev => ({
                    ...prev,
                    lemonSqueezy: { ...prev.lemonSqueezy, storeId: e.target.value }
                  }))}
                  data-testid="input-lemonsqueezy-store-id"
                />
                <p className="text-xs text-muted-foreground">Environment variable: LEMONSQUEEZY_STORE_ID</p>
              </div>
              <div className="space-y-2">
                <Label>Variant ID</Label>
                <Input 
                  placeholder="Enter Variant ID"
                  value={paymentSettings.lemonSqueezy.variantId}
                  onChange={(e) => setPaymentSettings(prev => ({
                    ...prev,
                    lemonSqueezy: { ...prev.lemonSqueezy, variantId: e.target.value }
                  }))}
                  data-testid="input-lemonsqueezy-variant-id"
                />
                <p className="text-xs text-muted-foreground">Environment variable: LEMONSQUEEZY_VARIANT_ID</p>
              </div>
              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showApiKeys.lsWebhook ? "text" : "password"}
                    placeholder="Enter Webhook Secret"
                    value={paymentSettings.lemonSqueezy.webhookSecret}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      lemonSqueezy: { ...prev.lemonSqueezy, webhookSecret: e.target.value }
                    }))}
                    data-testid="input-lemonsqueezy-webhook-secret"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => toggleShowKey("lsWebhook")}
                    data-testid="button-toggle-ls-webhook"
                  >
                    {showApiKeys.lsWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Environment variable: LEMONSQUEEZY_WEBHOOK_SECRET</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                Stripe Configuration
              </CardTitle>
              <CardDescription>Configure Stripe for payment processing (alternative to LemonSqueezy)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showApiKeys.stripeSecret ? "text" : "password"}
                    placeholder="sk_live_..."
                    value={paymentSettings.stripe.secretKey}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      stripe: { ...prev.stripe, secretKey: e.target.value }
                    }))}
                    data-testid="input-stripe-secret-key"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => toggleShowKey("stripeSecret")}
                    data-testid="button-toggle-stripe-secret"
                  >
                    {showApiKeys.stripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Environment variable: STRIPE_SECRET_KEY</p>
              </div>
              <div className="space-y-2">
                <Label>Publishable Key</Label>
                <Input 
                  placeholder="pk_live_..."
                  value={paymentSettings.stripe.publishableKey}
                  onChange={(e) => setPaymentSettings(prev => ({
                    ...prev,
                    stripe: { ...prev.stripe, publishableKey: e.target.value }
                  }))}
                  data-testid="input-stripe-publishable-key"
                />
                <p className="text-xs text-muted-foreground">Environment variable: STRIPE_PUBLISHABLE_KEY</p>
              </div>
              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showApiKeys.stripeWebhook ? "text" : "password"}
                    placeholder="whsec_..."
                    value={paymentSettings.stripe.webhookSecret}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      stripe: { ...prev.stripe, webhookSecret: e.target.value }
                    }))}
                    data-testid="input-stripe-webhook-secret"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => toggleShowKey("stripeWebhook")}
                    data-testid="button-toggle-stripe-webhook"
                  >
                    {showApiKeys.stripeWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Environment variable: STRIPE_WEBHOOK_SECRET</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Security Note</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    For security, API keys should be stored as environment variables (secrets) rather than in the database. 
                    Use the Secrets panel in your hosting environment to set these values. The fields above are for reference only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSavePaymentSettings} disabled={isSavingPayments} data-testid="button-save-payment-settings">
            {isSavingPayments ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-2" /> Save Payment Settings</>
            )}
          </Button>
        </div>
      )}

      {activeNav === "system" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Global Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>System Name</Label>
                <Input defaultValue="NexusAI" data-testid="input-system-name" />
              </div>
              <div className="space-y-2">
                <Label>Default Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger data-testid="select-timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="cst">Central Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Tenant SSO</p>
                  <p className="text-xs text-muted-foreground">Enable Single Sign-On for all tenants</p>
                </div>
                <Switch defaultChecked data-testid="switch-sso" />
              </div>
              <Button data-testid="button-save-settings">Save Settings</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "security" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { standard: "SOC 2 Type II", status: "compliant", lastAudit: "2024-10-15" },
                { standard: "GDPR", status: "compliant", lastAudit: "2024-11-01" },
                { standard: "HIPAA", status: "compliant", lastAudit: "2024-09-20" },
                { standard: "ISO 27001", status: "in_progress", lastAudit: "2024-08-10" },
              ].map((compliance) => (
                <div key={compliance.standard} className="flex items-center justify-between p-3 rounded-md border">
                  <div>
                    <p className="font-medium text-sm">{compliance.standard}</p>
                    <p className="text-xs text-muted-foreground">Last audit: {compliance.lastAudit}</p>
                  </div>
                  <Badge variant="secondary" className={compliance.status === "compliant" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}>
                    {compliance.status === "compliant" ? "Compliant" : "In Progress"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
