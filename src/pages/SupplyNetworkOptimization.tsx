import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, TrendingDown, BarChart3 } from "lucide-react";

export default function SupplyNetworkOptimization() {
  const { data: plans = [], isLoading } = useQuery<any>({
    queryKey: ["/api/network-plan"],
    queryFn: () => fetch("/api/network-plan").then(r => r.json()).catch(() => []),
  });

  const nodes = plans.filter((p: any) => p.type === "node").length;
  const routes = plans.filter((p: any) => p.type === "route").length;

  return (
    <StandardPage
      title="Supply Netw"
      description="Multi-echelon planning and network optimization"
    >

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
    </StandardPage>
  );
}
