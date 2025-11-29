import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadTable } from "@/components/LeadTable";
import { LeadCard } from "@/components/LeadCard";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { ModuleNav } from "@/components/ModuleNav";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  score: number;
  value: number;
  source: string;
  owner: string;
  nextAction: string;
  nextActionDate: string;
  lastActivity: string;
}

interface Opportunity {
  id: string;
  name: string;
  account: string;
  value: number;
  stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: number;
  closeDate: string;
  owner: string;
  products: string[];
  nextStep: string;
}

interface Account {
  id: string;
  name: string;
  industry: string;
  employees: number;
  revenue: string;
  location: string;
  website: string;
  status: "active" | "inactive" | "prospect";
  contacts: number;
  opportunities: number;
  annualValue: string;
}

export default function CRM() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch leads from backend API
  const { data: backendLeads = [] } = useQuery<any[]>({ queryKey: ["/api/leads"] });
  const { data: scoreData } = useQuery({ queryKey: ["/api/ai/score-leads"] });

  // Transform backend leads to UI format
  const leads: Lead[] = backendLeads.map((lead: any, idx: number) => ({
    id: lead.id || `${idx}`,
    name: lead.name || "Unknown",
    email: lead.email || "",
    phone: lead.phone || "+1-555-0000",
    company: lead.company || "",
    status: (lead.status || "new") as Lead["status"],
    score: lead.score || 75,
    value: lead.value || 45000,
    source: lead.source || "Unknown",
    owner: lead.owner || "Unassigned",
    nextAction: lead.nextAction || "Schedule follow-up",
    nextActionDate: lead.nextActionDate || new Date().toISOString().split('T')[0],
    lastActivity: lead.lastActivity || "Recently added",
  })).slice(0, 10);

  const opportunities: Opportunity[] = [
    {
      id: "opp-1",
      name: "TechCorp - Enterprise License",
      account: "TechCorp Inc.",
      value: 85000,
      stage: "proposal",
      probability: 75,
      closeDate: "2024-12-30",
      owner: "John Smith",
      products: ["Enterprise License", "Implementation"],
      nextStep: "Present ROI analysis",
    },
    {
      id: "opp-2",
      name: "Acme - Additional Licenses",
      account: "Acme Corp",
      value: 35000,
      stage: "negotiation",
      probability: 60,
      closeDate: "2025-01-15",
      owner: "Emily Davis",
      products: ["Professional License"],
      nextStep: "Negotiate pricing",
    },
    {
      id: "opp-3",
      name: "GlobalTech - Full Suite",
      account: "GlobalTech",
      value: 120000,
      stage: "qualification",
      probability: 40,
      closeDate: "2025-02-28",
      owner: "John Smith",
      products: ["Enterprise Suite"],
      nextStep: "Technical assessment",
    },
  ];

  const accounts: Account[] = [
    {
      id: "acc-1",
      name: "TechCorp Inc.",
      industry: "Technology",
      employees: 250,
      revenue: "$50M",
      location: "San Francisco, CA",
      website: "www.techcorp.com",
      status: "active",
      contacts: 8,
      opportunities: 3,
      annualValue: "$125K",
    },
    {
      id: "acc-2",
      name: "Acme Corp",
      industry: "Manufacturing",
      employees: 1200,
      revenue: "$250M",
      location: "Chicago, IL",
      website: "www.acme.com",
      status: "active",
      contacts: 15,
      opportunities: 5,
      annualValue: "$380K",
    },
    {
      id: "acc-3",
      name: "GlobalTech",
      industry: "Consulting",
      employees: 500,
      revenue: "$100M",
      location: "New York, NY",
      website: "www.globaltech.io",
      status: "active",
      contacts: 6,
      opportunities: 2,
      annualValue: "$0",
    },
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const metrics = {
    totalLeads: leads.length,
    qualifiedLeads: leads.filter(l => l.status === "qualified" || l.status === "proposal").length,
    avgScore: Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length),
    pipelineValue: leads.reduce((acc, l) => acc + l.value, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">CRM & Sales</h1>
          <p className="text-muted-foreground text-sm">Manage leads, opportunities, and customer relationships</p>
        </div>
        <AddLeadDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold">{metrics.totalLeads}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{metrics.qualifiedLeads}</p>
                <p className="text-xs text-muted-foreground">Qualified Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-semibold">{metrics.avgScore}</p>
                <p className="text-xs text-muted-foreground">Avg AI Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold font-mono">${(metrics.pipelineValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Pipeline Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ModuleNav
        title="CRM Modules"
        items={[
          { title: "Lead Details", icon: Users, href: "/lead-detail" },
          { title: "Opportunities", icon: Target, href: "/opportunities" },
          { title: "Sales Pipeline", icon: TrendingUp, href: "/sales-pipeline" },
          { title: "Revenue Forecast", icon: DollarSign, href: "/forecast" },
          { title: "Accounts", icon: Users, href: "/accounts" },
          { title: "Contacts", icon: Phone, href: "/contacts" },
        ]}
      />

      <Tabs defaultValue="leads" className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="leads" data-testid="tab-leads">Leads</TabsTrigger>
            <TabsTrigger value="opportunities" data-testid="tab-opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="accounts" data-testid="tab-accounts">Accounts</TabsTrigger>
            <TabsTrigger value="pipeline" data-testid="tab-pipeline">Pipeline</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-48"
                data-testid="input-search-leads"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36" data-testid="select-status-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="won">Won</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"} 
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "grid" ? "secondary" : "ghost"} 
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="leads" className="space-y-4">
          {viewMode === "list" ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Name</th>
                        <th className="px-4 py-3 text-left font-medium">Company</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Score</th>
                        <th className="px-4 py-3 text-left font-medium">Value</th>
                        <th className="px-4 py-3 text-left font-medium">Next Action</th>
                        <th className="px-4 py-3 text-left font-medium">Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="border-b hover:bg-muted/50" data-testid={`row-lead-${lead.id}`}>
                          <td className="px-4 py-3 font-medium">{lead.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{lead.company}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="capitalize">
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary"
                                  style={{ width: `${lead.score}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono">{lead.score}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono">${(lead.value / 1000).toFixed(0)}K</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{lead.nextAction}</td>
                          <td className="px-4 py-3 text-xs">{lead.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="hover-elevate cursor-pointer" onClick={() => setSelectedLead(lead)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{lead.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{lead.company}</p>
                      </div>
                      <Badge className="capitalize">{lead.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>AI Score</span>
                        <span className="font-mono">{lead.score}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-mono text-xs">${(lead.value / 1000).toFixed(0)}K</span>
                      <span className="text-xs text-muted-foreground">{lead.nextActionDate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sales Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{opp.name}</p>
                        <p className="text-xs text-muted-foreground">{opp.account}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">${(opp.value / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted-foreground">{opp.probability}% probability</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Stage</p>
                        <p className="font-medium capitalize text-xs">{opp.stage.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Close Date</p>
                        <p className="font-medium text-xs">{opp.closeDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Owner</p>
                        <p className="font-medium text-xs">{opp.owner}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="p-4 rounded-lg border hover-elevate">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{account.industry}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {account.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Contacts • Opportunities</p>
                        <p className="font-medium text-sm">{account.contacts} • {account.opportunities}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Annual Value</p>
                        <p className="font-mono font-semibold">{account.annualValue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <AnalyticsChart title="Sales Pipeline by Stage" type="bar" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
