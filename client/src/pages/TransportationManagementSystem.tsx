import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, Trash2, TrendingUp, Navigation, Boxes, CheckCircle2, Activity } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransportationManagementSystem() {
  const { toast } = useToast();
  const [newShip, setNewShip] = useState({ shipmentId: "", carrier: "FedEx", loadType: "FTL", distance: "500", status: "planned" });

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["/api/tms"],
    queryFn: () => fetch("/api/tms").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/tms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tms"] });
      setNewShip({ shipmentId: "", carrier: "FedEx", loadType: "FTL", distance: "500", status: "planned" });
      toast({ title: "TMS shipment created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/tms/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tms"] });
      toast({ title: "Shipment deleted" });
    },
  });

  const delivered = shipments.filter((s: any) => s.status === "delivered").length;
  const totalDistance = shipments.reduce((sum: number, s: any) => sum + (parseFloat(s.distance) || 0), 0);

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Transportation Management (TMS)</h1>
          <p className="text-muted-foreground mt-1">Global logistics orchestration, freight booking, and route optimization</p>
        </div>
      }
    >
      <DashboardWidget title="Total Shipments" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Boxes className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{shipments.length}</div>
            <p className="text-xs text-muted-foreground">Active manifests</p>
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
            <p className="text-xs text-muted-foreground">Proof of delivery</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Total Miles" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">{(totalDistance / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Cumulative distance</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="In Transit" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <Navigation className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">{shipments.filter((s: any) => s.status === "in-transit").length}</div>
            <p className="text-xs text-muted-foreground">Live tracking</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Plan New Shipment" colSpan={4} icon={Plus}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shipment ID</label>
            <Input placeholder="ID" value={newShip.shipmentId} onChange={(e) => setNewShip({ ...newShip, shipmentId: e.target.value })} data-testid="input-ship-id" />
          </div>
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Carrier</label>
            <Select value={newShip.carrier} onValueChange={(v) => setNewShip({ ...newShip, carrier: v })}>
              <SelectTrigger data-testid="select-carrier"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FedEx">FedEx</SelectItem>
                <SelectItem value="UPS">UPS</SelectItem>
                <SelectItem value="DHL">DHL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Load</label>
            <Select value={newShip.loadType} onValueChange={(v) => setNewShip({ ...newShip, loadType: v })}>
              <SelectTrigger data-testid="select-load"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FTL">FTL</SelectItem>
                <SelectItem value="LTL">LTL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Distance</label>
            <Input placeholder="km" type="number" value={newShip.distance} onChange={(e) => setNewShip({ ...newShip, distance: e.target.value })} data-testid="input-dist" />
          </div>
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
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
            {createMutation.isPending ? "Planning..." : "Plan Load"}
          </Button>
        </div>
      </DashboardWidget>

      <DashboardWidget colSpan={4} title="Master Shipment Directory" icon={Truck}>
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : shipments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-medium">No active shipments found</p>
          ) : (
            shipments.map((s: any) => (
              <div key={s.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`ship-${s.id}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{s.shipmentId}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-tighter">
                      {s.carrier} • {s.loadType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Route: {s.distance} km • Last Update: Just now</p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <Badge variant={s.status === "delivered" ? "default" : "secondary"} className="text-[10px] uppercase font-mono">
                    {s.status}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(s.id)} data-testid={`button-delete-${s.id}`}>
                    <Trash2 className="w-4 h-4" />
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
