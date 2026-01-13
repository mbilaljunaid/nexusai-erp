import React from 'react';
import { StandardDashboard, DashboardWidget } from '@/components/layout/StandardDashboard';
import { Factory, Zap, BoxesIcon, TrendingUp, AlertTriangle } from 'lucide-react';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { Button } from '@/components/ui/button';

export default function ManufacturingDashboard() {
    // Mock Data based on Manufacturing.tsx and typical manufacturing KPIs
    const metrics = [
        { label: 'Active Work Orders', value: '12', change: '+2', icon: Factory, color: "bg-blue-100 text-blue-700" },
        { label: 'Capacity Utilization', value: '87%', change: '+5%', icon: Zap, color: "bg-green-100 text-green-700" },
        { label: 'Avg Lead Time', value: '2.1 days', change: '-0.4 days', icon: BoxesIcon, color: "bg-purple-100 text-purple-700" },
        { label: 'Quality Rate', value: '98.5%', change: '+0.2%', icon: TrendingUp, color: "bg-pink-100 text-pink-700" },
    ];

    const productionData = [
        { name: 'Week 1', value: 3200 },
        { name: 'Week 2', value: 3400 },
        { name: 'Week 3', value: 3100 },
        { name: 'Week 4', value: 3800 },
    ];

    const alerts = [
        { id: 1, message: "Machine #4 Maintenance Due", type: "warning" },
        { id: 2, message: "Raw Material Shortage: Steel", type: "critical" }
    ];

    const header = (
        <div className="flex justify-between items-center w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manufacturing Operations</h1>
                <p className="text-muted-foreground">Real-time production monitoring and control</p>
            </div>
            <div className="space-x-2">
                <Button>Create Work Order</Button>
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
                                {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change} vs last month
                            </p>
                        </div>
                    </div>
                </DashboardWidget>
            ))}

            {/* Charts */}
            <DashboardWidget title="Production Output Trend" colSpan={2} className="min-h-[350px]">
                <div className="h-[300px] w-full mt-4">
                    <AnalyticsChart
                        title=""
                        data={productionData}
                        type="area"
                        dataKey="value"
                    />
                </div>
            </DashboardWidget>

            <DashboardWidget title="Shop Floor Alerts" colSpan={2} className="min-h-[350px]">
                <div className="space-y-4 mt-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className={`p-4 rounded-lg flex items-center gap-3 ${alert.type === 'critical' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                            <AlertTriangle className="h-5 w-5" />
                            <div>
                                <p className="font-semibold">{alert.message}</p>
                                <p className="text-xs opacity-80">Action required immediately</p>
                            </div>
                        </div>
                    ))}
                    {alerts.length === 0 && <p className="text-muted-foreground text-center">No active alerts</p>}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}
