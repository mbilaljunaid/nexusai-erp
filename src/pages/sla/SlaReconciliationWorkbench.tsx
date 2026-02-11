import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Scale, AlertTriangle, CheckCircle2, FileText, Download, Filter, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SlaReconciliationWorkbench() {
    const [period, setPeriod] = useState("FEB-2026");

    // Fetch reconciliation data
    const { data: report, isLoading } = useQuery({
        queryKey: ["sla-recon-report", period],
        queryFn: async () => {
            // Mock subledger-to-GL reconciliation data
            return {
                summary: [
                    { module: "Accounts Payable", subledgerBalance: 124500.50, glBalance: 124500.50, variance: 0, status: "MATCHED" },
                    { module: "Accounts Receivable", subledgerBalance: 312000.00, glBalance: 311950.00, variance: 50.00, status: "DISCREPANCY" },
                    { module: "Inventory", subledgerBalance: 850400.75, glBalance: 850400.75, variance: 0, status: "MATCHED" },
                    { module: "Project Costing", subledgerBalance: 45200.00, glBalance: 45000.00, variance: 200.00, status: "DISCREPANCY" },
                ],
                totalSubledger: 1332101.25,
                totalGL: 1331851.25,
                totalVariance: 250.00
            };
        }
    });

    return (
        <StandardPage
            title="SLA Reconciliation Workbench"
            description="Verify integrity between subledger transaction journals and General Ledger balances."
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "SLA Governance" }]}
        >
            <div className="flex flex-col gap-6">
                {/* Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Ledger</label>
                            <Select defaultValue="PRIMARY">
                                <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRIMARY">Primary USD Ledger</SelectItem>
                                    <SelectItem value="SECONDARY">Secondary EUR Ledger</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Period</label>
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FEB-2026">Feb-2026</SelectItem>
                                    <SelectItem value="JAN-2026">Jan-2026</SelectItem>
                                    <SelectItem value="DEC-2025">Dec-2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex gap-2 self-end">
                        <Button variant="outline" size="sm" className="gap-2 h-9">
                            <Download className="h-4 w-4" /> Export
                        </Button>
                        <Button variant="default" size="sm" className="gap-2 h-9">
                            <RefreshCw className="h-4 w-4" /> Run Comparison
                        </Button>
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                <Scale className="h-4 w-4" /> Combined Variance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${report?.totalVariance === 0 ? 'text-green-600' : 'text-red-500'}`}>
                                ${report?.totalVariance.toFixed(2) ?? "--"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Variance across all subledgers for the period.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Discrepancies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-600">
                                {report?.summary.filter(s => s.status === 'DISCREPANCY').length ?? "--"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Modules requiring manual reconciliation.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" /> Integrity Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">99.98%</div>
                            <p className="text-xs text-muted-foreground mt-1">Overall data mapping accuracy.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detail Table */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Module-Wise Reconciliation
                        </CardTitle>
                        <CardDescription>Breakdown of subledger and GL balances by source module.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-bold">Source Module</TableHead>
                                    <TableHead className="text-right font-bold">Subledger Balance</TableHead>
                                    <TableHead className="text-right font-bold">GL Balance</TableHead>
                                    <TableHead className="text-right font-bold">Variance</TableHead>
                                    <TableHead className="text-center font-bold">Status</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report?.summary.map((row) => (
                                    <TableRow key={row.module} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium">{row.module}</TableCell>
                                        <TableCell className="text-right font-mono text-sm">${row.subledgerBalance.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono text-sm">${row.glBalance.toLocaleString()}</TableCell>
                                        <TableCell className={`text-right font-mono text-sm font-bold ${row.variance !== 0 ? 'text-red-500' : 'text-green-600'}`}>
                                            ${row.variance.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={row.status === 'MATCHED' ? 'success' : 'destructive'} className="text-[10px]">
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 gap-2">
                                                <FileText className="h-3 w-3" /> Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
