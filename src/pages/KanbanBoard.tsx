import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { KanbanBoard as GenericKanbanBoard } from "@/components/ui/KanbanBoard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function KanbanBoard() {
  const { data: board = null } = useQuery<any>({ queryKey: ["/api/projects/kanban-board"] });
  const { data: tasks = [] } = useQuery<any[]>({ queryKey: ["/api/projects/kanban-tasks"] });

  const columns = board?.columns || ["Todo", "In Progress", "Review", "Done"];
  const statusMap: Record<string, string> = {
    "Todo": "todo",
    "In Progress": "in_progress",
    "Review": "review",
    "Done": "done",
  };

  const columnColors: Record<string, string> = {
    "Todo": "bg-gray-50 dark:bg-gray-900",
    "In Progress": "bg-blue-50 dark:bg-blue-950",
    "Review": "bg-purple-50 dark:bg-purple-950",
    "Done": "bg-green-50 dark:bg-green-950",
  };

  const tasksByStatus: Record<string, any[]> = {};
  columns.forEach((col: string) => {
    tasksByStatus[statusMap[col]] = tasks.filter((t: any) => t.status === statusMap[col]);
  });

  return (
    <StandardPage
      title="Project Kanban"
      description="Drag tasks between columns to update status"
    >
      <GenericKanbanBoard<any>
        columns={columns.map((c: string) => ({
          id: statusMap[c],
          title: c,
          bgColor: columnColors[c],
        }))}
        items={tasks}
        getColumnId={(t) => t.status}
        onDragEnd={(taskId, newStatus) => {
          // Add drag and drop logic here
        }}
        renderCard={(task) => (
          <Card className="cursor-grab active:cursor-grabbing hover-elevate border-none">
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
        )}
      />
    </StandardPage>
  );
}
