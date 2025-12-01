import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function LogisticsBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/logistics-bi"]
    
  });

  const totalCost = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.cost) || 0), 0);
  const avgDeliveryTime = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.deliveryTime) || 0), 0) / metrics.length).toFixed(1) : 0;
  const onTimeRate = metrics.length > 0 ? ((metrics.filter((m: any) => m.onTime).length / metrics.length) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Logistics BI & Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Warehouse utilization, fleet performance, on-time delivery, and cost analysis</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-bold">${(totalCost / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Delivery Time</p>
            <p className="text-2xl font-bold">{avgDeliveryTime}h</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">On-Time Rate</p>
            <p className="text-2xl font-bold text-green-600">{onTimeRate}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Shipments</p>
            <p className="text-2xl font-bold">{metrics.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Warehouse Utilization</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between" data-testid={`wh-${m.id}`}>
                <span>{m.warehouse || "Warehouse"}</span>
                <span className="font-bold">{m.utilization || 0}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Carrier Performance</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between items-center" data-testid={`carrier-${m.id}`}>
                <span>{m.carrier || "Carrier"}</span>
                <Badge variant={m.onTime ? "default" : "secondary"} className="text-xs">{m.onTime ? "On-Time" : "Late"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
