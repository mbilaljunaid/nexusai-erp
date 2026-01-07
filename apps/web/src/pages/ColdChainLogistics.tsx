import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";

export default function ColdChainLogistics() {
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["/api/fb-coldchain"],
    queryFn: () => fetch("/api/fb-coldchain").then(r => r.json()).catch(() => []),
  });

  const onTime = shipments.filter((s: any) => s.tempBreach === false).length;
  const breaches = shipments.filter((s: any) => s.tempBreach === true).length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="h-8 w-8" />
          Cold Chain Logistics & Last Mile
        </h1>
        <p className="text-muted-foreground mt-2">Temperature-controlled TMS, cold chain checkpoints, custody transfer, and delivery POD</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Shipments</p>
            <p className="text-2xl font-bold">{shipments.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">On Time</p>
            <p className="text-2xl font-bold text-green-600">{onTime}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Breaches</p>
            <p className="text-2xl font-bold text-red-600">{breaches}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Compliance %</p>
            <p className="text-2xl font-bold">{shipments.length > 0 ? ((onTime / shipments.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Shipments</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : shipments.length === 0 ? <p className="text-muted-foreground text-center py-4">No shipments</p> : shipments.slice(0, 10).map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`shipment-${s.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{s.shipmentId}</p>
                <p className="text-xs text-muted-foreground">Temp: {s.minTemp}–{s.maxTemp}°C</p>
              </div>
              <Badge variant={s.tempBreach ? "destructive" : "default"} className="text-xs">{s.tempBreach ? "BREACH" : "OK"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
