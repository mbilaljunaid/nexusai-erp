import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BudgetEntryForm } from "@/components/forms/BudgetEntryForm";
import { ForecastSubmissionForm } from "@/components/forms/ForecastSubmissionForm";
import { ScenarioBuilderForm } from "@/components/forms/ScenarioBuilderForm";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Target, AlertCircle } from "lucide-react";

const varianceData = [
  { month: "Jan", budget: 50, actual: 48 },
  { month: "Feb", budget: 55, actual: 60 },
  { month: "Mar", budget: 60, actual: 58 },
  { month: "Apr", budget: 65, actual: 62 },
  { month: "May", budget: 70, actual: 68 },
  { month: "Jun", budget: 75, actual: 82 }
];

const forecastAccuracy = [
  { quarter: "Q1", forecast: 120, actual: 118 },
  { quarter: "Q2", forecast: 130, actual: 132 },
  { quarter: "Q3", forecast: 140, actual: 135 },
  { quarter: "Q4", forecast: 150, actual: 148 }
];

const cycleStatus = [
  { name: "Planning", value: 35 },
  { name: "Review", value: 40 },
  { name: "Approved", value: 25 }
];

const COLORS = ['#3b82f6', '#f97316', '#10b981'];

export default function EPMModule() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">EPM - Enterprise Performance Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Budget planning, forecasting, scenario modeling, consolidation, and variance analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Budget vs Actual</p>
              <p className="text-2xl font-semibold">98.5%</p>
              <Badge variant="outline" className="text-xs mt-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300">On Track</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Planning Complete</p>
              <p className="text-2xl font-semibold">72%</p>
              <p className="text-xs text-muted-foreground mt-2">8 of 11 depts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Forecast Accuracy</p>
              <p className="text-2xl font-semibold">94.2%</p>
              <Badge variant="outline" className="text-xs mt-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300">MAPE</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Consolidation</p>
              <p className="text-2xl font-semibold">6/6</p>
              <p className="text-xs text-muted-foreground mt-2">entities ready</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Open Variances</p>
              <p className="text-2xl font-semibold">12</p>
              <Badge variant="outline" className="text-xs mt-2 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300">Review</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Plan Cycle Time</p>
              <p className="text-2xl font-semibold">14 days</p>
              <p className="text-xs text-muted-foreground mt-2">Target: 21 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="scenario">Scenario</TabsTrigger>
          <TabsTrigger value="consolidation">Consolidation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Variance Report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget vs Actual - YTD</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={varianceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="budget" stroke="#3b82f6" name="Budget" strokeWidth={2} />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Forecast Accuracy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Forecast Accuracy by Quarter</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={forecastAccuracy} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="forecast" fill="#3b82f6" name="Forecast" />
                    <Bar dataKey="actual" fill="#10b981" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget Cycle Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={cycleStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                      {cycleStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab("budget")}>
                <DollarSign className="h-4 w-4" />
                Create New Budget Entry
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab("forecast")}>
                <TrendingUp className="h-4 w-4" />
                Submit Forecast
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab("scenario")}>
                <Target className="h-4 w-4" />
                Run Scenario Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab("consolidation")}>
                <AlertCircle className="h-4 w-4" />
                Consolidation Hub
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <BudgetEntryForm />
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <ForecastSubmissionForm />
        </TabsContent>

        {/* Scenario Tab */}
        <TabsContent value="scenario" className="space-y-4">
          <ScenarioBuilderForm />
        </TabsContent>

        {/* Consolidation Tab */}
        <TabsContent value="consolidation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Multi-Entity Consolidation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Entities Consolidated</p>
                    <p className="font-semibold text-lg">6 / 6</p>
                    <Badge className="mt-2 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-0">Ready</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Data Validation</p>
                    <p className="font-semibold text-lg">✓</p>
                    <p className="text-xs text-muted-foreground mt-2">All entities passed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">FX Translation</p>
                    <p className="font-semibold text-lg">Pending</p>
                    <p className="text-xs text-muted-foreground mt-2">Rate update needed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">I/C Eliminations</p>
                    <p className="font-semibold text-lg">47</p>
                    <p className="text-xs text-muted-foreground mt-2">To review</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3 pt-4">
                <Button className="w-full">Run Consolidation</Button>
                <Button variant="outline" className="w-full">View Consolidated Results</Button>
                <Button variant="outline" className="w-full">FX Translation Settings</Button>
                <Button variant="outline" className="w-full">Review I/C Eliminations</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
