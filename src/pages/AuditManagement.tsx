import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Plus, Trash2, CheckCircle2, Timer, AlertCircle, Activity, ShieldCheck, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function AuditManagement() {
  const { toast } = useToast();
  const [localAudits, setLocalAudits] = useState<any[]>([]);

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["/api/audits"],
    queryFn: () => fetch("/api/audits").then(r => r.json()),
  });

  useEffect(() => {
    if (audits) {
      setLocalAudits(audits);
    }
  }, [audits]);

  const saveMutation = useMutation({
    mutationFn: async (updatedAudits: any[]) => {
      for (const a of updatedAudits) {
        if (!a.id || String(a.id).startsWith('temp-')) {
          await fetch('/api/audits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...a, id: undefined }) }).catch(() => { });
        } else {
          await apiRequest('PATCH', `/api/audits/${a.id}`, a).catch(() => { });
        }
      }

      const deletedIds = audits.filter((c: any) => !updatedAudits.find((uc: any) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/audits/${id}`, { method: 'DELETE' }).catch(() => { });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Audit records saved successfully" });
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

      <DashboardWidget colSpan={4} title="Audit Directory" icon={ShieldCheck}>
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => setLocalAudits([...localAudits, { id: `temp-${Date.now()}`, auditType: "Financial", module: "Finance", findings: "", severity: "medium", status: "open" }])}>
            <Plus className="w-4 h-4 mr-2" /> Add Audit
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate(localAudits)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
          </Button>
        </div>

        <div className="border rounded-md bg-white">
          <InteractiveSpreadsheet
            data={localAudits}
            columns={[
              {
                id: "auditType",
                header: "Audit Type",
                width: "150px",
                cell: (row, index, updateRow) => (
                  <Select value={row.auditType || 'Financial'} onValueChange={(val) => updateRow("auditType", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Operational">Operational</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                )
              },
              {
                id: "module",
                header: "Module",
                width: "150px",
                cell: (row, index, updateRow) => (
                  <Select value={row.module || 'Finance'} onValueChange={(val) => updateRow("module", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Module" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                )
              },
              {
                id: "findings",
                header: "Findings",
                width: "300px",
                cell: (row, index, updateRow) => (
                  <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Findings summary..." value={row.findings || ''} onChange={(e) => updateRow("findings", e.target.value)} />
                )
              },
              {
                id: "severity",
                header: "Severity",
                width: "120px",
                cell: (row, index, updateRow) => (
                  <Select value={row.severity || 'medium'} onValueChange={(val) => updateRow("severity", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Severity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                )
              },
              {
                id: "status",
                header: "Status",
                width: "150px",
                cell: (row, index, updateRow) => (
                  <Select value={row.status || 'open'} onValueChange={(val) => updateRow("status", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )
              }
            ]}
            onChange={setLocalAudits}
          />
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
