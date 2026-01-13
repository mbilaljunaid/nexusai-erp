import React from 'react';
import { StandardTable } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Project {
    id: string;
    name: string;
    description: string;
    status: "on_track" | "at_risk" | "delayed";
    progress: number;
    tasks: { total: number; completed: number };
    team: { name: string; initials: string }[];
    dueDate: string;
}

export default function ProjectList() {
    // Mock Projects Data
    const projects: Project[] = [
        { id: "1", name: "Website Redesign", description: "Complete overhaul of the company website with new branding", status: "on_track", progress: 65, tasks: { total: 24, completed: 16 }, team: [{ name: "Alex Chen", initials: "AC" }, { name: "Maria Garcia", initials: "MG" }], dueDate: "Dec 30, 2024" },
        { id: "2", name: "Mobile App Development", description: "Native mobile app for iOS and Android platforms", status: "at_risk", progress: 40, tasks: { total: 48, completed: 19 }, team: [{ name: "James Wilson", initials: "JW" }], dueDate: "Jan 15, 2025" },
        { id: "3", name: "ERP Migration", description: "Migrate legacy systems", status: "on_track", progress: 85, tasks: { total: 100, completed: 85 }, team: [{ name: "Sarah Jones", initials: "SJ" }], dueDate: "Feb 20, 2025" },
    ];

    const statusConfig = {
        on_track: { label: "On Track", variant: "default" as const }, // Badge variant
        at_risk: { label: "At Risk", variant: "destructive" as const },
        delayed: { label: "Delayed", variant: "secondary" as const },
    };

    const columns: any[] = [
        {
            header: "Project",
            accessorKey: "name",
            cell: (proj: Project) => (
                <div>
                    <div className="font-semibold">{proj.name}</div>
                    <div className="text-xs text-muted-foreground">{proj.description}</div>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (proj: Project) => (
                <Badge variant={statusConfig[proj.status].variant}>
                    {statusConfig[proj.status].label}
                </Badge>
            )
        },
        {
            header: "Progress",
            accessorKey: "progress",
            cell: (proj: Project) => (
                <div className="w-[150px] space-y-1">
                    <div className="flex justify-between text-xs">
                        <span>{proj.progress}%</span>
                    </div>
                    <Progress value={proj.progress} className="h-2" />
                </div>
            )
        },
        {
            header: "Team",
            accessorKey: "team",
            cell: (proj: Project) => (
                <div className="flex -space-x-2">
                    {proj.team.map((member, i) => (
                        <Avatar key={i} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {member.initials}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                </div>
            )
        },
        {
            header: "Due Date",
            accessorKey: "dueDate",
            cell: (proj: Project) => (
                <span className="text-sm">{proj.dueDate}</span>
            )
        }
    ];

    return (
        <StandardTable
            data={projects}
            columns={columns}
            keyExtractor={(p) => p.id}
            filterColumn="name"
            filterPlaceholder="Filter projects..."
        />
    );
}
