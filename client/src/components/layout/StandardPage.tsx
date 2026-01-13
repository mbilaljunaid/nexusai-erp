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
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            </div>

            {/* Main Content */}
            <div className={cn("flex-1 space-y-4 pb-20", !actions && "pb-4")}>
                {children}
            </div>

            {/* Sticky Bottom Action Bar */}
            {actions && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 ml-[var(--sidebar-width,0px)] transition-[margin] duration-200">
                    {/* Note: ml-[var(--sidebar-width)] attempts to align with sidebar. 
               However, since sidebar width might change/collapse, we might need a more robust solution 
               or just let it span full width and overlay sidebar (not ideal) or be contained in main. 
               
               Since StandardPage is inside usage of GlobalLayout -> main, 
               and GlobalLayout Main has overflow-y-auto, 
               'fixed' positioning acts relative to the viewport.
               
               If we want it to stay within the content area, we can use 'sticky bottom-0' 
               BUT that requires the parent to be the scroll container.
               GlobalLayout 'main' IS the scroll container.
               So 'sticky bottom-0' inside StandardPage (which is inside main) 
               will stick to the bottom of 'main' view.
           */}
                    <div className="max-w-full mx-auto flex items-center justify-end gap-2">
                        {actions}
                    </div>
                </div>
            )}
        </div>
    );
}
