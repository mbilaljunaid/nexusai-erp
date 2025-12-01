import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export default function RetailAnalyticsDashboard() {
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ["/api/retail-analytics"]
    
  });

  const totalRevenue = analytics.reduce((sum: number, a: any) => sum + (parseFloat(a.revenue) || 0), 0);
  const avgMargin = analytics.length > 0 ? (analytics.reduce((sum: number, a: any) => sum + (parseFloat(a.margin) || 0), 0) / analytics.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Retail Analytics & BI Dashboards
        </h1>
        <p className="text-muted-foreground mt-2">Sales by store/channel, margin analysis, inventory turns, customer insights</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(2)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Margin</p>
            <p className="text-2xl font-bold">{avgMargin}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Dashboards</p>
                <p className="text-2xl font-bold">{analytics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">Customer Segments</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Key Metrics</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : analytics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : analytics.map((a: any) => (
            <div key={a.id} className="p-3 border rounded hover-elevate" data-testid={`analytic-${a.id}`}>
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">{a.metric || "Metric"}</p>
                <span className="text-sm font-bold">{a.value || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">{a.period || "Period"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
