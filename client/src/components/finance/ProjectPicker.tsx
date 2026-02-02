import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ProjectPickerProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function ProjectPicker({ value, onChange, placeholder = "Select Project..." }: ProjectPickerProps) {
    const { data: projects = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/ppm/projects"],
        queryFn: () => fetch("/api/ppm/projects").then(res => res.json()),
    });

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-muted/50">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground italic">Loading projects...</span>
            </div>
        );
    }

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                        {project.projectNumber} - {project.name}
                    </SelectItem>
                ))}
                {projects.length === 0 && (
                    <div className="p-2 text-xs text-muted-foreground text-center">
                        No projects found
                    </div>
                )}
            </SelectContent>
        </Select>
    );
}
