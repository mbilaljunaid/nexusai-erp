
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, AlertTriangle, Building2, FileText } from "lucide-react";
import { ReconciliationReportDialog } from "./ReconciliationReportDialog";

interface ReconciliationSummary {
    accountId: string;
    accountName: string;
    bankName: string;
    currency: string;
    totalLines: number;
    unreconciledLines: number;
    percentComplete: number;
    status: string;
}

export function PeriodCloseDashboard() {
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [reportOpen, setReportOpen] = useState(false);

    const { data: summary, isLoading } = useQuery<ReconciliationSummary[]>({
        queryKey: ["/api/cash/reconcile/summary"]
    });

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Analysing period status...</div>;
    }

    const handleViewReport = (accountId: string) => {
        setSelectedAccountId(accountId);
        setReportOpen(true);
    };

    const totalAccounts = summary?.length || 0;
    const completedAccounts = summary?.filter(s => s.status === "Complete").length || 0;
    const overallProgress = totalAccounts > 0 ? (completedAccounts / totalAccounts) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Overall Readiness</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold">{Math.round(overallProgress)}%</div>
                            <Progress value={overallProgress} className="h-2 flex-1" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {completedAccounts} of {totalAccounts} accounts reconciled
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Open Exceptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {summary?.reduce((acc, curr) => acc + curr.unreconciledLines, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Statement lines pending match
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Period Deadline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold flex items-center gap-2">
                            Jan 31
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Fiscal period ending in 20 days</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bank Reconciliation Progress</CardTitle>
                    <CardDescription>Status per bank account for the current fiscal period.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bank Account</TableHead>
                                <TableHead>Bank / Currency</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Exceptions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summary?.map((account) => (
                                <TableRow key={account.accountId}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{account.accountName}</span>
                                            <span className="text-xs text-muted-foreground font-normal">ID: {account.accountId.slice(0, 8)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="flex items-center gap-1">
                                                <Building2 className="h-3 w-3" /> {account.bankName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{account.currency}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[200px]">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                                <span>{Math.round(account.percentComplete)}%</span>
                                                <span>{account.totalLines - account.unreconciledLines} / {account.totalLines}</span>
                                            </div>
                                            <Progress value={account.percentComplete} className="h-1.5" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {account.unreconciledLines > 0 ? (
                                            <Badge variant="destructive" className="gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                {account.unreconciledLines}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">No exceptions</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {account.status === "Complete" ? (
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Reconciled
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">In Progress</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => handleViewReport(account.accountId)}
                                        >
                                            <FileText className="h-4 w-4" />
                                            Report
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ReconciliationReportDialog
                bankAccountId={selectedAccountId}
                open={reportOpen}
                onClose={() => setReportOpen(false)}
            />

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-4 items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                    <p className="font-semibold text-amber-900">Period Close Requirement</p>
                    <p className="text-amber-800 mt-1">
                        All bank accounts must reach 100% reconciliation status before the General Ledger period can be closed.
                        Unreconciled items will cause variance in the Trial Balance.
                    </p>
                </div>
            </div>
        </div>
    );
}
