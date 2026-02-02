import React from 'react';
import { StandardTable } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    const tasks: Task[] = [
        { id: "1", title: "Design homepage mockups", status: "done", priority: "high", assignee: { name: "Maria Garcia", initials: "MG" }, project: "Website Redesign" },
        { id: "2", title: "Implement user authentication", status: "in_progress", priority: "urgent", assignee: { name: "James Wilson", initials: "JW" }, dueDate: "Dec 14", project: "Mobile App" },
        { id: "3", title: "Setup CI/CD pipeline", status: "todo", priority: "medium", assignee: { name: "Alex Chen", initials: "AC" }, project: "ERP Migration" },
        { id: "4", title: "Review database schema", status: "review", priority: "high", assignee: { name: "Sarah Jones", initials: "SJ" }, dueDate: "Dec 20", project: "ERP Migration" },
    ];

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
