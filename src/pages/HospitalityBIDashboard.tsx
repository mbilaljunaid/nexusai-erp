import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Building2, DollarSign, Users } from "lucide-react";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";

export default function HospitalityBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/hospitality-bi"],
    queryFn: () => fetch("/api/hospitality-bi").then(r => r.json()).catch(() => []),
  });

  const totalRevenue = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.revenue) || 0), 0);
  const avgOccupancy = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.occupancy) || 0), 0) / metrics.length).toFixed(1) : 0;

  return (
    <StandardDashboard
      header={{
        title: "Hospitality BI & Analytics Dashboard",
        description: "Occupancy, ADR, RevPAR, F&B sales, housekeeping efficiency, and KPIs"
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget
          title="Total Revenue"
          value={`$${(totalRevenue / 1000).toFixed(1)}K`}
          icon={DollarSign}
          loading={isLoading}
          type="metric"
          description="Gross Income"
        />
        <DashboardWidget
          title="Avg Occupancy"
          value={`${avgOccupancy}%`}
          icon={Users}
          loading={isLoading}
          type="metric"
          description="Room utilization"
        />
        <DashboardWidget
          title="Data Points"
          value={metrics.length}
          icon={BarChart3}
          loading={isLoading}
          type="metric"
          description="Total records"
        />
        <DashboardWidget
          title="Properties"
          value={new Set(metrics.map((m: any) => m.property)).size}
          icon={Building2}
          loading={isLoading}
          type="metric"
          description="Active Locations"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardWidget
          title="Property Performance"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between" data-testid={`prop-${m.id}`}>
                <span>{m.property || "Property"}</span>
                <span className="font-bold">{m.occupancy || 0}%</span>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="F&B Performance"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between items-center" data-testid={`fb-${m.id}`}>
                <span>{m.outlet || "Outlet"}</span>
                <Badge variant="default" className="text-xs">${m.revenue || 0}</Badge>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </StandardDashboard>
  );
}
