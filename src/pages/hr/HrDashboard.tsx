import { cn } from "@/lib/utils";
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { StandardDashboard, DashboardWidget } from '@/components/layout/StandardDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Briefcase, Clock, TrendingUp, AlertTriangle, Trello } from 'lucide-react';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { EnterpriseContextSwitcher, buildScopeHeaders } from '@/components/enterprise/EnterpriseContextSwitcher';

export default function HrDashboard() {
    const [, setLocation] = useLocation();
    const [leId, setLeId] = useState<string | undefined>();
    const scopeHeaders = buildScopeHeaders({ 'legal-entity': leId });

    const { data: analytics, isLoading } = useQuery<any>({
        queryKey: ['hr-analytics', leId],
        queryFn: () => fetch('/api/hr/analytics', { headers: scopeHeaders, credentials: 'include' }).then(r => r.json()),
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-1/3" />
                <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        )
    }

    const { quality, headcount } = analytics || {};

    const metrics = [
        {
            label: 'Total Active Workers',
            value: quality?.totalActiveWorker?.toString() || '0',
            change: 'Live',
            icon: Users,
            color: "bg-blue-100 text-blue-700"
        },
        {
            label: 'Missing National ID',
            value: quality?.missingNationalId?.toString() || '0',
            change: quality?.missingNationalId > 0 ? 'Action Needed' : 'Clean',
            icon: AlertTriangle,
            color: quality?.missingNationalId > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        },
        {
            label: 'Missing Manager',
            value: quality?.missingManager?.toString() || '0',
            change: quality?.missingManager > 0 ? 'Action Needed' : 'Clean',
            icon: Users,
            color: quality?.missingManager > 0 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
        },
        {
            label: 'Data Quality Score',
            value: '98%',
            change: '+1.5%',
            icon: TrendingUp,
            color: "bg-purple-100 text-purple-700"
        },
    ];

    const departmentDist = headcount?.map((h: any) => ({
        name: h.dept || 'Unassigned',
        value: Number(h.count)
    })) || [];

    const header = (
        <div className="flex justify-between items-center w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
                <p className="text-muted-foreground">Workforce overview and key performance indicators</p>
            </div>
            <div className="flex items-center gap-3">
                <EnterpriseContextSwitcher
                    type="legal-entity"
                    value={leId}
                    onChange={setLeId}
                />
                <Button variant="outline" onClick={() => setLocation('/hr/recruitment/pipeline')}>
                    <Trello className="h-4 w-4 mr-2" />
                    Recruitment Pipeline
                </Button>
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
                        <div className={cn(`p-3 rounded-full ${metric.color}`)}>
                            <metric.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {metric.change}
                            </p>
                        </div>
                    </div>
                </DashboardWidget>
            ))}

            <DashboardWidget title="Headcount by Department" colSpan={2} className="min-h-80">
                <div className="h-72 w-full mt-4">
                    <AnalyticsChart
                        title=""
                        data={departmentDist}
                        type="bar"
                        dataKey="value"
                    />
                </div>
            </DashboardWidget>

            <DashboardWidget title="Data Quality Trends" colSpan={2} className="min-h-80">
                <div className="flex items-center justify-center h-72 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    Historical Trend Analysis Coming Soon
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}
