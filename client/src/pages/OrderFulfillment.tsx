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

export default function OrderFulfillment() {
  const { toast } = useToast();
  const [newOrder, setNewOrder] = useState({ orderId: "", channel: "web", status: "allocated", priority: "normal" });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/fulfillment"],
    queryFn: () => fetch("/api/fulfillment").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/fulfillment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fulfillment"] });
      setNewOrder({ orderId: "", channel: "web", status: "allocated", priority: "normal" });
      toast({ title: "Order created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/fulfillment/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fulfillment"] });
      toast({ title: "Order deleted" });
    },
  });

  const shipped = orders.filter((o: any) => o.status === "shipped").length;
  const highPriority = orders.filter((o: any) => o.priority === "urgent").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Order Fulfillment & Distribution
        </h1>
        <p className="text-muted-foreground mt-2">Omni-channel order allocation and fulfillment</p>
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
            <p className="text-xs text-muted-foreground">Shipped</p>
            <p className="text-2xl font-bold text-green-600">{shipped}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Urgent</p>
            <p className="text-2xl font-bold text-red-600">{highPriority}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Fulfillment %</p>
            <p className="text-2xl font-bold">{orders.length > 0 ? ((shipped / orders.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-order">
        <CardHeader><CardTitle className="text-base">Create Order</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Input placeholder="Order ID" value={newOrder.orderId} onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })} data-testid="input-order-id" />
            <Select value={newOrder.channel} onValueChange={(v) => setNewOrder({ ...newOrder, channel: v })}>
              <SelectTrigger data-testid="select-channel"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="b2b">B2B</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newOrder.status} onValueChange={(v) => setNewOrder({ ...newOrder, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="picking">Picking</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newOrder.priority} onValueChange={(v) => setNewOrder({ ...newOrder, priority: v })}>
              <SelectTrigger data-testid="select-priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newOrder)} disabled={createMutation.isPending || !newOrder.orderId} className="w-full" data-testid="button-create-order">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Orders</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : orders.length === 0 ? <p className="text-muted-foreground text-center py-4">No orders</p> : orders.map((o: any) => (
            <div key={o.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`order-${o.id}`}>
              <div>
                <p className="font-semibold text-sm">{o.orderId}</p>
                <p className="text-xs text-muted-foreground">{o.channel} • {o.status}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={o.priority === "urgent" ? "destructive" : "default"}>{o.priority}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(o.id)} data-testid={`button-delete-${o.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
