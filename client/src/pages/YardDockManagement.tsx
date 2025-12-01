import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Warehouse, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function YardDockManagement() {
  const { toast } = useToast();
  const [newAppt, setNewAppt] = useState({ appointmentId: "", carrierId: "", dockId: "", arrivalTime: "", status: "scheduled" });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/tl-dock-appointments"],
    queryFn: () => fetch("/api/tl-dock-appointments").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/tl-dock-appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-dock-appointments"] });
      setNewAppt({ appointmentId: "", carrierId: "", dockId: "", arrivalTime: "", status: "scheduled" });
      toast({ title: "Appointment scheduled" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/tl-dock-appointments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-dock-appointments"] });
      toast({ title: "Appointment deleted" });
    },
  });

  const completed = appointments.filter((a: any) => a.status === "completed").length;
  const active = appointments.filter((a: any) => a.status === "in-progress").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Warehouse className="h-8 w-8" />
          Yard & Dock Management
        </h1>
        <p className="text-muted-foreground mt-2">Dock scheduling, slot management, gate operations, and yard tasks</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Appointments</p>
            <p className="text-2xl font-bold">{appointments.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{active}</p>
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
            <p className="text-xs text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold text-yellow-600">{appointments.filter((a: any) => a.status === "scheduled").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-appt">
        <CardHeader><CardTitle className="text-base">Schedule Dock Appointment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Appt ID" value={newAppt.appointmentId} onChange={(e) => setNewAppt({ ...newAppt, appointmentId: e.target.value })} data-testid="input-apptid" className="text-sm" />
            <Input placeholder="Carrier ID" value={newAppt.carrierId} onChange={(e) => setNewAppt({ ...newAppt, carrierId: e.target.value })} data-testid="input-carid" className="text-sm" />
            <Input placeholder="Dock ID" value={newAppt.dockId} onChange={(e) => setNewAppt({ ...newAppt, dockId: e.target.value })} data-testid="input-dockid" className="text-sm" />
            <Input placeholder="Arrival Time" type="datetime-local" value={newAppt.arrivalTime} onChange={(e) => setNewAppt({ ...newAppt, arrivalTime: e.target.value })} data-testid="input-arrival" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newAppt)} disabled={createMutation.isPending || !newAppt.appointmentId} size="sm" data-testid="button-schedule">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Appointments</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : appointments.length === 0 ? <p className="text-muted-foreground text-center py-4">No appointments</p> : appointments.map((a: any) => (
            <div key={a.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`appt-${a.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{a.appointmentId}</p>
                <p className="text-xs text-muted-foreground">Carrier: {a.carrierId} • Dock: {a.dockId}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={a.status === "completed" ? "default" : "secondary"} className="text-xs">{a.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(a.id)} data-testid={`button-delete-${a.id}`} className="h-7 w-7">
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
