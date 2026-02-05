
import { useQuery } from "@tanstack/react-query";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, Download, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportData {
    account: {
        name: string;
        accountNumber: string;
        bankName: string;
        currency: string;
    };
    summary: {
        ledgerBalance: number;
        statementBalance: number;
        variance: number;
        reconciledCount: number;
        unreconciledCount: number;
    };
    details: {
        unreconciledLines: any[];
        unclearedTransactions: any[];
    };
}

export function ReconciliationReportDialog({
    bankAccountId,
    open,
    onClose
}: {
    bankAccountId: string | null;
    open: boolean;
    onClose: () => void;
}) {
    const { data: report, isLoading } = useQuery<ReportData>({
        queryKey: [`/api/cash/accounts/${bankAccountId}/reconcile-report`],
        enabled: !!bankAccountId && open
    });

    if (!bankAccountId) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Bank Reconciliation Report
                            </DialogTitle>
                            <DialogDescription>
                                Detailed analysis of ledger vs. statement for {report?.account.name}
                            </DialogDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.open(`/api/cash/accounts/${bankAccountId}/reconcile-report/pdf`, '_blank')}
                        >
                            <Download className="h-4 w-4" /> Export PDF
                        </Button>
                    </div>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-12 text-center text-muted-foreground">Generating report...</div>
                ) : (
                    <div className="space-y-8 py-4">
                        {/* Executive Summary */}
                        <div className="grid grid-cols-3 gap-6 bg-muted/30 p-4 rounded-lg border border-muted-foreground/10">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ledger Balance</span>
                                <div className="text-2xl font-bold">{report?.account.currency} {report?.summary.ledgerBalance.toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Statement Balance</span>
                                <div className="text-2xl font-bold">{report?.account.currency} {report?.summary.statementBalance.toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Unreconciled Variance</span>
                                <div className="flex items-center gap-2">
                                    <div className={`text-2xl font-bold ${report?.summary.variance === 0 ? 'text-green-600' : 'text-destructive'}`}>
                                        {report?.account.currency} {report?.summary.variance.toLocaleString()}
                                    </div>
                                    {report?.summary.variance === 0 ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-destructive" />}
                                </div>
                            </div>
                        </div>

                        {/* Exceptions Breakdown */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2 text-sm">
                                    <TrendingUp className="h-4 w-4 text-amber-600" />
                                    Uncleared Statement Lines ({report?.details.unreconciledLines.length})
                                </h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="text-[10px]">Date</TableHead>
                                            <TableHead className="text-[10px]">Description</TableHead>
                                            <TableHead className="text-[10px] text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report?.details.unreconciledLines.length === 0 ? (
                                            <TableRow><TableCell colSpan={3} className="text-center text-xs text-muted-foreground italic py-4">All lines cleared</TableCell></TableRow>
                                        ) : (
                                            report?.details.unreconciledLines.map((l, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="text-xs">{format(new Date(l.date), 'MMM dd')}</TableCell>
                                                    <TableCell className="text-xs max-w-[150px] truncate">{l.description}</TableCell>
                                                    <TableCell className="text-xs text-right font-medium">{l.amount.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2 text-sm">
                                    <TrendingDown className="h-4 w-4 text-blue-600" />
                                    Uncleared GL Transactions ({report?.details.unclearedTransactions.length})
                                </h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="text-[10px]">Date</TableHead>
                                            <TableHead className="text-[10px]">Description</TableHead>
                                            <TableHead className="text-[10px] text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report?.details.unclearedTransactions.length === 0 ? (
                                            <TableRow><TableCell colSpan={3} className="text-center text-xs text-muted-foreground italic py-4">All transactions cleared</TableCell></TableRow>
                                        ) : (
                                            report?.details.unclearedTransactions.map((t, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="text-xs">{format(new Date(t.date), 'MMM dd')}</TableCell>
                                                    <TableCell className="text-xs max-w-[150px] truncate">{t.description}</TableCell>
                                                    <TableCell className="text-xs text-right font-medium">{t.amount.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded border border-primary/20 p-3 italic text-[11px] text-muted-foreground">
                            Note: This report is generated in real-time. Final reconciliation certification should be performed after all automated rules are processed and manual adjustments are posted.
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
