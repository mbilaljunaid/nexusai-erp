import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PartsInventory() {
  const { toast } = useToast();
  const [newPart, setNewPart] = useState({ partId: "", partName: "", quantity: "0", reorder: "50" });

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["/api/auto-parts"],
    queryFn: () => fetch("/api/auto-parts").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/auto-parts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-parts"] });
      setNewPart({ partId: "", partName: "", quantity: "0", reorder: "50" });
      toast({ title: "Part added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/auto-parts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-parts"] });
      toast({ title: "Part deleted" });
    },
  });

  const lowStock = parts.filter((p: any) => (parseInt(p.quantity) || 0) < (parseInt(p.reorder) || 50)).length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Parts Warehouse & Inventory
        </h1>
        <p className="text-muted-foreground mt-2">Parts inventory, kitting, POS, replenishment, and warranty returns</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Parts</p>
            <p className="text-2xl font-bold">{parts.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Low Stock</p>
            <p className="text-2xl font-bold text-red-600">{lowStock}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Qty</p>
            <p className="text-2xl font-bold">{parts.reduce((sum: number, p: any) => sum + (parseInt(p.quantity) || 0), 0)}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Stocked</p>
            <p className="text-2xl font-bold text-green-600">{parts.filter((p: any) => (parseInt(p.quantity) || 0) > (parseInt(p.reorder) || 50)).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-part">
        <CardHeader><CardTitle className="text-base">Add Part</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Part ID" value={newPart.partId} onChange={(e) => setNewPart({ ...newPart, partId: e.target.value })} data-testid="input-pid" className="text-sm" />
            <Input placeholder="Part Name" value={newPart.partName} onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Qty" type="number" value={newPart.quantity} onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Input placeholder="Reorder" type="number" value={newPart.reorder} onChange={(e) => setNewPart({ ...newPart, reorder: e.target.value })} data-testid="input-reorder" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newPart)} disabled={createMutation.isPending || !newPart.partId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Parts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : parts.length === 0 ? <p className="text-muted-foreground text-center py-4">No parts</p> : parts.map((p: any) => (
            <div key={p.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`part-${p.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{p.partId} - {p.partName}</p>
                <p className="text-xs text-muted-foreground">Qty: {p.quantity} • Reorder: {p.reorder}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={(parseInt(p.quantity) || 0) < (parseInt(p.reorder) || 50) ? "destructive" : "default"} className="text-xs">Qty</Badge>
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
