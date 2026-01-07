import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WorkforceScheduling() {
  const { toast } = useToast();
  const [newSchedule, setNewSchedule] = useState({ employeeId: "", storeId: "", date: "", shift: "day", status: "scheduled" });

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["/api/workforce-schedule"],
    queryFn: () => fetch("/api/workforce-schedule").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/workforce-schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-schedule"] });
      setNewSchedule({ employeeId: "", storeId: "", date: "", shift: "day", status: "scheduled" });
      toast({ title: "Schedule created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/workforce-schedule/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-schedule"] });
      toast({ title: "Schedule deleted" });
    },
  });

  const scheduled = schedules.filter((s: any) => s.status === "scheduled").length;
  const completed = schedules.filter((s: any) => s.status === "completed").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Workforce Scheduling & Management
        </h1>
        <p className="text-muted-foreground mt-2">Employee scheduling, shift management, and labor optimization</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Schedules</p>
            <p className="text-2xl font-bold">{schedules.length}</p>
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
            <p className="text-xs text-muted-foreground">Coverage %</p>
            <p className="text-2xl font-bold">{schedules.length > 0 ? ((scheduled / schedules.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-schedule">
        <CardHeader><CardTitle className="text-base">Create Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Employee ID" value={newSchedule.employeeId} onChange={(e) => setNewSchedule({ ...newSchedule, employeeId: e.target.value })} data-testid="input-empid" className="text-sm" />
            <Input placeholder="Store ID" value={newSchedule.storeId} onChange={(e) => setNewSchedule({ ...newSchedule, storeId: e.target.value })} data-testid="input-storeid" className="text-sm" />
            <Input placeholder="Date" type="date" value={newSchedule.date} onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })} data-testid="input-date" className="text-sm" />
            <Select value={newSchedule.shift} onValueChange={(v) => setNewSchedule({ ...newSchedule, shift: v })}>
              <SelectTrigger data-testid="select-shift" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newSchedule.employeeId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Schedules</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : schedules.length === 0 ? <p className="text-muted-foreground text-center py-4">No schedules</p> : schedules.map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`schedule-${s.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{s.employeeId} - {s.storeId}</p>
                <p className="text-xs text-muted-foreground">{s.date} • {s.shift} shift</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={s.status === "completed" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${s.id}`} className="h-7 w-7">
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
