import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CheckCircle2, Clock, AlertCircle, GitBranch } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Task {
  id: string;
  title: string;
  status: "open" | "in_progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: string;
  subTasks: { id: string; title: string; completed: boolean }[];
  dependencies: string[];
  createdAt: string;
}

export default function TaskManagement() {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    retry: false,
  });

  const stats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === "open").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== "completed").length,
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "destructive";
    if (priority === "medium") return "secondary";
    return "default";
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "blocked") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Task Management</h1>
          <p className="text-muted-foreground text-sm">Track tasks, sub-tasks, and dependencies</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.open}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(task.status)}
                      <p className="font-semibold">{task.title}</p>
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority.toUpperCase()}
                      </Badge>
                    </div>
                    {task.subTasks.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Sub-tasks: {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length}
                      </p>
                    )}
                    {task.dependencies.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Blocked by: {task.dependencies.length} task(s)
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.assignee} • Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{task.status.replace(/_/g, " ").toUpperCase()}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="my-tasks" className="space-y-3">
          {tasks.slice(0, 3).map((task) => (
            <Card key={task.id} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{task.title}</p>
                  <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="high-priority" className="space-y-3">
          {tasks.filter(t => t.priority === "high").map((task) => (
            <Card key={task.id} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{task.title}</p>
                  <Badge variant="destructive">HIGH</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
