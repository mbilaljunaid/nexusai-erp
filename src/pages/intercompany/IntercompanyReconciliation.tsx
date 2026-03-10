import { cn } from "@/lib/utils";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


export default function IntercompanyReconciliation() {
    const { data: report, isLoading } = useQuery<any>({
        queryKey: ["ic-reconciliation"],
        queryFn: async () => {
            const res = await fetch("/api/intercompany/reports/reconciliation?period=All");
            if (!res.ok) throw new Error("Failed to fetch report");
            return res.json();
        }
    });

    if (isLoading) return <div className="p-8">Loading Report...</div>;

    const summary = report?.summary || { totalOutbound: 0, totalInbound: 0, variance: 0 };

    const detailsColumns: SpreadsheetColumn[] = [
        {
            id: "batchId",
            header: "Batch ID",
            width: "120px",
            cell: (row) => <div className="px-2 font-mono text-xs text-left">{row.batchId.substring(0, 8)}...</div>
        },
        {
            id: "provider",
            header: "Provider",
            width: "120px",
            cell: (row) => <div className="px-2 text-left">{row.providerOrgId}</div>
        },
        {
            id: "receiver",
            header: "Receiver",
            width: "120px",
            cell: (row) => <div className="px-2 text-left">{row.receiverOrgId}</div>
        },
        {
            id: "outbound",
            header: "Outbound",
            width: "140px",
            cell: (row) => <div className="px-2 text-right">{formatCurrency(row.outboundAmount)}</div>
        },
        {
            id: "inbound",
            header: "Inbound",
            width: "140px",
            cell: (row) => <div className="px-2 text-right">{formatCurrency(row.inboundAmount)}</div>
        },
        {
            id: "diff",
            header: "Diff",
            width: "120px",
            cell: (row) => (
                <div className={cn(`px-2 text-right font-medium ${row.difference !== 0 ? "text-red-500" : "text-green-500"}`)}>
                    {formatCurrency(row.difference)}
                </div>
            )
        },
        {
            id: "status",
            header: "Status",
            width: "120px",
            cell: (row) => (
                <div className="px-2 text-center flex justify-center">
                    <Badge variant={row.status === "APPROVED" ? "default" : "outline"}>{row.status}</Badge>
                </div>
            )
        },
        {
            id: "reason",
            header: "Reason",
            width: "250px",
            cell: (row) => <div className="px-2 text-muted-foreground text-left">{row.reason}</div>
        }
    ];

    return (
        <StandardPage title="Intercompany Reconciliation">
            <div>

                <p className="text-muted-foreground">Eliminations Monitor (Provider vs Receiver).</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Outbound (Provider)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.totalOutbound)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Inbound (Receiver)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.totalInbound)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Variance (Uneliminated)</CardTitle></CardHeader>
                    <CardContent>
                        <div className={cn(`text-2xl font-bold ${summary.variance !== 0 ? "text-red-500" : "text-green-500"}`)}>
                            {formatCurrency(summary.variance)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Details Table */}
            <Card>
                <CardHeader><CardTitle>Transaction Details</CardTitle></CardHeader>
                <CardContent>
                    <div className="rounded-md border h-[400px]">
                        <InteractiveSpreadsheet
                            data={report?.details || []}
                            columns={detailsColumns}
                            containerHeight="400px"
                            virtualized={true}
                        />
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
