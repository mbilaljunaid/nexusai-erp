import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Plus, TrendingUp, Zap, AlertCircle } from "lucide-react";

export default function EPMPage() {
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

  const allocations = [
    { department: "Sales", allocated: 250000, utilized: 235000, variance: -15000 },
    { department: "Engineering", allocated: 300000, utilized: 298000, variance: -2000 },
    { department: "Marketing", allocated: 150000, utilized: 142000, variance: -8000 },
    { department: "Operations", allocated: 200000, utilized: 195000, variance: -5000 },
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

      <Tabs defaultValue="budget" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4 mt-6">
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

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">$315,000</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Actual</p>
                <p className="text-2xl font-bold">$314,500</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Variance</p>
                <p className="text-2xl font-bold text-green-600">-$500</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Expense Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" />
                  <Bar dataKey="expenses" fill="#f59e0b" />
                  <Bar dataKey="profit" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Rolling Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {forecastData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border-b" data-testid={`forecast-${item.period}`}>
                  <span className="font-medium">{item.period}</span>
                  <span className="text-sm text-muted-foreground">
                    Profit: ${(item.profit / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Scenario Modeling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scenarios.map((scenario, idx) => (
                <div key={idx} className="p-4 border rounded-lg" data-testid={`scenario-${scenario.name.replace(/\s/g, "-").toLowerCase()}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{scenario.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Probability: {(scenario.probability * 100).toFixed(0)}%
                      </p>
                    </div>
                    <Badge>{scenario.probability > 0.4 ? "Likely" : "Possible"}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Revenue</p>
                      <p className="font-bold">${(scenario.revenue / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Expenses</p>
                      <p className="font-bold">${(scenario.expenses / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Profit</p>
                      <p className="font-bold text-green-600">${(scenario.profit / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create New Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Scenario Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Growth Case"
                    className="w-full p-2 border rounded mt-1"
                    data-testid="input-scenario-name"
                  />
                </div>
                <Button className="w-full">Simulate</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allocation Tab */}
        <TabsContent value="allocation" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Budget Allocation by Department
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allocations.map((alloc, idx) => (
                <div key={idx} className="p-3 border rounded-lg" data-testid={`allocation-${alloc.department.toLowerCase()}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{alloc.department}</span>
                    <span className={alloc.variance < 0 ? "text-green-600" : "text-red-600"}>
                      {alloc.variance < 0 ? "-" : "+"}${Math.abs(alloc.variance / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(alloc.utilized / alloc.allocated) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>${(alloc.allocated / 1000).toFixed(0)}K allocated</span>
                    <span>${(alloc.utilized / 1000).toFixed(0)}K utilized</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Recommend Allocations
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
