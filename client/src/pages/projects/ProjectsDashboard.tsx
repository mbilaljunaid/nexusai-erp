import React from 'react';
import { StandardDashboard, DashboardWidget } from '@/components/layout/StandardDashboard';
import { FolderKanban, ListTodo, Users, CheckCircle2 } from 'lucide-react';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { Button } from '@/components/ui/button';

export default function ProjectsDashboard() {
    // Mock Data based on Projects.tsx
    const metrics = [
        { label: 'Total Projects', value: '8', change: '+2', icon: FolderKanban, color: "bg-blue-100 text-blue-700" },
        { label: 'On Track', value: '5', change: '-1', icon: CheckCircle2, color: "bg-green-100 text-green-700" },
        { label: 'Active Tasks', value: '42', change: '+12', icon: ListTodo, color: "bg-purple-100 text-purple-700" },
        { label: 'Team Members', value: '12', change: '0', icon: Users, color: "bg-orange-100 text-orange-700" },
    ];

    const burndownData = [
        { name: 'Week 1', value: 100 },
        { name: 'Week 2', value: 85 },
        { name: 'Week 3', value: 60 },
        { name: 'Week 4', value: 45 },
        { name: 'Week 5', value: 20 },
    ];

    const projectStatusDist = [
        { name: 'On Track', value: 5 },
        { name: 'At Risk', value: 2 },
        { name: 'Delayed', value: 1 },
    ];

    const header = (
        <div className="flex justify-between items-center w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
                <p className="text-muted-foreground">Overview of all active projects and team capacity</p>
            </div>
            <div className="space-x-2">
                <Button>Create Project</Button>
            </div>
        </div>
    );

    return (
        <StandardDashboard header={header}>
            {/* Metrics */}
            {metrics.map((metric, i) => (
                <DashboardWidget key={i} title={metric.label} colSpan={1}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${metric.color}`}>
                            <metric.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {metric.change.startsWith('+') || metric.change === '0' ? '' : ''}
                                {metric.change !== '0' ? `${metric.change} vs last month` : 'No change'}
                            </p>
                        </div>
                    </div>
                </DashboardWidget>
            ))}

            {/* Charts */}
            <DashboardWidget title="Sprint Burndown" colSpan={2} className="min-h-[350px]">
                <div className="h-[300px] w-full mt-4">
                    <AnalyticsChart
                        title=""
                        data={burndownData}
                        type="area"
                        dataKey="value"
                    />
                </div>
            </DashboardWidget>

            <DashboardWidget title="Project Status" colSpan={2} className="min-h-[350px]">
                <div className="h-[300px] w-full mt-4">
                    <AnalyticsChart
                        title=""
                        data={projectStatusDist}
                        type="bar"
                        dataKey="value"
                    />
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}
