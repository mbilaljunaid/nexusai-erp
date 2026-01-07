import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Droplet, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BulkInventoryManagement() {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState({ materialId: "", containerType: "tank", quantity: "1000", status: "available" });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/bulk-inventory"],
    queryFn: () => fetch("/api/bulk-inventory").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/bulk-inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bulk-inventory"] });
      setNewItem({ materialId: "", containerType: "tank", quantity: "1000", status: "available" });
      toast({ title: "Inventory created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/bulk-inventory/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bulk-inventory"] });
      toast({ title: "Item deleted" });
    },
  });

  const available = items.filter((i: any) => i.status === "available").length;
  const reserved = items.filter((i: any) => i.status === "reserved").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Droplet className="h-8 w-8" />
          Bulk Inventory Management
        </h1>
        <p className="text-muted-foreground mt-2">Tanks, silos, drums, batch tracking, and shelf life management</p>
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
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-600">{available}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Reserved</p>
            <p className="text-2xl font-bold text-blue-600">{reserved}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Utilization</p>
            <p className="text-2xl font-bold">{items.length > 0 ? ((reserved / items.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-item">
        <CardHeader><CardTitle className="text-base">Add Bulk Inventory</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Material ID" value={newItem.materialId} onChange={(e) => setNewItem({ ...newItem, materialId: e.target.value })} data-testid="input-matid" className="text-sm" />
            <Select value={newItem.containerType} onValueChange={(v) => setNewItem({ ...newItem, containerType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tank">Tank</SelectItem>
                <SelectItem value="silo">Silo</SelectItem>
                <SelectItem value="drum">Drum</SelectItem>
                <SelectItem value="tote">Tote</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Quantity" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Select value={newItem.status} onValueChange={(v) => setNewItem({ ...newItem, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="quarantine">Quarantine</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newItem)} disabled={createMutation.isPending || !newItem.materialId} size="sm" data-testid="button-add-inv">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Inventory Items</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : items.length === 0 ? <p className="text-muted-foreground text-center py-4">No items</p> : items.map((i: any) => (
            <div key={i.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`inv-${i.id}`}>
              <div>
                <p className="font-semibold">{i.materialId}</p>
                <p className="text-xs text-muted-foreground">{i.containerType} • {i.quantity} units</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={i.status === "available" ? "default" : i.status === "quarantine" ? "destructive" : "secondary"} className="text-xs">{i.status}</Badge>
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
