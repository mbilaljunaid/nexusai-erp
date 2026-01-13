import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import React from "react";

interface DashboardWidgetProps {
    title: string;
    type?: string;
    icon?: LucideIcon;
    value?: React.ReactNode;
    description?: string;
    children?: React.ReactNode;
}

export function DashboardWidget({ title, icon: Icon, value, description, children }: DashboardWidgetProps) {
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
}
