import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf } from "lucide-react";

export default function SustainabilityTraceability() {
  const { data: metrics = [], isLoading } = useQuery<any>({
    queryKey: ["/api/fb-sustainability"],
    queryFn: () => fetch("/api/fb-sustainability").then(r => r.json()).catch(() => []),
  });

  const totalCO2 = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.co2kg) || 0), 0);
  const totalWaste = metrics.reduce((sum: number, m: any) => sum + (parseInt(m.wasteKg) || 0), 0);
  const avgDiversionRate = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.diversionRate) || 0), 0) / metrics.length).toFixed(1) : 0;

  return (
    <StandardPage
      title="Sustainabil CSR"
      description="Farm/supplier trace, CO2 tracking, waste management, and sustainability reporting"
    >

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total CO2 kg</p>
            <p className="text-2xl font-bold">{(totalCO2 / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Waste kg</p>
            <p className="text-2xl font-bold">{(totalWaste / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Diversion %</p>
            <p className="text-2xl font-bold text-green-600">{avgDiversionRate}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Records</p>
            <p className="text-2xl font-bold">{metrics.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Sustainability Metrics</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : metrics.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : metrics.slice(0, 10).map((m: any) => (
            <div key={m.id} className="p-2 border rounded text-sm hover-elevate" data-testid={`metric-${m.id}`}>
              <p className="font-semibold">{m.supplier || "Supplier"}</p>
              <p className="text-xs text-muted-foreground">CO2: {m.co2kg}kg • Waste: {m.wasteKg}kg • Diversion: {m.diversionRate}%</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
