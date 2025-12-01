import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export default function ShipmentTracking() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/tl-tracking"],
    queryFn: () => fetch("/api/tl-tracking").then(r => r.json()).catch(() => []),
  });

  const inTransit = events.filter((e: any) => e.status === "in-transit").length;
  const onTime = events.filter((e: any) => e.etaStatus === "on-time").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="h-8 w-8" />
          Visibility & Tracking (Real-Time)
        </h1>
        <p className="text-muted-foreground mt-2">Real-time tracker, ETA predictions, events, POD capture, and geo-fencing alerts</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{events.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Transit</p>
            <p className="text-2xl font-bold text-blue-600">{inTransit}</p>
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
            <p className="text-xs text-muted-foreground">Delayed</p>
            <p className="text-2xl font-bold text-red-600">{events.filter((e: any) => e.etaStatus === "delayed").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Tracking Events</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : events.length === 0 ? <p className="text-muted-foreground text-center py-4">No events</p> : events.slice(0, 10).map((e: any) => (
            <div key={e.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`event-${e.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{e.shipmentId}</p>
                <p className="text-xs text-muted-foreground">Event: {e.eventType} • Location: {e.location}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={e.etaStatus === "on-time" ? "default" : "destructive"} className="text-xs">ETA: {e.eta}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
