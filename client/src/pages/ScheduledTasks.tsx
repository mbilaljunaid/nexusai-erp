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

export default function ScheduledTasks() {
  const { toast } = useToast();
  const [newTask, setNewTask] = useState({ taskName: "", schedule: "", frequency: "daily", status: "active" });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/scheduled-tasks"],
    queryFn: () => fetch("/api/scheduled-tasks").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/scheduled-tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      setNewTask({ taskName: "", schedule: "", frequency: "daily", status: "active" });
      toast({ title: "Scheduled task created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/scheduled-tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      toast({ title: "Scheduled task deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Clock className="h-8 w-8" />Scheduled Tasks</h1>
        <p className="text-muted-foreground mt-1">Configure automated scheduled jobs</p>
      </div>

      <Card data-testid="card-new-scheduled-task">
        <CardHeader><CardTitle className="text-base">Create Scheduled Task</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Task name" value={newTask.taskName} onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })} data-testid="input-task-name" />
            <Input placeholder="Schedule time" value={newTask.schedule} onChange={(e) => setNewTask({ ...newTask, schedule: e.target.value })} data-testid="input-schedule" />
            <Select value={newTask.frequency} onValueChange={(v) => setNewTask({ ...newTask, frequency: v })}>
              <SelectTrigger data-testid="select-frequency"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newTask.status} onValueChange={(v) => setNewTask({ ...newTask, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending || !newTask.taskName} className="w-full" data-testid="button-create-scheduled-task">
            <Plus className="w-4 h-4 mr-2" /> Create Task
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? <p>Loading...</p> : tasks.length === 0 ? <p className="text-muted-foreground text-center py-4">No scheduled tasks</p> : tasks.map((task: any) => (
          <Card key={task.id} data-testid={`scheduled-task-${task.id}`} className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{task.taskName}</h3>
                  <p className="text-sm text-muted-foreground">Scheduled for {task.schedule} ({task.frequency})</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge className={task.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>{task.status}</Badge>
                  <Button size="icon" variant="ghost" data-testid={`button-delete-${task.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
