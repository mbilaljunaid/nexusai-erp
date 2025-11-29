import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SalesAnalytics() {
  const data = [
    { month: "Jan", revenue: 45000, deals: 12 },
    { month: "Feb", revenue: 52000, deals: 15 },
    { month: "Mar", revenue: 48000, deals: 13 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales Analytics</h1>
        <p className="text-muted-foreground mt-1">Revenue and sales pipeline metrics</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
