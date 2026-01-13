import { useQuery } from "@tanstack/react-query";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";
import { TrendingUp, ShoppingCart, DollarSign, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EcommerceBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/ecommerce-metrics"],
    queryFn: () => fetch("/api/ecommerce-metrics").then(r => r.json()).catch(() => []),
  });

  const totalRevenue = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.revenue) || 0), 0);
  const avgOrderValue = metrics.length > 0 ? (totalRevenue / metrics.length).toFixed(2) : 0;
  const conversionRate = metrics.length > 0 ? ((metrics.filter((m: any) => m.converted).length / metrics.length) * 100).toFixed(1) : 0;

  return (
    <StandardDashboard
      header={{
        title: "E-commerce BI & Analytics Dashboard",
        description: "Sales trends, customer insights, inventory health, and campaign ROI"
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget
          title="Total Revenue"
          value={`$${(totalRevenue / 1000).toFixed(1)}K`}
          icon={DollarSign}
          loading={isLoading}
          type="metric"
          description="Gross Sales"
        />
        <DashboardWidget
          title="Avg Order Value"
          value={`$${avgOrderValue}`}
          icon={ShoppingCart}
          loading={isLoading}
          type="metric"
          description="Per transaction"
        />
        <DashboardWidget
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={Percent}
          loading={isLoading}
          type="metric"
          className="text-green-600"
          description="Visitor to Sale"
        />
        <DashboardWidget
          title="Total Orders"
          value={metrics.length}
          icon={TrendingUp}
          loading={isLoading}
          type="metric"
          description="Transaction count"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardWidget
          title="Revenue by Category"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between" data-testid={`metric-${m.id}`}>
                <span className="font-medium">{m.category || "Category"}</span>
                <span className="font-mono font-bold">${(m.revenue || 0).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Top Products"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between items-center" data-testid={`product-${m.id}`}>
                <span className="font-medium">{m.productName || "Product"}</span>
                <Badge variant="secondary" className="font-mono text-xs">{m.units || 0} sold</Badge>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </StandardDashboard>
  );
}
