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

export default function HSESafety() {
  const { toast } = useToast();
  const [newHSE, setNewHSE] = useState({ incidentType: "Near Miss", severity: "low", location: "Site-A", status: "open" });

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["/api/hse"],
    queryFn: () => fetch("/api/hse").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hse"] });
      setNewHSE({ incidentType: "Near Miss", severity: "low", location: "Site-A", status: "open" });
      toast({ title: "HSE incident logged" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hse/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hse"] });
      toast({ title: "Incident deleted" });
    },
  });

  const critical = incidents.filter((i: any) => i.severity === "critical").length;
  const closed = incidents.filter((i: any) => i.status === "closed").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          HSE & Safety Management
        </h1>
        <p className="text-muted-foreground mt-2">Incident logging, investigations, and corrective actions</p>
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
            <p className="text-xs text-muted-foreground">Closed</p>
            <p className="text-2xl font-bold text-green-600">{closed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-yellow-600">{incidents.length - closed}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-hse">
        <CardHeader><CardTitle className="text-base">Log Incident</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <Input placeholder="Incident Type" value={newHSE.incidentType} onChange={(e) => setNewHSE({ ...newHSE, incidentType: e.target.value })} data-testid="input-type" className="text-sm" />
            <Select value={newHSE.severity} onValueChange={(v) => setNewHSE({ ...newHSE, severity: v })}>
              <SelectTrigger data-testid="select-severity" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Location" value={newHSE.location} onChange={(e) => setNewHSE({ ...newHSE, location: e.target.value })} data-testid="input-loc" className="text-sm" />
            <Button disabled={createMutation.isPending} size="sm" data-testid="button-log-hse">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Incidents</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : incidents.length === 0 ? <p className="text-muted-foreground text-center py-4">No incidents</p> : incidents.map((i: any) => (
            <div key={i.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`hse-${i.id}`}>
              <div>
                <p className="font-semibold">{i.incidentType}</p>
                <p className="text-xs text-muted-foreground">{i.location} • {i.status}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={i.severity === "critical" ? "destructive" : i.severity === "high" ? "destructive" : "secondary"} className="text-xs">{i.severity}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${i.id}`} className="h-7 w-7">
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
