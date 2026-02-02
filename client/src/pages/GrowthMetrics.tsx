import { Card, CardContent } from "@/components/ui/card";

export default function GrowthMetrics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Growth Metrics</h1>
        <p className="text-muted-foreground mt-1">Track business growth and KPIs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">MoM Growth</p><p className="text-3xl font-bold mt-1">+12%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">YoY Growth</p><p className="text-3xl font-bold mt-1">+45%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Customer LTV</p><p className="text-3xl font-bold mt-1">$85K</p></CardContent></Card>
      </div>
    </div>
  );
}
