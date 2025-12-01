import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, Trash2, TrendingUp } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TransportationManagementSystem() {
  const { toast } = useToast();
  const [newShip, setNewShip] = useState({ shipmentId: "", carrier: "FedEx", loadType: "FTL", distance: "500", status: "planned" });

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["/api/tms"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/tms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tms"] });
      setNewShip({ shipmentId: "", carrier: "FedEx", loadType: "FTL", distance: "500", status: "planned" });
      toast({ title: "TMS shipment created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/tms/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tms"] });
      toast({ title: "Shipment deleted" });
    }
  });

  const delivered = shipments.filter((s: any) => s.status === "delivered").length;
  const totalDistance = shipments.reduce((sum: number, s: any) => sum + (parseFloat(s.distance) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="h-8 w-8" />
          Transportation Management (TMS)
        </h1>
        <p className="text-muted-foreground mt-2">Freight booking, route optimization, and carrier management</p>
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
            <p className="text-xs text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{delivered}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total Miles</p>
                <p className="text-2xl font-bold">{(totalDistance / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Transit</p>
            <p className="text-2xl font-bold text-yellow-600">{shipments.filter((s: any) => s.status === "in-transit").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-ship">
        <CardHeader><CardTitle className="text-base">Plan Shipment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Input placeholder="Shipment ID" value={newShip.shipmentId} onChange={(e) => setNewShip({ ...newShip, shipmentId: e.target.value })} data-testid="input-ship-id" />
            <Select value={newShip.carrier} onValueChange={(v) => setNewShip({ ...newShip, carrier: v })}>
              <SelectTrigger data-testid="select-carrier"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FedEx">FedEx</SelectItem>
                <SelectItem value="UPS">UPS</SelectItem>
                <SelectItem value="DHL">DHL</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newShip.loadType} onValueChange={(v) => setNewShip({ ...newShip, loadType: v })}>
              <SelectTrigger data-testid="select-load"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FTL">FTL</SelectItem>
                <SelectItem value="LTL">LTL</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Distance (km)" type="number" value={newShip.distance} onChange={(e) => setNewShip({ ...newShip, distance: e.target.value })} data-testid="input-dist" />
            <Select value={newShip.status} onValueChange={(v) => setNewShip({ ...newShip, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newShip)} disabled={createMutation.isPending || !newShip.shipmentId} className="w-full" data-testid="button-create-ship">
            <Plus className="w-4 h-4 mr-2" /> Create Shipment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Shipments</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : shipments.length === 0 ? <p className="text-muted-foreground text-center py-4">No shipments</p> : shipments.map((s: any) => (
            <div key={s.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`ship-${s.id}`}>
              <div>
                <p className="font-semibold text-sm">{s.shipmentId}</p>
                <p className="text-xs text-muted-foreground">{s.carrier} • {s.loadType} • {s.distance}km</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={s.status === "delivered" ? "default" : "secondary"}>{s.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(s.id)} data-testid={`button-delete-${s.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
