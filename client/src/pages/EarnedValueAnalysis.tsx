import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function EarnedValueAnalysis() {
  const { data: evas = [], isLoading } = useQuery({
    queryKey: ["/api/eva"]
    
  });

  const onTrack = evas.filter((e: any) => e.spi >= 1 && e.cpi >= 1).length;
  const avgCPI = evas.length > 0 ? (evas.reduce((sum: number, e: any) => sum + (parseFloat(e.cpi) || 0), 0) / evas.length).toFixed(2) : "0";

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Earned Value Analysis (EVM)
        </h1>
        <p className="text-muted-foreground mt-2">Schedule Performance Index (SPI), Cost Performance (CPI), and forecasting</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Projects Tracked</p>
            <p className="text-2xl font-bold">{evas.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">On Track (SPI/CPI ≥ 1.0)</p>
            <p className="text-2xl font-bold text-green-600">{onTrack}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Cost Performance</p>
            <p className="text-2xl font-bold">{avgCPI}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">EVM Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : evas.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : evas.map((e: any) => (
            <div key={e.id} className="p-3 border rounded-lg hover-elevate" data-testid={`eva-${e.id}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{e.project || "Project"}</p>
                  <p className="text-xs text-muted-foreground">PV: ${e.pv || 0} | EV: ${e.ev || 0} | AC: ${e.ac || 0}</p>
                </div>
                <Badge variant={e.spi >= 1 ? "default" : "destructive"}>{e.spi ? `SPI: ${e.spi.toFixed(2)}` : "SPI: N/A"}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">CPI: {e.cpi ? e.cpi.toFixed(2) : "N/A"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
