import { cn } from "@/lib/utils";
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { CheckCircle, AlertCircle, XCircle, Activity } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    responseTime?: number;
    icon?: LucideIcon;
}

export default function MetricCard({ title, value, status, message, responseTime, icon: Icon }: MetricCardProps) {
    const getStatusIcon = () => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'degraded':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'unhealthy':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Activity className="w-5 h-5 text-muted-foreground/70" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'healthy':
                return 'border-green-200 bg-green-500/10';
            case 'degraded':
                return 'border-yellow-200 bg-yellow-500/10';
            case 'unhealthy':
                return 'border-red-200 bg-red-500/10';
            default:
                return 'border-border bg-gray-500/10';
        }
    };

    return (
        <div className={cn(`bg-card rounded-lg border-2 ${getStatusColor()} p-4 transition-all hover:shadow-md`)}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground dark:text-gray-200 capitalize">{value}</p>
                    {message && (
                        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
                    )}
                    {responseTime !== undefined && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            Response time: {responseTime}ms
                        </p>
                    )}
                </div>
                <div className="flex-shrink-0">
                    {getStatusIcon()}
                </div>
            </div>
        </div>
    );
}
