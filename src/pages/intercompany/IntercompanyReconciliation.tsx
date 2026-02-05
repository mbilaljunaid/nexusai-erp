
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function IntercompanyReconciliation() {
    const { data: report, isLoading } = useQuery({
        queryKey: ["ic-reconciliation"],
        queryFn: async () => {
            const res = await fetch("/api/intercompany/reports/reconciliation?period=All");
            if (!res.ok) throw new Error("Failed to fetch report");
            return res.json();
        }
    });

    if (isLoading) return <div className="p-8">Loading Report...</div>;

    const summary = report?.summary || { totalOutbound: 0, totalInbound: 0, variance: 0 };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Intercompany Reconciliation</h1>
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
                        <div className={`text-2xl font-bold ${summary.variance !== 0 ? "text-red-500" : "text-green-500"}`}>
                            {formatCurrency(summary.variance)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Details Table */}
            <Card>
                <CardHeader><CardTitle>Transaction Details</CardTitle></CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="p-3 text-left font-medium">Batch ID</th>
                                    <th className="p-3 text-left font-medium">Provider</th>
                                    <th className="p-3 text-left font-medium">Receiver</th>
                                    <th className="p-3 text-right font-medium">Outbound</th>
                                    <th className="p-3 text-right font-medium">Inbound</th>
                                    <th className="p-3 text-right font-medium">Diff</th>
                                    <th className="p-3 text-center font-medium">Status</th>
                                    <th className="p-3 text-left font-medium">Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report?.details?.map((d: any) => (
                                    <tr key={d.transactionId} className="border-b hover:bg-muted/50">
                                        <td className="p-3 font-mono text-xs">{d.batchId.substring(0, 8)}...</td>
                                        <td className="p-3">{d.providerOrgId}</td>
                                        <td className="p-3">{d.receiverOrgId}</td>
                                        <td className="p-3 text-right">{formatCurrency(d.outboundAmount)}</td>
                                        <td className="p-3 text-right">{formatCurrency(d.inboundAmount)}</td>
                                        <td className={`p-3 text-right font-medium ${d.difference !== 0 ? "text-red-500" : "text-green-500"}`}>
                                            {formatCurrency(d.difference)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Badge variant={d.status === "APPROVED" ? "default" : "outline"}>{d.status}</Badge>
                                        </td>
                                        <td className="p-3 text-muted-foreground">{d.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
