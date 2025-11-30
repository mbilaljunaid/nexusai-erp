import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function DemandForecastingPage() {
  const forecasts = [
    { id: "df1", period: "Q1 2026", item: "SKU-001", forecasted: 5000, actual: 4850, accuracy: "97%", method: "Time Series" },
    { id: "df2", period: "Q1 2026", item: "SKU-002", forecasted: 3200, actual: 3400, accuracy: "94%", method: "Machine Learning" },
    { id: "df3", period: "Q1 2026", item: "SKU-003", forecasted: 8500, actual: 8200, accuracy: "96%", method: "Regression" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Demand Forecasting
        </h1>
        <p className="text-muted-foreground mt-2">Predict future demand and optimize inventory</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
            <p className="text-2xl font-bold text-green-600">95.7%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Items Tracked</p>
            <p className="text-2xl font-bold">156</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Forecast Periods</p>
            <p className="text-2xl font-bold">8</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Forecasts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {forecasts.map((forecast) => (
            <div key={forecast.id} className="p-3 border rounded-lg hover-elevate" data-testid={`df-${forecast.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{forecast.item}</h3>
                <Badge variant="default">{forecast.accuracy}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Period: {forecast.period} • Forecasted: {forecast.forecasted.toLocaleString()} • Actual: {forecast.actual.toLocaleString()} • Method: {forecast.method}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
