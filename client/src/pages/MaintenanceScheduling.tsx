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

export default function MaintenanceScheduling() {
  const { toast } = useToast();
  const [newMaint, setNewMaint] = useState({ vehicleId: "", maintenanceType: "oil-change", scheduledDate: "", status: "scheduled" });

  const { data: maintenance = [], isLoading } = useQuery({
    queryKey: ["/api/maintenance-schedule"],
    queryFn: () => fetch("/api/maintenance-schedule").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/maintenance-schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-schedule"] });
      setNewMaint({ vehicleId: "", maintenanceType: "oil-change", scheduledDate: "", status: "scheduled" });
      toast({ title: "Maintenance scheduled" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/maintenance-schedule/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-schedule"] });
      toast({ title: "Maintenance deleted" });
    },
  });

  const completed = maintenance.filter((m: any) => m.status === "completed").length;
  const overdue = maintenance.filter((m: any) => m.status === "overdue").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wrench className="h-8 w-8" />
          Maintenance Scheduling
        </h1>
        <p className="text-muted-foreground mt-2">Fleet maintenance planning, work orders, and preventive maintenance tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">{maintenance.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">{maintenance.filter((m: any) => m.status === "scheduled").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdue}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-maint">
        <CardHeader><CardTitle className="text-base">Schedule Maintenance</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Vehicle ID" value={newMaint.vehicleId} onChange={(e) => setNewMaint({ ...newMaint, vehicleId: e.target.value })} data-testid="input-vid" className="text-sm" />
            <Select value={newMaint.maintenanceType} onValueChange={(v) => setNewMaint({ ...newMaint, maintenanceType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="oil-change">Oil Change</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Date" type="date" value={newMaint.scheduledDate} onChange={(e) => setNewMaint({ ...newMaint, scheduledDate: e.target.value })} data-testid="input-date" className="text-sm" />
            <Select value={newMaint.status} onValueChange={(v) => setNewMaint({ ...newMaint, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newMaint.vehicleId} size="sm" data-testid="button-schedule">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Maintenance</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : maintenance.length === 0 ? <p className="text-muted-foreground text-center py-4">No records</p> : maintenance.map((m: any) => (
            <div key={m.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`maint-${m.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{m.vehicleId}</p>
                <p className="text-xs text-muted-foreground">{m.maintenanceType} • {m.scheduledDate}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={m.status === "completed" ? "default" : m.status === "overdue" ? "destructive" : "secondary"} className="text-xs">{m.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${m.id}`} className="h-7 w-7">
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
