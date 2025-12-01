import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const revenueForecastSchema = z.object({
  name: z.string().min(1)
  forecastPeriod: z.string().min(1)
  baselineRevenue: z.coerce.number().min(0)
  forecastRevenue: z.coerce.number().min(0)
  product: z.string().optional()
  region: z.string().optional()
});

const budgetSchema = z.object({
  department: z.string().min(1)
  year: z.coerce.number().int()
  budgetAmount: z.coerce.number().min(0)
});

type RevenueForecastForm = z.infer<typeof revenueForecastSchema>;
type BudgetForm = z.infer<typeof budgetSchema>;

export default function Planning() {
  const [activeTab, setActiveTab] = useState<"revenue" | "budget" | "scenarios">("revenue");

  const { data: forecasts = [] } = useQuery({
    queryKey: ["/api/planning/revenue-forecasts"]
  }) as { data: any[] };

  const { data: budgets = [] } = useQuery({
    queryKey: ["/api/planning/budgets"]
  }) as { data: any[] };

  const { data: scenarios = [] } = useQuery({
    queryKey: ["/api/planning/scenarios"]
  }) as { data: any[] };

  const forecastForm = useForm<RevenueForecastForm>({
    resolver: zodResolver(revenueForecastSchema)
    defaultValues: { name: "", forecastPeriod: "", baselineRevenue: 0, forecastRevenue: 0, product: "", region: "" }
  });

  const budgetForm = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema)
    defaultValues: { department: "", year: new Date().getFullYear(), budgetAmount: 0 }
  });

  const createForecastMutation = useMutation({
    mutationFn: (data: RevenueForecastForm) => apiRequest("POST", "/api/planning/revenue-forecasts", data)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planning/revenue-forecasts"] });
      forecastForm.reset();
    }
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: BudgetForm) => apiRequest("POST", "/api/planning/budgets", data)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planning/budgets"] });
      budgetForm.reset();
    }
  });

  const forecastChartData = forecasts.map((f: any) => ({
    name: f.name
    baseline: Number(f.baselineRevenue)
    forecast: Number(f.forecastRevenue)
  }));

  const budgetChartData = budgets.map((b: any) => ({
    name: b.department
    budget: Number(b.budgetAmount)
    allocated: Number(b.allocated)
    spent: Number(b.spent)
  }));

  return (
    <div className="space-y-6 p-4">
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("revenue")}
          className={`px-4 py-2 font-medium ${activeTab === "revenue" ? "border-b-2 border-primary" : ""}`}
          data-testid="tab-revenue"
        >
          Revenue Planning
        </button>
        <button
          onClick={() => setActiveTab("budget")}
          className={`px-4 py-2 font-medium ${activeTab === "budget" ? "border-b-2 border-primary" : ""}`}
          data-testid="tab-budget"
        >
          Budget Allocation
        </button>
        <button
          onClick={() => setActiveTab("scenarios")}
          className={`px-4 py-2 font-medium ${activeTab === "scenarios" ? "border-b-2 border-primary" : ""}`}
          data-testid="tab-scenarios"
        >
          What-If Scenarios
        </button>
      </div>

      {activeTab === "revenue" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle data-testid="title-revenue-forecast">Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...forecastForm}>
                <form onSubmit={forecastForm.handleSubmit((data) => createForecastMutation.mutate(data))} className="space-y-4">
                  <FormField control={forecastForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forecast Name</FormLabel>
                      <FormControl><Input {...field} placeholder="Q1 2025 Forecast" data-testid="input-forecast-name" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={forecastForm.control} name="forecastPeriod" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <FormControl><Input {...field} placeholder="Q1 2025" data-testid="input-forecast-period" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={forecastForm.control} name="baselineRevenue" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline Revenue</FormLabel>
                      <FormControl><Input {...field} type="number" placeholder="1000000" data-testid="input-baseline-revenue" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={forecastForm.control} name="forecastRevenue" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forecast Revenue</FormLabel>
                      <FormControl><Input {...field} type="number" placeholder="1200000" data-testid="input-forecast-revenue" /></FormControl>
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={createForecastMutation.isPending} className="w-full" data-testid="button-create-forecast">
                    {createForecastMutation.isPending ? "Creating..." : "Create Forecast"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle data-testid="title-forecast-chart">Forecast Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {forecastChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={forecastChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="baseline" fill="#8884d8" />
                    <Bar dataKey="forecast" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p data-testid="text-no-forecasts" className="text-center text-gray-500">No forecasts yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "budget" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle data-testid="title-budget-allocation">Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...budgetForm}>
                <form onSubmit={budgetForm.handleSubmit((data) => createBudgetMutation.mutate(data))} className="space-y-4">
                  <FormField control={budgetForm.control} name="department" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl><Input {...field} placeholder="Engineering" data-testid="input-department" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={budgetForm.control} name="year" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl><Input {...field} type="number" data-testid="input-budget-year" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={budgetForm.control} name="budgetAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Amount</FormLabel>
                      <FormControl><Input {...field} type="number" placeholder="500000" data-testid="input-budget-amount" /></FormControl>
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={createBudgetMutation.isPending} className="w-full" data-testid="button-create-budget">
                    {createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle data-testid="title-budget-chart">Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="budget" fill="#8884d8" />
                    <Bar dataKey="spent" fill="#ff7c7c" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p data-testid="text-no-budgets" className="text-center text-gray-500">No budgets yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "scenarios" && (
        <Card>
          <CardHeader>
            <CardTitle data-testid="title-scenarios">What-If Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarios.length > 0 ? (
                scenarios.map((scenario: any) => (
                  <div key={scenario.id} className="p-4 border rounded-lg" data-testid={`scenario-card-${scenario.id}`}>
                    <h3 className="font-semibold" data-testid={`text-scenario-${scenario.id}`}>{scenario.name}</h3>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                ))
              ) : (
                <p data-testid="text-no-scenarios" className="text-gray-500">No scenarios created yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
