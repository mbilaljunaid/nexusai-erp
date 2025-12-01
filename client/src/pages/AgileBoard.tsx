import { useState } from "react";
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
    queryKey: ["/api/sprints"]
    retry: false
  });

  const activeSprint = sprints.find(s => s.status === "active") || sprints[0];
  const tasks = activeSprint?.tasks || [];

  const todo = tasks.filter(t => t.status === "todo");
  const inProgress = tasks.filter(t => t.status === "in_progress");
  const done = tasks.filter(t => t.status === "done");

  const stats = {
    velocity: activeSprint?.velocity || 0
    completed: done.length
    inProgress: inProgress.length
    remaining: todo.length
    totalPoints: tasks.reduce((sum, t) => sum + t.points, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Agile Board</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["todo", "in_progress", "done"].map((status) => (
          <div key={status} className="space-y-3">
            <h3 className="font-semibold text-sm uppercase">
              {status === "todo" ? "To Do" : status === "in_progress" ? "In Progress" : "Done"} ({status === "todo" ? todo.length : status === "in_progress" ? inProgress.length : done.length})
            </h3>
            <div className="space-y-2">
              {tasks
                .filter(t => t.status === status)
                .map((task) => (
                  <Card key={task.id} className="hover-elevate cursor-grab">
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">{task.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">{task.assignee}</Badge>
                        <Badge className="text-xs">{task.points}pt</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
