import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MerchandisePlanning() {
  const { toast } = useToast();
  const [newPlan, setNewPlan] = useState({ sku: "", season: "spring", targetQty: "100", status: "draft" });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["/api/merch-plans"],
    queryFn: () => fetch("/api/merch-plans").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/merch-plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merch-plans"] });
      setNewPlan({ sku: "", season: "spring", targetQty: "100", status: "draft" });
      toast({ title: "Merchandise plan created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/merch-plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merch-plans"] });
      toast({ title: "Plan deleted" });
    },
  });

  const active = plans.filter((p: any) => p.status === "active").length;
  const totalQty = plans.reduce((sum: number, p: any) => sum + (parseFloat(p.targetQty) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8" />
          Merchandise Planning & Assortment
        </h1>
        <p className="text-muted-foreground mt-2">Seasonal planning, assortment optimization, and replenishment recommendations</p>
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
            <p className="text-xs text-muted-foreground">Active Plans</p>
            <p className="text-2xl font-bold text-green-600">{active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Target Qty</p>
            <p className="text-2xl font-bold">{(totalQty / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Draft Plans</p>
            <p className="text-2xl font-bold text-yellow-600">{plans.length - active}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-plan">
        <CardHeader><CardTitle className="text-base">Create Merchandise Plan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="SKU" value={newPlan.sku} onChange={(e) => setNewPlan({ ...newPlan, sku: e.target.value })} data-testid="input-sku" className="text-sm" />
            <Select value={newPlan.season} onValueChange={(v) => setNewPlan({ ...newPlan, season: v })}>
              <SelectTrigger data-testid="select-season" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="fall">Fall</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Target Qty" type="number" value={newPlan.targetQty} onChange={(e) => setNewPlan({ ...newPlan, targetQty: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Select value={newPlan.status} onValueChange={(v) => setNewPlan({ ...newPlan, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newPlan)} disabled={createMutation.isPending || !newPlan.sku} size="sm" data-testid="button-create-plan">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Plans</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : plans.length === 0 ? <p className="text-muted-foreground text-center py-4">No plans</p> : plans.map((p: any) => (
            <div key={p.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`plan-${p.id}`}>
              <div>
                <p className="font-semibold">{p.sku}</p>
                <p className="text-xs text-muted-foreground">{p.season} • {p.targetQty} units</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-${p.id}`} className="h-7 w-7">
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
