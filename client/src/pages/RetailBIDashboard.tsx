import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default function RetailBIDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["/api/retail-bi"],
    queryFn: () => fetch("/api/retail-bi").then(r => r.json()).catch(() => []),
  });

  const totalRevenue = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.revenue) || 0), 0);
  const avgTicket = metrics.length > 0 ? (totalRevenue / metrics.length).toFixed(2) : 0;
  const loyaltyEnrollment = metrics.length > 0 ? ((metrics.filter((m: any) => m.loyaltyEnrolled).length / metrics.length) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Retail BI & Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Sales trends, inventory health, loyalty performance, and channel analytics</p>
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
            <p className="text-xs text-muted-foreground">Avg Ticket</p>
            <p className="text-2xl font-bold">${avgTicket}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Loyalty Enroll %</p>
            <p className="text-2xl font-bold text-green-600">{loyaltyEnrollment}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold">{metrics.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Sales by Channel</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between" data-testid={`metric-${m.id}`}>
                <span>{m.channel || "Channel"}</span>
                <span className="font-bold">${(m.revenue || 0).toFixed(0)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Stores</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex justify-between items-center" data-testid={`store-${m.id}`}>
                <span>{m.storeName || "Store"}</span>
                <Badge variant="secondary" className="text-xs">${(m.revenue || 0).toFixed(0)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
