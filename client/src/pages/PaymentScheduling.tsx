import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { Calendar, DollarSign, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PaymentSchedule {
  id: string;
  vendorId: string;
  invoiceId: string;
  amount: string;
  dueDate: string;
  scheduledDate: string;
  status: "pending" | "scheduled" | "processed" | "failed";
  createdAt: string;
}

export default function PaymentScheduling() {
  const [activeNav, setActiveNav] = useState("pending");
  const { data: schedules = [] } = useQuery<PaymentSchedule[]>({
    queryKey: ["/api/payment-schedules"]
    retry: false
  });

  const stats = {
    pending: (schedules || []).filter(s => s.status === "pending").length
    scheduled: (schedules || []).filter(s => s.status === "scheduled").length
    processed: (schedules || []).filter(s => s.status === "processed").length
    totalAmount: (schedules || []).filter(s => s.status !== "failed").reduce((sum, s) => sum + parseFloat(s.amount || "0"), 0)
  };

  const navItems = [
    { id: "pending", label: "Pending", icon: Clock, color: "text-yellow-500" }
    { id: "scheduled", label: "Scheduled", icon: Calendar, color: "text-blue-500" }
    { id: "processed", label: "Processed", icon: CheckCircle2, color: "text-green-500" }
    { id: "amount", label: "Amount", icon: DollarSign, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Payment Scheduling</h1>
          <p className="text-muted-foreground text-sm">Plan and manage vendor payment dates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="h-5 w-5 text-yellow-500" /><div><p className="text-2xl font-semibold">{stats.pending}</p><p className="text-xs text-muted-foreground">Pending</p></div></div></CardContent></Card>
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.scheduled}</p><p className="text-xs text-muted-foreground">Scheduled</p></div></div></CardContent></Card>
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.processed}</p><p className="text-xs text-muted-foreground">Processed</p></div></div></CardContent></Card>
        <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold font-mono">${(stats.totalAmount / 1000000).toFixed(1)}M</p><p className="text-xs text-muted-foreground">Total</p></div></div></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {(activeNav === "pending" || activeNav === "scheduled") && (
        <div className="space-y-3">
          {((activeNav === "pending" ? (schedules || []).filter(s => s.status === "pending") : (schedules || []).filter(s => s.status === "scheduled")) || []).map((schedule: any) => (
            <Card key={schedule.id} className="hover-elevate"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{schedule.invoiceId}</p><p className="text-sm text-muted-foreground">Due: {schedule.dueDate}</p></div><Badge>${parseFloat(schedule.amount).toLocaleString()}</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "processed" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.processed} payments processed</p></CardContent></Card>}
      {activeNav === "amount" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Total scheduled: ${(stats.totalAmount / 1000000).toFixed(1)}M</p></CardContent></Card>}
    </div>
  );
}
