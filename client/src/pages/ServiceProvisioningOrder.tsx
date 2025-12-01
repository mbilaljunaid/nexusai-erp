import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ServiceProvisioningOrder() {
  const { toast } = useToast();
  const [newOrder, setNewOrder] = useState({ orderId: "", subscriberId: "", serviceId: "", deviceId: "", status: "pending" });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/service-orders"],
    queryFn: () => fetch("/api/service-orders").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/service-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      setNewOrder({ orderId: "", subscriberId: "", serviceId: "", deviceId: "", status: "pending" });
      toast({ title: "Service order created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/service-orders/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      toast({ title: "Order deleted" });
    },
  });

  const activated = orders.filter((o: any) => o.status === "activated").length;
  const pending = orders.filter((o: any) => o.status === "pending").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8" />
          Service Provisioning & Order Management
        </h1>
        <p className="text-muted-foreground mt-2">Service orders, device provisioning, activation, and status tracking</p>
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
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Activated</p>
            <p className="text-2xl font-bold text-green-600">{activated}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completion %</p>
            <p className="text-2xl font-bold">{orders.length > 0 ? ((activated / orders.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-order">
        <CardHeader><CardTitle className="text-base">Create Service Order</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Order ID" value={newOrder.orderId} onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })} data-testid="input-oid" className="text-sm" />
            <Input placeholder="Subscriber ID" value={newOrder.subscriberId} onChange={(e) => setNewOrder({ ...newOrder, subscriberId: e.target.value })} data-testid="input-subid" className="text-sm" />
            <Input placeholder="Service ID" value={newOrder.serviceId} onChange={(e) => setNewOrder({ ...newOrder, serviceId: e.target.value })} data-testid="input-svcid" className="text-sm" />
            <Input placeholder="Device ID" value={newOrder.deviceId} onChange={(e) => setNewOrder({ ...newOrder, deviceId: e.target.value })} data-testid="input-devid" className="text-sm" />
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
                <p className="text-xs text-muted-foreground">{o.subscriberId} • {o.serviceId} • Device: {o.deviceId}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={o.status === "activated" ? "default" : "secondary"} className="text-xs">{o.status}</Badge>
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
