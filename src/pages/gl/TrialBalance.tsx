import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
    Search, Filter, Download, FileText, ChevronRight,
    ArrowUpDown, Loader2, Info, LayoutGrid, Sparkles, BarChart3
} from "lucide-react";

import { format } from "date-fns";
import { FormattedValue } from "@/components/FormattedValue";
import { cn } from "@/lib/utils";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { useLedger } from "@/context/LedgerContext";
import { LedgerContextBadge } from "@/components/gl/LedgerContextBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardPage } from "@/components/layout/StandardPage";

interface TrialBalanceRow {
    ccid: string;
    code: string;
    accountType: string;
    segment2: string;
    segment3: string;
    totalDebit: number;
    totalCredit: number;
    netBalance: number;
}

export default function TrialBalance() {
    const { open, sendMessage } = useNexusAI();
    const { currentLedgerId } = useLedger();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCCID, setSelectedCCID] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState("PRIMARY_DEC23"); // Mock selection for now
    const [accountTypeFilter, setAccountTypeFilter] = useState("All");
    const [page, setPage] = useState(1);
    const pageSize = 25;

    const { data: report, isLoading } = useQuery({
        queryKey: ["/api/gl/reporting/trial-balance", { periodId: selectedPeriod, ledgerId: currentLedgerId, page, limit: pageSize, accountType: accountTypeFilter }],
        queryFn: async () => {
            const offset = (page - 1) * pageSize;
            const res = await fetch(`/api/gl/reporting/trial-balance?periodId=${selectedPeriod}&ledgerId=${currentLedgerId}&limit=${pageSize}&offset=${offset}&accountType=${accountTypeFilter}`);
            if (!res.ok) throw new Error("Failed to fetch trial balance");
            return res.json();
        }
    });

    const handleExportCSV = async () => {
        try {
            // Fetch without limit to get full dataset for export
            const res = await fetch(`/api/gl/reporting/trial-balance?periodId=${selectedPeriod}&ledgerId=${currentLedgerId}&accountType=${accountTypeFilter}&limit=10000`);
            if (!res.ok) throw new Error("Failed to export");
            const data = await res.json();

            const headers = ["Code Combination", "Segment2", "Segment3", "Type", "Debit", "Credit", "Net Balance"];
            const csvRows = data.rows.map((r: TrialBalanceRow) => {
                return `"${r.code}","${r.segment2}","${r.segment3}","${r.accountType}",${r.totalDebit},${r.totalCredit},${r.netBalance}`;
            });

            const csvContent = [headers.join(","), ...csvRows].join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `trial_balance_${selectedPeriod}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Export failed:", error);
        }
    };


    const { data: insights, isLoading: isLoadingInsights } = useQuery({
        queryKey: ["/api/gl/reporting/explain-variance", selectedPeriod, currentLedgerId],
        queryFn: async () => {
            const benchmark = "PRIMARY_NOV23";
            const res = await fetch(`/api/gl/reporting/explain-variance?periodId=${selectedPeriod}&benchmarkPeriodId=${benchmark}&ledgerId=${currentLedgerId}`);
            if (!res.ok) throw new Error("Failed to fetch AI insights");
            return res.json();
        }
    });

    const { data: drillDown, isLoading: isLoadingDrill } = useQuery({
        queryKey: ["/api/gl/reporting/drill-down", selectedCCID, selectedPeriod, currentLedgerId],
        queryFn: async () => {
            if (!selectedCCID) return null;
            const res = await fetch(`/api/gl/reporting/drill-down/${selectedCCID}?periodId=${selectedPeriod}&ledgerId=${currentLedgerId}`);
            if (!res.ok) throw new Error("Failed to fetch drill-down data");
            return res.json();
        },
        enabled: !!selectedCCID
    });

    return (
        <StandardPage
            title="Trial Balance"
            description="Detailed balances by Code Combination for the selected period."
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
                    <Button><Filter className="mr-2 h-4 w-4" /> Multi-Period</Button>
                </div>
            }
        >
            {/* AI Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-primary/20 bg-primary/5 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                            <CardTitle className="text-lg">AI Financial Commentary</CardTitle>
                        </div>
                        <CardDescription>
                            Automated analysis of significant variances vs. benchmark period (Nov-2023)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingInsights ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing ledger data...
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {insights?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4">No significant variances detected for this period.</p>
                                ) : (
                                    insights?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 p-3 rounded-lg bg-background/50 border border-primary/10 hover:border-primary/30 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-sm">{item.code}</span>
                                                    <Badge variant={item.diff > 0 ? "destructive" : "default"} className="text-[10px]">
                                                        {item.pct > 0 ? "+" : ""}{item.pct.toFixed(1)}% Variance
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground italic leading-relaxed">
                                                    "{item.explanation}"
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary hover:bg-primary/5 gap-2 font-bold"
                                onClick={open}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                Financial Insights
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                            Period Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Total Debits</span>
                            <span className="font-mono font-bold">
                                {(report?.summary?.totalDebit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Total Credits</span>
                            <span className="font-mono font-bold">
                                {(report?.summary?.totalCredit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="pt-2 border-t flex justify-between items-center text-sm">
                            <span className="font-bold">Net Difference</span>
                            <span className={cn("font-mono font-bold", (report?.summary?.netDifference || 0) !== 0 ? "text-destructive" : "text-primary")}>
                                {(report?.summary?.netDifference || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="relative w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by CCID or Account..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Account Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Types</SelectItem>
                                    <SelectItem value="Asset">Asset</SelectItem>
                                    <SelectItem value="Liability">Liability</SelectItem>
                                    <SelectItem value="Equity">Equity</SelectItem>
                                    <SelectItem value="Revenue">Revenue</SelectItem>
                                    <SelectItem value="Expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                            <Badge variant="outline" className="px-3 py-1">
                                Ledger: <FormattedValue value={currentLedgerId} type="ledger" className="ml-1" />
                            </Badge>
                            <Badge variant="secondary" className="px-3 py-1">
                                Period: Dec-2023
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <InteractiveSpreadsheet
                                data={report?.rows || []}
                                isLoading={isLoading}
                                onRowClick={(row: TrialBalanceRow) => setSelectedCCID(row.ccid)}
                                isVirtualized={false} // Disabled for paginated high-level view
                                columns={[
                                    {
                                        header: "Code Combination",
                                        id: "code", width: "150px",
                                        width: "35%",
                                        cell: (row: TrialBalanceRow) => (
                                            <div className="flex flex-col">
                                                <span className="font-medium font-mono text-sm">{row.code}</span>
                                                <div className="text-xs text-muted-foreground font-sans mt-0.5 truncate">
                                                    Store: {row.segment2} | Account: {row.segment3}
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        header: "Type",
                                        id: "accountType", width: "150px",
                                        width: "15%",
                                        cell: (row: TrialBalanceRow) => (
                                            <Badge variant={row.accountType === "Asset" ? "default" : "secondary"} className="text-[10px] uppercase">
                                                {row.accountType}
                                            </Badge>
                                        )
                                    },
                                    {
                                        header: "Debit",
                                        id: "totalDebit", width: "150px",
                                        width: "15%",
                                        className: "text-right tabular-nums",
                                        cell: (row: TrialBalanceRow) => row.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })
                                    },
                                    {
                                        header: "Credit",
                                        id: "totalCredit", width: "150px",
                                        width: "15%",
                                        className: "text-right tabular-nums",
                                        cell: (row: TrialBalanceRow) => row.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })
                                    },
                                    {
                                        header: "Net Balance",
                                        id: "netBalance", width: "150px",
                                        width: "15%",
                                        className: "text-right font-bold tabular-nums",
                                        cell: (row: TrialBalanceRow) => (
                                            <span className={row.netBalance < 0 ? "text-red-500" : ""}>
                                                {row.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        )
                                    },
                                    {
                                        header: "",
                                        width: "5%",
                                        cell: () => <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"  onChange={() => {}} containerHeight="600px" />
                                    }
                                ]}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Drill Down Side Sheet */}
            <Sheet open={!!selectedCCID} onOpenChange={(open) => !open && setSelectedCCID(null)}>
                <SheetContent className="sm:max-w-xl md:max-w-2xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2">
                            <LayoutGrid className="h-5 w-5 text-primary" />
                            Balance Drill-down
                        </SheetTitle>
                        <SheetDescription>
                            Individual journal lines contributing to the balance for:
                            <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs break-all">
                                {report?.rows?.find((r: any) => r.ccid === selectedCCID)?.code}
                            </div>
                        </SheetDescription>
                    </SheetHeader>

                    {isLoadingDrill ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {drillDown?.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                                    <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground">No transaction history found for this CCID in the selected period.</p>
                                </div>
                            ) : (
                                drillDown?.map((line: any) => (
                                    <div key={line.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-sm">{line.journalNumber}</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">{line.description}</p>
                                            </div>
                                            <Badge variant="outline">{format(new Date(line.accountingDate), "MMM dd, yyyy")}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t text-xs">
                                            <div className="flex gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-muted-foreground">Debit</span>
                                                    <span className="font-mono font-bold text-green-600">{Number(line.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-muted-foreground">Credit</span>
                                                    <span className="font-mono font-bold text-red-600">{Number(line.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary font-bold">
                                                View Journal <ChevronRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </StandardPage>
    );
}
