import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MRRAnalyticsService, { SaaSMetrics } from '@/services/mrrAnalyticsService';
import { TrendingUp, DollarSign, Users, Target, Loader2 } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';


export default function MRRAnalyticsDashboard() {
    const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);
    const [waterfall, setWaterfall] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const [currentMetrics, waterfallData] = await Promise.all([
                MRRAnalyticsService.getCurrentMetrics(),
                MRRAnalyticsService.getMRRWaterfall(
                    new Date(new Date().setMonth(new Date().getMonth() - 6)),
                    new Date()
                )
            ]);
            setMetrics(currentMetrics);
            setWaterfall(waterfallData);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <StandardPage title="MRR Analytics">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </StandardPage>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                
                <p className="text-muted-foreground mt-1">Monthly Recurring Revenue & SaaS Metrics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            MRR
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${(metrics?.mrr || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            ARR: ${(metrics?.arr || 0).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Customers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatNumber(metrics?.total_customers) || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            ARPU: ${(metrics?.arpu || 0).toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            Net Revenue Retention
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{(metrics?.net_revenue_retention || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Churn: {(metrics?.customer_churn_rate || 0).toFixed(1)}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            LTV / CAC
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{(metrics?.ltv_cac_ratio || 0).toFixed(1)}x</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            LTV: ${(metrics?.ltv || 0).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="waterfall">
                <TabsList>
                    <TabsTrigger value="waterfall">MRR Waterfall</TabsTrigger>
                    <TabsTrigger value="cohorts">Cohort LTV</TabsTrigger>
                    <TabsTrigger value="plans">Plan Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="waterfall" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>MRR Movement Waterfall (Last 6 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 flex items-center justify-center">
                                <p className="text-muted-foreground/70">Waterfall chart visualization will be implemented here</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cohorts" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Lifetime Value by Cohort</CardTitle>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center">
                            <p className="text-muted-foreground/70">Cohort LTV table will be implemented here</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="plans" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center">
                            <p className="text-muted-foreground/70">Plan comparison table will be implemented here</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
