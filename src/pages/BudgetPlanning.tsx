import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Zap, PieChart, Plus, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { formatNumber } from "@/lib/formatters";

export default function BudgetPlanning() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newBudget, setNewBudget] = useState({ planName: "", department: "Finance", budgetAmount: "", forecastAmount: "" });

  const { data: budgets = [], isLoading } = useQuery<any>({
    queryKey: ["/api/budgets"],
    queryFn: () => fetch("/api/budgets").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/budgets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setNewBudget({ planName: "", department: "Finance", budgetAmount: "", forecastAmount: "" });
      toast({ title: "Budget plan created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/budgets/${data.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
    }
  });

  const totalBudgeted = budgets.reduce((sum: number, b: any) => sum + parseFloat(b.budgetAmount || "0"), 0);
  const totalForecasted = budgets.reduce((sum: number, b: any) => sum + parseFloat(b.forecastAmount || "0"), 0);
  const stats = {
    total: budgets.length,
    active: budgets.filter((b: any) => b.status === "active").length,
    totalBudgeted,
    avgVariance: budgets.length > 0 && totalBudgeted > 0 ? (((totalForecasted - totalBudgeted) / totalBudgeted) * 100).toFixed(1) : "0",
  };

  const handleGridChange = (newData: any[]) => {
    // Find the row that changed
    const changedRow = newData.find((n, i) => JSON.stringify(n) !== JSON.stringify(budgets[i]));
    if (changedRow) {
      updateMutation.mutate(changedRow);
    }
  };

  const columns: SpreadsheetColumn[] = [
    { id: "planName", header: "Plan Name", width: 200 },
    { id: "department", header: "Department", width: 150 },
    {
      id: "budgetAmount",
      header: "Budget Amount",
      width: 150,
      cell: (r, i, update) => (
        <Input
          value={r.budgetAmount}
          onChange={e => update("budgetAmount", e.target.value)}
          onBlur={(e) => handleGridChange(budgets.map((b: any, idx: number) => idx === i ? { ...b, budgetAmount: e.target.value } : b))}
          className="h-8 text-sm"
        />
      )
    },
    {
      id: "forecastAmount",
      header: "Forecast Amount",
      width: 150,
      cell: (r, i, update) => (
        <Input
          value={r.forecastAmount}
          onChange={e => update("forecastAmount", e.target.value)}
          onBlur={(e) => handleGridChange(budgets.map((b: any, idx: number) => idx === i ? { ...b, forecastAmount: e.target.value } : b))}
          className="h-8 text-sm"
        />
      )
    },
    {
      id: "variance",
      header: "Variance",
      width: 120,
      cell: (r) => {
        const b = parseFloat(r.budgetAmount) || 0;
        const f = parseFloat(r.forecastAmount) || 0;
        if (b === 0) return "0%";
        const variance = ((f - b) / b) * 100;
        return <span className={variance > 0 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>{variance > 0 ? "+" : ""}{variance.toFixed(1)}%</span>;
      }
    },
    { id: "status", header: "Status", width: 100 }
  ];

  return (
    <StandardPage
      title="EPM Budget Planning"
      description="Multidimensional driver-based planning with interactive spreadsheet modeling"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export Smart View</Button>
          <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" /> Import Data</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <div><p className="text-xl font-semibold font-mono">${(stats.totalBudgeted / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">Total Budgeted</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate" data-testid="card-variance">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-orange-500" />
              <div><p className="text-xl font-semibold font-mono">{stats.avgVariance}%</p>
                <p className="text-xs text-muted-foreground">Forecast Variance</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6" data-testid="card-new-budget">
        <CardHeader>
          <CardTitle className="text-base">Create Budget Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
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

      <div className="rounded-md border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Planning Grid</h3>
          <p className="text-sm text-muted-foreground">Double-click cells to edit inline.</p>
        </div>
        <InteractiveSpreadsheet
          columns={columns}
          data={budgets}
          isLoading={isLoading}
          onChange={handleGridChange}
        />
      </div>
    </StandardPage>
  );
}
