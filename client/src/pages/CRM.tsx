import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { Target, Users, BarChart3, TrendingUp, Mail, Phone, FileText, Settings, Activity, Badge as BadgeIcon } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { Badge } from "@/components/ui/badge";

export default function CRM() {
  const [match, params] = useRoute("/crm/:page?");
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
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
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "leads", label: "Leads", icon: Users, color: "text-green-500" },
    { id: "opportunities", label: "Opportunities", icon: Target, color: "text-purple-500" },
    { id: "accounts", label: "Accounts", icon: FileText, color: "text-orange-500" },
    { id: "contacts", label: "Contacts", icon: Phone, color: "text-pink-500" },
    { id: "campaigns", label: "Campaigns", icon: Mail, color: "text-cyan-500" },
    { id: "pipeline", label: "Pipeline", icon: TrendingUp, color: "text-indigo-500" },
    { id: "analytics", label: "Analytics", icon: Activity, color: "text-yellow-500" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="h-8 w-8" />CRM & Sales</h1>
        <p className="text-muted-foreground text-sm">Manage leads, opportunities, accounts, contacts, and campaigns</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {navItems.map((item) => {
          let routePath = item.id === "overview" ? "/crm" : `/crm/${item.id}`;
          if (item.id === "accounts") routePath = "/crm/customers";
          if (item.id === "contacts") routePath = "/crm/customers";
          const isActive = (item.id === "overview" && activeNav === "overview") || 
                          (item.id !== "overview" && activeNav === item.id);
          return (
            <Link key={item.id} to={routePath}>
              <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                isActive ? "border-primary bg-primary/5" : "hover:border-primary hover-elevate"
              }`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-sm font-medium text-center">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {activeNav === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">{leads.length}</p><p className="text-xs text-muted-foreground">Total Leads</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">$4.2M</p><p className="text-xs text-muted-foreground">Pipeline Value</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">35%</p><p className="text-xs text-muted-foreground">Avg Win Rate</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">18 days</p><p className="text-xs text-muted-foreground">Avg Sales Cycle</p></CardContent></Card>
        </div>
      )}

      {activeNav === "leads" && (
        <div className="space-y-4">
          <Breadcrumb items={[{ label: "Leads", path: "/crm/leads" }]} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1">
              <CardTitle>Leads</CardTitle>
              <SmartAddButton formId="leads" formMetadata={leadsMetadata} />
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSearchWithMetadata
                formMetadata={leadsMetadata}
                value={searchQuery}
                onChange={setSearchQuery}
                data={leads}
                onFilter={setFilteredLeads}
              />
              <div className="space-y-2">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead: any, idx: number) => (
                    <Card key={lead.id || idx} className="hover-elevate cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{lead.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                          </div>
                          <Badge>{lead.status || 'New'}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No leads found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "opportunities" && (
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
                  {[
                    { id: "1", name: "Enterprise License", account: "Tech Corp", amount: 500000, stage: "Won", prob: 100 },
                    { id: "2", name: "Implementation Services", account: "Finance Inc", amount: 150000, stage: "Proposal", prob: 50 },
                    { id: "3", name: "Support Contract", account: "Tech Corp", amount: 50000, stage: "Negotiation", prob: 75 },
                  ].map((opp) => (
                    <div key={opp.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{opp.name}</p>
                        <p className="text-sm text-muted-foreground">{opp.account} • ${opp.amount.toLocaleString()} • {opp.stage}</p>
                      </div>
                      {opp.stage === "Won" && (
                        <Button size="sm" onClick={() => setSelectedOpportunity(opp)} data-testid={`button-convert-${opp.id}`}>
                          Convert to Invoice
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
      )}

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
