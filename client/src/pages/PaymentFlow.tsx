import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { CreditCard, CheckCircle2, Clock, AlertCircle, DollarSign, BarChart3 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Payment {
  id: string;
  invoiceId: string;
  amount: string;
  method: "card" | "bank" | "check";
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

export default function PaymentFlow() {
  const [activeNav, setActiveNav] = useState("all");

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"]
    retry: false
  });

  const stats = {
    total: (payments || []).length
    pending: (payments || []).filter(p => p.status === "pending").length
    completed: (payments || []).filter(p => p.status === "completed").length
    failed: (payments || []).filter(p => p.status === "failed").length
    totalProcessed: (payments || []).filter(p => p.status === "completed").reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0)
  };

  const navItems = [
    { id: "all", label: "All", icon: CreditCard, color: "text-blue-500" }
    { id: "pending", label: "Pending", icon: Clock, color: "text-yellow-500" }
    { id: "completed", label: "Completed", icon: CheckCircle2, color: "text-green-500" }
    { id: "failed", label: "Failed", icon: AlertCircle, color: "text-red-500" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Payment Flow</h1>
        <p className="text-muted-foreground text-sm">Process and track customer and vendor payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div></div></CardContent></Card>
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="h-5 w-5 text-yellow-500" /><div><p className="text-2xl font-semibold">{stats.pending}</p><p className="text-xs text-muted-foreground">Pending</p></div></div></CardContent></Card>
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.completed}</p><p className="text-xs text-muted-foreground">Completed</p></div></div></CardContent></Card>
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold font-mono">${(stats.totalProcessed / 1000000).toFixed(1)}M</p><p className="text-xs text-muted-foreground">Processed</p></div></div></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {(activeNav === "all" || activeNav === "pending") && (
        <div className="space-y-3">
          {((activeNav === "pending" ? (payments || []).filter(p => p.status === "pending") : payments) || []).map((payment: any) => (
            <Card key={payment.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold text-sm">Invoice {payment.invoiceId}</p><p className="text-xs text-muted-foreground">{payment.method} • {payment.createdAt}</p></div><Badge variant={payment.status === "completed" ? "default" : "secondary"}>{payment.status}</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "completed" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.completed} payments completed</p></CardContent></Card>}
      {activeNav === "failed" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.failed} failed payments</p></CardContent></Card>}
    </div>
  );
}
