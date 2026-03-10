import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, PlayCircle, Zap, Search, Calendar, RefreshCw, Layers, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";

export default function ERSSettlementEngine() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isRunOpen, setIsRunOpen] = useState(false);
    const [selectedBu, setSelectedBu] = useState("BU-NEXUS-US");

    const { data: ersBatches, isLoading } = useQuery({
        queryKey: ["/api/finance/ap/ers-batches"],
        queryFn: async () => {
            // Stub backend data reflecting the ERS processing queue
            return [
                { id: "RCV-4011-B", rcvNumber: "RCV-55102", poNumber: "PO-9910", supplier: "Global Components", amount: 15400.00, rcvDate: "2026-03-08", status: "READY_FOR_ERS", matched: true },
                { id: "RCV-4012-A", rcvNumber: "RCV-55105", poNumber: "PO-9915", supplier: "Acme Packaging", amount: 8200.50, rcvDate: "2026-03-08", status: "READY_FOR_ERS", matched: true },
                { id: "RCV-4009-C", rcvNumber: "RCV-55099", poNumber: "PO-9884", supplier: "Steel Works Ltd", amount: 120500.00, rcvDate: "2026-03-07", status: "PRICE_VARIANCE_HOLD", matched: false },
                { id: "RCV-4022-X", rcvNumber: "RCV-55110", poNumber: "PO-9922", supplier: "Tech Supplies Inc", amount: 3450.00, rcvDate: "2026-03-08", status: "READY_FOR_ERS", matched: true },
            ];
        }
    });

    const { data: runHistory } = useQuery({
        queryKey: ["/api/finance/ap/ers-history"],
        queryFn: async () => [
            { runId: "ERS-RUN-801", date: "2026-03-07 18:00", receiptsProcessed: 14, invoicesGenerated: 14, errorCount: 0, status: "SUCCESS" },
            { runId: "ERS-RUN-800", date: "2026-03-06 18:00", receiptsProcessed: 22, invoicesGenerated: 19, errorCount: 3, status: "COMPLETED_WITH_WARNINGS" },
        ]
    });

    const runMachineMutation = useMutation({
        mutationFn: async () => {
            return new Promise((resolve) => setTimeout(resolve, 1500));
        },
        onSuccess: () => {
            setIsRunOpen(false);
            toast({ title: "ERS Settlement Complete", description: "The Pay-on-Receipt engine has successfully converted 3 warehouse receipts into Approved AP Invoices." });
        }
    });

    const getStatusBadge = (status: string) => {
        if (status === "READY_FOR_ERS") return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Ready for Sweep</Badge>;
        if (status === "PRICE_VARIANCE_HOLD") return <Badge variant="destructive">Tolerance Hold</Badge>;
        return <Badge variant="outline">{status}</Badge>;
    };

    const getRunStatusBadge = (status: string) => {
        if (status === "SUCCESS") return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" /> Success</Badge>;
        return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Warnings</Badge>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Evaluated Receipt Settlement (ERS)</h1>
                    <p className="text-muted-foreground mt-1">Automated "Pay on Receipt" engine translating WMS deliveries directly into AP supplier liabilities.</p>
                </div>

                <Dialog open={isRunOpen} onOpenChange={setIsRunOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700"><PlayCircle className="w-4 h-4 mr-2" /> Execute ERS Sweep</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-purple-600" /> Run Settlement Engine</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                This action will sweep all eligible PO receipts flagged for ERS and automatically generate active Accounts Payable invoices, bypassing manual data entry.
                            </p>
                            <div className="space-y-2">
                                <Label>Target Business Unit</Label>
                                <Select value={selectedBu} onValueChange={setSelectedBu}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BU-NEXUS-US">Nexus US Operations</SelectItem>
                                        <SelectItem value="BU-NEXUS-EU">Nexus Europe</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRunOpen(false)}>Cancel</Button>
                            <Button
                                disabled={runMachineMutation.isPending}
                                onClick={() => runMachineMutation.mutate()}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {runMachineMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                                Initialize Run
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-purple-950/20 border-purple-500/20">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-purple-500">Unprocessed ERS Receipts</div>
                                <div className="text-3xl font-bold">18</div>
                            </div>
                            <Layers className="w-8 h-8 text-purple-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-emerald-500/30 bg-emerald-500/10">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-emerald-600">Auto-Invoiced (MTD)</div>
                                <div className="text-3xl font-bold text-emerald-700">{formatCurrency(1450200)}</div>
                            </div>
                            <FileText className="w-8 h-8 text-emerald-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Pending Delivery Receipts (ERS Eligible)</CardTitle>
                        <CardDescription>Warehouse receipts awaiting conversion to AP Invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Receipt No.</TableHead>
                                    <TableHead>PO Reference</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead className="text-right">Receipt Value</TableHead>
                                    <TableHead>Match Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ersBatches?.map((batch: any) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-mono text-xs font-medium">{batch.rcvNumber}</TableCell>
                                        <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400">{batch.poNumber}</TableCell>
                                        <TableCell>{batch.supplier}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(batch.amount)}</TableCell>
                                        <TableCell>{getStatusBadge(batch.status)}</TableCell>
                                    </TableRow>
                                ))}
                                {!isLoading && (!ersBatches || ersBatches.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-medium">
                                            No pending ERS receipts in queue.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent ERS Sweeps</CardTitle>
                        <CardDescription>Historical batch execution logs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {runHistory?.map((run: any) => (
                            <div key={run.runId} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/10">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-xs font-medium">{run.runId}</span>
                                    {getRunStatusBadge(run.status)}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {run.date}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t">
                                    <div className="text-xs">
                                        <span className="text-muted-foreground block">Processed</span>
                                        <span className="font-medium">{run.receiptsProcessed} Receipts</span>
                                    </div>
                                    <div className="text-xs">
                                        <span className="text-muted-foreground block">Created</span>
                                        <span className="font-medium text-purple-600 dark:text-purple-400">{run.invoicesGenerated} Invoices</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
