import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function KPIDashboard() {
  const { toast } = useToast();
  const [newKPI, setNewKPI] = useState({ name: "", value: "", target: "", status: "on-track" });

  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ["/api/kpis"],
    queryFn: () => fetch("/api/kpis").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/kpis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kpis"] });
      setNewKPI({ name: "", value: "", target: "", status: "on-track" });
      toast({ title: "KPI created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/kpis/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kpis"] });
      toast({ title: "KPI deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          KPI Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Monitor key performance indicators</p>
      </div>

      <Card data-testid="card-new-kpi">
        <CardHeader><CardTitle className="text-base">Create KPI</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Name" value={newKPI.name} onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })} data-testid="input-name" />
            <Input placeholder="Value" value={newKPI.value} onChange={(e) => setNewKPI({ ...newKPI, value: e.target.value })} data-testid="input-value" />
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
          <Button disabled={createMutation.isPending || !newKPI.name} className="w-full" data-testid="button-create-kpi">
            <Plus className="w-4 h-4 mr-2" /> Create KPI
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {isLoading ? <p>Loading...</p> : kpis.length === 0 ? <p className="text-muted-foreground">No KPIs</p> : kpis.map((kpi: any) => (
          <Card key={kpi.id} className="hover-elevate" data-testid={`kpi-${kpi.id}`}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{kpi.name}</h3>
                <div className="flex gap-2 items-center">
                  <Badge variant={kpi.status === "on-track" ? "default" : kpi.status === "warning" ? "secondary" : "destructive"}>
                    {kpi.status}
                  </Badge>
                  <Button size="icon" variant="ghost" data-testid={`button-delete-${kpi.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">Target: {kpi.target}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
