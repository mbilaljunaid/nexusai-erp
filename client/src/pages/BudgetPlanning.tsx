import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Zap, PieChart, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BudgetPlanning() {
  const { toast } = useToast();
  const [newBudget, setNewBudget] = useState({ planName: "", department: "Finance", budgetAmount: "", forecastAmount: "" });

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["/api/budgets"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/budgets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setNewBudget({ planName: "", department: "Finance", budgetAmount: "", forecastAmount: "" });
      toast({ title: "Budget plan created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/budgets/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({ title: "Budget deleted" });
    }
  });

  const totalBudgeted = budgets.reduce((sum: number, b: any) => sum + parseFloat(b.budgetAmount || "0"), 0);
  const totalForecasted = budgets.reduce((sum: number, b: any) => sum + parseFloat(b.forecastAmount || "0"), 0);
  const stats = {
    total: budgets.length
    active: budgets.filter((b: any) => b.status === "active").length
    totalBudgeted
    avgVariance: budgets.length > 0 && totalBudgeted > 0 ? ((totalForecasted / totalBudgeted) * 100).toFixed(1) : "0"
  };

  return (
    <div className="space-y-6 p-4" data-testid="budget-planning">
      <div>
        <h1 className="text-3xl font-semibold">Budget Planning</h1>
        <p className="text-muted-foreground text-sm">Driver-based planning and scenario modeling</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate" data-testid="card-total-budgets">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div><p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Budgets</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate" data-testid="card-active">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div><p className="text-2xl font-semibold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate" data-testid="card-total-amount">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div><p className="text-2xl font-semibold font-mono">${(stats.totalBudgeted / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Total</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate" data-testid="card-variance">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-orange-500" />
              <div><p className="text-2xl font-semibold font-mono">{stats.avgVariance}%</p>
                <p className="text-xs text-muted-foreground">Avg Variance</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-budget">
        <CardHeader>
          <CardTitle className="text-base">Create Budget Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Plan name" value={newBudget.planName} onChange={(e) => setNewBudget({ ...newBudget, planName: e.target.value })} data-testid="input-plan-name" />
            <Select value={newBudget.department} onValueChange={(v) => setNewBudget({ ...newBudget, department: v })}>
              <SelectTrigger data-testid="select-department">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Budget amount" type="number" value={newBudget.budgetAmount} onChange={(e) => setNewBudget({ ...newBudget, budgetAmount: e.target.value })} data-testid="input-budget-amount" />
            <Input placeholder="Forecast amount" type="number" value={newBudget.forecastAmount} onChange={(e) => setNewBudget({ ...newBudget, forecastAmount: e.target.value })} data-testid="input-forecast-amount" />
          </div>
          <Button onClick={() => createMutation.mutate(newBudget)} disabled={createMutation.isPending || !newBudget.planName} className="w-full" data-testid="button-create-budget">
            <Plus className="w-4 h-4 mr-2" /> Create Budget
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No budgets created yet</div>
          ) : (
            budgets.map((budget: any) => (
              <div key={budget.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`budget-item-${budget.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{budget.planName}</p>
                  <p className="text-sm text-muted-foreground">${(budget.budgetAmount / 1000000).toFixed(1)}M • {budget.department}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={budget.status === "active" ? "default" : "secondary"}>{budget.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(budget.id)} data-testid={`button-delete-${budget.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
