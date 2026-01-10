
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLedger } from "@/context/LedgerContext";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Download, Play, FileText, Loader2, ArrowUpRight, TrendingUp, DollarSign, Wallet, Layout } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ReportDefinition {
    id: string;
    name: string;
    description: string;
}

interface GlPeriod {
    id: string;
    periodName: string;
}

interface ReportGrid {
    reportName: string;
    period: string;
    ledger: string;
    columns: { header: string, type: string }[];
    rows: {
        description: string;
        rowType: string;
        indentLevel: number;
        cells: number[];
    }[];
}

import { VarianceAnalysisWidget } from "@/components/gl/VarianceAnalysisWidget";

export default function FinancialReports() {
    const { toast } = useToast();
    const { currentLedgerId, activeLedger } = useLedger();
    const [selectedReportId, setSelectedReportId] = useState<string>("");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("Jan-2026");
    const [reportData, setReportData] = useState<ReportGrid | null>(null);

    // Drill Down State
    const [drillCell, setDrillCell] = useState<{ row: string, col: string, value: number } | null>(null);
    const [isDrillOpen, setIsDrillOpen] = useState(false);

    // Variance Analysis State
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

    // Fetch Available Reports
    const { data: reports, isLoading: isLoadingReports } = useQuery<ReportDefinition[]>({
        queryKey: ["/api/gl/fsg/reports"],
    });

    // Fetch Periods
    const { data: periods } = useQuery<GlPeriod[]>({
        queryKey: ["/api/gl/periods"],
    });

    // Generate Report Mutation
    const generateReportMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/gl/fsg/generate", {
                reportId: selectedReportId,
                periodName: selectedPeriod,
                ledgerId: currentLedgerId,
                format: "JSON"
            });
            const data = await res.json();

            // Map Backend Response to Frontend Grid
            return {
                reportName: data.reportName,
                period: data.period,
                ledger: currentLedgerId || "Unknown",
                columns: data.headers.map((h: string) => ({ header: h, type: "number" })),
                rows: data.rows.map((r: any) => ({
                    description: r.label,
                    rowType: r.rowType,
                    indentLevel: r.indentLevel || 0,
                    cells: r.values
                }))
            };
        },
        onSuccess: (data: ReportGrid) => {
            setReportData(data);
            toast({
                title: "Report Generated",
                description: `Successfully generated ${data.reportName}`,
            });
        },
        onError: (error) => {
            toast({
                title: "Generation Failed",
                description: "Could not generate the report. Please check parameters.",
                variant: "destructive",
            });
        },
    });

    const handleRun = () => {
        if (!selectedReportId) return;
        generateReportMutation.mutate();
    };

    const handleExport = (format: 'pdf' | 'excel') => {
        toast({
            title: "Export Started",
            description: `Exporting to ${format.toUpperCase()}... (Simulated)`,
        });
    };

    const handleCellClick = (rowDesc: string, colHeader: string, value: number) => {
        if (value === 0) return; // Ignore zero cells
        setDrillCell({ row: rowDesc, col: colHeader, value });
        setIsDrillOpen(true);
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                        Financial Reporting Center
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Enterprise Financial Intelligence & Analysis
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsAnalysisOpen(true)}>
                        <TrendingUp className="mr-2 h-4 w-4" /> Analyze Variance
                    </Button>
                    <Link href="/gl/reports/builder">
                        <Button variant="outline">
                            <Layout className="mr-2 h-4 w-4" /> Builder
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={() => handleExport('excel')} disabled={!reportData}>
                        <Download className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                </div>
            </div>

            {/* Metric Cards (Quick Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="shadow-sm border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Wallet className="h-4 w-4" /> Active Ledger
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold truncate">{activeLedger?.name || "Primary Ledger"} ({activeLedger?.currencyCode || "USD"})</div>
                        <p className="text-xs text-muted-foreground mt-1">Calendar: Monthly</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Period Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold flex items-center gap-2">
                            Open <Badge className="bg-green-600">Jan-2026</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Close Date: Jan 31, 2026</p>
                    </CardContent>
                </Card>
                {/* Placeholder Metrics */}
                <Card className="shadow-sm border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">YTD Net Income (Est)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">$1,240,500.00</div>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> 12% vs Last Year
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area: Sidebar + Report Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                {/* Left Sidebar: Controls */}
                <Card className="lg:col-span-1 shadow-md border-t-4 border-t-primary/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Report Definition</label>
                            <Select value={selectedReportId} onValueChange={setSelectedReportId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Report..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingReports ? (
                                        <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                                    ) : reports?.map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ledger (Read Only)</label>
                            <Input
                                value={activeLedger?.name || "Loading..."}
                                disabled
                                className="bg-muted/50"
                            />
                            <p className="text-[10px] text-muted-foreground italic">Use the Global Ledger Switcher to change books.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Period</label>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods?.length ? periods.map(p => (
                                        <SelectItem key={p.id} value={p.periodName}>{p.periodName}</SelectItem>
                                    )) : (
                                        <SelectItem value="Jan-2026">Jan-2026 (Default)</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleRun}
                            disabled={!selectedReportId || generateReportMutation.isPending}
                            className="w-full bg-primary hover:bg-primary/90 mt-4 shadow-md transition-all active:scale-[0.98]"
                        >
                            {generateReportMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" /> Run Report
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Area: Report Output */}
                <div className="lg:col-span-3">
                    {reportData ? (
                        <Card className="min-h-[600px] shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500 border-none ring-1 ring-border/50">
                            <CardHeader className="bg-muted/10 border-b pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl font-serif text-foreground/90">{reportData.reportName}</CardTitle>
                                        <CardDescription className="mt-1 flex gap-4 text-xs font-mono">
                                            <span>Period: {reportData.period}</span>
                                            <span>|</span>
                                            <span>Ledger: {reportData.ledger}</span>
                                            <span>|</span>
                                            <span>Currency: USD</span>
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="font-mono">Generated: {new Date().toLocaleTimeString()}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                            <TableHead className="w-[400px] font-bold text-foreground pl-6">Description</TableHead>
                                            {reportData.columns.map((col, idx) => (
                                                <TableHead key={idx} className="text-right font-bold text-foreground">
                                                    {col.header}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.rows.map((row, idx) => (
                                            <TableRow
                                                key={idx}
                                                className={cn(
                                                    "transition-colors hover:bg-muted/20 border-b-border/50",
                                                    (row.rowType === 'CALCULATION' || row.indentLevel === 0) ? "font-bold bg-muted/5" : ""
                                                )}
                                            >
                                                <TableCell
                                                    style={{ paddingLeft: `${(row.indentLevel * 1.5) + 1.5}rem` }}
                                                    className="py-3"
                                                >
                                                    {row.description}
                                                </TableCell>
                                                {row.cells.map((cell, cIdx) => (
                                                    <TableCell
                                                        key={cIdx}
                                                        className="text-right font-mono cursor-pointer hover:text-blue-600 hover:underline"
                                                        onClick={() => handleCellClick(row.description, reportData.columns[cIdx].header, cell)}
                                                    >
                                                        {cell === 0 ? "-" : cell.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/5">
                            <FileText className="h-12 w-12 mb-4 opacity-20" />
                            <p>Select parameters and click "Run Report" to generate output.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Drill Down Side Sheet */}
            <Sheet open={isDrillOpen} onOpenChange={setIsDrillOpen}>
                <SheetContent side="right" className="sm:max-w-[600px] flex flex-col h-full border-l shadow-2xl">
                    <SheetHeader className="pb-6 border-b">
                        <SheetTitle className="flex items-center gap-2">
                            Drill Down Details
                        </SheetTitle>
                        <SheetDescription>
                            Reviewing source transactions for selected balance.
                        </SheetDescription>
                    </SheetHeader>

                    {drillCell && (
                        <div className="flex-1 overflow-y-auto py-6 space-y-6">
                            {/* Context Card */}
                            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Account / Row</p>
                                        <p className="font-medium">{drillCell.row}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-muted-foreground text-xs">Period / Column</p>
                                        <p className="font-medium">{drillCell.col}</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                        <p className="text-muted-foreground text-xs">Balance Amount</p>
                                        <p className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-400">
                                            {drillCell.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <h4 className="text-sm font-semibold">Source Transactions (Preview)</h4>

                            {/* Source Journal List (Mocked for UI Demo) */}
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-3 rounded-md border text-sm hover:bg-muted/50 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-blue-600 group-hover:underline">JE-2026-00{i}</span>
                                            <span className="text-xs text-muted-foreground">Jan {10 + i}, 2026</span>
                                        </div>
                                        <p className="text-muted-foreground line-clamp-1">Monthly allocation for {drillCell.row} - Batch #{100 + i}</p>
                                        <div className="mt-2 text-right font-mono text-xs">
                                            {(drillCell.value / 3).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                                View all 12 transactions...
                            </Button>
                        </div>
                    )}

                    <SheetFooter className="mt-auto pt-4 border-t">
                        <SheetClose asChild>
                            <Button variant="outline" className="w-full">Close Details</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Variance Analysis Sheet */}
            <Sheet open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
                <SheetContent side="right" className="sm:max-w-[500px] w-full p-0">
                    <div className="h-full p-6">
                        <VarianceAnalysisWidget
                            currentPeriodId={selectedPeriod}
                            onClose={() => setIsAnalysisOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet >
        </div >
    );
}

