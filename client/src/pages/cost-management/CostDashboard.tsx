import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Package, Activity } from 'lucide-react';

export default function CostDashboard() {
    const [period, setPeriod] = useState('CY');

    // Mock Data (Replace with API calls later)
    const metrics = [
        { label: 'Total Inventory Value', value: '$12,450,000', change: '+5.2%', icon: DollarSign },
        { label: 'Gross Margin (MTD)', value: '32.4%', change: '+1.1%', icon: TrendingUp },
        { label: 'WIP Balance', value: '$850,000', change: '-2.5%', icon: Activity },
        { label: 'Uninvoiced Receipts', value: '$125,000', change: '+0.5%', icon: Package },
    ];

    const valuationChatData = [
        { name: 'Jan', value: 10500 },
        { name: 'Feb', value: 11200 },
        { name: 'Mar', value: 12450 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Cost Management Dashboard</h1>
                <div className="space-x-2">
                    <Button variant={period === 'CY' ? 'default' : 'outline'} onClick={() => setPeriod('CY')}>CY</Button>
                    <Button variant={period === 'QTD' ? 'default' : 'outline'} onClick={() => setPeriod('QTD')}>QTD</Button>
                    <Button variant={period === 'MTD' ? 'default' : 'outline'} onClick={() => setPeriod('MTD')}>MTD</Button>
                </div>
            </div>

            {/* Primary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric, i) => {
                    // Parse string percentage to number for MetricCard
                    const changeVal = parseFloat(metric.change.replace('%', '').replace('+', ''));
                    return (
                        <MetricCard
                            key={i}
                            title={metric.label}
                            value={metric.value}
                            change={changeVal}
                            icon={metric.icon}
                        />
                    )
                })}
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Valuation Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <AnalyticsChart
                                title="Inventory Valuation"
                                data={valuationChatData}
                                type="area"
                                dataKey="value"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cost Elements Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                            <p>Pie Chart Component Pending</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
