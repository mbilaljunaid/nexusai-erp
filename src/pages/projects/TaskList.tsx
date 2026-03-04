import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";

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

    const columns: SpreadsheetColumn<any>[] = [
        {
            id: "title",
            header: "Task",
            width: "35%",
            cell: (task: any) => (
                <div className="p-2">
                    <div className="font-semibold">{task.title}</div>
                    <div className="text-xs text-muted-foreground">{task.project}</div>
                </div>
            )
        },
        {
            id: "status",
            header: "Status",
            width: "15%",
            cell: (task: any) => (
                <div className="p-2">
                    <Badge variant="outline" className="capitalize">{task.status.replace('_', ' ')}</Badge>
                </div>
            )
        },
        {
            id: "priority",
            header: "Priority",
            width: "15%",
            cell: (task: any) => {
                let color = "bg-gray-100 text-gray-800";
                if (task.priority === 'urgent') color = "bg-red-100 text-red-800";
                if (task.priority === 'high') color = "bg-orange-100 text-orange-800";
                if (task.priority === 'medium') color = "bg-blue-100 text-blue-800";

                return (
                    <div className="p-2">
                        <Badge variant="secondary" className={`${color} capitalize border-none`}>
                            {task.priority}
                        </Badge>
                    </div>
                )
            }
        },
        {
            id: "assignee",
            header: "Assignee",
            width: "20%",
            cell: (task: any) => (
                <div className="p-2 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">{task.assignee.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.assignee.name}</span>
                </div>
            )
        },
        {
            id: "dueDate",
            header: "Due Date",
            width: "15%",
            cell: (task: any) => <div className="p-2 text-sm">{task.dueDate || '-'}</div>
        }
    ];

    return (
        <StandardPage title="Tasks" description="Project task management">
            <InteractiveSpreadsheet
                data={tasks}
                columns={columns}
                virtualized={true}
                containerHeight="600px"
                onChange={() => { }}
            />
        </StandardPage>
    );
}
