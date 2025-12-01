import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function FBDemandPlanning() {
  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ["/api/fb-planning"]
    
  });

  const avgForecast = forecasts.length > 0 ? (forecasts.reduce((sum: number, f: any) => sum + (parseInt(f.forecastQty) || 0), 0) / forecasts.length).toFixed(0) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          MRP, Demand Planning & Forecasting
        </h1>
        <p className="text-muted-foreground mt-2">Demand forecasting, ingredient depletion, MRP runs, and shelf-life aware procurement</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Forecasts</p>
            <p className="text-2xl font-bold">{forecasts.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Forecast</p>
            <p className="text-2xl font-bold">{avgForecast}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Outlets</p>
            <p className="text-2xl font-bold">{new Set(forecasts.map((f: any) => f.outletId)).size}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Horizon</p>
            <p className="text-2xl font-bold">7 Days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Forecasts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : forecasts.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : forecasts.slice(0, 5).map((f: any) => (
              <div key={f.id} className="p-2 border rounded text-sm hover-elevate flex justify-between" data-testid={`forecast-${f.id}`}>
                <span>{f.outletId}</span>
                <span className="font-bold">{f.forecastQty}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Suggested POs</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : forecasts.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : forecasts.slice(0, 5).map((f: any) => (
              <div key={f.id} className="p-2 border rounded text-sm hover-elevate flex justify-between items-center" data-testid={`po-${f.id}`}>
                <span>{f.itemId || "Item"}</span>
                <Badge variant="default" className="text-xs">{f.suggestedQty || 0}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
