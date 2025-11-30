import { useState } from "react";
import { Link } from "wouter";
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
import { Search, Filter, LayoutGrid, List, Sparkles, TrendingUp, Users, Target, Calendar, DollarSign, Clock, AlertCircle, CheckCircle2, Plus, Phone, Mail, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Lead { id: string; name: string; email: string; phone: string; company: string; status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost"; score: number; value: number; source: string; owner: string; nextAction: string; nextActionDate: string; lastActivity: string; }
interface Opportunity { id: string; name: string; account: string; value: number; stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost"; probability: number; closeDate: string; owner: string; products: string[]; nextStep: string; }
interface Account { id: string; name: string; industry: string; employees: number; revenue: string; location: string; website: string; phone: string; lastActivity: string; }

export default function CRM() {
  const [leadView, setLeadView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: leads = [] } = useQuery({ queryKey: ["/api/leads"] });

  const mockLeads: Lead[] = [ { id: "1", name: "Sarah Johnson", email: "sarah@acme.com", phone: "+1-555-0101", company: "ACME Corp", status: "proposal", score: 92, value: 250000, source: "website", owner: "John Smith", nextAction: "Follow up call", nextActionDate: "2024-12-14", lastActivity: "2024-12-10" } ];

  const mockOpportunities: Opportunity[] = [ { id: "opp1", name: "Enterprise Platform Deal", account: "TechCorp Inc", value: 500000, stage: "negotiation", probability: 75, closeDate: "2024-12-31", owner: "Maria Garcia", products: ["Platform", "Support"], nextStep: "Send proposal" } ];

  const mockAccounts: Account[] = [ { id: "acc1", name: "TechCorp Inc", industry: "Technology", employees: 500, revenue: "$100M", location: "San Francisco", website: "techcorp.com", phone: "+1-555-0200", lastActivity: "2024-12-10" } ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="h-8 w-8" />CRM & Sales</h1>
          <p className="text-muted-foreground text-sm">Manage leads, opportunities, and accounts</p>
        </div>
        <AddLeadDialog />
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" data-testid="input-search-leads" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-lead-status">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" variant={leadView === "grid" ? "default" : "outline"} onClick={() => setLeadView("grid")} data-testid="button-leads-grid">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button size="sm" variant={leadView === "list" ? "default" : "outline"} onClick={() => setLeadView("list")} data-testid="button-leads-list">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {leadView === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          ) : (
            <LeadTable leads={mockLeads} />
          )}
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockOpportunities.map((opp) => (
              <Card key={opp.id} data-testid={`card-opportunity-${opp.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{opp.name}</span>
                    <Badge>{opp.probability}%</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm"><span className="text-muted-foreground">Account:</span> {opp.account}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Value:</span> ${opp.value.toLocaleString()}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Close Date:</span> {opp.closeDate}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockAccounts.map((acc) => (
              <Card key={acc.id} data-testid={`card-account-${acc.id}`}>
                <CardHeader>
                  <CardTitle>{acc.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm"><span className="text-muted-foreground">Industry:</span> {acc.industry}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Employees:</span> {acc.employees}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Revenue:</span> {acc.revenue}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Leads</p><p className="text-2xl font-bold">1,234</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Conversion Rate</p><p className="text-2xl font-bold text-green-600">18%</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Pipeline Value</p><p className="text-2xl font-bold">$2.4M</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Win Rate</p><p className="text-2xl font-bold text-green-600">32%</p></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
