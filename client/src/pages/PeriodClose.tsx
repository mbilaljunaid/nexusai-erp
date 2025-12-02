import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PeriodClose() {
  const { toast } = useToast();
  const [newTask, setNewTask] = useState({ closeTask: "", module: "Finance", dueDate: "" });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/period-close"],
    queryFn: () => fetch("/api/period-close").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/period-close", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/period-close"] });
      setNewTask({ closeTask: "", module: "Finance", dueDate: "" });
      toast({ title: "Close task created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/period-close/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/period-close"] });
      toast({ title: "Task deleted" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/period-close/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/period-close"] });
      toast({ title: "Task status updated" });
    },
  });

  const metrics = {
    total: tasks.length,
    completed: tasks.filter((t: any) => t.status === "completed").length,
    inProgress: tasks.filter((t: any) => t.status === "in-progress").length,
    notStarted: tasks.filter((t: any) => t.status === "not_started").length,
  };

  return (
    <div className="space-y-6 p-4" data-testid="period-close">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckSquare className="h-8 w-8" />
          Period Close
        </h1>
        <p className="text-muted-foreground mt-2">Manage end-of-period close tasks and checklist</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3" data-testid="card-total-tasks">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-completed">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{metrics.completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-in-progress">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{metrics.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-not-started">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Not Started</p>
            <p className="text-2xl font-bold text-red-600">{metrics.notStarted}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-task">
        <CardHeader>
          <CardTitle className="text-base">Create Close Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Task name" value={newTask.closeTask} onChange={(e) => setNewTask({ ...newTask, closeTask: e.target.value })} data-testid="input-task-name" />
            <Select value={newTask.module} onValueChange={(v) => setNewTask({ ...newTask, module: v })}>
              <SelectTrigger data-testid="select-module">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Receivables">Receivables</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Due date" type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} data-testid="input-due-date" />
          </div>
          <Button disabled={createMutation.isPending || !newTask.closeTask} className="w-full" data-testid="button-create-task">
            <Plus className="w-4 h-4 mr-2" /> Create Task
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Close Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No close tasks created</div>
          ) : (
            tasks.map((t: any) => (
              <div key={t.id} className="p-3 border rounded-lg hover-elevate" data-testid={`task-item-${t.id}`}>
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{t.closeTask}</h3>
                  <Badge variant={t.status === "completed" ? "default" : t.status === "in-progress" ? "secondary" : "outline"}>{t.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Module: {t.module} • Due: {t.dueDate}</p>
                <div className="flex gap-2">
                  {t.status === "not_started" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: t.id, status: "in-progress" })} data-testid={`button-start-${t.id}`}>
                      Start
                    </Button>
                  )}
                  {t.status === "in-progress" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: t.id, status: "completed" })} data-testid={`button-complete-${t.id}`}>
                      Complete
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" data-testid={`button-delete-${t.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
