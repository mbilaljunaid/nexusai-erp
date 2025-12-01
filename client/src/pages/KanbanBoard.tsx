import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid } from "lucide-react";

export default function KanbanBoard() {
  const { data: board = null } = useQuery<any>({ queryKey: ["/api/projects/kanban-board"] });
  const { data: tasks = [] } = useQuery<any[]>({ queryKey: ["/api/projects/kanban-tasks"] });

  const columns = board?.columns || ["Todo", "In Progress", "Review", "Done"];
  const statusMap: Record<string, string> = {
    "Todo": "todo"
    "In Progress": "in_progress"
    "Review": "review"
    "Done": "done"
  };

  const columnColors: Record<string, string> = {
    "Todo": "bg-gray-50 dark:bg-gray-900"
    "In Progress": "bg-blue-50 dark:bg-blue-950"
    "Review": "bg-purple-50 dark:bg-purple-950"
    "Done": "bg-green-50 dark:bg-green-950"
  };

  const tasksByStatus: Record<string, any[]> = {};
  columns.forEach((col: string) => {
    tasksByStatus[statusMap[col]] = tasks.filter((t: any) => t.status === statusMap[col]);
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <LayoutGrid className="w-8 h-8" />
          Kanban Board
        </h1>
        <p className="text-muted-foreground">Drag tasks between columns to update status</p>
      </div>

      <div className="grid grid-cols-4 gap-4 overflow-x-auto pb-4">
        {columns.map((column: string) => (
          <div key={column} className={`flex-1 min-w-80 p-4 rounded-lg ${columnColors[column]}`}>
            <div className="mb-4">
              <h3 className="font-bold text-lg">{column}</h3>
              <p className="text-sm text-muted-foreground">{tasksByStatus[statusMap[column]]?.length || 0} tasks</p>
            </div>

            <div className="space-y-2">
              {(tasksByStatus[statusMap[column]] || []).map((task: any) => (
                <Card key={task.id} className="cursor-move hover-elevate">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-sm">{task.title}</p>
                      <Badge variant="secondary" className="text-xs">{task.taskKey}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{task.assignee || "Unassigned"}</span>
                      {task.estimatedHours && <span>{task.estimatedHours}h</span>}
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
