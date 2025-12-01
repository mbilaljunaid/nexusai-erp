import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp } from "lucide-react";

export default function DemandForecastingAI() {
  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ["/api/demand-forecast"]
    
  });

  const highConfidence = forecasts.filter((f: any) => f.confidenceScore >= 0.8).length;
  const avgAccuracy = forecasts.length > 0 ? (forecasts.reduce((sum: number, f: any) => sum + (parseFloat(f.accuracy) || 0), 0) / forecasts.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8" />
          Demand Forecasting & AI
        </h1>
        <p className="text-muted-foreground mt-2">ML-based demand prediction, safety stock optimization, and replenishment recommendations</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Forecasts</p>
            <p className="text-2xl font-bold">{forecasts.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">High Confidence (≥80%)</p>
                <p className="text-2xl font-bold">{highConfidence}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
            <p className="text-2xl font-bold">{avgAccuracy}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Forecast Results</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : forecasts.length === 0 ? <p className="text-muted-foreground text-center py-4">No forecasts</p> : forecasts.map((f: any) => (
            <div key={f.id} className="p-3 border rounded hover-elevate" data-testid={`forecast-${f.id}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{f.sku || "SKU"}</p>
                  <p className="text-xs text-muted-foreground">Predicted Demand: {f.demandQty || 0} units</p>
                </div>
                <Badge variant={f.confidenceScore >= 0.8 ? "default" : "secondary"} className="text-xs">{(f.confidenceScore * 100).toFixed(0)}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Safety Stock: {f.safetyStock || 0} | Reorder Qty: {f.reorderQty || 0}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
