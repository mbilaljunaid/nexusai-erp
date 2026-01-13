import { useQuery } from "@tanstack/react-query";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export default function RetailAnalyticsDashboard() {
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ["/api/retail-analytics"],
    queryFn: () => fetch("/api/retail-analytics").then(r => r.json()).catch(() => []),
  });

  const totalRevenue = analytics.reduce((sum: number, a: any) => sum + (parseFloat(a.revenue) || 0), 0);
  const avgMargin = analytics.length > 0 ? (analytics.reduce((sum: number, a: any) => sum + (parseFloat(a.margin) || 0), 0) / analytics.length).toFixed(1) : 0;

  return (
    <StandardDashboard
      header={{
        title: "Retail Analytics & BI Dashboards",
        description: "Sales by store/channel, margin analysis, inventory turns, customer insights"
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget
          title="Total Revenue"
          value={`$${(totalRevenue / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          loading={isLoading}
          type="metric"
          className="text-green-600"
          description="Gross Sales Revenue"
        />
        <DashboardWidget
          title="Avg Margin"
          value={`${avgMargin}%`}
          icon={TrendingUp}
          loading={isLoading}
          type="metric"
          description="Profitability"
        />
        <DashboardWidget
          title="Active Dashboards"
          value={analytics.length}
          icon={BarChart3}
          loading={isLoading}
          type="metric"
          description="Reports Generated"
        />
        <DashboardWidget
          title="Customer Segments"
          value="5"
          icon={Users}
          loading={isLoading}
          type="metric"
          description="Analyzed Groups"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <DashboardWidget
          title="Key Metrics"
          type="chart"
          className="col-span-1"
        >
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading metrics...</p>
            ) : analytics.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No data available</p>
            ) : (
              analytics.map((a: any) => (
                <div key={a.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-semibold">{a.metric || "Metric"}</p>
                    <p className="text-xs text-muted-foreground">{a.period || "Period"}</p>
                  </div>
                  <span className="font-mono font-bold">{a.value || 0}</span>
                </div>
              ))
            )}
          </div>
        </DashboardWidget>
      </div>
    </StandardDashboard>
  );
}
