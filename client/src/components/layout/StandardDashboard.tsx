import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardWidgetProps {
    children: ReactNode;
    className?: string;
    colSpan?: 1 | 2 | 3 | 4; // Responsive columns span
    title?: string;
    action?: ReactNode;
}

export function DashboardWidget({ children, className, colSpan = 1, title, action }: DashboardWidgetProps) {
    // col-span logic matches Tailwind grid-cols-4
    const colSpanClass = {
        1: "md:col-span-1",
        2: "md:col-span-2",
        3: "md:col-span-3",
        4: "md:col-span-4",
    }[colSpan];

    return (
        <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", colSpanClass, className)}>
            {(title || action) && (
                <div className="flex items-center justify-between p-6 pb-2">
                    {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6 pt-0 mt-4">{children}</div>
        </div>
    );
}

export interface StandardDashboardProps {
    header?: ReactNode;
    children: ReactNode;
    className?: string;
}

/**
 * StandardDashboard
 * A standardized grid layout for analytical dashboards.
 * Enforces a 4-column grid system with responsive behavior.
 */
export function StandardDashboard({ header, children, className }: StandardDashboardProps) {
    return (
        <div className={cn("flex flex-col space-y-6 p-6 animate-in fade-in duration-500", className)}>
            {header && <div className="flex flex-col space-y-2">{header}</div>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {children}
            </div>
        </div>
    );
}
