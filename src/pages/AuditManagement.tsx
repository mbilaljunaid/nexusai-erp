import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Plus, Trash2, CheckCircle2, Timer, AlertCircle, Activity, ShieldCheck } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuditManagement() {
  const { toast } = useToast();
  const [newAudit, setNewAudit] = useState({ auditType: "Financial", module: "Finance", findings: "", severity: "medium" });

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["/api/audits"],
    queryFn: () => fetch("/api/audits").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/audits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      setNewAudit({ auditType: "Financial", module: "Finance", findings: "", severity: "medium" });
      toast({ title: "Audit record created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/audits/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Audit deleted" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/audits/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Audit status updated" });
    },
  });

  const metrics = {
    total: audits.length,
    closed: audits.filter((a: any) => a.status === "closed").length,
    inProgress: audits.filter((a: any) => a.status === "in-progress").length,
    open: audits.filter((a: any) => a.status === "open").length,
  };

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Audit Management</h1>
          <p className="text-muted-foreground mt-1">Track audit findings, corrective actions, and regulatory compliance across the enterprise</p>
        </div>
      }
    >
      <DashboardWidget title="Total Audits" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Clipboard className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">Master records</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Closed" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">{metrics.closed}</div>
            <p className="text-xs text-muted-foreground">Remediated issues</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="In Progress" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <Timer className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">{metrics.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active workflow</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Open" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-red-100/50">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-red-600">{metrics.open}</div>
            <p className="text-xs text-muted-foreground">Pending action</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Create Audit Record" colSpan={4} icon={Plus}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</label>
            <Select value={newAudit.auditType} onValueChange={(v) => setNewAudit({ ...newAudit, auditType: v })}>
              <SelectTrigger data-testid="select-audit-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="Operational">Operational</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Module</label>
            <Select value={newAudit.module} onValueChange={(v) => setNewAudit({ ...newAudit, module: v })}>
              <SelectTrigger data-testid="select-module">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Findings</label>
            <Input placeholder="Enter brief summary" value={newAudit.findings} onChange={(e) => setNewAudit({ ...newAudit, findings: e.target.value })} data-testid="input-findings" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</label>
              <Select value={newAudit.severity} onValueChange={(v) => setNewAudit({ ...newAudit, severity: v })}>
                <SelectTrigger data-testid="select-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => createMutation.mutate(newAudit)} disabled={createMutation.isPending || !newAudit.findings} className="px-6" data-testid="button-create-audit">
              {createMutation.isPending ? <Activity className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget colSpan={4} title="Audit Audit Directory" icon={ShieldCheck}>
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : audits.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-medium">No audit findings registered</p>
          ) : (
            audits.map((a: any) => (
              <div key={a.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`audit-item-${a.id}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{a.auditType} Audit</h3>
                    <Badge variant={a.severity === "high" ? "destructive" : a.severity === "medium" ? "secondary" : "default"} className="text-[10px] uppercase font-mono">
                      {a.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Module: {a.module} • {a.findings}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono bg-background">
                    {a.status}
                  </Badge>
                  {a.status !== "closed" && (
                    <Button size="sm" variant="outline" className="h-8" onClick={() => updateStatusMutation.mutate({ id: a.id, status: a.status === "open" ? "in-progress" : "closed" })} data-testid={`button-update-${a.id}`}>
                      {a.status === "open" ? "Start Audit" : "Sign Off"}
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(a.id)} data-testid={`button-delete-${a.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
