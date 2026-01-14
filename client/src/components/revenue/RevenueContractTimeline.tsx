
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
import { History, GitCommit, ArrowRightCircle } from "lucide-react";

interface ContractVersion {
    id: string;
    versionNumber: number;
    snapshotDate: string;
    changeReason: string;
    totalTransactionPrice: number;
    totalAllocatedPrice: number;
    status: string;
}

export function RevenueContractTimeline({ contractId }: { contractId: string }) {
    const { data: history, isLoading } = useQuery({
        queryKey: ["contractHistory", contractId],
        queryFn: async () => {
            const res = await fetch(`/api/revenue/contracts/${contractId}/history`);
            if (!res.ok) throw new Error("Failed to fetch history");
            return res.json() as Promise<ContractVersion[]>;
        }
    });

    if (isLoading) return <Skeleton className="h-48 w-full" />;
    if (!history?.length) return <div>No modification history.</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Modification History
                </CardTitle>
                <CardDescription>Audit trail of contract versions (ASC 606 Modifications)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative border-l border-muted ml-3 space-y-6">
                    {history.map((version, index) => (
                        <div key={version.id} className="ml-6 relative">
                            {/* Dot */}
                            <span className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-primary" />

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">Version {version.versionNumber}</span>
                                    <Badge variant="outline" className="text-[10px]">{new Date(version.snapshotDate).toLocaleDateString()}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{version.changeReason || "Initial Creation"}</p>
                                <div className="flex items-center gap-4 text-xs mt-1 bg-muted/30 p-2 rounded">
                                    <div>
                                        <span className="text-muted-foreground">Price: </span>
                                        <span className="font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(version.totalTransactionPrice || 0))}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Allocated: </span>
                                        <span className="font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(version.totalAllocatedPrice || 0))}</span>
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
