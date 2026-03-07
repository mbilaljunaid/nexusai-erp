import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import UsageAnalyticsService, { FeatureAdoptionMetric, StickinessStat } from '@/services/usageAnalyticsService';
import { TrendingUp, Users, Activity, Target, Loader2 } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';


export default function UsageAnalyticsDashboard() {
    const [topFeatures, setTopFeatures] = useState<any[]>([]);
    const [stickiness, setStickiness] = useState<StickinessStat | null>(null);
    const [sessionMetrics, setSessionMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [features, stick, sessions] = await Promise.all([
                UsageAnalyticsService.getTopFeatures(10),
                UsageAnalyticsService.calculateCurrentStickiness(),
                UsageAnalyticsService.getSessionMetrics(30)
            ]);
            setTopFeatures(features);
            setStickiness(stick);
            setSessionMetrics(sessions);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const featureColumns: SpreadsheetColumn<any>[] = [
        { id: 'feature_name', header: 'Feature', width: "250px", cell: (row: any) => <div className="p-2">{row.feature_name}</div> },
        {
            id: 'unique_users',
            header: 'Users',
            width: "150px",
            cell: (row: any) => <div className="p-2 font-medium">{formatNumber(row.unique_users)}</div>
        },
        {
            id: 'total_events',
            header: 'Events',
            width: "150px",
            cell: (row: any) => <div className="p-2">{formatNumber(row.total_events)}</div>
        },
        {
            id: 'unique_sessions',
            header: 'Sessions',
            width: "150px",
            cell: (row: any) => <div className="p-2">{formatNumber(row.unique_sessions)}</div>
        }
    ];

    if (loading) {
        return (
            <StandardPage title="Usage Analytics">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </StandardPage>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                
                <p className="text-gray-500 mt-1">Product usage, feature adoption, and engagement metrics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Daily Active Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatNumber(stickiness?.dau) || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                            <Activity className="h-4 w-4 mr-2" />
                            DAU/MAU Ratio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stickiness?.dau_mau_ratio?.toFixed(1) || 0}%</div>
                        <p className="text-xs text-gray-500 mt-1">Product stickiness</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            Avg Session Duration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {sessionMetrics ? Math.floor(sessionMetrics.avg_duration_seconds / 60) : 0}m
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Per session</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Conversion Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {sessionMetrics?.conversion_rate?.toFixed(1) || 0}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Sessions with conversion</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="features">
                <TabsList>
                    <TabsTrigger value="features">Top Features</TabsTrigger>
                    <TabsTrigger value="cohorts">Cohort Retention</TabsTrigger>
                    <TabsTrigger value="funnels">Funnels</TabsTrigger>
                </TabsList>

                <TabsContent value="features" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Most Used Features (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InteractiveSpreadsheet
                                columns={featureColumns}
                                data={topFeatures}
                                onChange={() => { }} virtualized={true} containerHeight="400px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cohorts" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cohort Retention Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center">
                            <p className="text-gray-400">Cohort retention matrix will be implemented here</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="funnels" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Conversion Funnels</CardTitle>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center">
                            <p className="text-gray-400">Funnel visualization will be implemented here</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
