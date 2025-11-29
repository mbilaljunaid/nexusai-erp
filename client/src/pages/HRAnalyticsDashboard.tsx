import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function HRAnalyticsDashboard() {
  const turnoverData = [
    { month: "Jan", turnover: 2 },
    { month: "Feb", turnover: 1 },
    { month: "Mar", turnover: 3 },
  ];

  const depData = [
    { name: "Sales", value: 25 },
    { name: "Engineering", value: 35 },
    { name: "HR", value: 8 },
    { name: "Finance", value: 12 },
    { name: "Operations", value: 20 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HR Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Key HR metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-3xl font-bold mt-1">100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Turnover Rate</p>
            <p className="text-3xl font-bold mt-1">2.4%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Tenure</p>
            <p className="text-3xl font-bold mt-1">5.2 yrs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Turnover</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="turnover" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Employees by Department</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={depData} cx="50%" cy="50%" labelLine={false} label={({value}) => `${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {depData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
