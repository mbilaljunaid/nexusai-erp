import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Boxes, AlertCircle } from "lucide-react";

export default function InventoryOptimization() {
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/inventory-optimization"],
    queryFn: () => fetch("/api/inventory-optimization").then(r => r.json()).catch(() => []),
  });

  const overstock = inventory.filter((i: any) => i.daysOfSupply > 90).length;
  const understock = inventory.filter((i: any) => i.daysOfSupply < 14).length;
  const optimized = inventory.filter((i: any) => i.daysOfSupply >= 14 && i.daysOfSupply <= 90).length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Boxes className="h-8 w-8" />
          Inventory Optimization (Multi-Warehouse)
        </h1>
        <p className="text-muted-foreground mt-2">Stock levels across DCs, inventory turns, and safety stock recommendations</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">SKUs Tracked</p>
            <p className="text-2xl font-bold">{inventory.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Overstock</p>
                <p className="text-2xl font-bold">{overstock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">Understock</p>
                <p className="text-2xl font-bold">{understock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">Optimized</Badge>
              <div>
                <p className="text-xs text-muted-foreground">Optimal Level</p>
                <p className="text-2xl font-bold">{optimized}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Inventory Status by Warehouse</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : inventory.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : inventory.map((i: any) => {
            let status = "optimal";
            if (i.daysOfSupply > 90) status = "overstock";
            else if (i.daysOfSupply < 14) status = "understock";
            return (
              <div key={i.id} className="p-3 border rounded hover-elevate" data-testid={`inv-${i.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-sm">{i.sku || "SKU"}</p>
                  <Badge variant={status === "optimal" ? "default" : status === "overstock" ? "destructive" : "secondary"} className="text-xs">
                    {i.daysOfSupply || 0} days
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{i.warehouse || "DC"} • OnHand: {i.onHand || 0} • ROQ: {i.reorderQty || 0}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
