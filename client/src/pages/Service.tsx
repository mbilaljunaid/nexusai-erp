import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { ServiceTicketForm } from "@/components/forms/ServiceTicketForm";
import CustomerEntryForm from "@/components/forms/CustomerEntryForm";
import { AlertCircle, Users, BarChart3, FileText, Settings, Zap, TrendingUp, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

export default function Service() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: tickets = [] } = useQuery({ queryKey: ["/api/service-tickets"], retry: false });

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "tickets", label: "Tickets", icon: AlertCircle, color: "text-green-500" },
    { id: "customers", label: "Customers", icon: Users, color: "text-purple-500" },
    { id: "knowledge", label: "Knowledge Base", icon: FileText, color: "text-orange-500" },
    { id: "sla", label: "SLA Tracking", icon: Clock, color: "text-pink-500" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, color: "text-cyan-500" },
    { id: "queue", label: "Queue Manager", icon: Zap, color: "text-indigo-500" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><TicketSquare className="w-8 h-8" />Customer Service</h1>
        <p className="text-muted-foreground text-sm">Manage support tickets, SLAs, and customer satisfaction</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">342</p><p className="text-xs text-muted-foreground">Open Tickets</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">4.2 hrs</p><p className="text-xs text-muted-foreground">Avg Response Time</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">94%</p><p className="text-xs text-muted-foreground">SLA Compliance</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">4.8/5</p><p className="text-xs text-muted-foreground">CSAT Score</p></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-base">Ticket Status</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Open: 342</p><p className="text-sm">In Progress: 156</p><p className="text-sm">Resolved: 1,234</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Performance</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Avg Response: 4.2 hrs</p><p className="text-sm">Avg Resolution: 8.5 hrs</p><p className="text-sm">First Contact Resolution: 72%</p></div></CardContent></Card>
        </div>
      )}

      {activeNav === "tickets" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New Ticket</Button>
          </div>
          <div className="space-y-2">
            {(tickets || []).filter((t: any) => (t.title || "").toLowerCase().includes(searchQuery.toLowerCase())).map((t: any, idx: number) => (
              <Card key={idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{t.title}</p><p className="text-sm text-muted-foreground">{t.description}</p></div><Badge>{t.status}</Badge></div></CardContent></Card>
            ))}
          </div>
          <ServiceTicketForm />
        </div>
      )}

      {activeNav === "customers" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New Customer</Button>
          </div>
          <div className="space-y-2">
            {[{id: 1, name: "TechCorp Inc", email: "support@techcorp.com", tickets: 12}, {id: 2, name: "RetailCo", email: "support@retailco.com", tickets: 8}].filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((c: any) => (
              <Card key={c.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">{c.email}</p></div><Badge>{c.tickets} tickets</Badge></div></CardContent></Card>
            ))}
          </div>
          <CustomerEntryForm />
        </div>
      )}

      {activeNav === "knowledge" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Knowledge Base</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">1,234 articles | 89% article coverage</p><Button size="sm" className="mt-4">+ New Article</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "sla" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>SLA Tracking</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Compliance: 94% | At Risk: 28 | Breached: 8</p><Button size="sm" className="mt-4">+ Configure SLA</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "analytics" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Service Analytics</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Reports and performance dashboards</p><Button size="sm" className="mt-4">+ View Reports</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "queue" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Queue Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Queue depth: 342 | Wait time: 4.2 min</p><Button size="sm" className="mt-4">+ Manage Queue</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "settings" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Service Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure workflows, routing, and automation</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
