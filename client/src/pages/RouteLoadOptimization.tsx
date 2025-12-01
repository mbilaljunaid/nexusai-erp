import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "lucide-react";

export default function RouteLoadOptimization() {
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["/api/tl-routes"]
    
  });

  const avgUtilization = routes.length > 0 ? (routes.reduce((sum: number, r: any) => sum + (parseFloat(r.utilization) || 0), 0) / routes.length).toFixed(1) : 0;
  const emptyMiles = routes.filter((r: any) => (parseFloat(r.utilization) || 0) < 30).length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Navigation className="h-8 w-8" />
          Route & Load Optimization (TMS)
        </h1>
        <p className="text-muted-foreground mt-2">Load planning, route sequencing, optimization, and backhaul management</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Routes</p>
            <p className="text-2xl font-bold">{routes.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Utilization</p>
            <p className="text-2xl font-bold text-green-600">{avgUtilization}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Low Util Routes</p>
            <p className="text-2xl font-bold text-red-600">{emptyMiles}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Optimizable</p>
            <p className="text-2xl font-bold">{routes.filter((r: any) => (parseFloat(r.utilization) || 0) < 50).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Routes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : routes.length === 0 ? <p className="text-muted-foreground text-center py-4">No routes</p> : routes.slice(0, 10).map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`route-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.routeId}</p>
                <p className="text-xs text-muted-foreground">Stops: {r.stops || 0} • Distance: {r.distance || 0} km</p>
              </div>
              <Badge variant={parseFloat(r.utilization) > 80 ? "default" : "secondary"} className="text-xs">{r.utilization || 0}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
