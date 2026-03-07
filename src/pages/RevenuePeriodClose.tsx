import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
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
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CalendarDays,
    Lock,
    Unlock,
    LockKeyhole,
    CheckCircle2,
    AlertCircle,
    Info,
    SearchCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function RevenuePeriodClose() {
    const { toast } = useToast();

    const { data: periods, isLoading } = useQuery<any>({
        queryKey: ["revenuePeriods"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/periods");
            if (!res.ok) throw new Error("Failed to fetch periods");
            return res.json();
        }
    });

    const sweepMutation = useMutation({
        mutationFn: async (periodId: string) => {
            const res = await fetch(`/api/revenue/periods/${periodId}/sweep`, { method: "POST" });
            if (!res.ok) throw new Error("Sweep failed");
            return res.json();
        },
        onSuccess: (data: any) => {
            toast({
                title: "Sweep Complete",
                description: `Processed: ${data.postedCount || 0}, Unbilled Accrual: $${data.unbilledAccrualTotal || 0}`,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Sweep Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const closeMutation = useMutation({
        mutationFn: async (periodId: string) => {
            const res = await fetch("/api/revenue/periods/close", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ periodId })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to close period");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Period Closed",
                description: "Revenue period has been successfully closed for transactions.",
            });
            queryClient.invalidateQueries({ queryKey: ["revenuePeriods"] });
        },
        onError: (error: any) => {
            toast({
                title: "Close Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const columns: any[] = [
        {
            id: "exceptions",
            header: "Exceptions",
            width: "150px",
            cell: (row: any) => ( // Changed Period to any as Period type is not defined in the snippet
                row.exceptions > 0 ? (
                    <Badge variant="destructive" className="ml-2">{row.exceptions}</Badge>
                ) : (
                    <span className="text-muted-foreground text-sm ml-2">None</span>
                )
            )
        },
        {
            id: "lastUpdated",
            header: "Last Activity",
            width: "150px",
            cell: (item: any) => <span>{format(new Date(item.startDate), "MMM dd, yyyy")}</span>
        },
        {
            id: "periodName",
            header: "Period",
            width: "150px",
            cell: (row: any) => <span className="font-medium">{row.periodName}</span> // Changed Period to any
        },
        {
            id: "startDate",
            header: "Start Date",
            width: "150px",
            cell: (item: any) => <span>{format(new Date(item.startDate), "MMM dd, yyyy")}</span>
        },
        {
            id: "endDate",
            header: "End Date",
            width: "150px",
            cell: (item: any) => <span>{format(new Date(item.endDate), "MMM dd, yyyy")}</span>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (item: any) => {
                const status = item.status;
                return (
                    <Badge variant={status === "Open" ? "outline" : "default"}>
                        {status === "Open" ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                        {status}
                    </Badge>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            width: 250,
            cell: (period: any) => {
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={period.status !== "Open" || sweepMutation.isPending}
                            onClick={() => sweepMutation.mutate(period.id)}
                            title="Run Sweep: Auto-post schedules & calculate unbilled"
                        >
                            <SearchCheck className="h-4 w-4 mr-2" />
                            Run Sweep
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={period.status !== "Open" || closeMutation.isPending}
                            onClick={() => closeMutation.mutate(period.id)}
                        >
                            <LockKeyhole className="h-4 w-4 mr-2" />
                            Close
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <StandardPage
            title="Revenue Period Close"
            description="Manage fiscal period status for Revenue Management."
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription>Active Period</CardDescription>
                        <CardTitle className="text-2xl">{periods?.find((p: any) => p.status === "Open")?.periodName || "None"}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-white border-none shadow-sm text-green-600">
                    <CardHeader className="pb-2">
                        <CardDescription>Ready to Close</CardDescription>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" /> All Clean
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Revenue Fiscal Calendar</CardTitle>
                        <CardDescription>Transactions are only allowed in Open periods.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <InteractiveSpreadsheet
                            data={periods || []}
                            columns={columns}
                            onChange={() => { }}
                            virtualized={true}
                            containerHeight="400px"
                        />
                    )}
                </CardContent>
            </Card>

            <div className="bg-blue-500/10 border border-blue-100 p-4 rounded-lg flex gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Period Close Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 opacity-90">
                        <li>All Revenue Source Events for the period must be processed.</li>
                        <li>All Recognition Schedules for the period must be posted to the Subledger (SLA).</li>
                        <li>Allocations must be finalized.</li>
                    </ul>
                </div>
            </div>
        </StandardPage>
    );
}
