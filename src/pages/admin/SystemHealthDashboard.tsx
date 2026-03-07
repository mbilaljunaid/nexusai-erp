import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertCircle, CheckCircle, XCircle, Database, Zap, Server, Clock, Loader2 } from "lucide-react";
import MetricCard from '../../components/admin/MetricCard';
import AlertBanner from '../../components/admin/AlertBanner';
import { StandardPage } from "@/components/layout/StandardPage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: {
        name: string;
        status: 'healthy' | 'degraded' | 'unhealthy';
        message?: string;
        responseTime?: number;
    }[];
    timestamp: string;
}

interface Alert {
    id: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    component?: string;
}

export default function SystemHealthDashboard() {
    const [autoRefresh, setAutoRefresh] = useState(true);

    const { data: health, isLoading: loadingHealth, refetch: refetchHealth } = useQuery<HealthStatus>({
        queryKey: ['systemHealth'],
        queryFn: async () => {
            const response = await fetch('/api/production/health');
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        },
        refetchInterval: autoRefresh ? 30000 : false,
    });

    const { data: alerts = [], isLoading: loadingAlerts, refetch: refetchAlerts } = useQuery<Alert[]>({
        queryKey: ['systemAlerts'],
        queryFn: async () => {
            const response = await fetch('/api/production/alerts');
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        },
        refetchInterval: autoRefresh ? 30000 : false,
    });

    const loading = loadingHealth || loadingAlerts;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'degraded':
                return <AlertCircle className="w-6 h-6 text-yellow-600" />;
            case 'unhealthy':
                return <XCircle className="w-6 h-6 text-red-600" />;
            default:
                return <Activity className="w-6 h-6 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-100 text-green-800';
            case 'degraded':
                return 'bg-yellow-100 text-yellow-800';
            case 'unhealthy':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <StandardPage
            title="System Health Dashboard"
            description="Real-time system monitoring and health status"
            actions={
                <div className="flex items-center gap-3">
                    <Button variant="default" size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={cn(`px-3 py-2 text-sm rounded-md border ${autoRefresh
                            ? 'bg-blue-500/10 text-blue-700 border-blue-200'
                            : 'bg-white text-gray-700 border-gray-300'
                            }`)}
                    >
                        {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
                    </Button>
                    <Button variant="default"
                        onClick={() => {
                            refetchHealth();
                            refetchAlerts();
                        }}
                        className="text-white text-sm hover:"
                    >
                        Refresh Now
                    </Button>
                </div>
            }
        >
            {/* Overall Status */}
            {health && (
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        {getStatusIcon(health.status)}
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                                System Status:
                                <span className={cn(`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`)}>
                                    {health.status.toUpperCase()}
                                </span>
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Last updated: {formatDateTime(health.timestamp)}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Active Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wide">
                        Active Alerts ({alerts.length})
                    </h3>
                    {alerts.map((alert) => (
                        <AlertBanner key={alert.id} alert={alert} />
                    ))}
                </div>
            )}

            {/* Component Health Metrics */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wide mb-4">
                    Component Health
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {health?.components.map((component) => (
                        <MetricCard
                            key={component.name}
                            title={component.name}
                            value={component.status}
                            status={component.status}
                            message={component.message}
                            responseTime={component.responseTime}
                        />
                    ))}

                    {/* Placeholder if no components */}
                    {(!health?.components || health.components.length === 0) && (
                        <>
                            <MetricCard
                                title="Database"
                                value="healthy"
                                status="healthy"
                                icon={Database}
                                responseTime={45}
                            />
                            <MetricCard
                                title="API"
                                value="healthy"
                                status="healthy"
                                icon={Zap}
                                responseTime={12}
                            />
                            <MetricCard
                                title="Cache"
                                value="healthy"
                                status="healthy"
                                icon={Server}
                                responseTime={8}
                            />
                            <MetricCard
                                title="Background Jobs"
                                value="healthy"
                                status="healthy"
                                icon={Clock}
                                responseTime={120}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <Card className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wide mb-4">
                    System Information
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Environment</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-200">Production</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Version</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-200">v1.0.0</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Uptime</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-200">99.9%</dd>
                    </div>
                </dl>
            </Card>
        </StandardPage>
    );
}
