import { useQuery } from "@tanstack/react-query";
import React, { useState } from 'react';
import { StandardDashboard, DashboardWidget } from '@/components/layout/StandardDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Package, Activity } from 'lucide-react';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import {
    EnterpriseContextSwitcher,
    buildScopeHeaders
} from '@/components/enterprise/EnterpriseContextSwitcher';

export default function CostDashboard() {
    const [period, setPeriod] = useState('CY');
    const [activeBuId, setActiveBuId] = useState<string | undefined>(undefined);
    const [activeInvOrgId, setActiveInvOrgId] = useState<string | undefined>(undefined);

    const scopeHeaders = buildScopeHeaders({
        'business-unit': activeBuId,
        'inventory-org': activeInvOrgId,
    });

    const { data: apiMetrics, isLoading } = useQuery<any>({
        queryKey: ["/api/manufacturing/costs/metrics", period, activeBuId, activeInvOrgId],
        queryFn: async () => {
            const res = await fetch(
                `/api/manufacturing/costs/metrics?period=${period}`,
                { headers: { 'Content-Type': 'application/json', ...scopeHeaders } }
            );
            if (!res.ok) {
                if (res.status === 404) return null; // Fallback to mock
                throw new Error("Failed to fetch cost metrics");
            }
            return res.json();
        }
    });

    const metrics = apiMetrics || [
        { label: 'Total Inventory Value', value: '$12,450,000', change: '+5.2%', icon: DollarSign, color: "bg-blue-100 text-blue-700" },
        { label: 'Gross Margin (MTD)', value: '32.4%', change: '+1.1%', icon: TrendingUp, color: "bg-green-100 text-green-700" },
        { label: 'WIP Balance', value: '$850,000', change: '-2.5%', icon: Activity, color: "bg-orange-100 text-orange-700" },
        { label: 'Uninvoiced Receipts', value: '$125,000', change: '+0.5%', icon: Package, color: "bg-purple-100 text-purple-700" },
    ];

    const valuationChatData = [
        { name: 'Jan', value: 10500 },
        { name: 'Feb', value: 11200 },
        { name: 'Mar', value: 12450 },
    ];

    const header = (
        <div className="flex justify-between items-center w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cost Management Dashboard</h1>
                <p className="text-muted-foreground">Overview of inventory value and cost variances</p>
            </div>
            <div className="flex items-center gap-3">
                <EnterpriseContextSwitcher
                    type="business-unit"
                    value={activeBuId}
                    onChange={setActiveBuId}
                />
                <EnterpriseContextSwitcher
                    type="inventory-org"
                    value={activeInvOrgId}
                    onChange={setActiveInvOrgId}
                />
                <div className="flex gap-1">
                    <Button variant={period === 'CY' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('CY')}>CY</Button>
                    <Button variant={period === 'QTD' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('QTD')}>QTD</Button>
                    <Button variant={period === 'MTD' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('MTD')}>MTD</Button>
                </div>
            </div>
        </div>
    );

    return (
        <StandardDashboard header={header}>
            {/* Metrics */}
            {metrics.map((metric: any, i: number) => (
                <DashboardWidget key={i} title={metric.label} colSpan={1}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${metric.color}`}>
                            <metric.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change} from last period
                            </p>
                        </div>
                    </div>
                </DashboardWidget>
            ))}

            {/* Charts */}
            <DashboardWidget title="Inventory Valuation Trend" colSpan={2} className="min-h-[350px]">
                <div className="h-[300px] w-full mt-4">
                    <AnalyticsChart
                        title=""
                        data={valuationChatData}
                        type="area"
                        dataKey="value"
                    />
                </div>
            </DashboardWidget>

            <DashboardWidget title="Cost Elements Breakdown" colSpan={2} className="min-h-[350px]">
                <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                    <p>Pie Chart Component Pending</p>
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}
