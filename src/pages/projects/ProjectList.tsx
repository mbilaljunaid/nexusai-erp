import React from 'react';
import { StandardTable } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Eye, TrendingUp } from "lucide-react";
import { Link } from "wouter";

interface Project {
    id: string;
    projectNumber: string;
    name: string;
    description: string;
    status: string;
    budget: string;
    percentComplete: string;
    projectType: string;
    startDate: string;
    dueDate?: string;
}

export default function ProjectList() {
    const { data: projects, isLoading } = useQuery<Project[]>({
        queryKey: ['/api/ppm/projects'],
    });

    const statusConfig: Record<string, { label: string, variant: "default" | "destructive" | "secondary" | "outline" }> = {
        ACTIVE: { label: "Active", variant: "default" },
        DRAFT: { label: "Draft", variant: "secondary" },
        CLOSED: { label: "Closed", variant: "outline" },
        ON_TRACK: { label: "On Track", variant: "default" },
        AT_RISK: { label: "At Risk", variant: "destructive" },
        DELAYED: { label: "Delayed", variant: "destructive" },
    };

    const columns: any[] = [
        {
            header: "Number",
            accessorKey: "projectNumber",
            cell: (proj: Project) => <span className="font-mono text-xs">{proj.projectNumber}</span>
        },
        {
            header: "Project",
            accessorKey: "name",
            cell: (proj: Project) => (
                <div>
                    <div className="font-semibold">{proj.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{proj.description}</div>
                </div>
            )
        },
        {
            header: "Type",
            accessorKey: "projectType",
            cell: (proj: Project) => <Badge variant="outline">{proj.projectType}</Badge>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (proj: Project) => {
                const config = statusConfig[proj.status] || { label: proj.status, variant: "secondary" };
                return (
                    <Badge variant={config.variant}>
                        {config.label}
                    </Badge>
                );
            }
        },
        {
            header: "Progress",
            accessorKey: "percentComplete",
            cell: (proj: Project) => {
                const progress = parseFloat(proj.percentComplete || "0");
                return (
                    <div className="w-[120px] space-y-1">
                        <div className="flex justify-between text-[10px]">
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>
                );
            }
        },
        {
            header: "Budget",
            accessorKey: "budget",
            cell: (proj: Project) => (
                <span className="font-medium">
                    ${parseFloat(proj.budget || "0").toLocaleString()}
                </span>
            )
        },
        {
            header: "Actions",
            id: "actions",
            cell: (proj: Project) => (
                <div className="flex gap-2">
                    <Link to={`/projects/analytics?id=${proj.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </Button>
                    </Link>
                    <Link to={`/projects/tasks?id=${proj.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )
        }
    ];

    return (
        <StandardTable
            data={projects || []}
            columns={columns}
            keyExtractor={(p) => p.id}
            filterColumn="name"
            filterPlaceholder="Filter projects..."
            isLoading={isLoading}
        />
    );
}
