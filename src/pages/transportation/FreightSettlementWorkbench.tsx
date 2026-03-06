import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
    CheckCircle2, AlertTriangle, DollarSign, TrendingDown,
    FileCheck, Clock, ArrowUpRight, Ban
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StandardPage } from "@/components/layout/StandardPage";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/formatters";


interface FreightCharge {
    id: string;
    shipmentId: string;
    chargeType: string;
    plannedAmount: string;
    actualAmount?: string;
    currency: string;
    status: "PLANNED" | "ACCRUED" | "MATCHED" | "DISPUTED" | "PAID";
    varianceAmount?: string;
    reconciledAt?: string;
    reconciledBy?: string;
    carrierId?: string;
    carrierName?: string;
}

interface SettlementMetrics {
    pending: number;
    matched: number;
    disputed: number;
    totalVariance: number;
}

export default function FreightSettlementWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedCharge, setSelectedCharge] = useState<FreightCharge | null>(null);
    const [reconcileModal, setReconcileModal] = useState(false);
    const [disputeModal, setDisputeModal] = useState(false);
    const [invoiceAmount, setInvoiceAmount] = useState("");
    const [disputeReason, setDisputeReason] = useState("");

    // Fetch settlement charges
    const { data: charges = [], isLoading } = useQuery<FreightCharge[]>({
        queryKey: ["/api/freight/charges"],
        queryFn: async () => {
            const res = await fetch("/api/freight/charges");
            if (!res.ok) {
                // Mock data
                return [
                    {
                        id: "fc-1",
                        shipmentId: "SHP-001",
                        chargeType: "BASE_FREIGHT",
                        plannedAmount: "1500.00",
                        actualAmount: "1520.00",
                        currency: "USD",
                        status: "MATCHED" as const,
                        varianceAmount: "20.00",
                        reconciledAt: new Date().toISOString(),
                        reconciledBy: "AI_SETTLEMENT_ENGINE",
                        carrierId: "carr-1",
                        carrierName: "FedEx"
                    },
                    {
                        id: "fc-2",
                        shipmentId: "SHP-002",
                        chargeType: "FUEL_SURCHARGE",
                        plannedAmount: "250.00",
                        actualAmount: "285.00",
                        currency: "USD",
                        status: "DISPUTED" as const,
                        varianceAmount: "35.00",
                        reconciledAt: new Date().toISOString(),
                        carrierId: "carr-2",
                        carrierName: "UPS"
                    },
                    {
                        id: "fc-3",
                        shipmentId: "SHP-003",
                        chargeType: "BASE_FREIGHT",
                        plannedAmount: "2100.00",
                        currency: "USD",
                        status: "ACCRUED" as const,
                        carrierId: "carr-1",
                        carrierName: "FedEx"
                    },
                    {
                        id: "fc-4",
                        shipmentId: "SHP-004",
                        chargeType: "ACCESSORIAL",
                        plannedAmount: "75.00",
                        actualAmount: "75.00",
                        currency: "USD",
                        status: "PAID" as const,
                        varianceAmount: "0.00",
                        reconciledAt: new Date(Date.now() - 86400000).toISOString(),
                        carrierId: "carr-3",
                        carrierName: "DHL"
                    }
                ];
            }
            return res.json();
        }
    });

    // Fetch settlement metrics
    const { data: metrics } = useQuery<SettlementMetrics>({
        queryKey: ["/api/freight/settlement/metrics"],
        queryFn: async () => {
            const res = await fetch("/api/freight/settlement/metrics");
            if (!res.ok) {
                return {
                    pending: charges.filter(c => c.status === "ACCRUED").length,
                    matched: charges.filter(c => c.status === "MATCHED").length,
                    disputed: charges.filter(c => c.status === "DISPUTED").length,
                    totalVariance: charges.reduce((sum, c) => sum + parseFloat(c.varianceAmount || "0"), 0)
                };
            }
            return res.json();
        }
    });

    // Fetch settlement trend data (mock)
    const trendData = [
        { month: "Jul", settled: 45, disputed: 3 },
        { month: "Aug", settled: 52, disputed: 2 },
        { month: "Sep", settled: 48, disputed: 5 },
        { month: "Oct", settled: 61, disputed: 4 },
        { month: "Nov", settled: 55, disputed: 2 },
        { month: "Dec", settled: 58, disputed: 3 }
    ];

    // Reconcile charge mutation
    const reconcileMutation = useMutation({
        mutationFn: async ({ chargeId, amount }: { chargeId: string; amount: number }) => {
            const res = await fetch(`/api/freight/charges/${chargeId}/reconcile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceAmount: amount })
            });
            if (!res.ok) throw new Error("Failed to reconcile");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/freight/charges"] });
            queryClient.invalidateQueries({ queryKey: ["/api/freight/settlement/metrics"] });
            setReconcileModal(false);
            setSelectedCharge(null);
            setInvoiceAmount("");
            toast({
                title: "Charge Reconciled",
                description: `Status: ${data.charge?.status || "MATCHED"}`
            });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to reconcile charge.", variant: "destructive" });
        }
    });

    // Dispute charge mutation (custom implementation)
    const disputeMutation = useMutation({
        mutationFn: async ({ chargeId, reason }: { chargeId: string; reason: string }) => {
            const res = await fetch(`/api/freight/charges/${chargeId}/dispute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason })
            });
            if (!res.ok) throw new Error("Failed to dispute");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/freight/charges"] });
            setDisputeModal(false);
            setSelectedCharge(null);
            setDisputeReason("");
            toast({ title: "Charge Disputed", description: "Dispute has been logged." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to dispute charge.", variant: "destructive" });
        }
    });

    // Interface to AP mutation
    const interfaceToAPMutation = useMutation({
        mutationFn: async (chargeId: string) => {
            const res = await fetch(`/api/freight/charges/${chargeId}/interface-ap`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to interface to AP");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/freight/charges"] });
            toast({
                title: "Interfaced to AP",
                description: `AP Invoice: ${data.apInvoiceId || "Created"}`
            });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to interface to AP.", variant: "destructive" });
        }
    });

    const handleReconcile = () => {
        if (!selectedCharge || !invoiceAmount) {
            toast({ title: "Validation Error", description: "Please enter an invoice amount.", variant: "destructive" });
            return;
        }
        reconcileMutation.mutate({
            chargeId: selectedCharge.id,
            amount: parseFloat(invoiceAmount)
        });
    };

    const handleDispute = () => {
        if (!selectedCharge || !disputeReason) {
            toast({ title: "Validation Error", description: "Please provide a dispute reason.", variant: "destructive" });
            return;
        }
        disputeMutation.mutate({
            chargeId: selectedCharge.id,
            reason: disputeReason
        });
    };

    const openReconcileModal = (charge: FreightCharge) => {
        setSelectedCharge(charge);
        setInvoiceAmount(charge.actualAmount || "");
        setReconcileModal(true);
    };

    const openDisputeModal = (charge: FreightCharge) => {
        setSelectedCharge(charge);
        setDisputeModal(true);
    };

    const readyForAP = charges.filter(c => c.status === "MATCHED");
    const pendingReconciliation = charges.filter(c => c.status === "ACCRUED");

    return (
        <StandardPage title="Freight Settlement Workbench">
            {/* Header */}
            <div>

                <p className="text-muted-foreground mt-1">Reconcile carrier invoices and interface to Accounts Payable</p>
            </div>

            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Settlement</CardTitle>
                        <Clock className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.pending || 0}</div>
                        <p className="text-xs text-muted-foreground">Awaiting reconciliation</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Matched</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{metrics?.matched || 0}</div>
                        <p className="text-xs text-muted-foreground">Ready for AP</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disputed</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">{metrics?.disputed || 0}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Variance</CardTitle>
                        <TrendingDown className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(Math.abs(metrics?.totalVariance || 0))}</div>
                        <p className="text-xs text-muted-foreground">Planned vs Actual</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="reconcile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="reconcile">Reconciliation Queue</TabsTrigger>
                    <TabsTrigger value="ap">AP Interface</TabsTrigger>
                    <TabsTrigger value="analytics">Settlement Analytics</TabsTrigger>
                </TabsList>

                {/* Reconciliation Tab */}
                <TabsContent value="reconcile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Reconciliation</CardTitle>
                            <CardDescription>Match carrier invoices against planned costs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <p className="text-center py-8 text-muted-foreground">Loading charges...</p>
                            ) : pendingReconciliation.length === 0 ? (
                                <EmptyState compact title="No pending reconciliations" />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Shipment</TableHead>
                                            <TableHead>Carrier</TableHead>
                                            <TableHead>Charge Type</TableHead>
                                            <TableHead className="text-right">Planned</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingReconciliation.map((charge) => (
                                            <TableRow key={charge.id}>
                                                <TableCell className="font-medium">{charge.shipmentId}</TableCell>
                                                <TableCell>{charge.carrierName || "N/A"}</TableCell>
                                                <TableCell className="text-sm">{charge.chargeType.replace(/_/g, " ")}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {formatCurrency(charge.plannedAmount, charge.currency)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{charge.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => openReconcileModal(charge)}>
                                                            <FileCheck className="h-3 w-3 mr-1" />
                                                            Reconcile
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => openDisputeModal(charge)}>
                                                            <Ban className="h-3 w-3 mr-1" />
                                                            Dispute
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Disputed Charges Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-rose-600" />
                                Disputed Charges
                            </CardTitle>
                            <CardDescription>Charges with invoice variances outside tolerance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {charges.filter(c => c.status === "DISPUTED").length === 0 ? (
                                <EmptyState compact title="No disputed charges" />
                            ) : (
                                <div className="space-y-3">
                                    {charges.filter(c => c.status === "DISPUTED").map((charge) => (
                                        <div key={charge.id} className="p-4 border border-rose-200 bg-rose-50 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{charge.shipmentId}</span>
                                                        <Badge variant="destructive">DISPUTED</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Carrier: {charge.carrierName} • {charge.chargeType.replace(/_/g, " ")}
                                                    </p>
                                                    <div className="text-sm mt-2">
                                                        <span className="text-muted-foreground">Planned:</span>{" "}
                                                        <span className="font-mono">{formatCurrency(charge.plannedAmount)}</span>
                                                        {" "}<span className="text-muted-foreground">Actual:</span>{" "}
                                                        <span className="font-mono font-semibold text-rose-600">
                                                            {formatCurrency(charge.actualAmount || "0")}
                                                        </span>
                                                        {" "}<span className="text-muted-foreground">Variance:</span>{" "}
                                                        <span className="font-mono font-semibold text-rose-600">
                                                            +{formatCurrency(charge.varianceAmount || "0")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline">Resolve</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AP Interface Tab */}
                <TabsContent value="ap" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ready for Accounts Payable</CardTitle>
                            <CardDescription>Matched charges ready to be interfaced to AP for payment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {readyForAP.length === 0 ? (
                                <EmptyState compact title="No charges ready for AP interface" />
                            ) : (
                                <>
                                    <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-emerald-900">Batch Interface to AP</h4>
                                                <p className="text-sm text-emerald-700 mt-1">
                                                    {readyForAP.length} matched {readyForAP.length === 1 ? "charge" : "charges"} ready to create AP invoices
                                                </p>
                                            </div>
                                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                                Interface All to AP
                                            </Button>
                                        </div>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Shipment</TableHead>
                                                <TableHead>Carrier</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="text-right">Variance</TableHead>
                                                <TableHead>Reconciled</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {readyForAP.map((charge) => (
                                                <TableRow key={charge.id}>
                                                    <TableCell className="font-medium">{charge.shipmentId}</TableCell>
                                                    <TableCell>{charge.carrierName || "N/A"}</TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {formatCurrency(charge.actualAmount || charge.plannedAmount)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {charge.varianceAmount ? (
                                                            <span className={parseFloat(charge.varianceAmount) > 0 ? "text-rose-600" : "text-emerald-600"}>
                                                                {parseFloat(charge.varianceAmount) > 0 ? "+" : ""}
                                                                {formatCurrency(Math.abs(parseFloat(charge.varianceAmount)))}
                                                            </span>
                                                        ) : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {charge.reconciledAt ? formatDate(charge.reconciledAt) : "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => interfaceToAPMutation.mutate(charge.id)}
                                                            disabled={interfaceToAPMutation.isPending}
                                                        >
                                                            <ArrowUpRight className="h-3 w-3 mr-1" />
                                                            Interface
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Settlement Trend (Last 6 Months)</CardTitle>
                            <CardDescription>Monthly settlement activity and dispute rate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="settled" stroke="#10b981" strokeWidth={2} name="Settled" />
                                    <Line type="monotone" dataKey="disputed" stroke="#ef4444" strokeWidth={2} name="Disputed" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Variance by Carrier</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {["FedEx", "UPS", "DHL"].map((carrier) => {
                                        const carrierCharges = charges.filter(c => c.carrierName === carrier);
                                        const variance = carrierCharges.reduce((sum, c) => sum + parseFloat(c.varianceAmount || "0"), 0);
                                        return (
                                            <div key={carrier} className="flex justify-between items-center p-3 border rounded-lg">
                                                <span className="font-medium">{carrier}</span>
                                                <div className="text-right">
                                                    <div className="font-mono font-semibold">
                                                        {variance >= 0 ? "+" : "-"}{formatCurrency(Math.abs(variance))}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {carrierCharges.length} {carrierCharges.length === 1 ? "charge" : "charges"}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Settlement Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 border rounded-lg">
                                        <span className="text-sm text-muted-foreground">Auto-Match Rate</span>
                                        <span className="font-semibold text-emerald-600">92%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 border rounded-lg">
                                        <span className="text-sm text-muted-foreground">Avg Settlement Time</span>
                                        <span className="font-semibold">2.3 days</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 border rounded-lg">
                                        <span className="text-sm text-muted-foreground">Dispute Rate</span>
                                        <span className="font-semibold text-rose-600">8%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Reconcile Modal */}
            <Dialog open={reconcileModal} onOpenChange={setReconcileModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reconcile Invoice</DialogTitle>
                        <DialogDescription>
                            Match carrier invoice against planned cost for {selectedCharge?.shipmentId}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Planned Amount</p>
                                <p className="text-lg font-semibold font-mono">
                                    {formatCurrency(selectedCharge?.plannedAmount || "0")}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Currency</p>
                                <p className="text-lg font-semibold">{selectedCharge?.currency || "USD"}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="invoiceAmount">Invoice Amount *</Label>
                            <Input
                                id="invoiceAmount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={invoiceAmount}
                                onChange={(e) => setInvoiceAmount(e.target.value)}
                            />
                        </div>

                        {invoiceAmount && selectedCharge && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-blue-900">Variance</span>
                                    <span className={`font-mono font-semibold ${parseFloat(invoiceAmount) - parseFloat(selectedCharge.plannedAmount) > 0
                                        ? "text-rose-600"
                                        : "text-emerald-600"
                                        }`}>
                                        {parseFloat(invoiceAmount) - parseFloat(selectedCharge.plannedAmount) > 0 ? "+" : ""}
                                        {formatCurrency(Math.abs(parseFloat(invoiceAmount) - parseFloat(selectedCharge.plannedAmount)))}
                                    </span>
                                </div>
                                <p className="text-xs text-blue-700 mt-2">
                                    {Math.abs((parseFloat(invoiceAmount) - parseFloat(selectedCharge.plannedAmount)) / parseFloat(selectedCharge.plannedAmount) * 100) <= 5
                                        ? "✓ Within 5% tolerance - Will auto-match"
                                        : "⚠ Outside tolerance - Will be marked as disputed"
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReconcileModal(false)}>Cancel</Button>
                        <Button onClick={handleReconcile} disabled={reconcileMutation.isPending}>
                            {reconcileMutation.isPending ? "Processing..." : "Reconcile"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dispute Modal */}
            <Dialog open={disputeModal} onOpenChange={setDisputeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dispute Charge</DialogTitle>
                        <DialogDescription>
                            Log a dispute for shipment {selectedCharge?.shipmentId}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="disputeReason">Dispute Reason *</Label>
                            <Select value={disputeReason} onValueChange={setDisputeReason}>
                                <SelectTrigger id="disputeReason">
                                    <SelectValue placeholder="Select a reason..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCORRECT_AMOUNT">Incorrect Amount</SelectItem>
                                    <SelectItem value="UNAUTHORIZED_CHARGE">Unauthorized Charge</SelectItem>
                                    <SelectItem value="SERVICE_NOT_RENDERED">Service Not Rendered</SelectItem>
                                    <SelectItem value="DUPLICATE_CHARGE">Duplicate Charge</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDisputeModal(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDispute}
                            disabled={disputeMutation.isPending}
                        >
                            {disputeMutation.isPending ? "Processing..." : "Submit Dispute"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
