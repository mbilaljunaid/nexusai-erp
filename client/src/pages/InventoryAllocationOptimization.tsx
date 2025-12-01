import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

export default function InventoryAllocationOptimization() {
  const { data: allocations = [], isLoading } = useQuery({
    queryKey: ["/api/inventory-allocation"]
    
  });

  const optimized = allocations.filter((a: any) => a.status === "optimized").length;
  const avgUtilization = allocations.length > 0 ? (allocations.reduce((sum: number, a: any) => sum + (parseFloat(a.utilization) || 0), 0) / allocations.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Lightbulb className="h-8 w-8" />
          Inventory Allocation & Optimization
        </h1>
        <p className="text-muted-foreground mt-2">Allocation across warehouses, stock balancing, and optimization recommendations</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Allocations</p>
            <p className="text-2xl font-bold">{allocations.length}</p>
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
            <p className="text-xs text-muted-foreground">Avg Utilization</p>
            <p className="text-2xl font-bold">{avgUtilization}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{allocations.length - optimized}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Allocations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : allocations.length === 0 ? <p className="text-muted-foreground text-center py-4">No allocations</p> : allocations.map((a: any) => (
            <div key={a.id} className="p-3 border rounded hover-elevate" data-testid={`alloc-${a.id}`}>
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">{a.productId || "Product"}</p>
                <Badge variant={a.status === "optimized" ? "default" : "secondary"} className="text-xs">{a.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Warehouses: {a.warehouseCount || 0} • Utilization: {a.utilization || 0}% • Recommendation: {a.recommendation || "balanced"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
