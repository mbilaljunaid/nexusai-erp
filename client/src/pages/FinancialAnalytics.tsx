import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancialAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Analytics</h1>
        <p className="text-muted-foreground mt-1">Financial performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">$2.4M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Profit Margin</p>
            <p className="text-3xl font-bold mt-1">32.5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Operating Costs</p>
            <p className="text-3xl font-bold mt-1">$1.6M</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
