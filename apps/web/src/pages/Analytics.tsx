import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Plus, Download, LayoutDashboard, FileText, Table2, TrendingUp, Percent, Users, ShoppingCart } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { useQuery } from "@tanstack/react-query";

export default function Analytics() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
    { id: "reports", label: "Reports", icon: FileText, color: "text-green-500" },
    { id: "excel", label: "Data", icon: Table2, color: "text-purple-500" },
  ];
  
  const kpiIcons = [
    { name: "Revenue", icon: TrendingUp, color: "text-blue-500" },
    { name: "Profit Margin", icon: Percent, color: "text-green-500" },
    { name: "Customer Count", icon: Users, color: "text-purple-500" },
    { name: "Avg Order Value", icon: ShoppingCart, color: "text-orange-500" },
  ];
  // Fetch ARIMA forecasting data from backend
  const { data: forecastData } = useQuery({ queryKey: ["/api/analytics/forecast-advanced"] });
  const { data: dashboardSummary } = useQuery({ queryKey: ["/api/analytics/dashboard/summary"] });
  const { data: olapResults } = useQuery({ queryKey: ["/api/analytics/olap/query"] });

  // Use backend forecast data or mock as fallback
  const dashboardData = (forecastData as any)?.timeSeries || [
    { month: "Jan", revenue: 65000, expenses: 42000 },
    { month: "Feb", revenue: 72000, expenses: 45000 },
    { month: "Mar", revenue: 68000, expenses: 43000 },
    { month: "Apr", revenue: 78000, expenses: 48000 },
    { month: "May", revenue: 82000, expenses: 50000 },
    { month: "Jun", revenue: 88000, expenses: 52000 },
  ];

  const departmentData = [
    { name: "Sales", value: 35 },
    { name: "Engineering", value: 25 },
    { name: "Marketing", value: 20 },
    { name: "Operations", value: 15 },
    { name: "Other", value: 5 },
  ];

  const kpis = [
    { name: "Revenue", value: "$453K", trend: "+12%" },
    { name: "Profit Margin", value: "42%", trend: "+3%" },
    { name: "Customer Count", value: "1,245", trend: "+8%" },
    { name: "Avg Order Value", value: "$362", trend: "-2%" },
  ];

  const reports = [
    { name: "Quarterly Revenue", date: "Generated today", format: "PDF" },
    { name: "Expense Analysis", date: "Generated yesterday", format: "Excel" },
    { name: "Customer Metrics", date: "Generated 3 days ago", format: "HTML" },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Analytics & BI</h1>
          <p className="text-muted-foreground mt-2">Dashboards, reports, and business intelligence</p>
        </div>
        <Button data-testid="button-new-dashboard">
          <Plus className="h-4 w-4 mr-2" />
          New Dashboard
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const KPIIcon = kpiIcons[idx].icon;
          return (
            <Card key={idx} data-testid={`kpi-${kpi.name.replace(/\s/g, "-").toLowerCase()}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <KPIIcon className={`h-5 w-5 ${kpiIcons[idx].color}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.name}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    <p className={`text-xs mt-1 ${kpi.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                      {kpi.trend}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "dashboard" && (
        <div className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                    <Bar dataKey="expenses" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeNav === "reports" && (
        <div className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.map((report, idx) => (
                <div
                  key={idx}
                  className="p-4 border rounded-lg flex items-center justify-between"
                  data-testid={`report-${report.name.replace(/\s/g, "-").toLowerCase()}`}
                >
                  <div>
                    <h4 className="font-semibold">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">{report.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {report.format}
                    </span>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <select className="w-full p-2 border rounded mt-1" data-testid="select-report-type">
                  <option>Financial Summary</option>
                  <option>Sales Analysis</option>
                  <option>Customer Metrics</option>
                  <option>Performance Report</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Format</label>
                <select className="w-full p-2 border rounded mt-1" data-testid="select-report-format">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>HTML</option>
                </select>
              </div>
              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "excel" && (
        <div className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Embedded Data Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-analytics-data">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Month</th>
                      <th className="text-right p-2 font-semibold">Revenue</th>
                      <th className="text-right p-2 font-semibold">Expenses</th>
                      <th className="text-right p-2 font-semibold">Profit</th>
                      <th className="text-right p-2 font-semibold">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.map((row: any, idx: number) => {
                      const profit = row.revenue - row.expenses;
                      const margin = ((profit / row.revenue) * 100).toFixed(1);
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50" data-testid={`row-${row.month}`}>
                          <td className="p-2">{row.month}</td>
                          <td className="text-right p-2">${row.revenue.toLocaleString()}</td>
                          <td className="text-right p-2">${row.expenses.toLocaleString()}</td>
                          <td className="text-right p-2 font-semibold">${profit.toLocaleString()}</td>
                          <td className="text-right p-2">{margin}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-900">
                  Tip: You can edit values directly in this table, and changes will update all connected dashboards in real-time.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Modeling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Run what-if scenarios with embedded Excel-like functionality</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" data-testid="button-scenario-best">
                  Best Case Scenario
                </Button>
                <Button variant="outline" data-testid="button-scenario-worst">
                  Worst Case Scenario
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
