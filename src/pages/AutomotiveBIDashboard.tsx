import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, PenTool } from "lucide-react";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";

export default function AutomotiveBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/auto-analytics"],
    queryFn: () => fetch("/api/auto-analytics").then(r => r.json()).catch(() => []),
  });

  const totalSales = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.salesAmount) || 0), 0);
  const avgMargin = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.margin) || 0), 0) / metrics.length).toFixed(1) : 0;
  const serviceRevenue = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.serviceRevenue) || 0), 0);

  return (
    <StandardDashboard
      header={{
        title: "Automotive BI & Analytics Dashboard",
        description: "Sales by model, margins, service ROI, technician efficiency, and KPIs"
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget
          title="Total Sales"
          value={`$${(totalSales / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          loading={isLoading}
          type="metric"
          description="Gross Sales Revenue"
        />
        <DashboardWidget
          title="Avg Margin"
          value={`${avgMargin}%`}
          icon={TrendingUp}
          loading={isLoading}
          type="metric"
          className="text-green-600"
          description="Profitability"
        />
        <DashboardWidget
          title="Service Revenue"
          value={`$${(serviceRevenue / 1000).toFixed(0)}K`}
          icon={PenTool}
          loading={isLoading}
          type="metric"
          description="After-sales income"
        />
        <DashboardWidget
          title="Data Points"
          value={metrics.length}
          icon={BarChart3}
          loading={isLoading}
          type="metric"
          description="Analyzed records"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardWidget
          title="Sales by Model"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between items-center" data-testid={`model-${m.id}`}>
                <span className="font-medium">{m.model || "Model"}</span>
                <span className="font-mono font-bold">${(m.salesAmount || 0) / 1000}K</span>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Service Metrics"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between items-center" data-testid={`service-${m.id}`}>
                <span className="font-medium">{m.serviceType || "Service"}</span>
                <Badge variant="secondary" className="font-mono">${m.serviceRevenue || 0}K</Badge>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </StandardDashboard>
  );
}
