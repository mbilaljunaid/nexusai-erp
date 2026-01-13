import { useQuery } from "@tanstack/react-query";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, PieChart, Activity } from "lucide-react";

export default function BudgetingDashboard() {
  const { data: budgets = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/epm/budgets"] });
  const totalBudget = budgets.reduce((sum, b: any) => sum + parseFloat(b.amount || 0), 0);
  const totalSpent = budgets.reduce((sum, b: any) => sum + parseFloat(b.spent || 0), 0);

  return (
    <StandardDashboard
      header={{
        title: "Budget Planning",
        description: "Manage budgets and forecasts"
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardWidget
          title="Total Budget"
          value={`$${totalBudget.toLocaleString()}`}
          icon={DollarSign}
          description="Total allocated budget"
        />
        <DashboardWidget
          title="Total Spent"
          value={`$${totalSpent.toLocaleString()}`}
          icon={Activity}
          description="Total utilization"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardWidget title="Budgets by Department">
          <div className="space-y-2 mt-2">
            {isLoading ? <p>Loading...</p> : budgets.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : budgets.slice(0, 5).map((b: any) => (
              <div key={b.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex justify-between" data-testid={`budget-${b.id}`}>
                <span className="font-medium">{b.department || "General"}</span>
                <span className="font-mono font-bold">${parseFloat(b.amount || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </StandardDashboard>
  );
}
