import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Flag, MoreHorizontal, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: { name: string; initials: string };
  dueDate?: string;
  project?: string;
  aiGenerated?: boolean;
  completed?: boolean;
}

const priorityColors: Record<Task["priority"], string> = {
  low: "text-muted-foreground",
  medium: "text-yellow-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

const statusColors: Record<Task["status"], string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  review: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  done: "bg-green-500/10 text-green-600 dark:text-green-400",
};

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  draggable?: boolean;
}

export function TaskCard({ task, onToggleComplete, draggable }: TaskCardProps) {
  return (
    <Card 
      className={`hover-elevate ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      data-testid={`card-task-${task.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={task.completed}
            onCheckedChange={() => onToggleComplete?.(task)}
            className="mt-0.5"
            data-testid={`checkbox-task-${task.id}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h4>
              {task.aiGenerated && (
                <Sparkles className="h-3 w-3 text-primary" />
              )}
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className={`text-xs ${statusColors[task.status]}`}>
                {task.status.replace('_', ' ')}
              </Badge>
              {task.project && (
                <span className="text-xs text-muted-foreground">{task.project}</span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-task-menu-${task.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Task</DropdownMenuItem>
              <DropdownMenuItem>Assign</DropdownMenuItem>
              <DropdownMenuItem>Set Due Date</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {task.assignee && (
              <Avatar className="h-6 w-6">
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
          <Flag className={`h-4 w-4 ${priorityColors[task.priority]}`} />
        </div>
      </CardContent>
    </Card>
  );
}
