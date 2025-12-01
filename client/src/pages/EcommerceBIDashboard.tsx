import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function EcommerceBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/ecommerce-metrics"],
    queryFn: () => fetch("/api/ecommerce-metrics").then(r => r.json()).catch(() => []),
  });

  const totalRevenue = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.revenue) || 0), 0);
  const avgOrderValue = metrics.length > 0 ? (totalRevenue / metrics.length).toFixed(2) : 0;
  const conversionRate = metrics.length > 0 ? ((metrics.filter((m: any) => m.converted).length / metrics.length) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          E-commerce BI & Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Sales trends, customer insights, inventory health, and campaign ROI</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Order Value</p>
            <p className="text-2xl font-bold">${avgOrderValue}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
            <p className="text-2xl font-bold text-green-600">{conversionRate}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="text-2xl font-bold">{metrics.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Category</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between" data-testid={`metric-${m.id}`}>
                <span>{m.category || "Category"}</span>
                <span className="font-bold">${(m.revenue || 0).toFixed(0)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Products</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between items-center" data-testid={`product-${m.id}`}>
                <span>{m.productName || "Product"}</span>
                <Badge variant="secondary" className="text-xs">{m.units || 0} sold</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
