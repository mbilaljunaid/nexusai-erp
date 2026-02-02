import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandardTable } from "@/components/ui/StandardTable";
import { Skeleton } from "@/components/ui/skeleton";
import {
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { RevenueSourceEvent } from "@shared/schema/revenue";

// Create a local type matching the DB schema if not exported
// type RevenueSourceEvent = {
//     id: string;
//     sourceSystem: string;
//     sourceId: string;
//     eventType: string;
//     eventDate: string;
//     amount: string;
//     currency: string;
//     processingStatus: "Pending" | "Processed" | "Error" | "Ignored";
//     errorMessage?: string;
// };

export default function RevenueSourceEvents() {
    const { toast } = useToast();

    // Fetch Events
    const { data: events, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ["revenueSourceEvents"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/events");
            if (!res.ok) throw new Error("Failed to fetch events");
            return res.json() as Promise<any[]>; // Use any to avoid strict type issues for now
        }
    });

    // Retry Mutation (Single Action - Re-queue)
    // For MVP, we'll just implement a "Process All" trigger from here too
    const processMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/revenue/jobs/process-events", { method: "POST" });
            if (!res.ok) throw new Error("Processing failed");
            return res.json();
        },
        onSuccess: (data: any) => {
            toast({
                title: "Processing Job Triggered",
                description: data.message,
            });
            queryClient.invalidateQueries({ queryKey: ["revenueSourceEvents"] });
        },
        onError: () => {
            toast({
                title: "Processing Failed",
                variant: "destructive"
            });
        }
    });

    const columns: any[] = [
        {
            header: "Source System",
            accessorKey: "sourceSystem",
            cell: (info: any) => <span className="font-medium">{info.getValue()}</span>
        },
        {
            header: "Source ID",
            accessorKey: "sourceId",
        },
        {
            header: "Reference #",
            accessorKey: "referenceNumber",
            cell: (info: any) => <span className="font-mono text-xs">{info.getValue() || "—"}</span>
        },
        {
            header: "Event Type",
            accessorKey: "eventType",
            cell: (info: any) => <Badge variant="outline">{info.getValue()}</Badge>
        },
        {
            header: "Event Date",
            accessorKey: "eventDate",
            cell: (info: any) => format(new Date(info.getValue()), "MMM dd, yyyy")
        },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: (info: any) => {
                const amount = parseFloat(info.getValue() || "0");
                const currency = info.row.original.currency || "USD";
                return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
            }
        },
        {
            header: "Status",
            accessorKey: "processingStatus",
            cell: (info: any) => {
                const status = info.getValue();
                let color = "bg-gray-100 text-gray-800";
                let icon = <Clock className="h-3 w-3 mr-1" />;

                if (status === "Processed") {
                    color = "bg-green-100 text-green-800 border-green-200";
                    icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
                } else if (status === "Error") {
                    color = "bg-red-100 text-red-800 border-red-200";
                    icon = <AlertCircle className="h-3 w-3 mr-1" />;
                }

                return (
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs border ${color} w-fit`}>
                        {icon}
                        {status}
                    </div>
                );
            }
        },
        {
            header: "Message",
            accessorKey: "errorMessage",
            cell: (info: any) => <span className="text-xs text-red-500 max-w-[200px] truncate block" title={info.getValue()}>{info.getValue()}</span>
        }
    ];

    if (isLoading) {
        return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Revenue Source Events</h1>
                    <p className="text-muted-foreground mt-1">Audit trail of inbound commercial events (Orders, Usage, Invoices)</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => processMutation.mutate()}
                        disabled={processMutation.isPending}
                    >
                        {processMutation.isPending ? "Processing..." : "Process Pending Events"}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inbound Stream</CardTitle>
                    <CardDescription>Real-time feed of revenue-impacting events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StandardTable
                        data={events || []}
                        columns={columns}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
