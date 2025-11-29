import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MoreHorizontal, Flag, Calendar, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanTask {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: { name: string; initials: string };
  dueDate?: string;
  tags?: string[];
  aiGenerated?: boolean;
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
}

const priorityColors = {
  low: "text-muted-foreground",
  medium: "text-yellow-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

interface KanbanBoardProps {
  columns?: KanbanColumn[];
  onTaskMove?: (taskId: string, fromColumn: string, toColumn: string) => void;
  onAddTask?: (columnId: string) => void;
}

export function KanbanBoard({ columns, onAddTask }: KanbanBoardProps) {
  // todo: remove mock functionality
  const defaultColumns: KanbanColumn[] = columns || [
    {
      id: "todo",
      title: "To Do",
      tasks: [
        {
          id: "1",
          title: "Research competitor pricing",
          priority: "medium",
          assignee: { name: "Alex Chen", initials: "AC" },
          dueDate: "Dec 18",
          tags: ["Research"],
        },
        {
          id: "2",
          title: "Update user documentation",
          priority: "low",
          assignee: { name: "Maria Garcia", initials: "MG" },
          dueDate: "Dec 20",
        },
      ],
    },
    {
      id: "in_progress",
      title: "In Progress",
      tasks: [
        {
          id: "3",
          title: "Design new dashboard layout",
          priority: "high",
          assignee: { name: "Emily Brown", initials: "EB" },
          dueDate: "Dec 15",
          tags: ["Design", "UI"],
          aiGenerated: true,
        },
        {
          id: "4",
          title: "Implement lead scoring API",
          priority: "urgent",
          assignee: { name: "James Wilson", initials: "JW" },
          dueDate: "Dec 14",
          tags: ["Backend"],
        },
      ],
    },
    {
      id: "review",
      title: "Review",
      tasks: [
        {
          id: "5",
          title: "Review Q4 marketing copy",
          priority: "medium",
          assignee: { name: "Alex Chen", initials: "AC" },
          dueDate: "Dec 16",
          aiGenerated: true,
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        {
          id: "6",
          title: "Set up CI/CD pipeline",
          priority: "high",
          assignee: { name: "James Wilson", initials: "JW" },
          tags: ["DevOps"],
        },
      ],
    },
  ];

  const [kanbanColumns] = useState(defaultColumns);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" data-testid="board-kanban">
      {kanbanColumns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-72">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {column.tasks.length}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => onAddTask?.(column.id)}
                  data-testid={`button-add-task-${column.id}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 p-1">
                  {column.tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="hover-elevate cursor-grab active:cursor-grabbing"
                      data-testid={`kanban-task-${task.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {task.aiGenerated && (
                              <Sparkles className="h-3 w-3 text-primary" />
                            )}
                            <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Assign</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            {task.assignee && (
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {task.assignee.initials}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {task.dueDate}
                              </div>
                            )}
                          </div>
                          <Flag className={`h-3 w-3 ${priorityColors[task.priority]}`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
