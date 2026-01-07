import { useState, useEffect } from "react";
import { LeadList } from "@/features/crm/LeadList";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { openFormInNewWindow } from "@/lib/formUtils";
import { Target, Users, BarChart3, TrendingUp, Mail, Phone, FileText, Settings, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CRMMetrics {
  totalLeads: number;
  pipelineValue: string;
  winRate: string;
  avgSalesCycle: string;
}

interface Opportunity {
  id: string;
  name: string;
  account: string;
  amount: number;
  stage: string;
}

function CRMOverview({ totalLeads }: { totalLeads: number }) {
  const { data: metrics, isLoading } = useQuery<CRMMetrics>({
    queryKey: ["/api/crm/metrics"],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="crm-metrics">
      <Card><CardContent className="p-4"><p className="text-2xl font-semibold" data-testid="text-total-leads">{isLoading ? "..." : (metrics?.totalLeads ?? totalLeads)}</p><p className="text-xs text-muted-foreground">Total Leads</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-2xl font-semibold" data-testid="text-pipeline-value">{isLoading ? "..." : (metrics?.pipelineValue || "$4.2M")}</p><p className="text-xs text-muted-foreground">Pipeline Value</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-2xl font-semibold" data-testid="text-win-rate">{isLoading ? "..." : (metrics?.winRate || "35%")}</p><p className="text-xs text-muted-foreground">Avg Win Rate</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-2xl font-semibold" data-testid="text-sales-cycle">{isLoading ? "..." : (metrics?.avgSalesCycle || "18 days")}</p><p className="text-xs text-muted-foreground">Avg Sales Cycle</p></CardContent></Card>
    </div>
  );
}

function OpportunitiesSection() {
  const { data: opportunities = [], isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/crm/opportunities"],
  });

  const defaultOpportunities = [
    { id: "1", name: "Enterprise License", account: "Tech Corp", amount: 500000, stage: "Won" },
    { id: "2", name: "Implementation Services", account: "Finance Inc", amount: 150000, stage: "Proposal" },
    { id: "3", name: "Support Contract", account: "Tech Corp", amount: 50000, stage: "Negotiation" },
  ];

  const displayOpportunities = opportunities.length > 0 ? opportunities : defaultOpportunities;

  return (
    <div className="space-y-4">
      <Breadcrumb items={[
        { label: "CRM", path: "/crm" },
        { label: "Opportunities", path: "/crm/opportunities" },
      ]} />
      <Card>
        <CardHeader>
          <CardTitle>Sales Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">Track and manage sales opportunities and deals</p>
          <div className="space-y-2">
            {isLoading ? (
              <div className="p-3 text-muted-foreground">Loading opportunities...</div>
            ) : displayOpportunities.map((opp) => (
              <div key={opp.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`card-opportunity-${opp.id}`}>
                <div>
                  <p className="font-semibold">{opp.name}</p>
                  <p className="text-sm text-muted-foreground">{opp.account} - ${(opp.amount || 0).toLocaleString()} - {opp.stage}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CRM() {
  const [match, params] = useRoute("/crm/:page?");
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const leadsMetadata = getFormMetadata("leads");

  useEffect(() => {
    if (params?.page) {
      setActiveNav(params.page);
    } else {
      setActiveNav("overview");
    }
  }, [params?.page]);

  const { data: leads = [] } = useQuery<any[]>({ queryKey: ["/api/leads"], retry: false });

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500", formId: null },
    { id: "leads", label: "Leads", icon: Users, color: "text-green-500", formId: "leads" },
    { id: "opportunities", label: "Opportunities", icon: Target, color: "text-purple-500", formId: "opportunities" },
    { id: "accounts", label: "Accounts", icon: FileText, color: "text-orange-500", formId: "accounts" },
    { id: "contacts", label: "Contacts", icon: Phone, color: "text-pink-500", formId: "contacts" },
    { id: "campaigns", label: "Campaigns", icon: Mail, color: "text-cyan-500", formId: "campaigns" },
    { id: "pipeline", label: "Pipeline", icon: TrendingUp, color: "text-indigo-500", formId: null },
    { id: "analytics", label: "Analytics", icon: Activity, color: "text-yellow-500", formId: null },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500", formId: null },
  ];

  const handleIconClick = (formId: string | null) => {
    if (formId) {
      openFormInNewWindow(formId, `${formId.charAt(0).toUpperCase() + formId.slice(1)} Form`);
    } else {
      setActiveNav("overview");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="h-8 w-8" />CRM & Sales</h1>
        <p className="text-muted-foreground text-sm">Manage leads, opportunities, accounts, contacts, and campaigns</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleIconClick(item.formId)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${!item.formId ? "hover:border-primary hover-elevate" : "hover:bg-primary/10 hover:border-primary hover-elevate"
              }`}
            data-testid={`button-icon-${item.id}`}
          >
            <item.icon className={`w-6 h-6 ${item.color}`} />
            <span className="text-sm font-medium text-center">{item.label}</span>
          </button>
        ))}
      </div>

      {activeNav === "overview" && <CRMOverview totalLeads={leads.length} />}

      {activeNav === "leads" && (
        <LeadList />
      )}

      {activeNav === "opportunities" && <OpportunitiesSection />}

      {activeNav === "customers" && (
        <div className="space-y-4">
          <Breadcrumb items={[
            { label: "CRM", path: "/crm" },
            { label: "Customers", path: "/crm/customers" },
          ]} />
          <Card><CardHeader><CardTitle>Accounts & Contacts</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage customer accounts and contact information</p></CardContent></Card>
        </div>
      )}

      {activeNav === "campaigns" && (
        <div className="space-y-4">
          <Breadcrumb items={[
            { label: "CRM", path: "/crm" },
            { label: "Campaigns", path: "/crm/campaigns" },
          ]} />
          <Card><CardHeader><CardTitle>Marketing Campaigns</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Create and manage marketing campaigns</p></CardContent></Card>
        </div>
      )}

      {activeNav === "pipeline" && (
        <div className="space-y-4">
          <Breadcrumb items={[
            { label: "CRM", path: "/crm" },
            { label: "Pipeline", path: "/crm/pipeline" },
          ]} />
          <Card><CardHeader><CardTitle>Sales Pipeline</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Visualize your sales pipeline by stage</p></CardContent></Card>
        </div>
      )}

      {activeNav === "analytics" && (
        <div className="space-y-4">
          <Breadcrumb items={[
            { label: "CRM", path: "/crm" },
            { label: "Analytics", path: "/crm/analytics" },
          ]} />
          <Card><CardHeader><CardTitle>CRM Analytics</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Reports, forecasts, and performance metrics</p></CardContent></Card>
        </div>
      )}

      {activeNav === "settings" && (
        <div className="space-y-4">
          <Breadcrumb items={[
            { label: "CRM", path: "/crm" },
            { label: "Settings", path: "/crm/settings" },
          ]} />
          <Card><CardHeader><CardTitle>CRM Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure CRM workflows and customizations</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
