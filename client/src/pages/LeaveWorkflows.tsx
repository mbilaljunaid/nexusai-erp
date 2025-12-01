import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { Calendar, CheckCircle2, Clock, AlertCircle, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LeaveRequest {
  id: string;
  employeeName: string;
  type: string;
  status: string;
  days: number;
}

export default function LeaveWorkflows() {
  const [activeNav, setActiveNav] = useState("pending");
  const { data: requests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"]
    retry: false
  });

  const stats = {
    total: (requests || []).length
    pending: (requests || []).filter((r: any) => r.status === "pending").length
    approved: (requests || []).filter((r: any) => r.status === "approved").length
    days: (requests || []).filter((r: any) => r.status === "approved").reduce((sum: number, r: any) => sum + (r.days || 0), 0)
  };

  const navItems = [
    { id: "pending", label: "Pending", icon: Clock, color: "text-yellow-500" }
    { id: "approved", label: "Approved", icon: CheckCircle2, color: "text-green-500" }
    { id: "all", label: "All", icon: Calendar, color: "text-blue-500" }
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-purple-500" }
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Leave Workflows</h1>
        <p className="text-muted-foreground text-sm">Request, approve, and track time off</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Requests</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="h-5 w-5 text-yellow-500" /><div><p className="text-2xl font-semibold">{stats.pending}</p><p className="text-xs text-muted-foreground">Pending</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.approved}</p><p className="text-xs text-muted-foreground">Approved</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold">{stats.days}</p><p className="text-xs text-muted-foreground">Days Approved</p></div></div></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {(activeNav === "pending" || activeNav === "all") && (
        <div className="space-y-3">
          {((activeNav === "pending" ? (requests || []).filter((r: any) => r.status === "pending") : requests) || []).map((req: any) => (
            <Card key={req.id} className="hover-elevate"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="font-semibold">{req.employeeName}</p><p className="text-sm text-muted-foreground">{req.type} • {req.days} days</p></div><Badge>{req.status}</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "approved" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.approved} approved leave requests</p></CardContent></Card>}
      {activeNav === "analytics" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Leave usage and analytics</p></CardContent></Card>}
    </div>
  );
}
