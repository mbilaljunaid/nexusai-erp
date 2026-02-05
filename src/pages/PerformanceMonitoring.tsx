import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PerformanceMonitoring() {
  const data = [{ time: "10:00", latency: 45 }, { time: "11:00", latency: 38 }];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Monitoring</h1>
        <p className="text-muted-foreground mt-1">Track system performance metrics</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Response Time</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="latency" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
