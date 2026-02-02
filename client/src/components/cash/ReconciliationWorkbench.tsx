
import { useState, useMemo } from "react";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Check, Wand2, Calendar, LayoutList, Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CashStatementLine, CashTransaction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { api } from "@/lib/api";

interface ReconciliationWorkbenchProps {
    accountId: string;
}

export function ReconciliationWorkbench({ accountId }: ReconciliationWorkbenchProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // 1. Pagination State
    const [linesPage, setLinesPage] = useState(1);
    const [trxPage, setTrxPage] = useState(1);
    const pageSize = 50;

    // 2. Data Fetching
    const { data: linesData, isLoading: isLoadingLines } = useQuery<{ data: CashStatementLine[], total: number }>({
        queryKey: [`/api/cash/accounts/${accountId}/statement-lines`, linesPage],
        queryFn: () => api.cash.accounts.getStatementLines(accountId, { limit: pageSize, offset: (linesPage - 1) * pageSize }),
    });

    const { data: trxData, isLoading: isLoadingTrx } = useQuery<{ data: CashTransaction[], total: number }>({
        queryKey: [`/api/cash/accounts/${accountId}/transactions`, trxPage],
        queryFn: () => api.cash.accounts.getTransactions(accountId, { limit: pageSize, offset: (trxPage - 1) * pageSize }),
    });

    const unreconciledLines = useMemo(() => (linesData?.data || []).filter(l => !l.reconciled), [linesData]);
    const unreconciledTrx = useMemo(() => (trxData?.data || []).filter(t => t.status === "Unreconciled"), [trxData]);

    // 3. Selection State
    const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
    const [selectedTrx, setSelectedTrx] = useState<Set<string>>(new Set());

    const toggleLine = (id: string | number) => {
        const sid = String(id);
        const newSet = new Set(selectedLines);
        if (newSet.has(sid)) newSet.delete(sid);
        else newSet.add(sid);
        setSelectedLines(newSet);
    };

    const toggleTrx = (id: string | number) => {
        const sid = String(id);
        const newSet = new Set(selectedTrx);
        if (newSet.has(sid)) newSet.delete(sid);
        else newSet.add(sid);
        setSelectedTrx(newSet);
    };

    // 4. Computed Totals
    const totalLinesAmount = useMemo(() => {
        return unreconciledLines
            .filter(l => selectedLines.has(String(l.id)))
            .reduce((sum, l) => sum + Number(l.amount), 0);
    }, [unreconciledLines, selectedLines]);

    const totalTrxAmount = useMemo(() => {
        return unreconciledTrx
            .filter(t => selectedTrx.has(String(t.id)))
            .reduce((sum, t) => sum + Number(t.amount), 0);
    }, [unreconciledTrx, selectedTrx]);

    const difference = Math.abs(totalLinesAmount - totalTrxAmount);
    const canMatch = selectedLines.size > 0 && selectedTrx.size > 0 && difference < 0.01;

    // 5. Column Definitions
    const lineColumns: Column<CashStatementLine>[] = [
        {
            header: "",
            width: "40px",
            cell: (item) => (
                <Checkbox
                    checked={selectedLines.has(String(item.id))}
                    onCheckedChange={() => toggleLine(item.id)}
                />
            )
        },
        {
            header: "Description",
            accessorKey: "description",
            width: "60%",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm truncate">{item.description}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(item.transactionDate).toLocaleDateString()}
                        {item.referenceNumber && <span className="ml-2">Ref: {item.referenceNumber}</span>}
                    </span>
                </div>
            )
        },
        {
            header: "Amount",
            width: "30%",
            className: "text-right font-mono font-bold",
            cell: (item) => (
                <span className={Number(item.amount) < 0 ? "text-red-600" : "text-green-600"}>
                    {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            )
        }
    ];

    const trxColumns: Column<CashTransaction>[] = [
        {
            header: "",
            width: "40px",
            cell: (item) => (
                <Checkbox
                    checked={selectedTrx.has(String(item.id))}
                    onCheckedChange={() => toggleTrx(item.id)}
                />
            )
        },
        {
            header: "Reference",
            width: "60%",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm truncate">
                        {item.reference || 'No Ref'} <span className="text-xs text-muted-foreground">({item.sourceModule})</span>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(item.transactionDate!).toLocaleDateString()}
                        {item.description && <span className="ml-2 truncate max-w-[150px]">{item.description}</span>}
                    </span>
                </div>
            )
        },
        {
            header: "Amount",
            width: "30%",
            className: "text-right font-mono font-bold",
            cell: (item) => (
                <span className={Number(item.amount) < 0 ? "text-red-600" : "text-green-600"}>
                    {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            )
        }
    ];

    // 6. Mutations
    const manualReconcileMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/cash/reconcile/manual", {
                bankAccountId: accountId,
                lineIds: Array.from(selectedLines),
                transactionIds: Array.from(selectedTrx)
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Reconciled Successfully", description: "Selected items have been matched." });
            queryClient.invalidateQueries({ queryKey: [`/api/cash/accounts/${accountId}/statement-lines`] });
            queryClient.invalidateQueries({ queryKey: [`/api/cash/accounts/${accountId}/transactions`] });
            setSelectedLines(new Set());
            setSelectedTrx(new Set());
        },
        onError: (err: Error) => {
            toast({ title: "Reconciliation Failed", description: err.message, variant: "destructive" });
        }
    });

    const autoReconcileMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/cash/accounts/${accountId}/reconcile`);
            return res.json();
        },
        onSuccess: (data) => {
            toast({ title: "Auto-Reconciliation Complete", description: data.message });
            queryClient.invalidateQueries({ queryKey: [`/api/cash/accounts/${accountId}/statement-lines`] });
            queryClient.invalidateQueries({ queryKey: [`/api/cash/accounts/${accountId}/transactions`] });
        }
    });

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <LayoutList className="h-5 w-5" />
                        Reconciliation Workbench
                    </h3>
                    <span className="text-sm text-muted-foreground">
                        {linesData?.total || 0} Lines • {trxData?.total || 0} Transactions Pending
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Match Summary */}
                    {(selectedLines.size > 0 || selectedTrx.size > 0) && (
                        <div className="flex items-center gap-4 bg-muted px-4 py-2 rounded-md">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-semibold uppercase text-muted-foreground">Selection Difference</span>
                                <span className={`font-mono font-bold ${difference < 0.01 ? "text-green-600" : "text-red-500"}`}>
                                    {difference.toFixed(2)}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => manualReconcileMutation.mutate()}
                                disabled={!canMatch || manualReconcileMutation.isPending}
                            >
                                {manualReconcileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                Match Selected
                            </Button>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        onClick={() => autoReconcileMutation.mutate()}
                        disabled={autoReconcileMutation.isPending}
                    >
                        <Wand2 className="w-4 h-4 mr-2" />
                        {autoReconcileMutation.isPending ? "Running..." : "Auto Reconcile"}
                    </Button>
                </div>
            </div>

            {/* Main Workbench Grid */}
            <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                {/* Left: Bank Statement Lines */}
                <Card className="flex flex-col h-full overflow-hidden border-2 border-l-blue-500 bg-white">
                    <CardHeader className="py-2 px-4 bg-muted/30 border-b flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Bank Statement Lines</CardTitle>
                        <Badge variant="outline">{selectedLines.size} Selected</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                        <StandardTable
                            /* @ts-ignore - Generic Type inference issue in some environments */
                            data={unreconciledLines}
                            columns={lineColumns}
                            isLoading={isLoadingLines}
                            isVirtualized={true}
                            height={450}
                            page={linesPage}
                            pageSize={pageSize}
                            totalItems={linesData?.total}
                            onPageChange={setLinesPage}
                            className="h-full border-0 shadow-none"
                        />
                    </CardContent>
                </Card>

                {/* Right: System Transactions */}
                <Card className="flex flex-col h-full overflow-hidden border-2 border-l-purple-500 bg-white">
                    <CardHeader className="py-2 px-4 bg-muted/30 border-b flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">System Transactions</CardTitle>
                        <Badge variant="outline">{selectedTrx.size} Selected</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                        <StandardTable
                            /* @ts-ignore */
                            data={unreconciledTrx}
                            columns={trxColumns}
                            isLoading={isLoadingTrx}
                            isVirtualized={true}
                            height={450}
                            page={trxPage}
                            pageSize={pageSize}
                            totalItems={trxData?.total}
                            onPageChange={setTrxPage}
                            className="h-full border-0 shadow-none"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
