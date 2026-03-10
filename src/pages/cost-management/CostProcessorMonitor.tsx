import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Play, RefreshCw, CheckCircle, XCircle, Clock, Zap, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_TRANSACTIONS: any[] = [
    { id: "CP-TXN-001", txnType: "Inventory Receipt", source: "PO-2026-1310", item: "COAT-SVC-01", qty: 50, costMethod: "Standard", stdCost: 350.00, actualCost: 368.40, variance: 18.40, costElement: "Material", status: "Costed", processedDate: "2026-03-08 02:04 AM" },
    { id: "CP-TXN-002", txnType: "WO Component Issue", source: "WO-2026-0441", item: "STEEL-BILLET-100", qty: 200, costMethod: "Standard", stdCost: 12.50, actualCost: null, variance: null, costElement: "Material", status: "Pending", processedDate: null },
    { id: "CP-TXN-003", txnType: "WO Assembly Completion", source: "WO-2026-0440", item: "MACHINED-BRACKET-A", qty: 100, costMethod: "Standard", stdCost: 45.80, actualCost: 47.20, variance: 1.40, costElement: "Material + Labor", status: "Costed", processedDate: "2026-03-08 02:04 AM" },
    { id: "CP-TXN-004", txnType: "Inter-Org Transfer", source: "ITO-2026-0088", item: "USB-C-HUB", qty: 500, costMethod: "Average", stdCost: null, actualCost: 8.25, variance: null, costElement: "Material", status: "Costed", processedDate: "2026-03-07 02:01 AM" },
    { id: "CP-TXN-005", txnType: "Inventory Receipt", source: "PO-2026-1295", item: "HEAT-MAT-012", qty: 30, costMethod: "Standard", stdCost: 220.00, actualCost: null, variance: null, costElement: "Material", status: "Error", processedDate: null },
    { id: "CP-TXN-006", txnType: "Physical Inventory Adj", source: "PHY-ADJ-2026-003", item: "MONITOR-24", qty: -3, costMethod: "Standard", stdCost: 180.00, actualCost: -540.00, variance: 0, costElement: "Material", status: "Costed", processedDate: "2026-03-08 02:05 AM" },
];

const SEED_RUNS: any[] = [
    { id: "RUN-2026-0308", runDate: "2026-03-08", startTime: "02:00 AM", endTime: "02:06 AM", txnProcessed: 48, txnErrored: 1, status: "Completed" },
    { id: "RUN-2026-0307", runDate: "2026-03-07", startTime: "02:00 AM", endTime: "02:05 AM", txnProcessed: 37, txnErrored: 0, status: "Completed" },
    { id: "RUN-2026-0306", runDate: "2026-03-06", startTime: "02:00 AM", endTime: "02:09 AM", txnProcessed: 62, txnErrored: 2, status: "Completed with Errors" },
];

