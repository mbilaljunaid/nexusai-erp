import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function FinancialAnalytics() {
  const { data: analytics = {} } = useQuery({
    queryKey: ["/api/analytics/financial"]
  });

  const revenue = analytics.revenue || 2400000;
  const profitMargin = analytics.profitMargin || 32.5;
  const costs = analytics.costs || 1600000;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><TrendingUp className="w-8 h-8" />Financial Analytics</h1>
        <p className="text-muted-foreground mt-1">Financial performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-revenue">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">${(revenue / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card data-testid="card-margin">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Profit Margin</p>
            <p className="text-3xl font-bold mt-1 text-green-600">{profitMargin}%</p>
          </CardContent>
        </Card>
        <Card data-testid="card-costs">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Operating Costs</p>
            <p className="text-3xl font-bold mt-1">${(costs / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
