import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Plus, TrendingUp, Zap, AlertCircle, DollarSign, PieChart } from "lucide-react";

export default function EPMPage() {
  const [activeNav, setActiveNav] = useState("budget");

  const budgetData = [
    { month: "Jan", budgeted: 100000, actual: 98000, variance: -2000 },
    { month: "Feb", budgeted: 105000, actual: 107500, variance: 2500 },
    { month: "Mar", budgeted: 110000, actual: 109000, variance: -1000 },
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Performance Management</h1>
          <p className="text-muted-foreground mt-2">Budget planning, forecasting & scenario modeling</p>
        </div>
        <Button data-testid="button-new-budget">
          <Plus className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "budget" && (
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="budgeted" stroke="#3b82f6" />
                <Line type="monotone" dataKey="actual" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
            <CardTitle>Department Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { dept: "Sales", allocated: 250000, utilized: 235000 },
                { dept: "Engineering", allocated: 300000, utilized: 298000 },
                { dept: "Marketing", allocated: 150000, utilized: 142000 },
              ].map((item) => (
                <div key={item.dept} className="flex justify-between items-center p-2 border rounded">
                  <p className="text-sm font-medium">{item.dept}</p>
                  <p className="text-sm">${(item.utilized / 1000).toFixed(0)}K / ${(item.allocated / 1000).toFixed(0)}K</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
