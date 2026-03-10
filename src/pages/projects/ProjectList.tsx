import React, { useState } from 'react';
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Eye, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { EnterpriseContextSwitcher, buildScopeHeaders } from '@/components/enterprise/EnterpriseContextSwitcher';
import { StandardPage } from '@/components/layout/StandardPage';
import { formatNumber } from '@/lib/formatters';

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
    const [buId, setBuId] = useState<string | undefined>();

    const { data: projects, isLoading } = useQuery<Project[]>({
        queryKey: ['/api/ppm/projects', buId],
        queryFn: () =>
            fetch('/api/ppm/projects', { headers: buildScopeHeaders({ 'business-unit': buId }) })
                .then(r => r.json()),
    });

    const statusConfig: Record<string, { label: string, variant: "default" | "destructive" | "secondary" | "outline" }> = {
        ACTIVE: { label: "Active", variant: "default" },
        DRAFT: { label: "Draft", variant: "secondary" },
        CLOSED: { label: "Closed", variant: "outline" },
        ON_TRACK: { label: "On Track", variant: "default" },
        AT_RISK: { label: "At Risk", variant: "destructive" },
        DELAYED: { label: "Delayed", variant: "destructive" },
    };

    const columns = [
        {
            id: "projectNumber",
            header: "Number",
            width: "150px",
            cell: (proj: Project) => <div className="px-2 h-full flex items-center font-mono text-xs">{proj.projectNumber}</div>
        },
        {
            id: "name",
            header: "Project",
            width: "300px",
            cell: (proj: Project) => (
                <div className="px-2 h-full flex flex-col justify-center">
                    <div className="font-semibold">{proj.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{proj.description}</div>
                </div>
            )
        },
        {
            id: "projectType",
            header: "Type",
            width: "150px",
            cell: (proj: Project) => <div className="px-2 h-full flex items-center"><Badge variant="outline">{proj.projectType}</Badge></div>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (proj: Project) => {
                const config = statusConfig[proj.status] || { label: proj.status, variant: "secondary" };
                return (
                    <div className="px-2 h-full flex items-center">
                        <Badge variant={config.variant}>
                            {config.label}
                        </Badge>
                    </div>
                );
            }
        },
        {
            id: "percentComplete",
            header: "Progress",
            width: "200px",
            cell: (proj: Project) => {
                const progress = parseFloat(proj.percentComplete || "0");
                return (
                    <div className="px-2 h-full flex flex-col justify-center w-36 space-y-1">
                        <div className="flex justify-between text-[10px]">
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>
                );
            }
        },
        {
            id: "budget",
            header: "Budget",
            width: "150px",
            cell: (proj: Project) => (
                <div className="px-2 h-full flex items-center justify-end font-medium w-full">
                    ${formatNumber(parseFloat(proj.budget || "0"))}
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            width: "100px",
            cell: (proj: Project) => (
                <div className="px-2 h-full flex items-center gap-2">
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
        <StandardPage
            title="Project List"
            description="View and manage projects in the portfolio"
            actions={
                <EnterpriseContextSwitcher
                    type="business-unit"
                    value={buId}
                    onChange={setBuId}
                />
            }
        >
            <div className="space-y-4">
                <div className="bg-card w-full rounded-md border shadow-sm">
                    <InteractiveSpreadsheet
                        data={projects || []}
                        columns={columns}
                        onChange={() => { }}
                        virtualized={true}
                        containerHeight="600px"
                    />
                </div>
            </div>
        </StandardPage>
    );
}
