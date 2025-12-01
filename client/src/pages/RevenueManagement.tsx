import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function RevenueManagement() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/hospitality-revenue"]
    
  });

  const totalRevenue = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.revenue) || 0), 0);
  const avgADR = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.adr) || 0), 0) / metrics.length).toFixed(2) : 0;
  const avgOccupancy = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.occupancy) || 0), 0) / metrics.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Revenue Management & Pricing
        </h1>
        <p className="text-muted-foreground mt-2">Dynamic pricing, demand forecasting, rate rules, and competitor analysis</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg ADR</p>
            <p className="text-2xl font-bold">${avgADR}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Occupancy</p>
            <p className="text-2xl font-bold">{avgOccupancy}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Data Points</p>
            <p className="text-2xl font-bold">{metrics.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Rate Rules</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between" data-testid={`rate-${m.id}`}>
                <span>{m.roomType || "Type"}</span>
                <span className="font-bold">${m.adr || 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Forecast</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between items-center" data-testid={`forecast-${m.id}`}>
                <span>{m.period || "Period"}</span>
                <Badge variant="default" className="text-xs">{m.occupancy || 0}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
