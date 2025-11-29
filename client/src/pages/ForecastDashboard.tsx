import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function ForecastDashboard() {
  const forecastData = [
    { month: "Jan", forecast: 450, actual: 380 },
    { month: "Feb", forecast: 520, actual: 480 },
    { month: "Mar", forecast: 680, actual: 650 },
    { month: "Apr", forecast: 720, actual: null },
    { month: "May", forecast: 850, actual: null },
    { month: "Jun", forecast: 920, actual: null },
  ];

  const stageWiseData = [
    { stage: "Prospecting", forecast: 120 },
    { stage: "Qualification", forecast: 180 },
    { stage: "Needs Analysis", forecast: 320 },
    { stage: "Proposal", forecast: 750 },
    { stage: "Negotiation", forecast: 540 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue Forecast</h1>
        <p className="text-muted-foreground mt-1">6-month revenue projection based on pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Q1 Forecast</p>
            <p className="text-3xl font-bold mt-1">$1.65M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pipeline Value</p>
            <p className="text-3xl font-bold mt-1">$2.91M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Weighted Forecast</p>
            <p className="text-3xl font-bold mt-1">$1.45M</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">6-Month Forecast Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="forecast" stroke="#3b82f6" name="Forecast" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Forecast by Stage</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageWiseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="forecast" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
