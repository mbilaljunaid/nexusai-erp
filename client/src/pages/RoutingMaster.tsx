import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Workflow, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RoutingMaster() {
  const { toast } = useToast();
  const [newRouting, setNewRouting] = useState({ product: "Product-A", operation: "Assembly", workCenter: "WC-01", cycleTime: "30", status: "active" });

  const { data: routings = [], isLoading } = useQuery({
    queryKey: ["/api/routing"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/routing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routing"] });
      setNewRouting({ product: "Product-A", operation: "Assembly", workCenter: "WC-01", cycleTime: "30", status: "active" });
      toast({ title: "Routing created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/routing/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routing"] });
      toast({ title: "Routing deleted" });
    }
  });

  const totalCycleTime = routings.reduce((sum: number, r: any) => sum + (parseFloat(r.cycleTime) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Workflow className="h-8 w-8" />
          Routing Master
        </h1>
        <p className="text-muted-foreground mt-2">Define manufacturing routings and operations</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Routings</p>
            <p className="text-2xl font-bold">{routings.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Cycle Time (hrs)</p>
            <p className="text-2xl font-bold">{(totalCycleTime / 60).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Cycle Time (min)</p>
            <p className="text-2xl font-bold">{routings.length > 0 ? (totalCycleTime / routings.length).toFixed(0) : "0"}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-routing">
        <CardHeader><CardTitle className="text-base">Create Routing</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Select value={newRouting.product} onValueChange={(v) => setNewRouting({ ...newRouting, product: v })}>
              <SelectTrigger data-testid="select-product"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Product-A">Product-A</SelectItem>
                <SelectItem value="Product-B">Product-B</SelectItem>
                <SelectItem value="Product-C">Product-C</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Operation" value={newRouting.operation} onChange={(e) => setNewRouting({ ...newRouting, operation: e.target.value })} data-testid="input-operation" />
            <Input placeholder="Work Center" value={newRouting.workCenter} onChange={(e) => setNewRouting({ ...newRouting, workCenter: e.target.value })} data-testid="input-wc" />
            <Input placeholder="Cycle Time (min)" type="number" value={newRouting.cycleTime} onChange={(e) => setNewRouting({ ...newRouting, cycleTime: e.target.value })} data-testid="input-cycle" />
            <Select value={newRouting.status} onValueChange={(v) => setNewRouting({ ...newRouting, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newRouting)} disabled={createMutation.isPending || !newRouting.operation} className="w-full" data-testid="button-create-routing">
            <Plus className="w-4 h-4 mr-2" /> Create Routing
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Routings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : routings.length === 0 ? <p className="text-muted-foreground text-center py-4">No routings</p> : routings.map((r: any) => (
            <div key={r.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`routing-${r.id}`}>
              <div>
                <p className="font-semibold text-sm">{r.product} - {r.operation}</p>
                <p className="text-xs text-muted-foreground">{r.workCenter} • {r.cycleTime} min cycle</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="default">{r.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`}>
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
