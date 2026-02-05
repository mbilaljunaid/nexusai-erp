import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ECommerceDelivery() {
  const { toast } = useToast();
  const [newOrder, setNewOrder] = useState({ orderId: "", customerEmail: "", total: "0", status: "pending" });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/fb-ecommerce"],
    queryFn: () => fetch("/api/fb-ecommerce").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/fb-ecommerce", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-ecommerce"] });
      setNewOrder({ orderId: "", customerEmail: "", total: "0", status: "pending" });
      toast({ title: "Order created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/fb-ecommerce/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-ecommerce"] });
      toast({ title: "Order deleted" });
    },
  });

  const delivered = orders.filter((o: any) => o.status === "delivered").length;
  const totalSales = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="h-8 w-8" />
          E-Commerce & Delivery Integration
        </h1>
        <p className="text-muted-foreground mt-2">Online menu, order capture, delivery orchestration, and fulfillment management</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{orders.filter((o: any) => o.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{delivered}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-order">
        <CardHeader><CardTitle className="text-base">Create Order</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Order ID" value={newOrder.orderId} onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })} data-testid="input-oid" className="text-sm" />
            <Input placeholder="Email" value={newOrder.customerEmail} onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })} data-testid="input-email" className="text-sm" />
            <Input placeholder="Total $" type="number" value={newOrder.total} onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })} data-testid="input-total" className="text-sm" />
            <Input placeholder="Status" disabled value={newOrder.status} data-testid="input-status" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newOrder)} disabled={createMutation.isPending || !newOrder.orderId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Orders</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : orders.length === 0 ? <p className="text-muted-foreground text-center py-4">No orders</p> : orders.map((o: any) => (
            <div key={o.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`order-${o.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{o.orderId}</p>
                <p className="text-xs text-muted-foreground">{o.customerEmail} • ${o.total}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={o.status === "delivered" ? "default" : "secondary"} className="text-xs">{o.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(o.id)} data-testid={`button-delete-${o.id}`} className="h-7 w-7">
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
