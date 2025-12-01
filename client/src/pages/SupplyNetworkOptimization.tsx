import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, TrendingDown, BarChart3 } from "lucide-react";

export default function SupplyNetworkOptimization() {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["/api/network-plan"]
    
  });

  const nodes = plans.filter((p: any) => p.type === "node").length;
  const routes = plans.filter((p: any) => p.type === "route").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Network className="h-8 w-8" />
          Supply Network Optimization
        </h1>
        <p className="text-muted-foreground mt-2">Multi-echelon planning and network optimization</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Network Nodes</p>
            <p className="text-2xl font-bold">{nodes}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Routes Optimized</p>
                <p className="text-2xl font-bold">{routes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{plans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Optimization Results</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : plans.length === 0 ? <p className="text-muted-foreground text-center py-4">No plans</p> : plans.map((p: any) => (
            <div key={p.id} className="p-3 border rounded-lg hover-elevate" data-testid={`plan-${p.id}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{p.name || "Network Plan"}</p>
                  <p className="text-xs text-muted-foreground">{p.type}</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
