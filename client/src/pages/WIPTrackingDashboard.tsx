import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock } from "lucide-react";

export default function WIPTrackingDashboard() {
  const { data: wipData = [], isLoading } = useQuery({
    queryKey: ["/api/wip-tracking"],
    queryFn: () => fetch("/api/wip-tracking").then(r => r.json()).catch(() => []),
  });

  const totalWIP = wipData.reduce((sum: number, w: any) => sum + (parseFloat(w.quantity) || 0), 0);
  const aged = wipData.filter((w: any) => w.daysInWIP > 7).length;
  const avgAge = wipData.length > 0 ? (wipData.reduce((sum: number, w: any) => sum + (parseFloat(w.daysInWIP) || 0), 0) / wipData.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          WIP Tracking & Bottleneck Analysis
        </h1>
        <p className="text-muted-foreground mt-2">Work-in-progress visibility, aging analysis, and constraint management</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total WIP Units</p>
            <p className="text-2xl font-bold">{(totalWIP / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">Avg Days in WIP</p>
                <p className="text-2xl font-bold">{avgAge}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Aged WIP (>7 days)</p>
            <p className="text-2xl font-bold text-red-600">{aged}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">WIP Items</p>
            <p className="text-2xl font-bold">{wipData.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">WIP Status by Work Center</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : wipData.length === 0 ? <p className="text-muted-foreground text-center py-4">No WIP</p> : wipData.map((w: any) => (
            <div key={w.id} className="p-3 border rounded hover-elevate" data-testid={`wip-${w.id}`}>
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">{w.workOrderId || "WO"}</p>
                <Badge variant={w.daysInWIP > 7 ? "destructive" : w.daysInWIP > 4 ? "secondary" : "default"} className="text-xs">{w.daysInWIP} days</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{w.workCenter} • {w.quantity || 0} units • Op {w.currentOperation || 1}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
