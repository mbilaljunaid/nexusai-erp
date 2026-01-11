
import { useState, useMemo } from "react";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Check, X, RefreshCw, Wand2, Calendar, LayoutList, ArrowRightLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CashStatementLine, CashTransaction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ReconciliationWorkbenchProps {
    accountId: string;
}

export function ReconciliationWorkbench({ accountId }: ReconciliationWorkbenchProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // 1. Data Fetching
    const { data: lines = [] } = useQuery<CashStatementLine[]>({
        queryKey: [`/api/cash/accounts/${accountId}/statement-lines`],
    });

    const { data: transactions = [] } = useQuery<CashTransaction[]>({
        queryKey: [`/api/cash/accounts/${accountId}/transactions`],
    });

    const unreconciledLines = useMemo(() => lines.filter(l => !l.reconciled), [lines]);
    const unreconciledTrx = useMemo(() => transactions.filter(t => t.status === "Unreconciled"), [transactions]);

    // 2. Selection State
    const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
    const [selectedTrx, setSelectedTrx] = useState<Set<string>>(new Set());

    const toggleLine = (id: string) => {
        const newSet = new Set(selectedLines);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedLines(newSet);
    };

    const toggleTrx = (id: string) => {
        const newSet = new Set(selectedTrx);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedTrx(newSet);
    };

    // 3. Computed Totals
    const totalLinesAmount = useMemo(() => {
        return unreconciledLines
            .filter(l => selectedLines.has(l.id))
            .reduce((sum, l) => sum + Number(l.amount), 0);
    }, [unreconciledLines, selectedLines]);

    const totalTrxAmount = useMemo(() => {
        return unreconciledTrx
            .filter(t => selectedTrx.has(t.id))
            .reduce((sum, t) => sum + Number(t.amount), 0);
    }, [unreconciledTrx, selectedTrx]);

    const difference = Math.abs(totalLinesAmount - totalTrxAmount);
    const canMatch = selectedLines.size > 0 && selectedTrx.size > 0 && difference < 0.01;

    // 4. Mutations
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
                        {unreconciledLines.length} Lines • {unreconciledTrx.length} Transactions Pending
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Match Summary */}
                    {(selectedLines.size > 0 || selectedTrx.size > 0) && (
                        <div className="flex items-center gap-4 bg-muted px-4 py-2 rounded-md">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-semibold uppercase text-muted-foreground">Selection Difference</span>
                                <span className={`font-mono font-bold ${difference === 0 ? "text-green-600" : "text-red-500"}`}>
                                    {difference.toFixed(2)}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => manualReconcileMutation.mutate()}
                                disabled={!canMatch || manualReconcileMutation.isPending}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Match Selected
                            </Button>
                        </div>
                    )}

                    <Button
                        variant="default"
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
                <Card className="flex flex-col h-full overflow-hidden border-2 border-l-blue-500">
                    <CardHeader className="py-3 bg-muted/30 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Bank Statement Lines</CardTitle>
                        <Badge variant="outline">{selectedLines.size} Selected</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="divide-y">
                                {unreconciledLines.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">No unreconciled lines.</div>
                                )}
                                {unreconciledLines.map(line => (
                                    <div
                                        key={line.id}
                                        className={`p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer ${selectedLines.has(line.id) ? "bg-blue-50/50" : ""}`}
                                        onClick={() => toggleLine(line.id)}
                                    >
                                        <Checkbox
                                            checked={selectedLines.has(line.id)}
                                            onCheckedChange={() => toggleLine(line.id)}
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-sm">{line.description}</span>
                                                <span className={`font-mono font-bold ${Number(line.amount) < 0 ? "text-red-600" : "text-green-600"}`}>
                                                    {Number(line.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <div className="flex gap-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(line.transactionDate).toLocaleDateString()}</span>
                                                    {line.referenceNumber && <span>Ref: {line.referenceNumber}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Right: System Transactions */}
                <Card className="flex flex-col h-full overflow-hidden border-2 border-l-purple-500">
                    <CardHeader className="py-3 bg-muted/30 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">System Transactions</CardTitle>
                        <Badge variant="outline">{selectedTrx.size} Selected</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="divide-y">
                                {unreconciledTrx.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">No unreconciled transactions.</div>
                                )}
                                {unreconciledTrx.map(trx => (
                                    <div
                                        key={trx.id}
                                        className={`p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer ${selectedTrx.has(trx.id) ? "bg-purple-50/50" : ""}`}
                                        onClick={() => toggleTrx(trx.id)}
                                    >
                                        <Checkbox
                                            checked={selectedTrx.has(trx.id)}
                                            onCheckedChange={() => toggleTrx(trx.id)}
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-sm">{trx.reference || 'No Ref'} <span className="text-xs text-muted-foreground">({trx.sourceModule})</span></span>
                                                <span className={`font-mono font-bold ${Number(trx.amount) < 0 ? "text-red-600" : "text-green-600"}`}>
                                                    {Number(trx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <div className="flex gap-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(trx.transactionDate!).toLocaleDateString()}</span>
                                                    {trx.description && <span className="truncate max-w-[200px]">{trx.description}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
