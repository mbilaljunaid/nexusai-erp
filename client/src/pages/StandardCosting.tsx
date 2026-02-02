import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StandardCosting() {
  const { toast } = useToast();
  const [newCost, setNewCost] = useState({ product: "Product-A", materialCost: "50", laborCost: "20", overheadPct: "15", status: "active" });

  const { data: costs = [], isLoading } = useQuery({
    queryKey: ["/api/costing"],
    queryFn: () => fetch("/api/costing").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/costing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/costing"] });
      setNewCost({ product: "Product-A", materialCost: "50", laborCost: "20", overheadPct: "15", status: "active" });
      toast({ title: "Cost created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/costing/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/costing"] });
      toast({ title: "Cost deleted" });
    },
  });

  const totalMaterialCost = costs.reduce((sum: number, c: any) => sum + (parseFloat(c.materialCost) || 0), 0);
  const avgTotalCost = costs.length > 0 ? costs.reduce((sum: number, c: any) => {
    const mat = parseFloat(c.materialCost) || 0;
    const lab = parseFloat(c.laborCost) || 0;
    const oh = (parseFloat(c.overheadPct) || 0) / 100;
    return sum + (mat + lab + (mat + lab) * oh);
  }, 0) / costs.length : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Standard Costing
        </h1>
        <p className="text-muted-foreground mt-2">Manage standard costs and cost variances</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Cost Records</p>
            <p className="text-2xl font-bold">{costs.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Material Cost</p>
            <p className="text-2xl font-bold">${(totalMaterialCost / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Total Cost</p>
            <p className="text-2xl font-bold">${avgTotalCost.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-cost">
        <CardHeader><CardTitle className="text-base">Add Standard Cost</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Select value={newCost.product} onValueChange={(v) => setNewCost({ ...newCost, product: v })}>
              <SelectTrigger data-testid="select-product"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Product-A">Product-A</SelectItem>
                <SelectItem value="Product-B">Product-B</SelectItem>
                <SelectItem value="Product-C">Product-C</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Material $" type="number" value={newCost.materialCost} onChange={(e) => setNewCost({ ...newCost, materialCost: e.target.value })} data-testid="input-mat" />
            <Input placeholder="Labor $" type="number" value={newCost.laborCost} onChange={(e) => setNewCost({ ...newCost, laborCost: e.target.value })} data-testid="input-lab" />
            <Input placeholder="Overhead %" type="number" value={newCost.overheadPct} onChange={(e) => setNewCost({ ...newCost, overheadPct: e.target.value })} data-testid="input-oh" />
            <Select value={newCost.status} onValueChange={(v) => setNewCost({ ...newCost, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="obsolete">Obsolete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending} className="w-full" data-testid="button-create-cost">
            <Plus className="w-4 h-4 mr-2" /> Create Cost
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Standard Costs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : costs.length === 0 ? <p className="text-muted-foreground text-center py-4">No costs</p> : costs.map((c: any) => {
            const totalCost = (parseFloat(c.materialCost) || 0) + (parseFloat(c.laborCost) || 0) + ((parseFloat(c.materialCost) || 0) + (parseFloat(c.laborCost) || 0)) * ((parseFloat(c.overheadPct) || 0) / 100);
            return (
              <div key={c.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`cost-${c.id}`}>
                <div>
                  <p className="font-semibold text-sm">{c.product}</p>
                  <p className="text-xs text-muted-foreground">Mat: ${c.materialCost} | Lab: ${c.laborCost} | Total: ${totalCost.toFixed(0)}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="default">{c.status}</Badge>
                  <Button size="icon" variant="ghost" data-testid={`button-delete-${c.id}`}>
                    <Trash2 className="w-4 h-4" />
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
