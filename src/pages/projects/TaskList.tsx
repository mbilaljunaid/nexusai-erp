import React from 'react';
import { StandardTable } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

export interface Task {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "review" | "done";
    priority: "low" | "medium" | "high" | "urgent";
    assignee: { name: string; initials: string };
    project: string;
    dueDate?: string;
}

export default function TaskList() {
    const { data: tasks = [] } = useQuery<Task[]>({
        queryKey: ['/api/projects/tasks'],
        queryFn: async () => {
            const res = await fetch('/api/projects/tasks');
            if (!res.ok) return [];
            return res.json();
        }
    });

    const columns: any[] = [
        {
            header: "Task",
            accessorKey: "title",
            cell: (task: Task) => (
                <div>
                    <div className="font-semibold">{task.title}</div>
                    <div className="text-xs text-muted-foreground">{task.project}</div>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (task: Task) => (
                <Badge variant="outline" className="capitalize">{task.status.replace('_', ' ')}</Badge>
            )
        },
        {
            header: "Priority",
            accessorKey: "priority",
            cell: (task: Task) => {
                let color = "bg-gray-100 text-gray-800";
                if (task.priority === 'urgent') color = "bg-red-100 text-red-800";
                if (task.priority === 'high') color = "bg-orange-100 text-orange-800";
                if (task.priority === 'medium') color = "bg-blue-100 text-blue-800";

                return (
                    <Badge variant="secondary" className={`${color} capitalize border-none`}>
                        {task.priority}
                    </Badge>
                )
            }
        },
        {
            header: "Assignee",
            accessorKey: "assignee",
            cell: (task: Task) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">{task.assignee.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.assignee.name}</span>
                </div>
            )
        },
        {
            header: "Due Date",
            accessorKey: "dueDate",
            cell: (task: Task) => <span className="text-sm">{task.dueDate || '-'}</span>
        }
    ];

    return (
        <StandardTable
            data={tasks}
            columns={columns}
            keyExtractor={(t) => t.id}
            filterColumn="title"
            filterPlaceholder="Search tasks..."
        />
    );
}
