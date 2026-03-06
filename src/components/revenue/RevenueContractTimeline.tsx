import { formatDate } from "@/lib/dateUtils";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { History } from "lucide-react";

interface TimelineEntry {
    version: number;
    snapshotDate: string;
    changeReason: string;
    totalTransactionPrice: number;
    totalAllocatedPrice: number;
    status: string;
    changes: string[];
}

interface TimelineResponse {
    contractId: string;
    contractNumber: string;
    timeline: TimelineEntry[];
    totalModifications: number;
}

export function RevenueContractTimeline({ contractId }: { contractId: string }) {
    const { data: result, isLoading } = useQuery<TimelineResponse>({
        queryKey: ["contractTimeline", contractId],
        queryFn: async () => {
            const res = await fetch(`/api/erp/revenue/contracts/${contractId}/timeline`);
            if (!res.ok) throw new Error("Failed to fetch contract timeline");
            return res.json();
        }
    });

    const history = result?.timeline || [];

    if (isLoading) return <Skeleton className="h-48 w-full" />;
    if (!history?.length) return <div>No modification history.</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Modification History
                </CardTitle>
                <CardDescription>Audit trail of contract versions (ASC 606 Modifications) — {result?.totalModifications ?? 0} total</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative border-l border-muted ml-3 space-y-6">
                    {history.map((entry, index) => (
                        <div key={index} className="ml-6 relative">
                            {/* Dot */}
                            <span className="absolute -left-7 top-1 h-3 w-3 rounded-full bg-primary" />

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">Version {entry.version}</span>
                                    <Badge variant="outline" className="text-[10px]">{entry.snapshotDate ? formatDate(entry.snapshotDate) : "—"}</Badge>
                                    <Badge variant={entry.status === "Active" ? "default" : "secondary"} className="text-[10px]">{entry.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{entry.changeReason || "Initial creation"}</p>
                                {entry.changes?.length > 0 && (
                                    <ul className="mt-1 space-y-0.5">
                                        {entry.changes.map((change, ci) => (
                                            <li key={ci} className="text-xs text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded">→ {change}</li>
                                        ))}
                                    </ul>
                                )}
                                <div className="flex items-center gap-4 text-xs mt-1 bg-muted/30 p-2 rounded">
                                    <div>
                                        <span className="text-muted-foreground">Price: </span>
                                        <span className="font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(entry.totalTransactionPrice || 0))}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Allocated: </span>
                                        <span className="font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(entry.totalAllocatedPrice || 0))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

