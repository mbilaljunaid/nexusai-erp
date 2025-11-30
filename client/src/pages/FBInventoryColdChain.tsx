import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FBInventoryColdChain() {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState({ itemId: "", itemName: "", quantity: "0", tempZone: "chilled" });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/fb-inventory"],
    queryFn: () => fetch("/api/fb-inventory").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/fb-inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-inventory"] });
      setNewItem({ itemId: "", itemName: "", quantity: "0", tempZone: "chilled" });
      toast({ title: "Inventory item added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/fb-inventory/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-inventory"] });
      toast({ title: "Item deleted" });
    },
  });

  const chilled = items.filter((i: any) => i.tempZone === "chilled").length;
  const frozen = items.filter((i: any) => i.tempZone === "frozen").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Thermometer className="h-8 w-8" />
          Inventory, Cold Chain & WMS
        </h1>
        <p className="text-muted-foreground mt-2">FEFO/FIFO, temperature logging, batch traceability, and cold storage management</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Chilled</p>
            <p className="text-2xl font-bold text-blue-600">{chilled}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Frozen</p>
            <p className="text-2xl font-bold text-purple-600">{frozen}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Qty</p>
            <p className="text-2xl font-bold">{items.reduce((sum: number, i: any) => sum + (parseInt(i.quantity) || 0), 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-item">
        <CardHeader><CardTitle className="text-base">Add Inventory Item</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Item ID" value={newItem.itemId} onChange={(e) => setNewItem({ ...newItem, itemId: e.target.value })} data-testid="input-iid" className="text-sm" />
            <Input placeholder="Item Name" value={newItem.itemName} onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Qty" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Input placeholder="Temp Zone" disabled value={newItem.tempZone} data-testid="input-temp" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newItem)} disabled={createMutation.isPending || !newItem.itemId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Inventory</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : items.length === 0 ? <p className="text-muted-foreground text-center py-4">No items</p> : items.map((i: any) => (
            <div key={i.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`item-${i.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{i.itemId} - {i.itemName}</p>
                <p className="text-xs text-muted-foreground">Qty: {i.quantity}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="default" className="text-xs">{i.tempZone}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(i.id)} data-testid={`button-delete-${i.id}`} className="h-7 w-7">
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
