import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, BarChart3 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DashboardBuilder() {
  const { toast } = useToast();
  const [newDash, setNewDash] = useState({ name: "", type: "sales", owner: "" });

  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboards"],
    queryFn: () => fetch("/api/analytics/dashboards").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/analytics/dashboards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboards"] });
      setNewDash({ name: "", type: "sales", owner: "" });
      toast({ title: "Dashboard created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/analytics/dashboards/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboards"] });
      toast({ title: "Dashboard deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><BarChart3 className="w-8 h-8" />Dashboard Builder</h1>
          <p className="text-muted-foreground mt-1">Create and manage custom dashboards</p>
        </div>
      </div>

      <Card data-testid="card-new-dash">
        <CardHeader><CardTitle className="text-base">Create Dashboard</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Dashboard name" value={newDash.name} onChange={(e) => setNewDash({ ...newDash, name: e.target.value })} data-testid="input-name" />
            <Select value={newDash.type} onValueChange={(v) => setNewDash({ ...newDash, type: v })}>
              <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Owner" value={newDash.owner} onChange={(e) => setNewDash({ ...newDash, owner: e.target.value })} data-testid="input-owner" />
          </div>
          <Button onClick={() => createMutation.mutate(newDash)} disabled={createMutation.isPending || !newDash.name} className="w-full" data-testid="button-new-dash">
            <Plus className="w-4 h-4 mr-2" /> Create Dashboard
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? <p>Loading...</p> : dashboards.length === 0 ? <p className="text-muted-foreground text-center py-4">No dashboards</p> : dashboards.map((dash: any) => (
          <Card key={dash.id} className="hover:shadow-lg transition" data-testid={`dashboard-${dash.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{dash.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{dash.widgets || 5} widgets • {dash.owner || "Unknown"}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(dash.id)} data-testid={`button-delete-${dash.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
