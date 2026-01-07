import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function BudgetingDashboard() {
  const { data: budgets = [] } = useQuery<any[]>({ queryKey: ["/api/epm/budgets"] });
  const totalBudget = budgets.reduce((sum, b: any) => sum + parseFloat(b.amount || 0), 0);
  const totalSpent = budgets.reduce((sum, b: any) => sum + parseFloat(b.spent || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><TrendingUp className="w-8 h-8" />Budget Planning</h1>
        <p className="text-muted-foreground">Manage budgets and forecasts</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Budget</p><p className="text-2xl font-bold">${totalBudget.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Spent</p><p className="text-2xl font-bold text-orange-600">${totalSpent.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Remaining</p><p className="text-2xl font-bold text-green-600">${(totalBudget - totalSpent).toFixed(2)}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Budgets</CardTitle></CardHeader><CardContent><div className="space-y-2">{budgets.map((b: any) => (<div key={b.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{b.department}</p><p className="text-sm text-muted-foreground">Period: {b.period}</p></div><div className="text-right"><p className="font-semibold">${b.amount}</p><Badge variant={parseFloat(b.spent) > parseFloat(b.amount) ? "destructive" : "default"}>{((parseFloat(b.spent) / parseFloat(b.amount)) * 100).toFixed(0)}%</Badge></div></div>))}</div></CardContent></Card>
    </div>
  );
}
