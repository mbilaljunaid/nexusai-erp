import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarRange, CheckCircle2, ShieldAlert, Lock, Unlock, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";

export default function PeriodCloseReconciliation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [closingPeriod, setClosingPeriod] = useState("MAR-2026");

    const { data: reconciliationData, isLoading } = useQuery({
        queryKey: ["/api/cost-management/period-close", closingPeriod],
        queryFn: async () => {
            // Stub backend data
            return {
                periodStatus: "OPEN",
                daysToClose: 22,
                unaccountedTransactions: 142,
                unprocessedCosts: 18,
                discrepancyAmount: 4250.00,
                subledgers: [
                    { name: "Inventory Valuation", status: "PENDING_RECONCILIATION", unaccounted: 85, balance: 14500000, glBalance: 14495750 },
                    { name: "Receipt Accounting", status: "CLEARED", unaccounted: 0, balance: 3200000, glBalance: 3200000 },
                    { name: "Manufacturing WIP", status: "PENDING_RECONCILIATION", unaccounted: 57, balance: 840000, glBalance: 840000 },
                    { name: "Landed Cost", status: "WARNING", unaccounted: 18, balance: 125000, glBalance: 125000 },
                ]
            };
        }
    });

    const runSweepMutation = useMutation({
        mutationFn: async () => {
            return new Promise((resolve) => setTimeout(resolve, 1500));
        },
        onSuccess: () => {
            toast({ title: "Subledger Sweep Executed", description: "Unaccounted transactions have been swept to the next period or forced to error suspense." });
        }
    });

    const closePeriodMutation = useMutation({
        mutationFn: async () => {
            if (reconciliationData?.unaccountedTransactions > 0) {
                throw new Error("Cannot close period with unaccounted transactions.");
            }
            return new Promise((resolve) => setTimeout(resolve, 1000));
        },
        onSuccess: () => {
            toast({ title: "Period Closed", description: `${closingPeriod} has been permanently closed for costing and inventory.` });
        },
        onError: (err: any) => {
            toast({ title: "Close Rejected", description: err.message, variant: "destructive" });
        }
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CLEARED": return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Cleared</Badge>;
            case "PENDING_RECONCILIATION": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case "WARNING": return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Exceptions Found</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) return <div className="p-6">Loading Hub...</div>;

    const totalProgress = reconciliationData ?
        (reconciliationData.subledgers.filter((s: any) => s.status === "CLEARED").length / reconciliationData.subledgers.length) * 100 : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Period Close Reconciliation</h1>
                    <p className="text-muted-foreground mt-1">Ensure subledger balances tie to General Ledger and clear uncosted transactions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => runSweepMutation.mutate()} disabled={runSweepMutation.isPending}>
                        <ArrowRightLeft className="w-4 h-4 mr-2" /> Sweep Transactions
                    </Button>
                    <Button
                        onClick={() => closePeriodMutation.mutate()}
                        disabled={closePeriodMutation.isPending}
                        className={reconciliationData?.periodStatus === "OPEN" ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                        <Lock className="w-4 h-4 mr-2" /> Close Subledger Period
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <CalendarRange className="w-4 h-4 text-primary" /> Target Period
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{closingPeriod}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={reconciliationData?.periodStatus === "OPEN" ? "default" : "secondary"}>
                                {reconciliationData?.periodStatus}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{reconciliationData?.daysToClose} days to soft close</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className={reconciliationData?.unaccountedTransactions > 0 ? "border-orange-500/50 bg-orange-500/5" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <ShieldAlert className="w-4 h-4 text-orange-500" /> Unaccounted Txns
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">{reconciliationData?.unaccountedTransactions}</div>
                        <p className="text-xs text-muted-foreground mt-1">Must be swept or costed to close</p>
                    </CardContent>
                </Card>

                <Card className={reconciliationData?.discrepancyAmount !== 0 ? "border-red-500/50 bg-red-500/5" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <AlertTriangle className="w-4 h-4 text-red-500" /> SL to GL Variance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">${formatNumber(reconciliationData?.discrepancyAmount || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total out-of-balance requiring adjustment</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-600" /> Subledger Readiness
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{totalProgress}%</div>
                        <Progress value={totalProgress} className="h-2 mt-2" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Subledger Reconciliation Status</CardTitle>
                    <CardDescription>Detailed breakdown of SCM costing subledgers and their alignment with the GL trial balance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subledger Domain</TableHead>
                                <TableHead className="text-right">Subledger Balance</TableHead>
                                <TableHead className="text-right">GL Balance</TableHead>
                                <TableHead className="text-right">Variance</TableHead>
                                <TableHead className="text-right">Unaccounted Txns</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reconciliationData?.subledgers.map((sub: any, idx: number) => {
                                const variance = sub.balance - sub.glBalance;
                                return (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{sub.name}</TableCell>
                                        <TableCell className="text-right">${formatNumber(sub.balance)}</TableCell>
                                        <TableCell className="text-right">${formatNumber(sub.glBalance)}</TableCell>
                                        <TableCell className={`text-right font-mono ${variance !== 0 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                            ${formatNumber(variance)}
                                        </TableCell>
                                        <TableCell className={`text-right ${sub.unaccounted > 0 ? 'text-orange-500 font-bold' : ''}`}>
                                            {sub.unaccounted}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">Validate</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
