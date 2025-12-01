import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProcessAnalytics() {
  const { toast } = useToast();
  const [newKPI, setNewKPI] = useState({ process: "Order to Cash", metric: "Avg Cycle Time", target: "5 days", status: "on-track" });

  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ["/api/process-kpis"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/process-kpis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/process-kpis"] });
      setNewKPI({ process: "Order to Cash", metric: "Avg Cycle Time", target: "5 days", status: "on-track" });
      toast({ title: "Process KPI created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/process-kpis/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/process-kpis"] });
      toast({ title: "Process KPI deleted" });
    }
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Process Analytics & Optimization
        </h1>
        <p className="text-muted-foreground mt-2">Track process performance and identify optimization opportunities</p>
      </div>

      <Card data-testid="card-new-kpi">
        <CardHeader><CardTitle className="text-base">Add Process KPI</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Process" value={newKPI.process} onChange={(e) => setNewKPI({ ...newKPI, process: e.target.value })} data-testid="input-process" />
            <Input placeholder="Metric" value={newKPI.metric} onChange={(e) => setNewKPI({ ...newKPI, metric: e.target.value })} data-testid="input-metric" />
            <Input placeholder="Target" value={newKPI.target} onChange={(e) => setNewKPI({ ...newKPI, target: e.target.value })} data-testid="input-target" />
            <Select value={newKPI.status} onValueChange={(v) => setNewKPI({ ...newKPI, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="on-track">On Track</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newKPI)} disabled={createMutation.isPending || !newKPI.process} className="w-full" data-testid="button-add-kpi">
            <Plus className="w-4 h-4 mr-2" /> Add KPI
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Process KPIs</p>
            <p className="text-2xl font-bold">{kpis.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">On Track</p>
            <p className="text-2xl font-bold text-green-600">{kpis.filter((k: any) => k.status === "on-track").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Warnings</p>
            <p className="text-2xl font-bold text-yellow-600">{kpis.filter((k: any) => k.status === "warning").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-red-600">{kpis.filter((k: any) => k.status === "critical").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Process KPI Dashboard</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : kpis.length === 0 ? <p className="text-muted-foreground text-center py-4">No KPIs</p> : kpis.map((k: any) => (
            <div key={k.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`kpi-${k.id}`}>
              <div className="flex-1">
                <h3 className="font-semibold">{k.process}</h3>
                <p className="text-sm text-muted-foreground">Metric: {k.metric} • Target: {k.target}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={k.status === "on-track" ? "default" : k.status === "warning" ? "secondary" : "destructive"}>{k.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(k.id)} data-testid={`button-delete-${k.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
