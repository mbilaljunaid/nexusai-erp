import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FaultPerformanceMonitoring() {
  const { toast } = useToast();
  const [newFault, setNewFault] = useState({ eventId: "", nodeId: "", severity: "medium", status: "open" });

  const { data: faults = [], isLoading } = useQuery({
    queryKey: ["/api/network-faults"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/network-faults", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-faults"] });
      setNewFault({ eventId: "", nodeId: "", severity: "medium", status: "open" });
      toast({ title: "Fault logged" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/network-faults/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-faults"] });
      toast({ title: "Fault deleted" });
    }
  });

  const critical = faults.filter((f: any) => f.severity === "critical").length;
  const resolved = faults.filter((f: any) => f.status === "resolved").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          Fault & Performance Monitoring
        </h1>
        <p className="text-muted-foreground mt-2">Event/alarm dashboard, SLA violations, and automated escalation</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Faults</p>
            <p className="text-2xl font-bold">{faults.length}</p>
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
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-yellow-600">{faults.length - resolved}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-fault">
        <CardHeader><CardTitle className="text-base">Log Fault</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Event ID" value={newFault.eventId} onChange={(e) => setNewFault({ ...newFault, eventId: e.target.value })} data-testid="input-eid" className="text-sm" />
            <Input placeholder="Node ID" value={newFault.nodeId} onChange={(e) => setNewFault({ ...newFault, nodeId: e.target.value })} data-testid="input-nid" className="text-sm" />
            <Select value={newFault.severity} onValueChange={(v) => setNewFault({ ...newFault, severity: v })}>
              <SelectTrigger data-testid="select-severity" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newFault.status} onValueChange={(v) => setNewFault({ ...newFault, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newFault)} disabled={createMutation.isPending || !newFault.eventId} size="sm" data-testid="button-log">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Faults</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : faults.length === 0 ? <p className="text-muted-foreground text-center py-4">No faults</p> : faults.map((f: any) => (
            <div key={f.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`fault-${f.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{f.eventId}</p>
                <p className="text-xs text-muted-foreground">Node: {f.nodeId} • Status: {f.status}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={f.severity === "critical" ? "destructive" : f.severity === "medium" ? "secondary" : "default"} className="text-xs">{f.severity}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(f.id)} data-testid={`button-delete-${f.id}`} className="h-7 w-7">
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
