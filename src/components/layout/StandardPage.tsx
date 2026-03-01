import { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";

export interface BreadcrumbNavItem {
    label: string;
    href?: string;
}

export interface StandardPageProps {
    title: string;
    description?: ReactNode;
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
            <PageHeader
                title={title}
                description={description}
                breadcrumbs={breadcrumbs}
                actions={actions}
                className="mb-6"
            />

            {/* Main Content */}
            <div className={cn("flex-1 space-y-4 pb-4")}>
                {children}
            </div>
        </div>
    );
}
