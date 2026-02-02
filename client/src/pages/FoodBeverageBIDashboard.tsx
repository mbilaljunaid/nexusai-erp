import { useQuery } from "@tanstack/react-query";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, Trash2 } from "lucide-react";

export default function FoodBeverageBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/fb-analytics"],
    queryFn: () => fetch("/api/fb-analytics").then(r => r.json()).catch(() => []),
  });

  const totalSales = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.sales) || 0), 0);
  const avgFoodCost = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.foodCostPct) || 0), 0) / metrics.length).toFixed(1) : 0;
  const avgWaste = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.wastePct) || 0), 0) / metrics.length).toFixed(1) : 0;

  return (
    <StandardDashboard
      header={{
        title: "Food & Beverage BI & Analytics",
        description: "Sales by menu item, food cost, waste trends, batch yield, supplier metrics, and KPIs"
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget
          title="Total Sales"
          value={`$${(totalSales / 1000).toFixed(1)}K`}
          icon={DollarSign}
          loading={isLoading}
          type="metric"
          description="Gross Revenue"
        />
        <DashboardWidget
          title="Avg Food Cost %"
          value={`${avgFoodCost}%`}
          icon={TrendingUp}
          loading={isLoading}
          type="metric"
          description="Cost of Goods Sold"
        />
        <DashboardWidget
          title="Avg Waste %"
          value={`${avgWaste}%`}
          icon={Trash2}
          loading={isLoading}
          type="metric"
          className="text-red-600"
          description="Spoilage & Loss"
        />
        <DashboardWidget
          title="Data Points"
          value={metrics.length}
          icon={BarChart3}
          loading={isLoading}
          type="metric"
          description="Tracked Items"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardWidget
          title="Sales by Item"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between" data-testid={`item-${m.id}`}>
                <span className="font-medium">{m.menuItem || "Item"}</span>
                <span className="font-mono font-bold">${m.sales || 0}</span>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Outlet Performance"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between items-center" data-testid={`outlet-${m.id}`}>
                <span className="font-medium">{m.outlet || "Outlet"}</span>
                <Badge variant="default" className="font-mono text-xs">{m.foodCostPct || 0}% FC</Badge>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </StandardDashboard>
  );
}
