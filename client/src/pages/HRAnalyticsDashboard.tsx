import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function HRAnalyticsDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const { data: analyticsData = [] } = useQuery<any[]>({ queryKey: ["/api/hr/analytics"] });
  const formMetadata = getFormMetadata("hrAnalytics");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={analyticsData} onFilter={setFiltered} />
      
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
