import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";

export default function LogisticsShipping() {
  const { data: shipments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/retail-shipping"],
    queryFn: () => fetch("/api/retail-shipping").then(r => r.json()).catch(() => []),
  });

  const delivered = shipments.filter((s: any) => s.status === "delivered").length;
  const inTransit = shipments.filter((s: any) => s.status === "in-transit").length;

  return (
    <StandardPage
      title="Logistics & Shipping"
      description="Carrier integration, tracking, ETA, delivery exceptions, shipping cost calculation"
    >
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Shipments</p>
            <p className="text-2xl font-bold">{shipments.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{delivered}</p>
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
            <p className="text-xs text-muted-foreground">Delivery %</p>
            <p className="text-2xl font-bold">{shipments.length > 0 ? ((delivered / shipments.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <p>Loading...</p>
          ) : shipments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No shipments</p>
          ) : (
            shipments.slice(0, 10).map((s: any) => (
              <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`ship-${s.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{s.shipmentId}</p>
                  <p className="text-xs text-muted-foreground">{s.carrier}</p>
                </div>
                <Badge variant={s.status === "delivered" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
