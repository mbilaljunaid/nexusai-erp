import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LeadTable } from "@/components/LeadTable";
import { LeadCard, type Lead } from "@/components/LeadCard";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  Sparkles,
  TrendingUp,
  Users,
  Target
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CRM() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // todo: remove mock functionality
  const leads: Lead[] = [
    { id: "1", name: "Sarah Johnson", email: "sarah@techcorp.com", company: "TechCorp Inc.", status: "qualified", score: 87, value: 45000 },
    { id: "2", name: "Mark Chen", email: "mark@acme.com", company: "Acme Corp", status: "proposal", score: 78, value: 62000 },
    { id: "3", name: "Lisa Wong", email: "lisa@globaltech.io", company: "GlobalTech", status: "new", score: 65, value: 28000 },
    { id: "4", name: "James Miller", email: "james@startup.co", company: "StartupCo", status: "contacted", score: 54, value: 15000 },
    { id: "5", name: "Emma Davis", email: "emma@enterprise.com", company: "Enterprise LLC", status: "won", score: 92, value: 120000 },
    { id: "6", name: "Michael Brown", email: "michael@corp.net", company: "Corp Network", status: "qualified", score: 71, value: 38000 },
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const metrics = {
    totalLeads: leads.length,
    qualifiedLeads: leads.filter(l => l.status === "qualified").length,
    avgScore: Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length),
    pipelineValue: leads.reduce((acc, l) => acc + l.value, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">CRM</h1>
          <p className="text-muted-foreground text-sm">Manage leads with AI-powered insights</p>
        </div>
        <AddLeadDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
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
              <div className="p-2 rounded-md bg-green-500/10">
                <Target className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{metrics.qualifiedLeads}</p>
                <p className="text-xs text-muted-foreground">Qualified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
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
              <div className="p-2 rounded-md bg-orange-500/10">
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono">${(metrics.pipelineValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Pipeline Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="leads" data-testid="tab-leads">Leads</TabsTrigger>
            <TabsTrigger value="pipeline" data-testid="tab-pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="insights" data-testid="tab-insights">AI Insights</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
                data-testid="input-search-leads"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-status-filter">
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
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"} 
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "grid" ? "secondary" : "ghost"} 
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="leads" className="space-y-4">
          {viewMode === "list" ? (
            <LeadTable leads={filteredLeads} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <AnalyticsChart title="Lead Pipeline" type="pie" />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Lead Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-md bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">High Priority</Badge>
                </div>
                <p className="text-sm font-medium">Sarah Johnson is ready for closing</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on engagement patterns and lead score (87), this lead shows strong buying signals. 
                  Recommend scheduling a closing call within 48 hours.
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Schedule Call
                </Button>
              </div>
              <div className="p-4 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Action Needed</Badge>
                </div>
                <p className="text-sm font-medium">3 leads haven't been contacted in 7+ days</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mark Chen, Lisa Wong, and James Miller need follow-up. Consider sending automated re-engagement emails.
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Draft Emails
                </Button>
              </div>
              <div className="p-4 rounded-md bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Optimization</Badge>
                </div>
                <p className="text-sm font-medium">Predicted close rate can improve by 15%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Analysis shows that leads contacted within 4 hours of submission have 15% higher conversion. 
                  Consider setting up automated first-touch emails.
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Configure Automation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
