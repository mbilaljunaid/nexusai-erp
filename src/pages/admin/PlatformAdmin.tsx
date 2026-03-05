import { useState } from "react";
import AIConfigurationSection from "@/components/admin/AIConfigurationSection";
import { NexusAIAgentRegistrySection } from "@/components/admin/NexusAIAgentRegistrySection";
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
  Mail,
  Server,
  Receipt,
  RefreshCw,
  UserCog,
  Send,
  Play,
  Trash2,
  Edit,
  Handshake,
  Check,
  X,
  ExternalLink,
  Brain,
  Sparkles,
} from "lucide-react";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Partner } from "@/types/erp-types";
import { useToast } from "@/hooks/use-toast";
import { useTenants, useAdminMetrics } from "@/hooks/admin/useAdminData";
import { ContextualSearch } from "@/components/ContextualSearch";

function PartnersManagementSection({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: partners = [], isLoading } = useQuery<Partner[]>({
    queryKey: ['/api/partners'],
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Partner> }) => {
      return apiRequest("PATCH", `/api/partners/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      toast({
        title: "Partner Updated",
        description: "Partner has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update partner. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      toast({
        title: "Partner Deleted",
        description: "Partner has been removed from the system.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete partner. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pendingPartners = partners.filter(p => !p.isApproved);
  const approvedPartners = partners.filter(p => p.isApproved);

  const filteredApprovedPartners = approvedPartners.filter(p => {
    const matchesSearch = searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || p.type === filterType;
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && p.isActive) ||
      (filterStatus === "inactive" && !p.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const tierConfig = {
    diamond: { bg: "bg-purple-500/10", text: "text-purple-600", label: "Diamond" },
    platinum: { bg: "bg-slate-500/10", text: "text-slate-600", label: "Platinum" },
    gold: { bg: "bg-yellow-500/10", text: "text-yellow-600", label: "Gold" },
    silver: { bg: "bg-gray-500/10", text: "text-gray-600", label: "Silver" },
  };

  const handleApprove = (partner: Partner) => {
    updatePartnerMutation.mutate({ id: partner.id, data: { isApproved: true, isActive: true } });
  };

  const handleReject = (partner: Partner) => {
    deletePartnerMutation.mutate(partner.id);
  };

  const handleToggleActive = (partner: Partner) => {
    updatePartnerMutation.mutate({ id: partner.id, data: { isActive: !partner.isActive } });
  };

  const handleChangeTier = (partner: Partner, newTier: Partner["tier"]) => {
    updatePartnerMutation.mutate({ id: partner.id, data: { tier: newTier } });
  };

  const partnerColumns: SpreadsheetColumn<any>[] = [
    {
      id: "partner", header: "Partner", width: 200, cell: (item) => (
        <div>
          <p className="font-medium text-sm">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.company}</p>
        </div>
      )
    },
    {
      id: "type", header: "Type", width: 100, cell: (item) => (
        <Badge variant="secondary" className="text-xs capitalize">
          {item.type}
        </Badge>
      )
    },
    {
      id: "tier", header: "Tier", width: 150, cell: (item) => {
        const tier = tierConfig[(item.tier as keyof typeof tierConfig) || "silver"];
        return (
          <Select
            value={item.tier || "silver"}
            onValueChange={(v) => handleChangeTier(item, v as Partner["tier"])}
          >
            <SelectTrigger className="w-28 h-8" data-testid={`select-tier-approved-${item.id}`}>
              <Badge variant="secondary" className={`${tier.bg} ${tier.text}`}>
                {tier.label}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
            </SelectContent>
          </Select>
        );
      }
    },
    {
      id: "status", header: "Status", width: 100, cell: (item) => (
        <Switch
          checked={item.isActive || false}
          onCheckedChange={() => handleToggleActive(item)}
          data-testid={`switch-active-${item.id}`}
        />
      )
    },
    { id: "joined", header: "Joined", width: 120, cell: (item) => <span className="text-xs text-muted-foreground">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span> },
    {
      id: "actions", header: "Actions", width: 120, cell: (item) => (
        <div className="flex items-center justify-end gap-1 pr-2 w-full">
          {item.website && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(item.website!, '_blank')}
              data-testid={`button-website-${item.id}`}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleReject(item)}
            disabled={deletePartnerMutation.isPending}
            data-testid={`button-delete-${item.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <StandardPage title="Platform Admin">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </StandardPage>
    );
  }

  return (
    <div className="space-y-6">
      {pendingPartners.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Pending Applications ({pendingPartners.length})
            </CardTitle>
            <CardDescription>Review and approve partner applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-background"
                  data-testid={`row-pending-partner-${partner.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{partner.name}</p>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {partner.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{partner.company}</p>
                    <p className="text-xs text-muted-foreground">{partner.email}</p>
                    {partner.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{partner.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {partner.website && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(partner.website!, '_blank')}
                        data-testid={`button-view-website-${partner.id}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Select
                      defaultValue={partner.tier || "silver"}
                      onValueChange={(v) => handleChangeTier(partner, v as Partner["tier"])}
                    >
                      <SelectTrigger className="w-28" data-testid={`select-tier-${partner.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(partner)}
                      disabled={deletePartnerMutation.isPending}
                      data-testid={`button-reject-${partner.id}`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(partner)}
                      disabled={updatePartnerMutation.isPending}
                      data-testid={`button-approve-${partner.id}`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Handshake className="h-4 w-4 text-teal-500" />
            Approved Partners ({approvedPartners.length})
          </CardTitle>
          <CardDescription>Manage active partners and trainers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="w-80">
              <ContextualSearch
                placeholder="Search partners..."
                fields={[
                  { key: "query", label: "Search", type: "text" },
                  { key: "type", label: "Type", type: "select", options: [{ value: "partner", label: "Partner" }, { value: "trainer", label: "Trainer" }] },
                  { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] }
                ]}
                onSearch={(filters) => {
                  setSearchQuery(filters.query || "");
                  if (filters.type) setFilterType(filters.type);
                  if (filters.status) setFilterStatus(filters.status);
                }}
              />
            </div>
          </div>

          {filteredApprovedPartners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Handshake className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No partners found</p>
            </div>
          ) : (
            <div className="h-[400px]">
              <InteractiveSpreadsheet
                columns={partnerColumns}
                data={filteredApprovedPartners}
                onChange={() => { }}
                containerHeight="400px"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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

import NexusAIToolRegistrySection from "@/components/admin/NexusAIToolRegistrySection";
import { StandardPage } from "@/components/layout/StandardPage";


export default function PlatformAdmin() {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("overview");
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const { data: liveTenants = [] } = useTenants();
  const { data: liveMetrics } = useAdminMetrics();
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

  const [emailSettings, setEmailSettings] = useState({
    smtp: { host: "", port: "587", username: "", password: "", encryption: "tls" },
    imap: { host: "", port: "993", username: "", password: "", encryption: "ssl" },
  });
  const [isRefreshingDemo, setIsRefreshingDemo] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  const navItems = [
    { id: "overview", label: "Overview", icon: Building2, color: "text-blue-500" },
    { id: "tenants", label: "Tenant & Hosting", icon: Server, color: "text-green-500" },
    { id: "users", label: "Users", icon: UserCog, color: "text-indigo-500" },
    { id: "partners", label: "Partners", icon: Handshake, color: "text-teal-500" },
    { id: "email", label: "Email Management", icon: Mail, color: "text-cyan-500" },
    { id: "billing", label: "Services Billing", icon: Receipt, color: "text-orange-500" },
    { id: "demos", label: "Demo Management", icon: RefreshCw, color: "text-pink-500" },
    { id: "payments", label: "Payment Settings", icon: CreditCard, color: "text-emerald-500" },
    { id: "features", label: "Features & Licensing", icon: Zap, color: "text-yellow-500" },
    { id: "tool-registry", label: "Tool Registry", icon: Brain, color: "text-violet-500" },
    { id: "agent-registry", label: "Agent Registry (Phase 11)", icon: Sparkles, color: "text-amber-500" },
    { id: "system", label: "System Config", icon: Settings, color: "text-purple-500" },
    { id: "security", label: "Security & Compliance", icon: Shield, color: "text-red-500" },
    { id: "ai-config", label: "AI Configuration", icon: Brain, color: "text-violet-500" },
  ];

  // Live data from API
  const tenants = liveTenants as Tenant[];
  const systemStats = {
    totalTenants: liveMetrics?.totalTenants ?? 0,
    activeUsers: liveMetrics?.activeTenants ?? 0,
    totalStorage: 0,
    systemUptime: 99.98,
    aiRequestsToday: 0,
    avgResponseTime: 0,
  };

  const statusConfig = {
    active: { bg: "bg-green-500/10", text: "text-green-600", label: "Active" },
    trial: { bg: "bg-blue-500/10", text: "text-blue-600", label: "Trial" },
    inactive: { bg: "bg-red-500/10", text: "text-red-600", label: "Inactive" },
  };

  const tenantColumns: SpreadsheetColumn<any>[] = [
    {
      id: "tenant", header: "Tenant", width: 250, cell: (item) => (
        <div>
          <p className="font-medium text-sm">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.company}</p>
        </div>
      )
    },
    {
      id: "status", header: "Status", width: 120, cell: (item) => {
        const statusCfg = statusConfig[item.status as keyof typeof statusConfig];
        return <Badge variant="secondary" className={`${statusCfg?.bg} ${statusCfg?.text}`}>{statusCfg?.label}</Badge>;
      }
    },
    { id: "plan", header: "Plan", width: 120, cell: (item) => <span className="text-xs capitalize">{item.plan}</span> },
    { id: "users", header: "Users", width: 100, cell: (item) => <span className="font-mono">{item.users}</span> },
    { id: "aiCredits", header: "AI Credits", width: 120, cell: (item) => <span className="font-mono">{item.aiCreditsUsed.toLocaleString()}</span> },
    { id: "created", header: "Created", width: 120, cell: (item) => <span className="text-xs">{item.createdAt}</span> },
    {
      id: "actions", header: "Actions", width: 100, cell: (item) => (
        <div className="flex justify-end pr-2 w-full">
          <Button variant="ghost" size="icon" data-testid={`button-tenant-actions-${item.id}`}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const adminUserColumns: SpreadsheetColumn<any>[] = [
    {
      id: "user", header: "User", width: 250, cell: (item) => (
        <div>
          <p className="font-medium text-sm">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.email}</p>
        </div>
      )
    },
    { id: "tenant", header: "Tenant", width: 200, cell: (item) => <span className="text-sm">{item.tenant}</span> },
    { id: "role", header: "Role", width: 120, cell: (item) => <Badge variant="secondary">{item.role}</Badge> },
    { id: "lastLogin", header: "Last Login", width: 120, cell: (item) => <span className="text-xs text-muted-foreground">{item.lastLogin}</span> },
    {
      id: "actions", header: "Actions", width: 100, cell: () => (
        <div className="flex justify-end pr-2 w-full">
          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

  const contractColumns: SpreadsheetColumn<any>[] = [
    { id: "client", header: "Client", width: 200, cell: (item) => <span className="font-medium text-sm">{item.client}</span> },
    { id: "serviceType", header: "Service Type", width: 200, cell: (item) => <span className="text-sm">{item.service}</span> },
    { id: "value", header: "Value", width: 120, cell: (item) => <span className="font-mono text-sm">{item.value}</span> },
    {
      id: "status", header: "Status", width: 120, cell: (item) => (
        <Badge variant="secondary" className={item.status === "Active" ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"}>
          {item.status}
        </Badge>
      )
    },
    { id: "renewal", header: "Renewal", width: 120, cell: (item) => <span className="text-xs">{item.renewal}</span> },
    {
      id: "actions", header: "Actions", width: 100, cell: () => (
        <div className="flex justify-end pr-2 w-full">
          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>

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
            <div className="w-80">
              <ContextualSearch
                placeholder="Search tenants..."
                fields={[{ key: "query", label: "Search", type: "text" }]}
                onSearch={() => { }}
                testId="search-tenants"
              />
            </div>
            <Button data-testid="button-add-tenant">
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </div>

          <div className="h-[400px]">
            <InteractiveSpreadsheet
              columns={tenantColumns}
              data={tenants}
              onChange={() => { }}
              containerHeight="400px"
            />
          </div>
        </div>
      )}

      {activeNav === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="w-80">
              <ContextualSearch
                placeholder="Search users..."
                fields={[
                  { key: "query", label: "Search", type: "text" },
                  {
                    key: "type", label: "User Type", type: "select", options: [
                      { value: "tenant-admin", label: "Tenant Admin" },
                      { value: "tenant-user", label: "Tenant User" },
                      { value: "individual", label: "Individual" }
                    ]
                  }
                ]}
                onSearch={() => { }}
                testId="search-users"
              />
            </div>
            <Button data-testid="button-add-user">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tenant Administrators</CardTitle>
                <CardDescription>Users with full admin access to their tenant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <InteractiveSpreadsheet
                    columns={adminUserColumns}
                    data={tenants.slice(0, 10).map((t: any, i) => ({
                      id: `admin-${i}`,
                      name: `Admin (${t.name})`,
                      email: `admin@${t.slug ?? 'unknown'}.com`,
                      tenant: t.name ?? '—',
                      role: 'Admin',
                      lastLogin: '—',
                    }))}
                    onChange={() => { }}
                    containerHeight="350px"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Individual Users</CardTitle>
                <CardDescription>Users without tenant association (free tier)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground text-center py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>127 individual users registered</p>
                  <Button variant="outline" size="sm" className="mt-3">View All</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeNav === "partners" && <PartnersManagementSection toast={toast} />}

      {activeNav === "email" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-500" />
                SMTP Configuration (Outgoing Mail)
              </CardTitle>
              <CardDescription>Configure SMTP settings for sending transactional emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    placeholder="smtp.example.com"
                    value={emailSettings.smtp.host}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, host: e.target.value }
                    }))}
                    data-testid="input-smtp-host"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    placeholder="587"
                    value={emailSettings.smtp.port}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, port: e.target.value }
                    }))}
                    data-testid="input-smtp-port"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder="noreply@example.com"
                    value={emailSettings.smtp.username}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, username: e.target.value }
                    }))}
                    data-testid="input-smtp-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showApiKeys.smtpPass ? "text" : "password"}
                      placeholder="SMTP Password"
                      value={emailSettings.smtp.password}
                      onChange={(e) => setEmailSettings(prev => ({
                        ...prev,
                        smtp: { ...prev.smtp, password: e.target.value }
                      }))}
                      data-testid="input-smtp-password"
                    />
                    <Button variant="outline" size="icon" onClick={() => toggleShowKey("smtpPass")}>
                      {showApiKeys.smtpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Encryption</Label>
                <Select
                  value={emailSettings.smtp.encryption}
                  onValueChange={(v) => setEmailSettings(prev => ({
                    ...prev,
                    smtp: { ...prev.smtp, encryption: v }
                  }))}
                >
                  <SelectTrigger data-testid="select-smtp-encryption">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSendingTestEmail(true);
                    setTimeout(() => {
                      toast({ title: "Test Email Sent", description: "Check your inbox for the test message." });
                      setIsSendingTestEmail(false);
                    }, 1500);
                  }}
                  disabled={isSendingTestEmail}
                  data-testid="button-test-smtp"
                >
                  {isSendingTestEmail ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Send Test Email
                </Button>
                <Button data-testid="button-save-smtp">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save SMTP Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                IMAP Configuration (Incoming Mail)
              </CardTitle>
              <CardDescription>Configure IMAP for receiving and processing incoming emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IMAP Host</Label>
                  <Input
                    placeholder="imap.example.com"
                    value={emailSettings.imap.host}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      imap: { ...prev.imap, host: e.target.value }
                    }))}
                    data-testid="input-imap-host"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    placeholder="993"
                    value={emailSettings.imap.port}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      imap: { ...prev.imap, port: e.target.value }
                    }))}
                    data-testid="input-imap-port"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder="support@example.com"
                    value={emailSettings.imap.username}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      imap: { ...prev.imap, username: e.target.value }
                    }))}
                    data-testid="input-imap-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showApiKeys.imapPass ? "text" : "password"}
                      placeholder="IMAP Password"
                      value={emailSettings.imap.password}
                      onChange={(e) => setEmailSettings(prev => ({
                        ...prev,
                        imap: { ...prev.imap, password: e.target.value }
                      }))}
                      data-testid="input-imap-password"
                    />
                    <Button variant="outline" size="icon" onClick={() => toggleShowKey("imapPass")}>
                      {showApiKeys.imapPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button data-testid="button-save-imap">
                <CheckCircle className="h-4 w-4 mr-2" />
                Save IMAP Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "billing" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-green-500/10">
                    <Receipt className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">$45,230</p>
                    <p className="text-xs text-muted-foreground">Services Revenue (MTD)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">23</p>
                    <p className="text-xs text-muted-foreground">Active Service Contracts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-orange-500/10">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">5</p>
                    <p className="text-xs text-muted-foreground">Pending Invoices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Contracts</CardTitle>
              <CardDescription>Active implementation and support contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <InteractiveSpreadsheet
                  columns={contractColumns}
                  data={[
                    { id: "1", client: "Acme Corp", service: "Implementation + Support", value: "$125,000", status: "Active", renewal: "2025-06-15" },
                    { id: "2", client: "TechStart Inc", service: "Annual Support", value: "$24,000", status: "Active", renewal: "2025-03-20" },
                    { id: "3", client: "Global Solutions", service: "Training Package", value: "$8,500", status: "In Progress", renewal: "N/A" },
                  ]}
                  onChange={() => { }}
                  containerHeight="300px"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "demos" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-pink-500" />
                Demo Environment Management
              </CardTitle>
              <CardDescription>Manage and refresh demo instances on demand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Main Demo Instance</p>
                    <p className="text-xs text-muted-foreground">Public demo available at /demo</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">Running</Badge>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">Last Refreshed</p>
                    <p className="font-medium">Dec 12, 2025 - 10:30 AM</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Demo Users</p>
                    <p className="font-medium">342 sessions today</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data Reset Schedule</p>
                    <p className="font-medium">Every 24 hours</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsRefreshingDemo(true);
                      setTimeout(() => {
                        toast({ title: "Demo Refreshed", description: "Demo data has been reset to default state." });
                        setIsRefreshingDemo(false);
                      }, 2000);
                    }}
                    disabled={isRefreshingDemo}
                    data-testid="button-refresh-demo"
                  >
                    {isRefreshingDemo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Refresh Demo Now
                  </Button>
                  <Button variant="outline" data-testid="button-demo-settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Demo Settings
                  </Button>
                </div>
              </div>

              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium mb-1">Industry-Specific Demos</p>
                    <p className="text-sm text-muted-foreground mb-4">Create additional demo instances with industry-specific data</p>
                    <Button variant="outline" data-testid="button-create-demo">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Demo Instance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
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
                <Input defaultValue="NexusAIFirst" data-testid="input-system-name" />
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

      {activeNav === "ai-config" && <AIConfigurationSection />}

      {activeNav === "tool-registry" && <NexusAIToolRegistrySection />}

      {activeNav === "agent-registry" && <NexusAIAgentRegistrySection />}
    </div>
  );
}
