import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default function HealthcareBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/healthcare-bi"]
    
  });

  const avgWait = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.waitTime) || 0), 0) / metrics.length).toFixed(1) : 0;
  const satisfactionScore = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.satisfaction) || 0), 0) / metrics.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Healthcare BI & Clinical Analytics
        </h1>
        <p className="text-muted-foreground mt-2">ED throughput, bed occupancy, clinical quality, financial KPIs, and patient outcomes</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Wait Time</p>
            <p className="text-2xl font-bold">{avgWait}min</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Patient Satisfaction</p>
            <p className="text-2xl font-bold text-green-600">{satisfactionScore}/10</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Data Points</p>
            <p className="text-2xl font-bold">{metrics.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active Admits</p>
            <p className="text-2xl font-bold">{metrics.filter((m: any) => m.status === "active").length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-base">ED Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between" data-testid={`metric-${m.id}`}>
                <span>{m.department || "ED"}</span>
                <span className="font-bold">{m.waitTime || 0}min</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Quality Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between items-center" data-testid={`quality-${m.id}`}>
                <span>{m.metric || "Metric"}</span>
                <Badge variant="default" className="text-xs">{m.value || 0}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
