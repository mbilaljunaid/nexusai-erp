import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
    /** Number of skeleton rows to render. Defaults to 5. */
    rows?: number;
    /** Number of skeleton columns per row. Defaults to 4. */
    columns?: number;
    /** Extra className applied to the wrapper div. */
    className?: string;
}

/**
 * TableSkeleton — inline data-area loading placeholder.
 *
 * Drop this inside an existing layout (e.g. inside `CardContent`) to replace ad-hoc
 * loading text or `Loader2` spinner divs:
 *
 * ```tsx
 * {isLoading ? <TableSkeleton rows={5} /> : <InteractiveSpreadsheet ... />}
 * ```
 */
export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
    return (
        <div className={className}>
            {/* Column header row */}
            <div className="flex gap-4 px-4 py-3 border-b">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {/* Data rows */}
            <div className="divide-y">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex gap-4 px-4 py-3 items-center">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/5" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
