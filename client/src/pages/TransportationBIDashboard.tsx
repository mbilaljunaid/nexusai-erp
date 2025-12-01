import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function TransportationBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/tl-analytics"]
    
  });

  const totalShipments = metrics.reduce((sum: number, m: any) => sum + (parseInt(m.shipments) || 0), 0);
  const avgCostPerKm = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.costPerKm) || 0), 0) / metrics.length).toFixed(2) : 0;
  const onTimeDelivery = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.onTimePercent) || 0), 0) / metrics.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Transportation BI & Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">On-time delivery, fleet utilization, cost per km, carrier SLA compliance, and KPIs</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Shipments</p>
            <p className="text-2xl font-bold">{(totalShipments / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">On-Time %</p>
            <p className="text-2xl font-bold text-green-600">{onTimeDelivery}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Cost/km</p>
            <p className="text-2xl font-bold">${avgCostPerKm}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Data Points</p>
            <p className="text-2xl font-bold">{metrics.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Performance by Lane</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between" data-testid={`lane-${m.id}`}>
                <span>{m.lane || "Lane"}</span>
                <span className="font-bold">{m.onTimePercent || 0}%</span>
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
                <Badge variant="default" className="text-xs">{m.slaScore || 0}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
