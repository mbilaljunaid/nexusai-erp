import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, Truck, CheckCircle, Clock } from "lucide-react";

export default function TrackingDashboard() {
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["/api/shipment-planning"],
    queryFn: () => fetch("/api/shipment-planning").then(r => r.json()).catch(() => []),
  });

  const inTransit = shipments.filter((s: any) => s.status === "shipped").length;
  const delivered = shipments.filter((s: any) => s.status === "delivered").length;
  const planning = shipments.filter((s: any) => s.status === "planning").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Map className="h-8 w-8" />
          Tracking Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Track all active shipments and deliveries</p>
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
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">{inTransit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Planning</p>
                <p className="text-2xl font-bold">{planning}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Active Shipments</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : shipments.length === 0 ? <p className="text-muted-foreground text-center py-4">No shipments</p> : shipments.map((s: any) => (
            <div key={s.id} className="p-3 border rounded-lg hover-elevate" data-testid={`tracking-${s.id}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{s.order}</p>
                  <p className="text-xs text-muted-foreground">Carrier: {s.carrier}</p>
                </div>
                <Badge variant={s.status === "shipped" ? "secondary" : "default"}>{s.status}</Badge>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Destination: {s.destination}</span>
                <span>{s.items} items</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
