import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TimesheetManagement() {
  const { toast } = useToast();
  const [newTimesheet, setNewTimesheet] = useState({ user: "", week: "", project: "", hours: "", approval: "pending" });

  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ["/api/timesheets"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/timesheets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      setNewTimesheet({ user: "", week: "", project: "", hours: "", approval: "pending" });
      toast({ title: "Timesheet submitted" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/timesheets/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      toast({ title: "Timesheet deleted" });
    }
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          Timesheet Management
        </h1>
        <p className="text-muted-foreground mt-2">Track and manage project timesheets</p>
      </div>

      <Card data-testid="card-new-timesheet">
        <CardHeader><CardTitle className="text-base">Submit Timesheet</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Input placeholder="Employee" value={newTimesheet.user} onChange={(e) => setNewTimesheet({ ...newTimesheet, user: e.target.value })} data-testid="input-user" />
            <Input placeholder="Week" value={newTimesheet.week} onChange={(e) => setNewTimesheet({ ...newTimesheet, week: e.target.value })} data-testid="input-week" />
            <Input placeholder="Project" value={newTimesheet.project} onChange={(e) => setNewTimesheet({ ...newTimesheet, project: e.target.value })} data-testid="input-project" />
            <Input placeholder="Hours" type="number" value={newTimesheet.hours} onChange={(e) => setNewTimesheet({ ...newTimesheet, hours: e.target.value })} data-testid="input-hours" />
            <Select value={newTimesheet.approval} onValueChange={(v) => setNewTimesheet({ ...newTimesheet, approval: v })}>
              <SelectTrigger data-testid="select-approval"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newTimesheet)} disabled={createMutation.isPending || !newTimesheet.user} className="w-full" data-testid="button-submit-timesheet">
            <Plus className="h-4 w-4 mr-2" /> Submit Timesheet
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold">120</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Billable Hours</p>
            <p className="text-2xl font-bold text-green-600">115</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600">2</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">1</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Timesheets</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : timesheets.length === 0 ? <p className="text-muted-foreground text-center py-4">No timesheets</p> : timesheets.map((ts: any) => (
            <div key={ts.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`timesheet-${ts.id}`}>
              <div>
                <h3 className="font-semibold">{ts.week}</h3>
                <p className="text-sm text-muted-foreground">User: {ts.user} • Project: {ts.project} • Hours: {ts.hours}h</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={ts.approval === "approved" ? "default" : "secondary"}>{ts.approval}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(ts.id)} data-testid={`button-delete-${ts.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
