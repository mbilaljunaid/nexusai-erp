import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadTable } from "@/components/LeadTable";
import { LeadCard } from "@/components/LeadCard";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { LeadEntryForm } from "@/components/forms/LeadEntryForm";
import { OpportunityForm } from "@/components/forms/OpportunityForm";
import CustomerEntryForm from "@/components/forms/CustomerEntryForm";
import { CampaignEntryForm } from "@/components/forms/CampaignEntryForm";
import { IconNavigation } from "@/components/IconNavigation";
import { Search, Filter, LayoutGrid, List, Target, Users, BarChart3, TrendingUp, Mail, Phone, FileText, Settings, Activity } from "lucide-react";

export default function CRM() {
  const [leadView, setLeadView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("overview");
  const { data: leads = [] } = useQuery({ queryKey: ["/api/leads"], retry: false });

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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="h-8 w-8" />CRM & Sales</h1>
          <p className="text-muted-foreground text-sm">Manage leads, opportunities, accounts, contacts, and campaigns</p>
        </div>
        <AddLeadDialog />
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">1,250</p><p className="text-xs text-muted-foreground">Total Leads</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">$4.2M</p><p className="text-xs text-muted-foreground">Pipeline Value</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">35%</p><p className="text-xs text-muted-foreground">Avg Win Rate</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">18 days</p><p className="text-xs text-muted-foreground">Avg Sales Cycle</p></CardContent></Card>
        </div>
      )}

      {activeNav === "leads" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New Lead</Button>
          </div>
          <div className="space-y-2">
            {(leads || []).filter((l: any) => (l.name || "").toLowerCase().includes(searchQuery.toLowerCase())).map((l: any) => (
              <Card key={l.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{l.name}</p><p className="text-sm text-muted-foreground">{l.email}</p></div><Badge>{l.status}</Badge></div></CardContent></Card>
            ))}
          </div>
          <LeadEntryForm />
        </div>
      )}

      {activeNav === "opportunities" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search opportunities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New Opportunity</Button>
          </div>
          <div className="space-y-2">
            {[{id: 1, name: "Enterprise Deal", value: 250000, stage: "proposal"}, {id: 2, name: "SMB Package", value: 45000, stage: "negotiation"}].filter((o: any) => o.name.toLowerCase().includes(searchQuery.toLowerCase())).map((o: any) => (
              <Card key={o.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{o.name}</p><p className="text-sm text-muted-foreground">{o.stage}</p></div><Badge>${(o.value / 1000).toFixed(0)}K</Badge></div></CardContent></Card>
            ))}
          </div>
          <OpportunityForm />
        </div>
      )}

      {activeNav === "accounts" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search accounts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New Account</Button>
          </div>
          <div className="space-y-2">
            {[{id: 1, name: "TechCorp Inc", industry: "Technology", revenue: "100M"}, {id: 2, name: "RetailCo", industry: "Retail", revenue: "50M"}].filter((a: any) => a.name.toLowerCase().includes(searchQuery.toLowerCase())).map((a: any) => (
              <Card key={a.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{a.name}</p><p className="text-sm text-muted-foreground">{a.industry}</p></div><Badge>{a.revenue}</Badge></div></CardContent></Card>
            ))}
          </div>
          <CustomerEntryForm />
        </div>
      )}

      {activeNav === "contacts" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New Contact</Button>
          </div>
          <div className="space-y-2">
            {[{id: 1, name: "Sarah Johnson", title: "CEO", email: "sarah@acme.com"}, {id: 2, name: "John Smith", title: "CTO", email: "john@acme.com"}].filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((c: any) => (
              <Card key={c.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">{c.title}</p></div><p className="text-xs text-muted-foreground">{c.email}</p></div></CardContent></Card>
            ))}
          </div>
          <CustomerEntryForm />
        </div>
      )}

      {activeNav === "campaigns" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search campaigns..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New Campaign</Button>
          </div>
          <div className="space-y-2">
            {[{id: 1, name: "Q4 Email Blast", status: "active", recipients: 5000}, {id: 2, name: "Holiday Sale", status: "planned", recipients: 8000}].filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((c: any) => (
              <Card key={c.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">{c.recipients} recipients</p></div><Badge>{c.status}</Badge></div></CardContent></Card>
            ))}
          </div>
          <CampaignEntryForm />
        </div>
      )}

      {activeNav === "pipeline" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Sales Pipeline</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Visualize your sales pipeline by stage</p></CardContent></Card>
        </div>
      )}

      {activeNav === "analytics" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>CRM Analytics</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Reports, forecasts, and performance metrics</p></CardContent></Card>
        </div>
      )}

      {activeNav === "settings" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>CRM Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure CRM workflows and customizations</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
