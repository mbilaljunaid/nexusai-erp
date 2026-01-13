import { useQuery } from "@tanstack/react-query";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, PieChart, AlertCircle } from "lucide-react";

export default function BudgetingDashboard() {
  const { data: budgets = [] } = useQuery<any[]>({ queryKey: ["/api/epm/budgets"] });
  const totalBudget = budgets.reduce((sum, b: any) => sum + parseFloat(b.amount || 0), 0);
  const totalSpent = budgets.reduce((sum, b: any) => sum + parseFloat(b.spent || 0), 0);

  return (
    <StandardDashboard
        header={{
            title: "Budget Planning",
            description: "Manage budgets and forecasts"
        }}
    >
          icon={Activity}
          loading={isLoading}
          type="metric"
          className="text-red-600"
          description="Attrition"
        />
        <DashboardWidget
          title="Data Points"
          value={metrics.length}
          icon={TrendingUp}
          loading={isLoading}
          type="metric"
          description="Network Nodes"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardWidget
          title="Revenue by Service"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between" data-testid={`svc-${m.id}`}>
                <span className="font-medium">{m.service || "Service"}</span>
                <span className="font-mono font-bold">${(m.revenue || 0).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Subscriber Growth"
          type="chart"
        >
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between items-center" data-testid={`growth-${m.id}`}>
                <span className="font-medium">{m.plan || "Plan"}</span>
                <Badge variant="default" className="font-mono text-xs">{m.subscribers || 0}+</Badge>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </StandardDashboard >
  );
}
