import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { Plus, CheckCircle2, Clock, AlertCircle, GitBranch, BarChart3, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  status: "open" | "in_progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: string;
}

export default function TaskManagement() {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("all");
  const [newTask, setNewTask] = useState({ title: "", status: "open", priority: "medium", assignee: "" });

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: () => fetch("/api/tasks").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTask({ title: "", status: "open", priority: "medium", assignee: "" });
      toast({ title: "Task created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task deleted" });
    },
  });

  const stats = {
    total: (tasks || []).length,
    open: (tasks || []).filter(t => t.status === "open").length,
    inProgress: (tasks || []).filter(t => t.status === "in_progress").length,
    completed: (tasks || []).filter(t => t.status === "completed").length,
  };

  const navItems = [
    { id: "all", label: "All Tasks", icon: GitBranch, color: "text-blue-500" },
    { id: "open", label: "Open", icon: AlertCircle, color: "text-red-500" },
    { id: "progress", label: "In Progress", icon: Clock, color: "text-orange-500" },
    { id: "completed", label: "Completed", icon: CheckCircle2, color: "text-green-500" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Task Management</h1>
          <p className="text-muted-foreground text-sm">Track tasks, subtasks, and dependencies</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />New Task</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><GitBranch className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-red-500" /><div><p className="text-2xl font-semibold">{stats.open}</p><p className="text-xs text-muted-foreground">Open</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold">{stats.inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.completed}</p><p className="text-xs text-muted-foreground">Completed</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-purple-500" /><div><p className="text-2xl font-semibold">{((stats.completed / stats.total) * 100).toFixed(0)}%</p><p className="text-xs text-muted-foreground">Completion</p></div></div></CardContent></Card>
      </div>

      <Card data-testid="card-new-task">
        <CardHeader><CardTitle className="text-base">Create Task</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} data-testid="input-title" />
            <Input placeholder="Assignee" value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} data-testid="input-assignee" />
            <Select value={newTask.status} onValueChange={(v) => setNewTask({ ...newTask, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
              <SelectTrigger data-testid="select-priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending || !newTask.title} className="w-full" data-testid="button-create-task">
            <Plus className="w-4 h-4 mr-2" /> Create Task
          </Button>
        </CardContent>
      </Card>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {(activeNav === "all" || activeNav === "open") && (
        <div className="space-y-3">
          {isLoading ? (
            <p>Loading...</p>
          ) : (tasks || []).filter((t: Task) => activeNav === "all" || t.status === "open").map((task) => (
            <Card key={task.id} className="hover-elevate cursor-pointer" data-testid={`task-${task.id}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.assignee}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>{task.priority}</Badge>
                    <Button size="icon" variant="ghost" data-testid={`button-delete-${task.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {activeNav === "progress" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.inProgress} tasks in progress</p></CardContent></Card>}
      {activeNav === "completed" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.completed} tasks completed</p></CardContent></Card>}
      {activeNav === "analytics" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Task completion trends</p></CardContent></Card>}
    </div>
  );
}
