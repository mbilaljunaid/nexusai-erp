import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MenuPOSOperations() {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState({ menuId: "", itemName: "", price: "0", status: "active" });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/fb-menu"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/fb-menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-menu"] });
      setNewItem({ menuId: "", itemName: "", price: "0", status: "active" });
      toast({ title: "Menu item created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/fb-menu/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-menu"] });
      toast({ title: "Menu item deleted" });
    }
  });

  const active = items.filter((i: any) => i.status === "active").length;
  const totalRevenue = items.reduce((sum: number, i: any) => sum + (parseFloat(i.price) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8" />
          Menu & POS Operations
        </h1>
        <p className="text-muted-foreground mt-2">Menu management, POS integration, portion costing, allergen management, and KDS routing</p>
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
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{items.length - active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Menu Value</p>
            <p className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-item">
        <CardHeader><CardTitle className="text-base">Add Menu Item</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Menu ID" value={newItem.menuId} onChange={(e) => setNewItem({ ...newItem, menuId: e.target.value })} data-testid="input-mid" className="text-sm" />
            <Input placeholder="Item Name" value={newItem.itemName} onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Price" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} data-testid="input-price" className="text-sm" />
            <Input placeholder="Status" disabled value={newItem.status} data-testid="input-status" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newItem)} disabled={createMutation.isPending || !newItem.menuId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Menu Items</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : items.length === 0 ? <p className="text-muted-foreground text-center py-4">No items</p> : items.map((i: any) => (
            <div key={i.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`item-${i.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{i.itemName}</p>
                <p className="text-xs text-muted-foreground">Price: ${i.price}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={i.status === "active" ? "default" : "secondary"} className="text-xs">{i.status}</Badge>
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
