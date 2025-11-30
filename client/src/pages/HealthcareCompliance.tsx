import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HealthcareCompliance() {
  const { toast } = useToast();
  const [newIncident, setNewIncident] = useState({ incidentId: "", type: "medication-error", severity: "medium", status: "open" });

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["/api/healthcare-compliance"],
    queryFn: () => fetch("/api/healthcare-compliance").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/healthcare-compliance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-compliance"] });
      setNewIncident({ incidentId: "", type: "medication-error", severity: "medium", status: "open" });
      toast({ title: "Incident reported" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/healthcare-compliance/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-compliance"] });
      toast({ title: "Incident deleted" });
    },
  });

  const critical = incidents.filter((i: any) => i.severity === "critical").length;
  const resolved = incidents.filter((i: any) => i.status === "resolved").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Quality, Safety & Compliance
        </h1>
        <p className="text-muted-foreground mt-2">Incident reporting, CAPA, audits, HIPAA/GDPR compliance, and accreditation evidence</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Incidents</p>
            <p className="text-2xl font-bold">{incidents.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-red-600">{critical}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{resolved}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Resolution %</p>
            <p className="text-2xl font-bold">{incidents.length > 0 ? ((resolved / incidents.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-incident">
        <CardHeader><CardTitle className="text-base">Report Incident</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Incident ID" value={newIncident.incidentId} onChange={(e) => setNewIncident({ ...newIncident, incidentId: e.target.value })} data-testid="input-incid" className="text-sm" />
            <Select value={newIncident.type} onValueChange={(v) => setNewIncident({ ...newIncident, type: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="medication-error">Medication Error</SelectItem>
                <SelectItem value="fall">Patient Fall</SelectItem>
                <SelectItem value="surgical">Surgical Complication</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newIncident.severity} onValueChange={(v) => setNewIncident({ ...newIncident, severity: v })}>
              <SelectTrigger data-testid="select-severity" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newIncident.status} onValueChange={(v) => setNewIncident({ ...newIncident, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="under-investigation">Under Investigation</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newIncident)} disabled={createMutation.isPending || !newIncident.incidentId} size="sm" data-testid="button-report">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Incidents</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : incidents.length === 0 ? <p className="text-muted-foreground text-center py-4">No incidents</p> : incidents.map((i: any) => (
            <div key={i.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`incident-${i.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{i.incidentId}</p>
                <p className="text-xs text-muted-foreground">{i.type} • {i.status}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={i.severity === "critical" ? "destructive" : i.severity === "medium" ? "secondary" : "default"} className="text-xs">{i.severity}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(i.id)} data-testid={`button-delete-${i.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
