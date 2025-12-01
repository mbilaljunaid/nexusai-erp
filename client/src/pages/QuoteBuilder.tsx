import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { Plus, FileText, DollarSign, Send, CheckCircle2, BarChart3 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Quote {
  id: string;
  opportunityId: string;
  total: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  validUntil: string;
  createdAt: string;
}

export default function QuoteBuilder() {
  const [activeNav, setActiveNav] = useState("all");

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"]
    retry: false
  });

  const stats = {
    total: (quotes || []).length
    sent: (quotes || []).filter(q => q.status === "sent").length
    accepted: (quotes || []).filter(q => q.status === "accepted").length
    totalValue: (quotes || []).reduce((sum, q) => sum + parseFloat(q.total || "0"), 0)
  };

  const navItems = [
    { id: "all", label: "All Quotes", icon: FileText, color: "text-blue-500" }
    { id: "sent", label: "Sent", icon: Send, color: "text-green-500" }
    { id: "accepted", label: "Accepted", icon: CheckCircle2, color: "text-purple-500" }
    { id: "value", label: "Value", icon: DollarSign, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Quote Builder</h1>
          <p className="text-muted-foreground text-sm">Create and manage sales quotes</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Quote</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Send className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.sent}</p><p className="text-xs text-muted-foreground">Sent</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-purple-500" /><div><p className="text-2xl font-semibold">{stats.accepted}</p><p className="text-xs text-muted-foreground">Accepted</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold font-mono">${(stats.totalValue / 1000000).toFixed(1)}M</p><p className="text-xs text-muted-foreground">Total Value</p></div></div></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {(activeNav === "all" || activeNav === "sent") && (
        <div className="space-y-3">
          {((activeNav === "sent" ? (quotes || []).filter(q => q.status === "sent") : quotes) || []).map((quote: any) => (
            <Card key={quote.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">Quote for {quote.opportunityId}</p><p className="text-sm text-muted-foreground">Valid until: {quote.validUntil}</p></div><Badge>${parseFloat(quote.total).toLocaleString()}</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "accepted" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.accepted} quotes accepted</p></CardContent></Card>}
      {activeNav === "value" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Total quote value: ${(stats.totalValue / 1000000).toFixed(1)}M</p></CardContent></Card>}
    </div>
  );
}
