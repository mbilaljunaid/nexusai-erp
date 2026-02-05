import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MaintenanceDetailSheet from "@/components/maintenance/MaintenanceDetailSheet";


export default function CMMSMaintenance() {
  const { toast } = useToast();
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [newMWO, setNewMWO] = useState({ assetId: "", maintenanceType: "PREVENTIVE", priority: "NORMAL", estimatedHours: "2", status: "DRAFT" });



  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ["/api/maintenance/work-orders"],
    queryFn: () => fetch("/api/maintenance/work-orders").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/maintenance/work-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders"] });
      setNewMWO({ assetId: "", maintenanceType: "PREVENTIVE", priority: "NORMAL", estimatedHours: "2", status: "DRAFT" });

      toast({ title: "Maintenance WO created" });
    },
  });

  const deleteMutation = useMutation({
    // Hard delete not supported yet, status update to CANCELLED
    mutationFn: (id: string) => fetch(`/api/maintenance/work-orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders"] });
      toast({ title: "WO Cancelled" });
    },
  });

  const completed = workOrders.filter((w: any) => w.status === "completed").length;
  const inProgress = workOrders.filter((w: any) => w.status === "in-progress").length;
  const avgHours = workOrders.length > 0 ? (workOrders.reduce((sum: number, w: any) => sum + (parseFloat(w.estimatedHours) || 0), 0) / workOrders.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wrench className="h-8 w-8" />
          CMMS & Preventive Maintenance
        </h1>
        <p className="text-muted-foreground mt-2">Maintenance schedules, asset tracking, downtime, and predictive analytics</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total MWOs</p>
            <p className="text-2xl font-bold">{workOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Hours</p>
            <p className="text-2xl font-bold">{avgHours}h</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-mwo">
        <CardHeader><CardTitle className="text-base">Create Maintenance WO</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Asset ID (UUID)" value={newMWO.assetId} onChange={(e) => setNewMWO({ ...newMWO, assetId: e.target.value })} data-testid="input-equipid" className="text-sm" />

            <Select value={newMWO.maintenanceType} onValueChange={(v) => setNewMWO({ ...newMWO, maintenanceType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newMWO.priority} onValueChange={(v) => setNewMWO({ ...newMWO, priority: v })}>
              <SelectTrigger data-testid="select-priority" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Est Hours" type="number" value={newMWO.estimatedHours} onChange={(e) => setNewMWO({ ...newMWO, estimatedHours: e.target.value })} data-testid="input-hours" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newMWO)} disabled={createMutation.isPending || !newMWO.assetId} size="sm" data-testid="button-create-mwo">

              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Maintenance Work Orders</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : workOrders.length === 0 ? <p className="text-muted-foreground text-center py-4">No MWOs</p> : workOrders.map((w: any) => (
            <div key={w.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between cursor-pointer" data-testid={`mwo-${w.id}`} onClick={() => setSelectedWorkOrderId(w.id)}>

              <div className="flex-1">
                <p className="font-semibold">{w.assetId}</p>

                <p className="text-xs text-muted-foreground">{w.maintenanceType} • {w.estimatedHours}h • Priority: {w.priority}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={w.status === "completed" ? "default" : "secondary"} className="text-xs">{w.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(w.id)} data-testid={`button-delete-${w.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <MaintenanceDetailSheet
        workOrderId={selectedWorkOrderId}
        open={!!selectedWorkOrderId}
        onOpenChange={(open) => !open && setSelectedWorkOrderId(null)}
      />
    </div >
  );
}
