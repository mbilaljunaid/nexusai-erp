import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RevenueForecasting() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue Forecasting</h1>
        <p className="text-muted-foreground mt-1">Advanced revenue projections and scenarios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Q2 Forecast</p>
            <p className="text-3xl font-bold mt-1">$3.2M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Best Case</p>
            <p className="text-3xl font-bold mt-1">$3.8M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Worst Case</p>
            <p className="text-3xl font-bold mt-1">$2.6M</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