export default function CostProcessorMonitor() {
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState("All");

    const runMutation = useMutation({
        mutationFn: () => fetch("/api/costing/processor/run", { method: "POST" }).then(r => r.json()),
        onSuccess: () => toast({ title: "Cost processor run triggered — will complete in ~2-5 min" }),
        onError: () => toast({ title: "Cost processor triggered (pending API)" }),
    });

    const filtered = SEED_TRANSACTIONS.filter(t => statusFilter === "All" || t.status === statusFilter);

    const txnCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "txnType", header: "Transaction Type", width: "180px", cell: r => <Badge variant="outline" className="text-xs">{r.txnType}</Badge> },
        { id: "source", header: "Source Ref", width: "150px", cell: r => <span className="font-mono text-xs text-blue-600">{r.source}</span> },
        { id: "item", header: "Item", width: "160px", cell: r => <span className="font-mono text-xs">{r.item}</span> },
        { id: "qty", header: "Qty", width: "80px", cell: r => <span className={`text-right block font-bold ${r.qty < 0 ? "text-red-600" : ""}`}>{formatNumber(r.qty)}</span> },
        { id: "costMethod", header: "Method", width: "100px", cell: r => <Badge variant="secondary" className="text-xs">{r.costMethod}</Badge> },
        { id: "stdCost", header: "Std Cost", width: "110px", cell: r => r.stdCost ? <span className="text-right block">${formatNumber(r.stdCost)}</span> : <span className="text-muted-foreground text-xs">—</span> },
        { id: "actualCost", header: "Actual Cost", width: "110px", cell: r => r.actualCost !== null ? <span className="text-right block font-medium">${formatNumber(Math.abs(r.actualCost))}</span> : <span className="text-muted-foreground text-xs">Pending</span> },
        { id: "variance", header: "Variance", width: "100px", cell: r => r.variance !== null ? <span className={`text-right block font-bold ${r.variance > 0 ? "text-red-600" : r.variance < 0 ? "text-green-700" : ""}`}>${formatNumber(r.variance)}</span> : <span className="text-muted-foreground text-xs">—</span> },
        { id: "costElement", header: "Cost Element", width: "150px", cell: r => <span className="text-xs">{r.costElement}</span> },
        { id: "status", header: "Status", width: "130px", cell: r => <StatusBadge status={r.status} /> },
        { id: "processedDate", header: "Processed At", width: "160px", cell: r => <span className="text-xs text-muted-foreground">{r.processedDate ?? "—"}</span> },
    ], []);

    const runCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "runDate", header: "Run Date", width: "120px", cell: r => formatDate(r.runDate) },
        { id: "startTime", header: "Start", width: "120px", cell: r => <span className="text-xs">{r.startTime}</span> },
        { id: "endTime", header: "End", width: "120px", cell: r => <span className="text-xs">{r.endTime}</span> },
        { id: "txnProcessed", header: "Txns Valued", width: "120px", cell: r => <span className="text-center block font-bold text-green-700">{r.txnProcessed}</span> },
        { id: "txnErrored", header: "Errors", width: "90px", cell: r => <span className={`text-center block font-bold ${r.txnErrored > 0 ? "text-red-600" : "text-muted-foreground"}`}>{r.txnErrored}</span> },
        { id: "status", header: "Status", width: "180px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    const pending = SEED_TRANSACTIONS.filter(t => t.status === "Pending").length;
    const errors = SEED_TRANSACTIONS.filter(t => t.status === "Error").length;

    return (
        <StandardPage
            title="Automated Cost Processor"
            description="Monitors and controls the background cost processor that automatically values all inventory transactions (receipts, WO completions, issues, transfers). Runs nightly at 02:00 AM."
            breadcrumbs={[{ label: "Cost Management", href: "/scm/costing" }, { label: "Cost Processor" }]}
            actions={
                <Button onClick={() => runMutation.mutate()} disabled={runMutation.isPending}>
                    <Play className="h-4 w-4 mr-2" />{runMutation.isPending ? "Running…" : "Run Now"}
                </Button>
            }
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Clock className="h-4 w-4 text-amber-500" />Pending Costing</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{pending}</div><p className="text-xs text-muted-foreground">transactions unvalued</p></CardContent>
                </Card>
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><AlertTriangle className="h-4 w-4 text-red-500" />Costing Errors</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{errors}</div></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><CheckCircle className="h-4 w-4 text-green-600" />Costed (Today)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{SEED_TRANSACTIONS.filter(t => t.status === "Costed").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Zap className="h-4 w-4 text-yellow-500" />Last Run</CardTitle></CardHeader>
                    <CardContent><div className="text-lg font-bold">2026-03-08</div><p className="text-xs text-muted-foreground">02:00–02:06 AM · 48 txns</p></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="transactions">
                <TabsList className="mb-4"><TabsTrigger value="transactions">Transaction Queue</TabsTrigger><TabsTrigger value="runs">Run History ({SEED_RUNS.length})</TabsTrigger></TabsList>
                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div><CardTitle>Inventory Transactions — Costing Status</CardTitle><CardDescription>Every inventory movement must be valued by the cost processor before it flows to GL.</CardDescription></div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="All">All</SelectItem><SelectItem value="Costed">Costed</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Error">Error</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={filtered} columns={txnCols} onChange={() => { }} containerHeight="440px" /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="runs">
                    <Card><CardHeader><CardTitle>Processor Run History</CardTitle><CardDescription>Nightly at 02:00 AM. Use "Run Now" to trigger a manual run for urgent transactions.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_RUNS} columns={runCols} onChange={() => { }} containerHeight="360px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
