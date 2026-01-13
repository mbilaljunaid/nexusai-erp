import { useQuery } from "@tanstack/react-query";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Truck, CheckCircle, DollarSign } from "lucide-react";

export default function TransportationBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/tl-analytics"],
    queryFn: () => fetch("/api/tl-analytics").then(r => r.json()).catch(() => []),
  });

  const totalShipments = metrics.reduce((sum: number, m: any) => sum + (parseInt(m.shipments) || 0), 0);
  const avgCostPerKm = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.costPerKm) || 0), 0) / metrics.length).toFixed(2) : 0;
  const onTimeDelivery = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.onTimePercent) || 0), 0) / metrics.length).toFixed(1) : 0;

  return (
    <StandardDashboard
      header={{
        title: "Transportation BI & Analytics Dashboard",
        description: "On-time delivery, fleet utilization, cost per km, carrier SLA compliance, and KPIs"
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget
          title="Total Shipments"
          value={`${(totalShipments / 1000).toFixed(1)}K`}
          icon={Truck}
          loading={isLoading}
          type="metric"
          description="Completed Deliveries"
        />
        <DashboardWidget
          title="On-Time %"
          value={`${onTimeDelivery}%`}
          icon={CheckCircle}
          loading={isLoading}
          type="metric"
          className="text-green-600"
          description="Performance KPI"
        />
        <DashboardWidget
          title="Cost/km"
          value={`$${avgCostPerKm}`}
          icon={DollarSign}
          loading={isLoading}
          type="metric"
          description="Avg Route Cost"
        />
        <DashboardWidget
          title="Data Points"
          value={metrics.length}
          icon={TrendingUp}
          loading={isLoading}
          type="metric"
          description="Active Trackers"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardWidget
          title="Performance by Lane"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between" data-testid={`lane-${m.id}`}>
                <span className="font-medium">{m.lane || "Lane"}</span>
                <span className="font-mono font-bold">{m.onTimePercent || 0}%</span>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Carrier Performance"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between items-center" data-testid={`carrier-${m.id}`}>
                <span className="font-medium">{m.carrier || "Carrier"}</span>
                <Badge variant="default" className="font-mono text-xs">{m.slaScore || 0}</Badge>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </StandardDashboard>
  );
}
