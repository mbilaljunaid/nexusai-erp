import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OmniChannelOrders() {
  const { toast } = useToast();
  const [newOrder, setNewOrder] = useState({ orderId: "", channel: "web", fulfillmentType: "ship", status: "pending" });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/omni-orders"],
    queryFn: () => fetch("/api/omni-orders").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/omni-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/omni-orders"] });
      setNewOrder({ orderId: "", channel: "web", fulfillmentType: "ship", status: "pending" });
      toast({ title: "Order created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/omni-orders/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/omni-orders"] });
      toast({ title: "Order deleted" });
    },
  });

  const fulfilled = orders.filter((o: any) => o.status === "fulfilled").length;
  const bopis = orders.filter((o: any) => o.fulfillmentType === "pickup").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="h-8 w-8" />
          Omnichannel Order Management
        </h1>
        <p className="text-muted-foreground mt-2">Web, mobile, POS, marketplace orders with ATP and fulfillment orchestration</p>
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
            <p className="text-xs text-muted-foreground">Fulfilled</p>
            <p className="text-2xl font-bold text-green-600">{fulfilled}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">BOPIS (Pickup)</p>
            <p className="text-2xl font-bold text-blue-600">{bopis}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{orders.filter((o: any) => o.status === "pending").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-order">
        <CardHeader><CardTitle className="text-base">Create Order</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Order ID" value={newOrder.orderId} onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })} data-testid="input-orderid" className="text-sm" />
            <Select value={newOrder.channel} onValueChange={(v) => setNewOrder({ ...newOrder, channel: v })}>
              <SelectTrigger data-testid="select-channel" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newOrder.fulfillmentType} onValueChange={(v) => setNewOrder({ ...newOrder, fulfillmentType: v })}>
              <SelectTrigger data-testid="select-fulfill" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ship">Ship</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="ship-from-store">Ship from Store</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newOrder.status} onValueChange={(v) => setNewOrder({ ...newOrder, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
              </SelectContent>
            </Select>
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
                <p className="font-semibold">{o.orderId}</p>
                <p className="text-xs text-muted-foreground">{o.channel} • {o.fulfillmentType}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="default" className="text-xs">{o.status}</Badge>
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
