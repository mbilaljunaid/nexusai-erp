import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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

export function KanbanBoard({ columns: propColumns, onAddTask }: KanbanBoardProps) {
  const { data: apiColumns, isLoading } = useQuery<KanbanColumn[]>({
    queryKey: ['/api/dashboard/kanban'],
    enabled: !propColumns,
    staleTime: 30000,
  });

  const kanbanColumns = propColumns || apiColumns || [];

  if (isLoading && !propColumns) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4" data-testid="board-kanban">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-72">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="p-3 border rounded-lg space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (kanbanColumns.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground" data-testid="board-kanban">
        <p>No tasks available</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" data-testid="board-kanban">
      {kanbanColumns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-72">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {column.tasks.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onAddTask?.(column.id)}
                  data-testid={`button-add-task-${column.id}`}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  {column.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border rounded-lg hover-elevate cursor-pointer"
                      data-testid={`task-${task.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium leading-tight flex items-center gap-1">
                          {task.aiGenerated && (
                            <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
                          )}
                          {task.title}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 flex-shrink-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Move</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {task.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Flag className={`h-3 w-3 ${priorityColors[task.priority]}`} />
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {task.dueDate}
                            </span>
                          )}
                        </div>
                        {task.assignee && (
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              {task.assignee.initials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
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
