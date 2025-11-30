import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AuditManagement() {
  const { toast } = useToast();
  const [newAudit, setNewAudit] = useState({ auditType: "Financial", module: "Finance", findings: "", severity: "medium" });

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["/api/audits"],
    queryFn: () => fetch("/api/audits").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data) => fetch("/api/audits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      setNewAudit({ auditType: "Financial", module: "Finance", findings: "", severity: "medium" });
      toast({ title: "Audit record created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/audits/${id}`, { method: "DELETE" }),
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
    <div className="space-y-6 p-4" data-testid="audit-management">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clipboard className="h-8 w-8" />
          Audit Management
        </h1>
        <p className="text-muted-foreground mt-2">Track audit findings, corrective actions, and compliance</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3" data-testid="card-total-audits">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Audits</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-closed">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Closed</p>
            <p className="text-2xl font-bold text-green-600">{metrics.closed}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-in-progress">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{metrics.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-open">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-red-600">{metrics.open}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-audit">
        <CardHeader>
          <CardTitle className="text-base">Create Audit Record</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
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
          <Input placeholder="Audit findings" value={newAudit.findings} onChange={(e) => setNewAudit({ ...newAudit, findings: e.target.value })} data-testid="input-findings" />
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
          <Button onClick={() => createMutation.mutate(newAudit)} disabled={createMutation.isPending || !newAudit.findings} className="w-full" data-testid="button-create-audit">
            <Plus className="w-4 h-4 mr-2" /> Create Audit
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : audits.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No audits found</div>
          ) : (
            audits.map((a: any) => (
              <div key={a.id} className="p-3 border rounded-lg hover-elevate" data-testid={`audit-item-${a.id}`}>
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{a.auditType} Audit</h3>
                  <div className="flex gap-2">
                    <Badge variant={a.severity === "high" ? "destructive" : a.severity === "medium" ? "secondary" : "default"}>{a.severity}</Badge>
                    <Badge>{a.status}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Module: {a.module} • Findings: {a.findings}</p>
                <div className="flex gap-2">
                  {a.status !== "closed" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: a.id, status: a.status === "open" ? "in-progress" : "closed" })} data-testid={`button-update-${a.id}`}>
                      {a.status === "open" ? "Start" : "Close"}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(a.id)} data-testid={`button-delete-${a.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
