import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SalesOrderManagement() {
  const { toast } = useToast();
  const [newOrder, setNewOrder] = useState({ orderId: "", customer: "", qty: "100", contractPrice: "50", status: "pending" });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/sales-orders"],
    queryFn: () => fetch("/api/sales-orders").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/sales-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      setNewOrder({ orderId: "", customer: "", qty: "100", contractPrice: "50", status: "pending" });
      toast({ title: "Sales order created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/sales-orders/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      toast({ title: "Order deleted" });
    },
  });

  const confirmed = orders.filter((o: any) => o.status === "confirmed").length;
  const totalValue = orders.reduce((sum: number, o: any) => sum + ((parseFloat(o.qty) || 0) * (parseFloat(o.contractPrice) || 0)), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          B2B Sales Order Management
        </h1>
        <p className="text-muted-foreground mt-2">Sales quotations, contracts, blanket orders, and fulfillment</p>
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
            <p className="text-xs text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{confirmed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">${(totalValue / 1000000).toFixed(2)}M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{orders.length - confirmed}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-order">
        <CardHeader><CardTitle className="text-base">Create Sales Order</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Order ID" value={newOrder.orderId} onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })} data-testid="input-orderid" className="text-sm" />
            <Input placeholder="Customer" value={newOrder.customer} onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })} data-testid="input-customer" className="text-sm" />
            <Input placeholder="Qty" type="number" value={newOrder.qty} onChange={(e) => setNewOrder({ ...newOrder, qty: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Input placeholder="Contract Price" type="number" value={newOrder.contractPrice} onChange={(e) => setNewOrder({ ...newOrder, contractPrice: e.target.value })} data-testid="input-price" className="text-sm" />
            <Button disabled={createMutation.isPending || !newOrder.orderId} size="sm" data-testid="button-create-order">
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
                <p className="font-semibold">{o.orderId} - {o.customer}</p>
                <p className="text-xs text-muted-foreground">{o.qty} @ ${o.contractPrice} = ${(o.qty * o.contractPrice).toFixed(0)}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={o.status === "confirmed" ? "default" : "secondary"} className="text-xs">{o.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${o.id}`} className="h-7 w-7">
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
