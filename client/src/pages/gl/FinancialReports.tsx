
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Download, Play, FileText, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

export default function FinancialReports() {
    const { toast } = useToast();
    const [selectedReportId, setSelectedReportId] = useState<string>("");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("Jan-2026"); // Default for demo
    const [selectedLedger, setSelectedLedger] = useState<string>("primary-ledger-001");
    const [reportData, setReportData] = useState<ReportGrid | null>(null);

    // Fetch Available Reports
    const { data: reports, isLoading: isLoadingReports } = useQuery<ReportDefinition[]>({
        queryKey: ["/api/gl/reports"],
    });

    // Fetch Periods
    const { data: periods } = useQuery<GlPeriod[]>({
        queryKey: ["/api/gl/periods"],
    });

    // Generate Report Mutation
    const generateReportMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/gl/reports/generate", {
                reportId: selectedReportId,
                periodName: selectedPeriod,
                ledgerId: selectedLedger
            });
            return await res.json();
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

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Financial Reporting Center
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Generate and analyze financial statements from the GL Cube.
                    </p>
                </div>
            </div>

            {/* Control Panel */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Report Parameters
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

                    {/* Report Selection */}
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
                                    <SelectItem key={r.id} value={r.id}>
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Ledger Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ledger</label>
                        <Select value={selectedLedger} onValueChange={setSelectedLedger}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="primary-ledger-001">Primary Ledger (USD)</SelectItem>
                                <SelectItem value="secondary-ledger-001">Secondary Ledger (EUR)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Period Selection */}
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

                    {/* Actions */}
                    <Button
                        onClick={handleRun}
                        disabled={!selectedReportId || generateReportMutation.isPending}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20"
                    >
                        {generateReportMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Run Report
                            </>
                        )}
                    </Button>

                </CardContent>
            </Card>

            {/* Report Output */}
            {reportData && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{reportData.reportName}</CardTitle>
                            <CardDescription>
                                Period: {reportData.period} | Ledger: {reportData.ledger} | Currency: USD
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                                <Download className="mr-2 h-4 w-4" /> Excel
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                                <Download className="mr-2 h-4 w-4" /> PDF
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[400px]">Description</TableHead>
                                        {reportData.columns.map((col, idx) => (
                                            <TableHead key={idx} className="text-right">
                                                {col.header}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.rows.map((row, idx) => (
                                        <TableRow key={idx} className={row.rowType === 'CALCULATION' || row.indentLevel === 0 ? "font-bold bg-muted/20" : ""}>
                                            <TableCell style={{ paddingLeft: `${(row.indentLevel * 1.5) + 1}rem` }}>
                                                {row.description}
                                            </TableCell>
                                            {row.cells.map((cell, cIdx) => (
                                                <TableCell key={cIdx} className="text-right font-mono">
                                                    {cell.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
