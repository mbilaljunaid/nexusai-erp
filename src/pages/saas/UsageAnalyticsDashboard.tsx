import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StandardTable } from '@/components/ui/StandardTable';
import UsageAnalyticsService, { FeatureAdoptionMetric, StickinessStat } from '@/services/usageAnalyticsService';
import { TrendingUp, Users, Activity, Target } from 'lucide-react';

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
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const featureColumns = [
        { key: 'feature_name', label: 'Feature' },
        {
            key: 'unique_users',
            label: 'Users',
            render: (row: any) => <span className="font-medium">{row.unique_users?.toLocaleString()}</span>
        },
        {
            key: 'total_events',
            label: 'Events',
            render: (row: any) => <span>{row.total_events?.toLocaleString()}</span>
        },
        {
            key: 'unique_sessions',
            label: 'Sessions',
            render: (row: any) => <span>{row.unique_sessions?.toLocaleString()}</span>
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Usage Analytics</h1>
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
                        <div className="text-3xl font-bold">{stickiness?.dau?.toLocaleString() || 0}</div>
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
                            <StandardTable
                                columns={featureColumns}
                                data={topFeatures}
                                pageSize={10}
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
