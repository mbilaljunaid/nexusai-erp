import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PredictiveAnalytics() {
  const forecast = [
    { month: "Apr", predicted: 55000, confidence: "95%" },
    { month: "May", predicted: 62000, confidence: "92%" },
    { month: "Jun", predicted: 58000, confidence: "88%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Predictive Analytics</h1>
        <p className="text-muted-foreground mt-1">ARIMA forecasting and predictions</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Revenue Forecast (ARIMA Model)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="predicted" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
