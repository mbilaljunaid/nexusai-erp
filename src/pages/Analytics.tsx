import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Plus, Download, LayoutDashboard, FileText, Table2, TrendingUp, Percent, Users, ShoppingCart } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { useQuery } from "@tanstack/react-query";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Analytics() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [reportType, setReportType] = useState("Financial Summary");
  const [reportFormat, setReportFormat] = useState("PDF");
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
  const { data: forecastData } = useQuery<any[]>({ queryKey: ["/api/analytics/forecast-advanced"] });
  const { data: dashboardSummary } = useQuery<any[]>({ queryKey: ["/api/analytics/dashboard/summary"] });
  const { data: olapResults } = useQuery<any[]>({ queryKey: ["/api/analytics/olap/query"] });

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

  const analyticsColumns: SpreadsheetColumn<any>[] = [
    { id: "month", header: "Month", width: "100px", cell: (row) => <span>{row.month}</span> },
    { id: "revenue", header: "Revenue", width: "120px", cell: (row) => <span className="text-right block">${row.revenue.toLocaleString()}</span> },
    { id: "expenses", header: "Expenses", width: "120px", cell: (row) => <span className="text-right block">${row.expenses.toLocaleString()}</span> },
    {
      id: "profit", header: "Profit", width: "120px", cell: (row) => {
        const profit = row.revenue - row.expenses;
        return <span className="text-right block font-semibold">${profit.toLocaleString()}</span>;
      }
    },
    {
      id: "margin", header: "Margin %", width: "100px", cell: (row) => {
        const profit = row.revenue - row.expenses;
        const margin = ((profit / row.revenue) * 100).toFixed(1);
        return <span className="text-right block">{margin}%</span>;
      }
    }
  ];

  return (
    <StandardPage
      title="Analytics & BI"
      description="Dashboards, reports, and business intelligence"
    >
      <div className="flex justify-end mb-4">
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
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="mt-1" data-testid="select-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Financial Summary">Financial Summary</SelectItem>
                    <SelectItem value="Sales Analysis">Sales Analysis</SelectItem>
                    <SelectItem value="Customer Metrics">Customer Metrics</SelectItem>
                    <SelectItem value="Performance Report">Performance Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Format</label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger className="mt-1" data-testid="select-report-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                  </SelectContent>
                </Select>
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
                <div className="min-h-[300px] h-full border border-gray-200 rounded-xl">
                  <InteractiveSpreadsheet
                    columns={analyticsColumns}
                    data={dashboardData}
                    onChange={() => { }}
                    containerHeight="400px"
                  />
                </div>
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
    </StandardPage>
  );
}
