import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2, Navigation, CheckCircle2, Clock, Truck, Activity } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

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
  const pending = shipments.filter((s: any) => s.status === "pending").length;

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Shipment Order Management</h1>
          <p className="text-muted-foreground mt-1">Global logistics execution, order consolidation, and multi-modal shipment orchestration</p>
        </div>
      }
    >
      <DashboardWidget title="Total Orders" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{shipments.length}</div>
            <p className="text-xs text-muted-foreground">Master manifests</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="In Transit" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <Navigation className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">{active}</div>
            <p className="text-xs text-muted-foreground">Live tracking</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Delivered" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">{delivered}</div>
            <p className="text-xs text-muted-foreground">Completed routes</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Pending Stage" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">{pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting dispatch</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Authorize New Shipment" colSpan={4} icon={Plus}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shipment Reference</label>
            <Input placeholder="REF-000" value={newShipment.shipmentId} onChange={(e) => setNewShipment({ ...newShipment, shipmentId: e.target.value })} data-testid="input-sid" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Origin Node</label>
            <Input placeholder="City / Port" value={newShipment.origin} onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })} data-testid="input-origin" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Destination Node</label>
            <Input placeholder="City / Port" value={newShipment.destination} onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })} data-testid="input-dest" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gross Weight (kg)</label>
            <Input placeholder="0" type="number" value={newShipment.weight} onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })} data-testid="input-weight" />
          </div>
          <Button onClick={() => createMutation.mutate(newShipment)} disabled={createMutation.isPending || !newShipment.shipmentId} className="w-full" data-testid="button-create">
            {createMutation.isPending ? <Activity className="h-4 w-4 animate-spin" /> : "Dispatch Order"}
          </Button>
        </div>
      </DashboardWidget>

      <DashboardWidget colSpan={4} title="Global Logistics Registry" icon={Truck}>
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : shipments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-medium">No shipment orders active in the current window</p>
          ) : (
            shipments.map((s: any) => (
              <div key={s.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`shipment-${s.id}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{s.shipmentId}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-tighter">
                      {s.origin} → {s.destination}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Payload: {s.weight} kg • Priority: Standard</p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <Badge variant={s.status === "delivered" ? "default" : "secondary"} className="text-[10px] uppercase font-mono">
                    {s.status}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(s.id)} data-testid={`button-delete-${s.id}`}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
