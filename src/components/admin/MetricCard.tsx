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
                return <Activity className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'healthy':
                return 'border-green-200 bg-green-50';
            case 'degraded':
                return 'border-yellow-200 bg-yellow-50';
            case 'unhealthy':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    return (
        <div className={`bg-white rounded-lg border-2 ${getStatusColor()} p-4 transition-all hover:shadow-md`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4 text-gray-600" />}
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-gray-900 capitalize">{value}</p>
                    {message && (
                        <p className="mt-1 text-xs text-gray-500">{message}</p>
                    )}
                    {responseTime !== undefined && (
                        <p className="mt-1 text-xs text-gray-500">
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
