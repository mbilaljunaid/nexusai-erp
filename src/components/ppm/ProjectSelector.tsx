
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Project {
    id: string;
    projectNumber: string;
    name: string;
    status: string;
}

interface ProjectSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function ProjectSelector({ value, onChange }: ProjectSelectorProps) {
    const [open, setOpen] = useState(false);

    const { data: projects, isLoading } = useQuery<Project[]>({
        queryKey: ["/api/projects"],
        queryFn: async () => {
            // Fallback to empty array if endpoint fails or returns non-array
            try {
                const res = await fetch("/api/projects");
                if (!res.ok) throw new Error("Failed to fetch");
                return await res.json();
            } catch (e) {
                return [];
            }
        }
    });

    const selectedProject = projects?.find((p) => p.id === value) || projects?.find(p => p.projectNumber === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-72 justify-between h-12 px-4 shadow-sm border-border"
                >
                    <div className="flex items-center gap-3 text-left">
                        <div className="bg-primary/10 p-2 rounded-md">
                            <FolderKanban className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Project</span>
                            <span className="font-semibold text-foreground dark:text-slate-200 truncate max-w-44">
                                {isLoading ? "Loading..." : selectedProject ? selectedProject.name : "Select Project..."}
                            </span>
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0">
                <Command>
                    <CommandInput placeholder="Search projects..." />
                    <CommandList>
                        <CommandEmpty>No project found.</CommandEmpty>
                        <CommandGroup>
                            {projects?.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={project.name}
                                    onSelect={() => {
                                        // Prefer ID, fallback to Project Number if ID is missing (legacy)
                                        onChange(project.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === project.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{project.name}</span>
                                        <span className="text-xs text-muted-foreground">{project.projectNumber} • <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{project.status}</Badge></span>

                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
