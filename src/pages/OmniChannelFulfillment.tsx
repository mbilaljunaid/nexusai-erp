import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export default function OmniChannelFulfillment() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/omni-fulfillment"],
    queryFn: () => fetch("/api/omni-fulfillment").then(r => r.json()).catch(() => []),
  });

  const fulfilled = orders.filter((o: any) => o.status === "fulfilled").length;
  const inProgress = orders.filter((o: any) => o.status === "in-progress").length;
  const avgTime = orders.length > 0 ? (orders.reduce((sum: number, o: any) => sum + (parseFloat(o.fulfillmentTime) || 0), 0) / orders.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8" />
          Omni-Channel Fulfillment
        </h1>
        <p className="text-muted-foreground mt-2">Order fulfillment, store pickup, ship-from-store, and cross-channel allocation</p>
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
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
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
            <p className="text-xs text-muted-foreground">Avg Time</p>
            <p className="text-2xl font-bold">{avgTime}h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : orders.length === 0 ? <p className="text-muted-foreground text-center py-4">No orders</p> : orders.map((o: any) => (
            <div key={o.id} className="p-3 border rounded hover-elevate" data-testid={`order-${o.id}`}>
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">{o.orderId || "Order"}</p>
                <Badge variant={o.status === "fulfilled" ? "default" : "secondary"} className="text-xs">{o.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Channel: {o.channel} • Fulfillment: {o.fulfillmentTime}h • Type: {o.fulfillmentType || "ship"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
