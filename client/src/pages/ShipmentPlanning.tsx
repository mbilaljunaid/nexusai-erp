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

export default function ShipmentPlanning() {
  const { toast } = useToast();
  const [newShipment, setNewShipment] = useState({ order: "SO-001", carrier: "FedEx", items: "", destination: "City", status: "planning" });

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["/api/shipment-planning"],
    queryFn: () => fetch("/api/shipment-planning").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/shipment-planning", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipment-planning"] });
      setNewShipment({ order: "SO-001", carrier: "FedEx", items: "", destination: "City", status: "planning" });
      toast({ title: "Shipment created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/shipment-planning/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipment-planning"] });
      toast({ title: "Shipment deleted" });
    },
  });

  const shippedCount = shipments.filter((s: any) => s.status === "shipped").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Shipment Planning
        </h1>
        <p className="text-muted-foreground mt-2">Plan and coordinate outbound shipments</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Shipments</p>
            <p className="text-2xl font-bold">{shipments.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Shipped</p>
            <p className="text-2xl font-bold text-green-600">{shippedCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Planning</p>
            <p className="text-2xl font-bold text-blue-600">{shipments.length - shippedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-shipment">
        <CardHeader><CardTitle className="text-base">Plan Shipment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Input placeholder="Order" value={newShipment.order} onChange={(e) => setNewShipment({ ...newShipment, order: e.target.value })} data-testid="input-order" />
            <Select value={newShipment.carrier} onValueChange={(v) => setNewShipment({ ...newShipment, carrier: v })}>
              <SelectTrigger data-testid="select-carrier"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FedEx">FedEx</SelectItem>
                <SelectItem value="UPS">UPS</SelectItem>
                <SelectItem value="DHL">DHL</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Items" type="number" value={newShipment.items} onChange={(e) => setNewShipment({ ...newShipment, items: e.target.value })} data-testid="input-items" />
            <Input placeholder="Destination" value={newShipment.destination} onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })} data-testid="input-dest" />
            <Select value={newShipment.status} onValueChange={(v) => setNewShipment({ ...newShipment, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending || !newShipment.items} className="w-full" data-testid="button-create-shipment">
            <Plus className="w-4 h-4 mr-2" /> Create Shipment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Shipments</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : shipments.length === 0 ? <p className="text-muted-foreground text-center py-4">No shipments</p> : shipments.map((s: any) => (
            <div key={s.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`shipment-${s.id}`}>
              <div>
                <p className="font-semibold text-sm">{s.order} → {s.destination}</p>
                <p className="text-xs text-muted-foreground">{s.carrier} | {s.items} items</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={s.status === "shipped" ? "default" : "secondary"}>{s.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${s.id}`}>
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
