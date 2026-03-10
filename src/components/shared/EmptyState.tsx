import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    /** Lucide icon component to display (renders at w-12 h-12) */
    icon?: React.ElementType;
    /** Primary empty-state message — always required */
    title: string;
    /** Optional secondary description text */
    description?: string;
    /** Optional CTA element (e.g. a <Button> or <Link><Button/></Link>) */
    action?: React.ReactNode;
    /** Additional className for the wrapper element */
    className?: string;
    /**
     * Compact mode — renders a simple centered paragraph with py-4 and no icon.
     * Use inside table rows or small card lists where a full icon block is excessive.
     */
    compact?: boolean;
}

/**
 * Shared empty-state component for standardised "no data" UX.
 *
 * Usage:
 * ```tsx
 * // Full (with icon + action)
 * <EmptyState
 *   icon={Package}
 *   title="No services yet"
 *   description="Create your first service to start earning."
 *   action={<Button onClick={onCreate}>Create Service</Button>}
 * />
 *
 * // Compact (inline table/list)
 * <EmptyState compact title="No orders received yet" />
 * ```
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
    compact = false,
}: EmptyStateProps) {
    if (compact) {
        return (
            <p className={cn("text-center text-muted-foreground py-4", className)}>
                {title}
            </p>
        );
    }

    return (
        <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
            {Icon && (
                <Icon className="w-12 h-12 mb-4 text-muted-foreground opacity-40" />
            )}
            <p className="font-medium text-muted-foreground">{title}</p>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>
            )}
            {action && (
                <div className="mt-4">{action}</div>
            )}
        </div>
    );
}
