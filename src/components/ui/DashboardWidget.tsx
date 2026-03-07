import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import React from "react";

interface DashboardWidgetProps {
    title: string;
    type?: string;
    icon?: LucideIcon;
    value?: React.ReactNode | number | string;
    description?: string;
    children?: React.ReactNode;
    loading?: boolean;
    className?: string;
    trend?: { value: number; label: string; positive: boolean };
}

// DashboardWidget — card wrapper for dashboard metric slots.
// Wrapped in React.memo — used across 54 pages; re-renders on every query
// refetch are prevented when props haven't changed.
export const DashboardWidget = memo(function DashboardWidget({
    title,
    icon: Icon,
    value,
    description,
    children,
}: DashboardWidgetProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                {value && <div className="text-2xl font-bold">{value}</div>}
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
                {children}
            </CardContent>
        </Card>
    );
});
