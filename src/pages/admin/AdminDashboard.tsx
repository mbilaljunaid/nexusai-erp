import React, { useState } from 'react';
import { Users, Activity, DollarSign, Building2, TrendingUp, Server, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminMetrics } from '@/hooks/admin/useAdminData';
import { useQueryClient } from '@tanstack/react-query';
import { StandardPage } from "@/components/layout/StandardPage";

const systemServices = [
    { service: 'API Server', uptime: '99.98%' },
    { service: 'Database', uptime: '99.95%' },
    { service: 'Cache', uptime: '99.99%' },
    { service: 'Queue', uptime: '99.97%' },
];

export default function AdminDashboard() {
    const { data: metrics, isLoading, isError, refetch } = useAdminMetrics();
    const queryClient = useQueryClient();

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    };

    return (
        <StandardPage title="Admin Dashboard">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    
                    <p className="text-muted-foreground">Overview of platform metrics and activity</p>
                </div>
                <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {isError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4" />
                    Failed to load metrics. Please refresh.
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">{metrics?.totalTenants?.toLocaleString() ?? '—'}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Registered organizations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">{metrics?.activeTenants?.toLocaleString() ?? '—'}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Currently active tenants</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Demos</CardTitle>
                        <Activity className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">{metrics?.activeDemos?.toLocaleString() ?? '—'}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Live demo environments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Open Support Requests</CardTitle>
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">{metrics?.openSupportRequests?.toLocaleString() ?? '—'}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
                    </CardContent>
                </Card>
            </div>

            {/* System Status */}
            <Card>
                <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <p className="text-sm text-muted-foreground">Service health and uptime</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {systemServices.map((service) => (
                            <div key={service.service} className="flex items-center justify-between pb-3 border-b last:border-0">
                                <div className="flex items-center gap-3">
                                    <Server className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{service.service}</p>
                                        <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-xs font-medium text-green-600">Healthy</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <p className="text-sm text-muted-foreground">Common admin tasks</p>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                        <Button variant="outline">
                            <Activity className="w-4 h-4 mr-2" />
                            Sync Stripe
                        </Button>
                        <Button variant="outline">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Create Invoice
                        </Button>
                        <Button variant="outline">
                            <Server className="w-4 h-4 mr-2" />
                            Run Health Check
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
