import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

export default function TelematicsVehicleData() {
  const { data: telemetry = [], isLoading } = useQuery({
    queryKey: ["/api/auto-telematics"]
    
  });

  const avgMileage = telemetry.length > 0 ? (telemetry.reduce((sum: number, t: any) => sum + (parseFloat(t.mileage) || 0), 0) / telemetry.length).toFixed(0) : 0;
  const healthyVehicles = telemetry.filter((t: any) => !t.dtcCode).length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Telematics, Connectivity & Vehicle Data
        </h1>
        <p className="text-muted-foreground mt-2">Device registry, OBD data, remote diagnostics, and predictive alerts</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Tracked Vehicles</p>
            <p className="text-2xl font-bold">{telemetry.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Mileage</p>
            <p className="text-2xl font-bold">{avgMileage}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Healthy</p>
            <p className="text-2xl font-bold text-green-600">{healthyVehicles}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">With DTC</p>
            <p className="text-2xl font-bold text-red-600">{telemetry.filter((t: any) => t.dtcCode).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Vehicle Telemetry</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : telemetry.length === 0 ? <p className="text-muted-foreground text-center py-4">No telemetry</p> : telemetry.slice(0, 10).map((t: any) => (
            <div key={t.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`telemetry-${t.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{t.vin}</p>
                <p className="text-xs text-muted-foreground">Mileage: {t.mileage}km • Battery: {t.batteryStatus}%</p>
              </div>
              <Badge variant={t.dtcCode ? "destructive" : "default"} className="text-xs">{t.dtcCode ? t.dtcCode : "OK"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
