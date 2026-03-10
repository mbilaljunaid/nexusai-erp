import { useQuery } from "@tanstack/react-query";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function RevenueOptimization() {
  const { businessUnitId } = useEnterpriseStore();
  const { data: optimization = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hospitality-optimization", businessUnitId],
    queryFn: () => fetch("/api/hospitality-optimization", {
      headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
    }).then(r => r.json()).catch(() => []),
  });

  const optimized = optimization.filter((o: any) => o.status === "optimized").length;

  return (
    <StandardPage
      title="AI & Revenue Optimization"
      description="Dynamic pricing, forecasting, recommendations"
    >
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Models</p>
            <p className="text-2xl font-bold">{optimization.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Optimized</p>
            <p className="text-2xl font-bold text-green-600">{optimized}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {optimization.filter((o: any) => o.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Optimization %</p>
            <p className="text-2xl font-bold">
              {optimization.length > 0 ? ((optimized / optimization.length) * 100).toFixed(0) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Models</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : optimization.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No data</p>
          ) : (
            optimization.slice(0, 10).map((o: any) => (
              <div key={o.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`opt-${o.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{o.modelId}</p>
                  <p className="text-xs text-muted-foreground">{o.type}</p>
                </div>
                <Badge variant={o.status === "optimized" ? "default" : "secondary"} className="text-xs">
                  {o.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
