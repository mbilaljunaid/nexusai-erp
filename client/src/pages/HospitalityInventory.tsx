import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Box, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HospitalityInventory() {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState({ itemId: "", itemName: "", category: "F&B", quantity: "0", reorder: "50" });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/hospitality-inventory"],
    queryFn: () => fetch("/api/hospitality-inventory").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hospitality-inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-inventory"] });
      setNewItem({ itemId: "", itemName: "", category: "F&B", quantity: "0", reorder: "50" });
      toast({ title: "Item added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hospitality-inventory/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-inventory"] });
      toast({ title: "Item deleted" });
    },
  });

  const lowStock = items.filter((i: any) => (parseInt(i.quantity) || 0) < (parseInt(i.reorder) || 50)).length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Box className="h-8 w-8" />
          Inventory & Procurement
        </h1>
        <p className="text-muted-foreground mt-2">F&B inventory, housekeeping supplies, par levels, and reorder management</p>
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
            <p className="text-xs text-muted-foreground">Low Stock</p>
            <p className="text-2xl font-bold text-red-600">{lowStock}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Qty</p>
            <p className="text-2xl font-bold">{items.reduce((sum: number, i: any) => sum + (parseInt(i.quantity) || 0), 0)}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Inventory Status</p>
            <p className="text-2xl font-bold text-green-600">{items.filter((i: any) => (parseInt(i.quantity) || 0) > (parseInt(i.reorder) || 50)).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-item">
        <CardHeader><CardTitle className="text-base">Add Item</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Item ID" value={newItem.itemId} onChange={(e) => setNewItem({ ...newItem, itemId: e.target.value })} data-testid="input-itemid" className="text-sm" />
            <Input placeholder="Name" value={newItem.itemName} onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Qty" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Input placeholder="Reorder" type="number" value={newItem.reorder} onChange={(e) => setNewItem({ ...newItem, reorder: e.target.value })} data-testid="input-reorder" className="text-sm" />
            <Button disabled={createMutation.isPending || !newItem.itemId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : items.length === 0 ? <p className="text-muted-foreground text-center py-4">No items</p> : items.map((i: any) => (
            <div key={i.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`item-${i.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{i.itemId} - {i.itemName}</p>
                <p className="text-xs text-muted-foreground">Qty: {i.quantity} • Reorder: {i.reorder}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={(parseInt(i.quantity) || 0) < (parseInt(i.reorder) || 50) ? "destructive" : "default"} className="text-xs">{i.category}</Badge>
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
