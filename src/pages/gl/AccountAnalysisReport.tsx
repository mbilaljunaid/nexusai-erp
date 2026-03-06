import { formatDate } from "@/lib/dateUtils";

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, TableProperties, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLedger } from "@/context/LedgerContext";
import { downloadFile } from "@/lib/utils";

type Transaction = {
    glDate: string;
    source: string;
    description: string;
    accountCode: string;
    enteredDr: string;
    enteredCr: string;
    accountedDr: string;
    accountedCr: string;
    currency: string;
};

type ReportData = {
    period: string;
    ledgerId: string;
    data: Transaction[];
    summary: {
        totalDr: number;
        totalCr: number;
        rowCount: number;
    };
};

export default function AccountAnalysisReport() {
    const { toast } = useToast();
    const { currentLedgerId: ledgerId } = useLedger();
    const [periodName, setPeriodName] = useState("");
    const [segment1, setSegment1] = useState(""); // Company
    const [segment3, setSegment3] = useState(""); // Natural Account

    // Generate Report Mutation (User triggers generation)
    const generateReport = useMutation({
        mutationFn: async () => {
            if (!periodName) throw new Error("Period Name is required");
            const res = await apiRequest("POST", "/api/sla/reports/account-analysis", {
                ledgerId,
                periodName,
                segment1,
                segment3
            });
            return res.json() as Promise<ReportData>;
        },
        onError: (error: Error) => {
            toast({ title: "Report Generation Failed", description: error.message, variant: "destructive" });
        }
    });

    const exportCSV = () => {
        if (!generateReport.data) return;
        const headers = ["Date", "Source", "Description", "Account", "Debit (Ent)", "Credit (Ent)", "Debit (Acc)", "Credit (Acc)", "Currency"];
        const rows = generateReport.data.data.map(t => [
            formatDate(t.glDate),
            t.source,
            `"${t.description || ''}"`, // Quote description to handle commas
            t.accountCode,
            t.enteredDr || 0,
            t.enteredCr || 0,
            t.accountedDr || 0,
            t.accountedCr || 0,
            t.currency
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadFile(blob, `account_analysis_${periodName}.csv`);
    };

    return (
        <StandardDashboard
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Account Analysis Report</h1>
                        <p className="text-muted-foreground mt-2">Detailed transaction listing for reconciliation.</p>
                    </div>
                    {generateReport.data && (
                        <Button variant="outline" onClick={exportCSV}>
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    )}
                </div>
            }
        >
            <DashboardWidget colSpan={4} title="Report Parameters" icon={Filter}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Period Name *</label>
                        <Input
                            placeholder="e.g. Jan-26"
                            value={periodName}
                            onChange={(e) => setPeriodName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Account (Segment 3)</label>
                        <Input
                            placeholder="e.g. 1000"
                            value={segment3}
                            onChange={(e) => setSegment3(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => generateReport.mutate()}
                        disabled={generateReport.isPending || !periodName}
                        className="w-full"
                    >
                        {generateReport.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Run Report"}
                    </Button>
                </div>
            </DashboardWidget>

            {generateReport.data && (
                <DashboardWidget colSpan={4} title={`Result: ${generateReport.data.summary.rowCount} Lines`}>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>GL Date</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Debit (Acc)</TableHead>
                                    <TableHead className="text-right">Credit (Acc)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {generateReport.data.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No transactions found.</TableCell>
                                    </TableRow>
                                ) : (
                                    generateReport.data.data.map((tx, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{formatDate(tx.glDate)}</TableCell>
                                            <TableCell>{tx.source}</TableCell>
                                            <TableCell className="font-mono text-xs">{tx.accountCode}</TableCell>
                                            <TableCell className="max-w-72 truncate">{tx.description}</TableCell>
                                            <TableCell className="text-right">{Number(tx.accountedDr).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="text-right">{Number(tx.accountedCr).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 flex justify-end gap-8 text-sm font-bold border-t pt-4">
                        <span>Total Debit: {generateReport.data.summary.totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span>Total Credit: {generateReport.data.summary.totalCr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </DashboardWidget>
            )}
        </StandardDashboard>
    );
}
