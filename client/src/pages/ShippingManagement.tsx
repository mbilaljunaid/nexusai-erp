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

export default function ShippingManagement() {
  const { toast } = useToast();
  const [newShip, setNewShip] = useState({ orderId: "", carrier: "UPS", method: "standard", status: "pending" });

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["/api/shipments"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/shipments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      setNewShip({ orderId: "", carrier: "UPS", method: "standard", status: "pending" });
      toast({ title: "Shipment created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/shipments/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({ title: "Shipment deleted" });
    }
  });

  const delivered = shipments.filter((s: any) => s.status === "delivered").length;
  const inTransit = shipments.filter((s: any) => s.status === "in-transit").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="h-8 w-8" />
          Shipping & Delivery Management
        </h1>
        <p className="text-muted-foreground mt-2">Carrier integration, tracking, fulfillment, and delivery confirmation</p>
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
            <p className="text-2xl font-bold text-blue-600">{inTransit}</p>
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
            <p className="text-xs text-muted-foreground">On-Time Rate</p>
            <p className="text-2xl font-bold">{shipments.length > 0 ? ((delivered / shipments.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-ship">
        <CardHeader><CardTitle className="text-base">Create Shipment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Order ID" value={newShip.orderId} onChange={(e) => setNewShip({ ...newShip, orderId: e.target.value })} data-testid="input-orderid" className="text-sm" />
            <Select value={newShip.carrier} onValueChange={(v) => setNewShip({ ...newShip, carrier: v })}>
              <SelectTrigger data-testid="select-carrier" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UPS">UPS</SelectItem>
                <SelectItem value="FedEx">FedEx</SelectItem>
                <SelectItem value="DHL">DHL</SelectItem>
                <SelectItem value="USPS">USPS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newShip.method} onValueChange={(v) => setNewShip({ ...newShip, method: v })}>
              <SelectTrigger data-testid="select-method" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="overnight">Overnight</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newShip.status} onValueChange={(v) => setNewShip({ ...newShip, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newShip)} disabled={createMutation.isPending || !newShip.orderId} size="sm" data-testid="button-create-ship">
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
              <div className="flex-1">
                <p className="font-semibold">{s.orderId}</p>
                <p className="text-xs text-muted-foreground">{s.carrier} • {s.method}</p>
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
