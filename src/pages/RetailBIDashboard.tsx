import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, DollarSign, CreditCard } from "lucide-react";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";

export default function RetailBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/retail-bi"],
    queryFn: () => fetch("/api/retail-bi").then(r => r.json()).catch(() => []),
  });

  const totalRevenue = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.revenue) || 0), 0);
  const avgTicket = metrics.length > 0 ? (totalRevenue / metrics.length).toFixed(2) : 0;
  const loyaltyEnrollment = metrics.length > 0 ? ((metrics.filter((m: any) => m.loyaltyEnrolled).length / metrics.length) * 100).toFixed(1) : 0;

  return (
    <StandardDashboard
      header={{
        title: "Retail BI & Analytics Dashboard",
        description: "Sales trends, inventory health, loyalty performance, and channel analytics"
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
          title="Avg Ticket"
          value={`$${avgTicket}`}
          icon={CreditCard}
          loading={isLoading}
          type="metric"
          description="Per transaction"
        />
        <DashboardWidget
          title="Loyalty Enroll %"
          value={`${loyaltyEnrollment}%`}
          icon={Users}
          loading={isLoading}
          type="metric"
          className="text-green-600"
          description="Member penetration"
        />
        <DashboardWidget
          title="Transactions"
          value={metrics.length}
          icon={BarChart3}
          loading={isLoading}
          type="metric"
          description="Total Sales Count"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardWidget
          title="Sales by Channel"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between" data-testid={`metric-${m.id}`}>
                <span className="font-medium">{m.channel || "Channel"}</span>
                <span className="font-mono font-bold">${(m.revenue || 0).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Top Stores"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between items-center" data-testid={`store-${m.id}`}>
                <span className="font-medium">{m.storeName || "Store"}</span>
                <Badge variant="secondary" className="font-mono text-xs">${(m.revenue || 0).toFixed(0)}</Badge>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </StandardDashboard>
  );
}
