import React, { ReactNode } from "react";
import { Link } from "wouter";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export interface BreadcrumbNavItem {
    label: string;
    href?: string;
}

export interface StandardPageProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbNavItem[];
    actions?: ReactNode; // Sticky bottom action bar content
    children: ReactNode;
    className?: string;
}

/**
 * StandardPage
 * Implements the SAP Fiori "ObjectPage" layout pattern with Oracle Redwood styling.
 * Features:
 * - Consistent Breadcrumb navigation
 * - Page Title
 * - Scrollable content area
 * - Sticky Bottom Action Bar (if actions provided)
 */
export function StandardPage({
    title,
    description,
    breadcrumbs,
    actions,
    children,
    className,
}: StandardPageProps) {
    return (
        <div className={cn("flex flex-col min-h-full relative", className)}>
            {/* Page Header */}
            <div className="mb-6 space-y-2">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((item, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <React.Fragment key={index}>
                                        <BreadcrumbItem>
                                            {isLast ? (
                                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink asChild>
                                                    <Link to={item.href || "#"}>{item.label}</Link>
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {!isLast && <BreadcrumbSeparator />}
                                    </React.Fragment>
                                );
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className={cn("flex-1 space-y-4 pb-20", !actions && "pb-4")}>
                {children}
            </div>

            {/* Sticky Bottom Action Bar */}
            {actions && (
                <div className="sticky bottom-0 -mx-6 -mb-6 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t shadow-md z-10 flex justify-end gap-2 mt-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}
