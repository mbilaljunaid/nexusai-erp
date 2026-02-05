import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, AlertCircle, TrendingUp, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ErrorEvent {
  id: string;
  message: string;
  severity: "critical" | "warning" | "info";
  count: number;
  status: "resolved" | "tracking";
}

export default function ErrorHandling() {
  const [activeNav, setActiveNav] = useState("errors");
  const { data: errors = [] } = useQuery<ErrorEvent[]>({
    queryKey: ["/api/errors/tracking"],
    retry: false,
  });

  const navItems = [
    { id: "errors", label: "Errors", icon: AlertTriangle, color: "text-red-500" },
    { id: "alerts", label: "Alerts", icon: Bell, color: "text-orange-500" },
    { id: "recovery", label: "Recovery", icon: CheckCircle2, color: "text-green-500" },
  ];

  const stats = {
    total: errors.length,
    critical: errors.filter((e: any) => e.severity === "critical").length,
    resolved: errors.filter((e: any) => e.status === "resolved").length,
    mttr: 45,
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold flex items-center gap-2"><AlertTriangle className="h-8 w-8" />Error Handling & Resilience</h1>
        <p className="text-muted-foreground text-sm">Error tracking, alerting, and recovery</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Errors</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.resolved}</p>
              <p className="text-xs text-muted-foreground">Resolved</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.mttr}m</p>
              <p className="text-xs text-muted-foreground">Avg MTTR</p></div>
          </div>
        </CardContent></Card>
      </div>
      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />
      {activeNav === "errors" && (
        <div className="space-y-3">
          {errors.map((error: any) => (
            <Card key={error.id} className="hover-elevate cursor-pointer"><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold">{error.message}</p>
                  <p className="text-sm text-muted-foreground">Occurrences: {error.count}</p></div>
                <Badge variant={error.severity === "critical" ? "destructive" : "secondary"}>{error.severity}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "alerts" && (<Card><CardContent className="p-4"><p className="text-muted-foreground">Real-time alerting and notifications</p></CardContent></Card>)}
      {activeNav === "recovery" && (<Card><CardContent className="p-4"><p className="text-muted-foreground">Automatic recovery and failover mechanisms</p></CardContent></Card>)}
    </div>
  );
}
