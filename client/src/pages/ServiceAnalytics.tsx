import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ServiceAnalytics() {
  const resolvedData = [
    { week: "W1", resolved: 12 },
    { week: "W2", resolved: 18 },
    { week: "W3", resolved: 15 },
    { week: "W4", resolved: 22 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service Analytics</h1>
        <p className="text-muted-foreground mt-1">Service performance metrics and trends</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Weekly Resolutions</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={resolvedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="resolved" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
