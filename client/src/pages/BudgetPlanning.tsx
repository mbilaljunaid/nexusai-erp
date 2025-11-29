import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Zap, PieChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function BudgetPlanning() {
  const { data: budgets = [] } = useQuery({
    queryKey: ["/api/budgets"],
    retry: false,
  });

  const stats = {
    total: budgets.length,
    active: budgets.filter((b: any) => b.status === "active").length,
    totalBudgeted: budgets.reduce((sum: number, b: any) => sum + parseFloat(b.amount || "0"), 0),
    variance: budgets.filter((b: any) => b.variance).reduce((sum: number, b: any) => sum + b.variance, 0),
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Budget Planning</h1>
        <p className="text-muted-foreground text-sm">Driver-based planning and scenario modeling</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Budgets</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-500" />
            <div><p className="text-2xl font-semibold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold font-mono">${(stats.totalBudgeted / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Total</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <PieChart className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold font-mono">{(stats.variance).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Avg Variance</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="budgets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>
        <TabsContent value="budgets">
          {budgets.map((budget: any) => (
            <Card key={budget.id}><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{budget.name}</p>
                  <p className="text-sm text-muted-foreground">${(budget.amount / 1000000).toFixed(1)}M • {budget.department}</p></div>
                <Badge variant={budget.status === "active" ? "default" : "secondary"}>{budget.status}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="scenarios"><p className="text-muted-foreground">What-if scenario analysis and modeling</p></TabsContent>
        <TabsContent value="drivers"><p className="text-muted-foreground">Budget drivers and assumptions configuration</p></TabsContent>
      </Tabs>
    </div>
  );
}
