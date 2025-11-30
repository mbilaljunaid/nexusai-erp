import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AppointmentScheduling() {
  const { toast } = useToast();
  const [newAppt, setNewAppt] = useState({ appointmentId: "", patientId: "", providerId: "", date: "", visitType: "OPD", status: "scheduled" });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/healthcare-appointments"],
    queryFn: () => fetch("/api/healthcare-appointments").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/healthcare-appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-appointments"] });
      setNewAppt({ appointmentId: "", patientId: "", providerId: "", date: "", visitType: "OPD", status: "scheduled" });
      toast({ title: "Appointment scheduled" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/healthcare-appointments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-appointments"] });
      toast({ title: "Appointment cancelled" });
    },
  });

  const confirmed = appointments.filter((a: any) => a.status === "checked-in").length;
  const scheduled = appointments.filter((a: any) => a.status === "scheduled").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Appointment Scheduling
        </h1>
        <p className="text-muted-foreground mt-2">Clinic scheduling, pre-registration, waitlists, and patient notifications</p>
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
            <p className="text-xs text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">{scheduled}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Checked-In</p>
            <p className="text-2xl font-bold text-green-600">{confirmed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">No-Show</p>
            <p className="text-2xl font-bold text-red-600">{appointments.filter((a: any) => a.status === "no-show").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-appt">
        <CardHeader><CardTitle className="text-base">Schedule Appointment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Appt ID" value={newAppt.appointmentId} onChange={(e) => setNewAppt({ ...newAppt, appointmentId: e.target.value })} data-testid="input-apptid" className="text-sm" />
            <Input placeholder="Patient ID" value={newAppt.patientId} onChange={(e) => setNewAppt({ ...newAppt, patientId: e.target.value })} data-testid="input-patid" className="text-sm" />
            <Input placeholder="Provider ID" value={newAppt.providerId} onChange={(e) => setNewAppt({ ...newAppt, providerId: e.target.value })} data-testid="input-provid" className="text-sm" />
            <Input placeholder="Date" type="date" value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })} data-testid="input-date" className="text-sm" />
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
                <p className="text-xs text-muted-foreground">Patient: {a.patientId} • {a.date} • {a.visitType}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={a.status === "checked-in" ? "default" : "secondary"} className="text-xs">{a.status}</Badge>
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
