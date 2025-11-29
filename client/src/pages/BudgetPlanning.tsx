import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Zap, PieChart, Settings, Sliders, BarChart3 as AnalyzeIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";

interface Budget {
  id: string;
  name: string;
  amount: number;
  status: string;
  department: string;
  variance: number;
}

export default function BudgetPlanning() {
  const [activeNav, setActiveNav] = useState("budgets");
  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
    retry: false,
  });

  const stats = {
    total: budgets.length,
    active: budgets.filter((b: any) => b.status === "active").length,
    totalBudgeted: budgets.reduce((sum: number, b: any) => sum + parseFloat(b.amount || "0"), 0),
    variance: budgets.filter((b: any) => b.variance).reduce((sum: number, b: any) => sum + b.variance, 0),
  };

  const navItems = [
    { id: "budgets", label: "Budgets", icon: BarChart3, color: "text-blue-500" },
    { id: "scenarios", label: "Scenarios", icon: Sliders, color: "text-purple-500" },
    { id: "drivers", label: "Drivers", icon: AnalyzeIcon, color: "text-green-500" },
  ];

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

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "budgets" && (
        <div className="space-y-3">
          {budgets.map((budget: any) => (
            <Card key={budget.id} className="hover-elevate cursor-pointer"><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{budget.name}</p>
                  <p className="text-sm text-muted-foreground">${(budget.amount / 1000000).toFixed(1)}M • {budget.department}</p></div>
                <Badge variant={budget.status === "active" ? "default" : "secondary"}>{budget.status}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "scenarios" && <Card><CardContent className="p-6"><p className="text-muted-foreground">What-if scenario analysis and modeling</p></CardContent></Card>}
      {activeNav === "drivers" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Budget drivers and assumptions configuration</p></CardContent></Card>}
    </div>
  );
}
