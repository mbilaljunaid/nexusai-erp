import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { Plus, CheckCircle2, Clock, AlertCircle, GitBranch, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Task {
  id: string;
  title: string;
  status: "open" | "in_progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: string;
}

export default function TaskManagement() {
  const [activeNav, setActiveNav] = useState("all");
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    retry: false,
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

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {(activeNav === "all" || activeNav === "open") && (
        <div className="space-y-3">
          {(tasks || []).filter(t => activeNav === "all" || t.status === "open").map((task) => (
            <Card key={task.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold text-sm">{task.title}</p><p className="text-xs text-muted-foreground">{task.assignee}</p></div><Badge variant={task.priority === "high" ? "destructive" : "secondary"}>{task.priority}</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "progress" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.inProgress} tasks in progress</p></CardContent></Card>}
      {activeNav === "completed" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.completed} tasks completed</p></CardContent></Card>}
      {activeNav === "analytics" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Task completion trends</p></CardContent></Card>}
    </div>
  );
}
