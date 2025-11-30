import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default function AutomotiveBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/auto-analytics"],
    queryFn: () => fetch("/api/auto-analytics").then(r => r.json()).catch(() => []),
  });

  const totalSales = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.salesAmount) || 0), 0);
  const avgMargin = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.margin) || 0), 0) / metrics.length).toFixed(1) : 0;
  const serviceRevenue = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.serviceRevenue) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Automotive BI & Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Sales by model, margins, service ROI, technician efficiency, and KPIs</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">${(totalSales / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Margin</p>
            <p className="text-2xl font-bold text-green-600">{avgMargin}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Service Revenue</p>
            <p className="text-2xl font-bold">${(serviceRevenue / 1000).toFixed(0)}K</p>
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
          <CardHeader><CardTitle className="text-base">Sales by Model</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between" data-testid={`model-${m.id}`}>
                <span>{m.model || "Model"}</span>
                <span className="font-bold">${(m.salesAmount || 0) / 1000}K</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Service Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between items-center" data-testid={`service-${m.id}`}>
                <span>{m.serviceType || "Service"}</span>
                <Badge variant="default" className="text-xs">${m.serviceRevenue || 0}K</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
