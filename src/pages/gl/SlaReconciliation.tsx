
import React, { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery } from "@tanstack/react-query";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCcw, AlertTriangle, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReconData = {
    period: string;
    sla: { dr: number; cr: number };
    gl: { dr: number; cr: number };
    variance: { dr: number; cr: number };
    status: "RECONCILED" | "DRIFT_DETECTED";
};

export default function SlaReconciliation() {
    const [periodName, setPeriodName] = useState("Jan-26");
    const [ledgerId, setLedgerId] = useState("PRIMARY");

    const { data, isLoading, refetch, error } = useQuery<ReconData>({
        queryKey: ["/api/sla/reports/reconciliation", ledgerId, periodName],
        queryFn: async () => {
            const res = await fetch(`/api/sla/reports/reconciliation?ledgerId=${ledgerId}&periodName=${periodName}`);
            if (!res.ok) throw new Error("Failed to fetch reconciliation data");
            return res.json();
        },
        enabled: !!periodName && !!ledgerId
    });

    return (
        <StandardDashboard
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reconciliation Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Compare Subledger Accounting (SLA) vs General Ledger (GL) Balances.</p>
                    </div>
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
                    </Button>
                </div>
            }
        >
            {/* Parameters */}
            <DashboardWidget colSpan={4} title="Reconciliation Scope">
                <div className="flex gap-4 items-end">
                    <div className="space-y-2 w-64">
                        <label className="text-sm font-medium">Ledger</label>
                        <Select value={ledgerId} onValueChange={setLedgerId}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PRIMARY">Primary Ledger</SelectItem>
                                <SelectItem value="SECONDARY">Secondary Ledger</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 w-48">
                        <label className="text-sm font-medium">Period</label>
                        <Input value={periodName} onChange={e => setPeriodName(e.target.value)} />
                    </div>
                </div>
            </DashboardWidget>

            {/* Status Cards */}
            {data && (
                <>
                    <DashboardWidget colSpan={1} title="Status">
                        <div className={`p-6 flex flex-col items-center justify-center h-full rounded-md border ${data.status === "RECONCILED" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                            {data.status === "RECONCILED" ? (
                                <>
                                    <CheckCircle className="h-12 w-12 text-green-600 mb-2" />
                                    <span className="text-lg font-bold text-green-800">Reconciled</span>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-12 w-12 text-red-600 mb-2" />
                                    <span className="text-lg font-bold text-red-800">Drift Detected</span>
                                </>
                            )}
                        </div>
                    </DashboardWidget>

                    <DashboardWidget colSpan={3} title="Balance Summary">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 border rounded bg-muted/20">
                                <h4 className="text-sm font-medium text-muted-foreground">SLA Total</h4>
                                <div className="text-2xl font-bold mt-2">{data.sla.dr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                <div className="text-xs text-muted-foreground">Debits</div>
                            </div>
                            <div className="p-4 border rounded bg-muted/20">
                                <h4 className="text-sm font-medium text-muted-foreground">GL Total</h4>
                                <div className="text-2xl font-bold mt-2">{data.gl.dr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                <div className="text-xs text-muted-foreground">Debits</div>
                            </div>
                            <div className="p-4 border rounded bg-card">
                                <h4 className="text-sm font-medium text-muted-foreground">Variance</h4>
                                <div className={`text-2xl font-bold mt-2 ${data.variance.dr !== 0 ? "text-red-600" : "text-green-600"}`}>
                                    {data.variance.dr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-muted-foreground">Difference</div>
                            </div>
                        </div>
                    </DashboardWidget>
                </>
            )}

            {isLoading && <TableSkeleton rows={4} />}
        </StandardDashboard>
    );
}
