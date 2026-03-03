import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { Plus, Zap, TrendingUp, Users, Calendar } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { KanbanBoard } from "@/components/ui/KanbanBoard";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  sprint: string;
  assignee: string;
  points: number;
}

interface Sprint {
  id: string;
  name: string;
  status: "planning" | "active" | "completed";
  startDate: string;
  endDate: string;
  tasks: Task[];
  velocity: number;
}

export default function AgileBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const formMetadata = getFormMetadata("agileBoard");
  const { data: sprints = [] } = useQuery<Sprint[]>({
    queryKey: ["/api/sprints"],
    retry: false,
  });

  const activeSprint = sprints.find(s => s.status === "active") || sprints[0];
  const tasks = activeSprint?.tasks || [];

  const todo = tasks.filter(t => t.status === "todo");
  const inProgress = tasks.filter(t => t.status === "in_progress");
  const done = tasks.filter(t => t.status === "done");

  const stats = {
    velocity: activeSprint?.velocity || 0,
    completed: done.length,
    inProgress: inProgress.length,
    remaining: todo.length,
    totalPoints: tasks.reduce((sum, t) => sum + t.points, 0),
  };

  return (
    <StandardPage
      title="Agile Board"
      description="Sprint planning and kanban board"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
        <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={sprints} onFilter={setFiltered} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agile Board</h1>
          <p className="text-muted-foreground text-sm">Sprint planning and kanban board</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Sprint
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.velocity}</p>
                <p className="text-xs text-muted-foreground">Velocity</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
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
              <Zap className="h-5 w-5 text-blue-500" />
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
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.totalPoints}</p>
                <p className="text-xs text-muted-foreground">Sprint Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeSprint && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{activeSprint.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>
      )}

      <KanbanBoard<Task>
        columns={[
          { id: "todo", title: "To Do", bgColor: "bg-gray-50 dark:bg-gray-900" },
          { id: "in_progress", title: "In Progress", bgColor: "bg-blue-50 dark:bg-blue-950" },
          { id: "done", title: "Done", bgColor: "bg-green-50 dark:bg-green-950" },
        ]}
        items={tasks}
        getColumnId={(t) => t.status}
        onDragEnd={(taskId, newStatus) => {
          // Optimistic update or call API here
          // e.g. updateTaskMutation.mutate({ id: taskId, status: newStatus as any })
        }}
        renderCard={(task) => (
          <Card className="cursor-grab active:cursor-grabbing hover-elevate">
            <CardContent className="p-3">
              <p className="font-medium text-sm">{task.title}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="secondary" className="text-xs">{task.assignee}</Badge>
                <Badge className="text-xs">{task.points}pt</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      />
    </StandardPage>
  );
}
