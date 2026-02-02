import React from 'react';
import { StandardDashboard, DashboardWidget } from '@/components/layout/StandardDashboard';
import { FolderKanban, DollarSign, BarChart3, TrendingUp } from 'lucide-react';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

export default function ProjectsDashboard() {
    const { data: summary, isLoading } = useQuery<any>({
        queryKey: ['/api/ppm/summary'],
    });

    const metrics = [
        { label: 'Total Projects', value: summary?.projectCount || '0', change: '+2', icon: FolderKanban, color: "bg-blue-100 text-blue-700" },
        { label: 'Total Budgeted', value: `$${parseFloat(summary?.totalBudget || "0").toLocaleString()}`, change: '0', icon: DollarSign, color: "bg-green-100 text-green-700" },
        { label: 'Actual Cost (Burdened)', value: `$${parseFloat(summary?.totalBurdenedCost || "0").toLocaleString()}`, change: '+15%', icon: BarChart3, color: "bg-purple-100 text-purple-700" },
        { label: 'Cost Variance', value: `$${(parseFloat(summary?.totalBudget || "0") - parseFloat(summary?.totalBurdenedCost || "0")).toLocaleString()}`, change: 'Real-time', icon: TrendingUp, color: "bg-orange-100 text-orange-700" },
    ];

    const burndownData = [
        { name: 'Planned Value', value: 100 },
        { name: 'Earned Value', value: 85 },
        { name: 'Actual Cost', value: 90 },
    ];

    const header = (
        <div className="flex justify-between items-center w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Project Portfolio Management</h1>
                <p className="text-muted-foreground">Financial summary and performance metrics across the portfolio</p>
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
                            <div className="text-xl font-bold">{metric.value}</div>
                            <p className="text-[10px] text-muted-foreground">
                                {metric.change}
                            </p>
                        </div>
                    </div>
                </DashboardWidget>
            ))}

            {/* Performance Indices */}
            <DashboardWidget title="EVM Performance Indices" colSpan={2} className="min-h-[250px]">
                <div className="grid grid-cols-2 gap-4 p-4">
                    <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-blue-50/30">
                        <span className="text-sm text-muted-foreground mb-1">Portfolio CPI</span>
                        <span className="text-4xl font-bold text-blue-600">1.04</span>
                        <Badge className="mt-2" variant="default">Under Budget</Badge>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-purple-50/30">
                        <span className="text-sm text-muted-foreground mb-1">Portfolio SPI</span>
                        <span className="text-4xl font-bold text-purple-600">0.98</span>
                        <Badge className="mt-2" variant="destructive">Behind Schedule</Badge>
                    </div>
                </div>
            </DashboardWidget>

            {/* Charts */}
            <DashboardWidget title="EVM Comparison" colSpan={2} className="min-h-[350px]">
                <div className="h-[300px] w-full mt-4">
                    <AnalyticsChart
                        title=""
                        data={burndownData}
                        type="bar"
                        dataKey="value"
                    />
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}
