import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getFormMetadata } from "@/lib/formMetadata";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 2000 },
  { name: "Apr", value: 2780 },
  { name: "May", value: 1890 },
  { name: "Jun", value: 2390 },
];

export default function AnalyticsModule() {
  const analyticsFormMetadata = getFormMetadata("analytics");

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={analyticsFormMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div>
        <h1 className="text-3xl font-bold">Analytics Hub</h1>
        <p className="text-muted-foreground">Real-time dashboards and insights</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">$2.4M</p>
              <p className="text-xs text-green-600 mt-1">+12% vs last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold mt-1">8,542</p>
              <p className="text-xs text-green-600 mt-1">+8% vs last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold mt-1">4.2%</p>
              <p className="text-xs text-green-600 mt-1">+0.5% vs last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold mt-1">$280</p>
              <p className="text-xs text-green-600 mt-1">+3% vs last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "Product A", sales: "$950K" },
              { name: "Product B", sales: "$750K" },
              { name: "Product C", sales: "$550K" },
            ].map((p) => (
              <div key={p.name} className="flex justify-between p-2 rounded hover:bg-muted">
                <span className="text-sm">{p.name}</span>
                <span className="font-mono text-sm">{p.sales}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { source: "Direct", pct: "45%" },
              { source: "Search", pct: "35%" },
              { source: "Social", pct: "20%" },
            ].map((s) => (
              <div key={s.source} className="flex justify-between p-2 rounded hover:bg-muted">
                <span className="text-sm">{s.source}</span>
                <Badge variant="outline">{s.pct}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
