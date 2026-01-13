import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface TaskPickerProps {
    projectId?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function TaskPicker({ projectId, value, onChange, placeholder = "Select Task...", disabled }: TaskPickerProps) {
    const { data: tasks = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/ppm/projects", projectId, "tasks"],
        queryFn: () => {
            if (!projectId) return Promise.resolve([]);
            return fetch(`/api/ppm/projects/${projectId}/tasks`).then(res => res.json());
        },
        enabled: !!projectId,
    });

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-muted/50">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground italic">Loading tasks...</span>
            </div>
        );
    }

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled || !projectId}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={!projectId ? "Select a project first" : placeholder} />
            </SelectTrigger>
            <SelectContent>
                {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                        {task.taskNumber} - {task.name}
                    </SelectItem>
                ))}
                {projectId && tasks.length === 0 && (
                    <div className="p-2 text-xs text-muted-foreground text-center">
                        No tasks found for this project
                    </div>
                )}
            </SelectContent>
        </Select>
    );
}
