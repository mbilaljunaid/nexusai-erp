import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Plus, TrendingUp, Zap, AlertCircle, DollarSign, PieChart, Shield, BarChart3, ChevronRight, GitBranch, RefreshCw } from "lucide-react";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";
import { formatNumber } from '@/lib/formatters';

const epmModules = [
  { title: "Budget Controls", description: "Rules and thresholds for budget enforcement", href: "/finance/epm/budget-controls", icon: Shield },
  { title: "Variance Analysis", description: "Budget vs. actual variance workbench", href: "/finance/epm/variance-analysis", icon: BarChart3 },
  { title: "Scenario Comparison", description: "Compare Budget, Forecast, and Actuals", href: "/finance/epm/scenarios", icon: Zap },
  { title: "Budget Reconciliation", description: "Reconcile budget entries and carry-forwards", href: "/finance/epm/budget-reconciliation", icon: RefreshCw },
  { title: "Budget Workflow", description: "Submit and approve budgets", href: "/finance/epm/workflow", icon: GitBranch },
  { title: "Budget Allocation", description: "Allocate budgets across cost centers", href: "/finance/epm/allocations", icon: PieChart },
  { title: "ESG & Sustainability", description: "Environmental, social, and governance metrics", href: "/epm/esg", icon: TrendingUp },
];

export default function EPMPage() {
  const [activeNav, setActiveNav] = useState("budget");
  const [ledgerId, setLedgerId] = useState<string | undefined>();

  const scopeHeaders = buildScopeHeaders({ "set": ledgerId });

  // Live budget controls (budget tab)
  const { data: budgetControls } = useQuery<any[]>({
    queryKey: ["/api/epm/budget/controls", ledgerId],
    queryFn: () =>
      fetch("/api/epm/budget/controls", { headers: { ...scopeHeaders, "x-ledger-id": ledgerId ?? "" } })
        .then(r => r.json())
        .catch(() => []),
    select: (data) => Array.isArray(data) ? data : [],
  });

  // Live variance report (budget tab chart)
  const { data: varianceRows } = useQuery<any[]>({
    queryKey: ["/api/epm/budget/variance", ledgerId],
    queryFn: () =>
      fetch("/api/epm/budget/variance", { headers: { ...scopeHeaders, "x-ledger-id": ledgerId ?? "" } })
        .then(r => r.json())
        .catch(() => []),
    select: (data) => Array.isArray(data) ? data : [],
  });

  // Build chart data from variance rows or fall back to static sample
  const budgetChartData = (varianceRows && varianceRows.length > 0)
    ? varianceRows.slice(0, 6).map(r => ({
      name: r.cost_center ?? r.gl_account ?? "—",
      budgeted: Number(r.budget_amount ?? 0),
      actual: Number(r.actual_amount ?? 0),
      variance: Number(r.available ?? 0),
    }))
    : [
      { name: "Jan", budgeted: 100000, actual: 98000, variance: -2000 },
      { name: "Feb", budgeted: 105000, actual: 107500, variance: 2500 },
      { name: "Mar", budgeted: 110000, actual: 109000, variance: -1000 },
    ];

  const forecastData = [
    { period: "Q1", revenue: 450000, expenses: 320000, profit: 130000 },
    { period: "Q2", revenue: 520000, expenses: 350000, profit: 170000 },
    { period: "Q3", revenue: 580000, expenses: 380000, profit: 200000 },
    { period: "Q4", revenue: 620000, expenses: 400000, profit: 220000 },
  ];

  const scenarios = [
    { name: "Base Case", revenue: 2170000, expenses: 1450000, profit: 720000, probability: 0.6 },
    { name: "Optimistic", revenue: 2500000, expenses: 1350000, profit: 1150000, probability: 0.25 },
    { name: "Pessimistic", revenue: 1800000, expenses: 1600000, profit: 200000, probability: 0.15 },
  ];

  const navItems = [
    { id: "budget", label: "Budget", icon: DollarSign, color: "text-blue-500" },
    { id: "forecast", label: "Forecast", icon: TrendingUp, color: "text-green-500" },
    { id: "scenarios", label: "Scenarios", icon: Zap, color: "text-purple-500" },
    { id: "allocation", label: "Allocation", icon: PieChart, color: "text-orange-500" },
  ];

  return (
    <StandardPage
      title="Enterprise Performance Management"
      description="Budget planning, forecasting & scenario modeling"
      actions={
        <div className="flex items-center gap-3">
          <EnterpriseContextSwitcher
            type="set"
            value={ledgerId}
            onChange={setLedgerId}
          />
          <Button data-testid="button-new-budget">
            <Plus className="h-4 w-4 mr-2" />
            New Budget
          </Button>
        </div>
      }
    >

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {/* EPM Module Navigation Cards */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">EPM Modules</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {epmModules.map((mod) => (
            <Link key={mod.href} to={mod.href}>
              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3">
                  <CardTitle className="text-xs font-medium">{mod.title}</CardTitle>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <mod.icon className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground leading-tight">{mod.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {activeNav === "budget" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual{ledgerId ? " — Ledger Filtered" : ""}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="budgeted" stroke="#3b82f6" name="Budgeted" />
                  <Line type="monotone" dataKey="actual" stroke="#ef4444" name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Live budget controls table */}
          {budgetControls && budgetControls.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Budget Controls</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {budgetControls.slice(0, 8).map((ctrl: any, i: number) => {
                    const util = Number(ctrl.utilization_pct ?? 0);
                    return (
                      <div key={i} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{ctrl.cost_center} / {ctrl.gl_account}</p>
                          <p className="text-xs text-muted-foreground">{ctrl.period} · {ctrl.budget_version}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm">${formatNumber(Number(ctrl.actual_amount ?? 0))} / ${formatNumber(Number(ctrl.budget_amount ?? 0))}</p>
                          <Badge variant={util > 100 ? "destructive" : util > 80 ? "secondary" : "default"}>
                            {util.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeNav === "forecast" && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" />
                <Bar dataKey="expenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {activeNav === "scenarios" && (
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <Card key={scenario.name}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{scenario.name}</p>
                    <p className="text-sm text-muted-foreground">Profit: ${(scenario.profit / 1000000).toFixed(2)}M</p>
                  </div>
                  <Badge>{(scenario.probability * 100).toFixed(0)}% probability</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "allocation" && (
        <Card>
          <CardHeader>
            <CardTitle>Department Allocation{ledgerId ? " — Ledger Filtered" : ""}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(budgetControls && budgetControls.length > 0
                ? budgetControls.slice(0, 5).map((ctrl: any) => ({
                  dept: ctrl.cost_center ?? "—",
                  allocated: Number(ctrl.budget_amount ?? 0),
                  utilized: Number(ctrl.actual_amount ?? 0),
                }))
                : [
                  { dept: "Sales", allocated: 250000, utilized: 235000 },
                  { dept: "Engineering", allocated: 300000, utilized: 298000 },
                  { dept: "Marketing", allocated: 150000, utilized: 142000 },
                ]
              ).map((item) => (
                <div key={item.dept} className="flex justify-between items-center p-2 border rounded">
                  <p className="text-sm font-medium">{item.dept}</p>
                  <p className="text-sm">${(item.utilized / 1000).toFixed(0)}K / ${(item.allocated / 1000).toFixed(0)}K</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </StandardPage>
  );
}
