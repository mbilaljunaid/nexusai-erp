import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HospitalityHRRostering() {
  const { toast } = useToast();
  const [newShift, setNewShift] = useState({ employeeId: "", name: "", role: "housekeeping", date: "", status: "scheduled" });

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ["/api/hospitality-rostering"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hospitality-rostering", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-rostering"] });
      setNewShift({ employeeId: "", name: "", role: "housekeeping", date: "", status: "scheduled" });
      toast({ title: "Shift scheduled" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hospitality-rostering/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-rostering"] });
      toast({ title: "Shift deleted" });
    }
  });

  const scheduled = shifts.filter((s: any) => s.status === "scheduled").length;
  const completed = shifts.filter((s: any) => s.status === "completed").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          HR, Rostering & Staffing
        </h1>
        <p className="text-muted-foreground mt-2">Employee profiles, shift scheduling, time & attendance, payroll integration</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Shifts</p>
            <p className="text-2xl font-bold">{shifts.length}</p>
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
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Attendance %</p>
            <p className="text-2xl font-bold">{shifts.length > 0 ? ((scheduled / shifts.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-shift">
        <CardHeader><CardTitle className="text-base">Schedule Shift</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Employee ID" value={newShift.employeeId} onChange={(e) => setNewShift({ ...newShift, employeeId: e.target.value })} data-testid="input-empid" className="text-sm" />
            <Input placeholder="Name" value={newShift.name} onChange={(e) => setNewShift({ ...newShift, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Role" value={newShift.role} onChange={(e) => setNewShift({ ...newShift, role: e.target.value })} data-testid="input-role" className="text-sm" />
            <Input placeholder="Date" type="date" value={newShift.date} onChange={(e) => setNewShift({ ...newShift, date: e.target.value })} data-testid="input-date" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newShift)} disabled={createMutation.isPending || !newShift.employeeId} size="sm" data-testid="button-schedule">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Shifts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : shifts.length === 0 ? <p className="text-muted-foreground text-center py-4">No shifts</p> : shifts.map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`shift-${s.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{s.employeeId} - {s.name}</p>
                <p className="text-xs text-muted-foreground">{s.role} • {s.date}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={s.status === "completed" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
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
