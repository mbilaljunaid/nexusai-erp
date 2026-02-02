import { useQuery } from "@tanstack/react-query";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock, CheckCircle, Package } from "lucide-react";

export default function LogisticsBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/logistics-bi"],
    queryFn: () => fetch("/api/logistics-bi").then(r => r.json()).catch(() => []),
  });

  const totalCost = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.cost) || 0), 0);
  const avgDeliveryTime = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.deliveryTime) || 0), 0) / metrics.length).toFixed(1) : 0;
  const onTimeRate = metrics.length > 0 ? ((metrics.filter((m: any) => m.onTime).length / metrics.length) * 100).toFixed(1) : 0;

  return (
    <StandardDashboard
      header={{
        title: "Logistics BI & Analytics Dashboard",
        description: "Warehouse utilization, fleet performance, on-time delivery, and cost analysis"
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget
          title="Total Cost"
          value={`$${(totalCost / 1000).toFixed(1)}K`}
          icon={DollarSign}
          loading={isLoading}
          type="metric"
          description="Operation costs"
        />
        <DashboardWidget
          title="Avg Delivery Time"
          value={`${avgDeliveryTime}h`}
          icon={Clock}
          loading={isLoading}
          type="metric"
          description="Lead time"
        />
        <DashboardWidget
          title="On-Time Rate"
          value={`${onTimeRate}%`}
          icon={CheckCircle}
          loading={isLoading}
          type="metric"
          className="text-green-600"
          description="Performance KPI"
        />
        <DashboardWidget
          title="Shipments"
          value={metrics.length}
          icon={Package}
          loading={isLoading}
          type="metric"
          description="Total handled"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardWidget
          title="Warehouse Utilization"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between" data-testid={`wh-${m.id}`}>
                <span className="font-medium">{m.warehouse || "Warehouse"}</span>
                <span className="font-mono font-bold">{m.utilization || 0}%</span>
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
                <Badge variant={m.onTime ? "default" : "secondary"} className="text-xs">{m.onTime ? "On-Time" : "Late"}</Badge>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </StandardDashboard>
  );
}
