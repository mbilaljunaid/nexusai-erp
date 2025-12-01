import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FreightManagement() {
  const { toast } = useToast();
  const [newShipment, setNewShipment] = useState({ shipmentId: "", carrier: "UPS", mode: "road", cost: "500", status: "booked" });

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["/api/freight"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/freight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/freight"] });
      setNewShipment({ shipmentId: "", carrier: "UPS", mode: "road", cost: "500", status: "booked" });
      toast({ title: "Shipment created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/freight/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/freight"] });
      toast({ title: "Shipment deleted" });
    }
  });

  const delivered = shipments.filter((s: any) => s.status === "delivered").length;
  const totalCost = shipments.reduce((sum: number, s: any) => sum + (parseFloat(s.cost) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="h-8 w-8" />
          Freight & Carrier Management
        </h1>
        <p className="text-muted-foreground mt-2">Shipment planning, carrier rates, tracking, and landed cost</p>
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
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-bold">${(totalCost / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Cost/Shipment</p>
            <p className="text-2xl font-bold">${shipments.length > 0 ? (totalCost / shipments.length).toFixed(0) : 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-shipment">
        <CardHeader><CardTitle className="text-base">Create Shipment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Shipment ID" value={newShipment.shipmentId} onChange={(e) => setNewShipment({ ...newShipment, shipmentId: e.target.value })} data-testid="input-shipid" className="text-sm" />
            <Input placeholder="Carrier" value={newShipment.carrier} onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })} data-testid="input-carrier" className="text-sm" />
            <Select value={newShipment.mode} onValueChange={(v) => setNewShipment({ ...newShipment, mode: v })}>
              <SelectTrigger data-testid="select-mode" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="air">Air</SelectItem>
                <SelectItem value="sea">Sea</SelectItem>
                <SelectItem value="road">Road</SelectItem>
                <SelectItem value="rail">Rail</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Cost" type="number" value={newShipment.cost} onChange={(e) => setNewShipment({ ...newShipment, cost: e.target.value })} data-testid="input-cost" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newShipment)} disabled={createMutation.isPending || !newShipment.shipmentId} size="sm" data-testid="button-create-ship">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Shipments</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : shipments.length === 0 ? <p className="text-muted-foreground text-center py-4">No shipments</p> : shipments.map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`ship-${s.id}`}>
              <div>
                <p className="font-semibold">{s.shipmentId}</p>
                <p className="text-xs text-muted-foreground">{s.carrier} ({s.mode}) • ${s.cost}</p>
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
