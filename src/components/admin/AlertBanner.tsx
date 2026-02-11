import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertBannerProps {
    alert: {
        id: string;
        severity: 'info' | 'warning' | 'error';
        message: string;
        timestamp: string;
        component?: string;
    };
}

export default function AlertBanner({ alert }: AlertBannerProps) {
    const getSeverityConfig = () => {
        switch (alert.severity) {
            case 'error':
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    iconColor: 'text-red-600',
                    textColor: 'text-red-900',
                    metaColor: 'text-red-700',
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    iconColor: 'text-yellow-600',
                    textColor: 'text-yellow-900',
                    metaColor: 'text-yellow-700',
                };
            case 'info':
            default:
                return {
                    icon: Info,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    iconColor: 'text-blue-600',
                    textColor: 'text-blue-900',
                    metaColor: 'text-blue-700',
                };
        }
    };

    const config = getSeverityConfig();
    const Icon = config.icon;

    return (
        <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
            <div className="flex gap-3">
                <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${config.textColor}`}>
                        {alert.message}
                    </p>
                    <div className={`mt-1 text-xs ${config.metaColor} flex items-center gap-3`}>
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        {alert.component && (
                            <>
                                <span>•</span>
                                <span>Component: {alert.component}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
