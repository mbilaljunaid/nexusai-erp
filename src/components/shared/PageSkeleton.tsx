import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PageSkeletonProps {
    /** Number of KPI stat cards to render in the top row. Defaults to 4. */
    cards?: number;
    /** Number of table rows to render in the body area. Defaults to 6. */
    rows?: number;
    /** Show the KPI cards row. Defaults to true. */
    showCards?: boolean;
}

/**
 * PageSkeleton — full-page loading placeholder.
 *
 * Use this when the entire page content is loading (i.e. in an early-return guard):
 *
 * ```tsx
 * if (isLoading) return <PageSkeleton />;
 * ```
 */
export function PageSkeleton({ cards = 4, rows = 6, showCards = true }: PageSkeletonProps) {
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-300">
            {/* Page header */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* KPI stat cards */}
            {showCards && (
                <div className={cn(`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(cards, 4)}`)}>
                    {Array.from({ length: cards }).map((_, i) => (
                        <Card key={i} className="border shadow-sm">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-20 mb-1" />
                                <Skeleton className="h-3 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Table / main content area */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-9 w-28" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Table header row */}
                    <div className="flex gap-4 px-4 pb-3 border-b">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 flex-1" />
                        ))}
                    </div>
                    {/* Table data rows */}
                    <div className="divide-y">
                        {Array.from({ length: rows }).map((_, i) => (
                            <div key={i} className="flex gap-4 px-4 py-3 items-center">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/5" />
                                <Skeleton className="h-4 w-1/6" />
                                <Skeleton className="h-4 w-1/6" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
