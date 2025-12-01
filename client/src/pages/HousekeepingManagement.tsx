import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HousekeepingManagement() {
  const { toast } = useToast();
  const [newTask, setNewTask] = useState({ taskId: "", roomId: "", housekeeper: "", status: "pending" });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/hospitality-housekeeping"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hospitality-housekeeping", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-housekeeping"] });
      setNewTask({ taskId: "", roomId: "", housekeeper: "", status: "pending" });
      toast({ title: "Task created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hospitality-housekeeping/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-housekeeping"] });
      toast({ title: "Task deleted" });
    }
  });

  const completed = tasks.filter((t: any) => t.status === "completed").length;
  const inProgress = tasks.filter((t: any) => t.status === "in-progress").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          Housekeeping & Room Operations
        </h1>
        <p className="text-muted-foreground mt-2">Room status, turnover scheduling, lost & found, and mini-bar tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold">{tasks.length}</p>
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
            <p className="text-xs text-muted-foreground">Completion %</p>
            <p className="text-2xl font-bold">{tasks.length > 0 ? ((completed / tasks.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-task">
        <CardHeader><CardTitle className="text-base">Create Task</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Task ID" value={newTask.taskId} onChange={(e) => setNewTask({ ...newTask, taskId: e.target.value })} data-testid="input-taskid" className="text-sm" />
            <Input placeholder="Room ID" value={newTask.roomId} onChange={(e) => setNewTask({ ...newTask, roomId: e.target.value })} data-testid="input-roomid" className="text-sm" />
            <Input placeholder="Housekeeper" value={newTask.housekeeper} onChange={(e) => setNewTask({ ...newTask, housekeeper: e.target.value })} data-testid="input-hk" className="text-sm" />
            <Select value={newTask.status} onValueChange={(v) => setNewTask({ ...newTask, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newTask)} disabled={createMutation.isPending || !newTask.taskId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Tasks</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : tasks.length === 0 ? <p className="text-muted-foreground text-center py-4">No tasks</p> : tasks.map((t: any) => (
            <div key={t.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`task-${t.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{t.taskId}</p>
                <p className="text-xs text-muted-foreground">Room: {t.roomId} • {t.housekeeper}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.status === "completed" ? "default" : "secondary"} className="text-xs">{t.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(t.id)} data-testid={`button-delete-${t.id}`} className="h-7 w-7">
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
