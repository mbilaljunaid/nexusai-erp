import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { FileText, Plus, Check, AlertCircle, DollarSign, Calendar } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface APInvoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  poId: string;
  amount: string;
  matchStatus: "unmatched" | "2way" | "3way";
  status: "draft" | "submitted" | "matched" | "approved" | "paid";
}

export default function VendorInvoiceEntry() {
  const [activeNav, setActiveNav] = useState("invoices");
  const { data: invoices = [] } = useQuery<APInvoice[]>({
    queryKey: ["/api/ap-invoices"]
    retry: false
  });

  const stats = {
    total: (invoices || []).length
    unmatched: (invoices || []).filter(i => i.matchStatus === "unmatched").length
    matched: (invoices || []).filter(i => i.matchStatus === "3way").length
    totalAmount: (invoices || []).reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0)
  };

  const navItems = [
    { id: "invoices", label: "Invoices", icon: FileText, color: "text-blue-500" }
    { id: "unmatched", label: "Unmatched", icon: AlertCircle, color: "text-red-500" }
    { id: "matched", label: "Matched", icon: Check, color: "text-green-500" }
    { id: "analytics", label: "Analytics", icon: DollarSign, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">AP Invoice Entry</h1>
          <p className="text-muted-foreground text-sm">Match vendor invoices to POs (3-way matching)</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div></div></CardContent></Card>
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-red-500" /><div><p className="text-2xl font-semibold">{stats.unmatched}</p><p className="text-xs text-muted-foreground">Unmatched</p></div></div></CardContent></Card>
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.matched}</p><p className="text-xs text-muted-foreground">3-Way Matched</p></div></div></CardContent></Card>
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold font-mono">${(stats.totalAmount / 1000000).toFixed(1)}M</p><p className="text-xs text-muted-foreground">Total Amount</p></div></div></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "invoices" && (
        <div className="space-y-3">
          {(invoices || []).map((invoice: any) => (
            <Card key={invoice.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold text-sm">{invoice.invoiceNumber}</p><p className="text-xs text-muted-foreground">PO: {invoice.poId}</p></div><Badge variant={invoice.matchStatus === "3way" ? "default" : "secondary"}>{invoice.matchStatus}</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "unmatched" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.unmatched} unmatched invoices awaiting matching</p></CardContent></Card>}
      {activeNav === "matched" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.matched} invoices successfully 3-way matched</p></CardContent></Card>}
      {activeNav === "analytics" && <Card><CardContent className="p-4"><p className="text-muted-foreground">AP invoice analytics and trends</p></CardContent></Card>}
    </div>
  );
}
