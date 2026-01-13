import React from 'react';
import { StandardDashboard, DashboardWidget } from '@/components/layout/StandardDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Briefcase, Clock, TrendingUp } from 'lucide-react';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { Button } from '@/components/ui/button';

export default function HrDashboard() {
    const metrics = [
        { label: 'Total Employees', value: '1,245', change: '+12%', icon: Users, color: "bg-blue-100 text-blue-700" },
        { label: 'Attendance Rate', value: '95.2%', change: '+0.5%', icon: Clock, color: "bg-green-100 text-green-700" },
        { label: 'Open Positions', value: '18', change: '-2', icon: Briefcase, color: "bg-orange-100 text-orange-700" },
        { label: 'Retention Rate', value: '92%', change: '+1.5%', icon: TrendingUp, color: "bg-purple-100 text-purple-700" },
    ];

    const headcountTrend = [
        { name: 'Jan', value: 1150 },
        { name: 'Feb', value: 1180 },
        { name: 'Mar', value: 1210 },
        { name: 'Apr', value: 1225 },
        { name: 'May', value: 1245 },
    ];

    const departmentDist = [
        { name: 'Engineering', value: 450 },
        { name: 'Sales', value: 320 },
        { name: 'Support', value: 210 },
        { name: 'HR & Admin', value: 150 },
        { name: 'Marketing', value: 115 },
    ];

    const header = (
        <div className="flex justify-between items-center w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
                <p className="text-muted-foreground">Workforce overview and key performance indicators</p>
            </div>
            <div className="space-x-2">
                <Button>Download Report</Button>
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
                            <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change} vs last month
                            </p>
                        </div>
                    </div>
                </DashboardWidget>
            ))}

            {/* Charts */}
            <DashboardWidget title="Headcount Trend" colSpan={2} className="min-h-[350px]">
                <div className="h-[300px] w-full mt-4">
                    <AnalyticsChart
                        title=""
                        data={headcountTrend}
                        type="area"
                        dataKey="value"
                    />
                </div>
            </DashboardWidget>

            <DashboardWidget title="Department Distribution" colSpan={2} className="min-h-[350px]">
                <div className="h-[300px] w-full mt-4">
                    <AnalyticsChart
                        title=""
                        data={departmentDist}
                        type="bar" // Using bar as simple proxy for distribution if pie not available
                        dataKey="value"
                    />
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}
