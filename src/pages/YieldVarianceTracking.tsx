import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertTriangle } from "lucide-react";

export default function YieldVarianceTracking() {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["/api/yield-tracking"],
    queryFn: () => fetch("/api/yield-tracking").then(r => r.json()).catch(() => []),
  });

  const avgYield = records.length > 0 ? (records.reduce((sum: number, r: any) => sum + (parseFloat(r.yieldPct) || 0), 0) / records.length).toFixed(1) : 0;
  const outliers = records.filter((r: any) => Math.abs((parseFloat(r.yieldPct) || 0) - (avgYield as any)) > 5).length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Yield & Variance Tracking
        </h1>
        <p className="text-muted-foreground mt-2">Actual vs planned yields, cost variance analysis, and scrap tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Batches Tracked</p>
            <p className="text-2xl font-bold">{records.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Yield %</p>
            <p className="text-2xl font-bold text-green-600">{avgYield}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">Outliers</p>
                <p className="text-2xl font-bold">{outliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Variance</p>
            <p className="text-2xl font-bold">±{records.length > 0 ? ((records.reduce((sum: number, r: any) => sum + Math.abs((parseFloat(r.variance) || 0)), 0) / records.length)).toFixed(1) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Batch Yield Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : records.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : records.map((r: any) => {
            const variance = parseFloat(r.variance) || 0;
            return (
              <div key={r.id} className="p-3 border rounded hover-elevate" data-testid={`yield-${r.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-sm">{r.batchId || "Batch"}</p>
                  <Badge variant={variance > 5 ? "destructive" : variance > 0 ? "secondary" : "default"} className="text-xs">{variance > 0 ? "+" : ""}{variance}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Yield: {r.yieldPct || 0}% • Scrap: ${r.scrapCost || 0} • Status: {r.status || "complete"}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
