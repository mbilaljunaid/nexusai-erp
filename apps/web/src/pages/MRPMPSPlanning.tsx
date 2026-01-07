import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MRPMPSPlanning() {
  const { toast } = useToast();
  const [newPlan, setNewPlan] = useState({ sku: "", demand: "1000", onHand: "500", planType: "buy", status: "suggested" });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["/api/mrp-plans"],
    queryFn: () => fetch("/api/mrp-plans").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/mrp-plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mrp-plans"] });
      setNewPlan({ sku: "", demand: "1000", onHand: "500", planType: "buy", status: "suggested" });
      toast({ title: "Plan created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/mrp-plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mrp-plans"] });
      toast({ title: "Plan deleted" });
    },
  });

  const approved = plans.filter((p: any) => p.status === "approved").length;
  const suggestedActions = plans.filter((p: any) => p.status === "suggested").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          MRP / MPS / APS Planning
        </h1>
        <p className="text-muted-foreground mt-2">Master production schedule, demand planning, and advanced scheduling</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Plans</p>
            <p className="text-2xl font-bold">{plans.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Suggested Actions</p>
            <p className="text-2xl font-bold text-yellow-600">{suggestedActions}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approved}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completion</p>
            <p className="text-2xl font-bold">{plans.length > 0 ? ((approved / plans.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-plan">
        <CardHeader><CardTitle className="text-base">Create MRP Plan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="SKU" value={newPlan.sku} onChange={(e) => setNewPlan({ ...newPlan, sku: e.target.value })} data-testid="input-sku" className="text-sm" />
            <Input placeholder="Demand Qty" type="number" value={newPlan.demand} onChange={(e) => setNewPlan({ ...newPlan, demand: e.target.value })} data-testid="input-demand" className="text-sm" />
            <Input placeholder="On Hand" type="number" value={newPlan.onHand} onChange={(e) => setNewPlan({ ...newPlan, onHand: e.target.value })} data-testid="input-onhand" className="text-sm" />
            <Select value={newPlan.planType} onValueChange={(v) => setNewPlan({ ...newPlan, planType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="make">Make</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newPlan.sku} size="sm" data-testid="button-create-plan">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">MRP Suggestions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : plans.length === 0 ? <p className="text-muted-foreground text-center py-4">No plans</p> : plans.map((p: any) => {
            const qty = (parseFloat(p.demand) || 0) - (parseFloat(p.onHand) || 0);
            return (
              <div key={p.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`plan-${p.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{p.sku}</p>
                  <p className="text-xs text-muted-foreground">Need {qty} units ({p.planType})</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={p.status === "approved" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                  <Button size="icon" variant="ghost" data-testid={`button-delete-${p.id}`} className="h-7 w-7">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
