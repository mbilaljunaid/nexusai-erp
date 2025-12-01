import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ShipmentOrderManagement() {
  const { toast } = useToast();
  const [newShipment, setNewShipment] = useState({ shipmentId: "", origin: "", destination: "", weight: "0", service: "standard", status: "pending" });

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["/api/tl-shipments"],
    queryFn: () => fetch("/api/tl-shipments").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/tl-shipments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-shipments"] });
      setNewShipment({ shipmentId: "", origin: "", destination: "", weight: "0", service: "standard", status: "pending" });
      toast({ title: "Shipment created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/tl-shipments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-shipments"] });
      toast({ title: "Shipment deleted" });
    },
  });

  const active = shipments.filter((s: any) => s.status === "in-transit").length;
  const delivered = shipments.filter((s: any) => s.status === "delivered").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Shipment Order Management
        </h1>
        <p className="text-muted-foreground mt-2">Order entry, consolidation, validation, and shipment creation</p>
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
            <p className="text-xs text-muted-foreground">In Transit</p>
            <p className="text-2xl font-bold text-blue-600">{active}</p>
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
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{shipments.filter((s: any) => s.status === "pending").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-shipment">
        <CardHeader><CardTitle className="text-base">Create Shipment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Shipment ID" value={newShipment.shipmentId} onChange={(e) => setNewShipment({ ...newShipment, shipmentId: e.target.value })} data-testid="input-sid" className="text-sm" />
            <Input placeholder="Origin" value={newShipment.origin} onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })} data-testid="input-origin" className="text-sm" />
            <Input placeholder="Destination" value={newShipment.destination} onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })} data-testid="input-dest" className="text-sm" />
            <Input placeholder="Weight (kg)" type="number" value={newShipment.weight} onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })} data-testid="input-weight" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newShipment)} disabled={createMutation.isPending || !newShipment.shipmentId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Shipments</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : shipments.length === 0 ? <p className="text-muted-foreground text-center py-4">No shipments</p> : shipments.map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`shipment-${s.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{s.shipmentId}</p>
                <p className="text-xs text-muted-foreground">{s.origin} → {s.destination} • {s.weight} kg</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={s.status === "delivered" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(s.id)} data-testid={`button-delete-${s.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
