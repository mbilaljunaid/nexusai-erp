import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default function FoodBeverageBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/fb-analytics"]
    
  });

  const totalSales = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.sales) || 0), 0);
  const avgFoodCost = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.foodCostPct) || 0), 0) / metrics.length).toFixed(1) : 0;
  const avgWaste = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.wastePct) || 0), 0) / metrics.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Food & Beverage BI & Analytics
        </h1>
        <p className="text-muted-foreground mt-2">Sales by menu item, food cost, waste trends, batch yield, supplier metrics, and KPIs</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">${(totalSales / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Food Cost %</p>
            <p className="text-2xl font-bold">{avgFoodCost}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Waste %</p>
            <p className="text-2xl font-bold text-red-600">{avgWaste}%</p>
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
          <CardHeader><CardTitle className="text-base">Sales by Item</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between" data-testid={`item-${m.id}`}>
                <span>{m.menuItem || "Item"}</span>
                <span className="font-bold">${m.sales || 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Outlet Performance</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between items-center" data-testid={`outlet-${m.id}`}>
                <span>{m.outlet || "Outlet"}</span>
                <Badge variant="default" className="text-xs">{m.foodCostPct || 0}% FC</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
