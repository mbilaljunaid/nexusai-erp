import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, FileText, ArrowLeft, Package, DollarSign, Link as LinkIcon } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { formatDate } from "@/lib/dateUtils";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function PurchaseOrderDetail() {
    const [, params] = useRoute("/procurement/orders/:id");
    const poId = (params as any)?.id;
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: po, isLoading } = useQuery<any>({
        queryKey: [`/api/procurement/purchase-orders/${poId}`],
        queryFn: () => fetch(`/api/scm/procurement/purchase-orders/${poId}`).then(r => r.json()),
        enabled: !!poId,
    });

    const { data: lines = [] } = useQuery<any[]>({
        queryKey: [`/api/procurement/purchase-orders/${poId}/lines`],
        queryFn: () => fetch(`/api/scm/procurement/purchase-orders/${poId}/lines`).then(r => r.json()),
        enabled: !!poId,
    });

    const { data: invoices = [] } = useQuery<any[]>({
        queryKey: [`/api/ap/invoices`, poId],
        queryFn: () => fetch(`/api/ap/invoices?poId=${poId}`).then(r => r.json()).catch(() => []),
        enabled: !!poId,
    });

    const approveMutation = useMutation({
        mutationFn: () => fetch(`/api/procurement/purchase-orders/${poId}/approve`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/procurement/purchase-orders/${poId}`] });
            toast({ title: "Purchase Order Approved" });
        },
        onError: () => toast({ title: "Approval failed", variant: "destructive" }),
    });

    const rejectMutation = useMutation({
        mutationFn: () => fetch(`/api/procurement/purchase-orders/${poId}/reject`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/procurement/purchase-orders/${poId}`] });
            toast({ title: "Purchase Order Rejected" });
        },
    });

    const lineColumns: SpreadsheetColumn<any>[] = [
        { id: "lineNumber", header: "#", width: "60px", cell: r => <span className="font-mono text-sm">{r.lineNumber || r.id}</span> },
        { id: "description", header: "Description / Item", width: "220px", cell: r => <span className="font-medium">{r.description || r.itemDescription}</span> },
        { id: "quantity", header: "Qty Ordered", width: "110px", cell: r => <span className="text-right block">{formatNumber(r.quantity || 0)}</span> },
        { id: "quantityReceived", header: "Qty Received", width: "120px", cell: r => <span className="text-right block text-green-700">{formatNumber(r.quantityReceived || 0)}</span> },
        { id: "unitPrice", header: "Unit Price", width: "120px", cell: r => <span className="text-right block">${formatNumber(parseFloat(r.unitPrice || 0))}</span> },
        { id: "amount", header: "Line Amount", width: "130px", cell: r => <span className="font-semibold text-right block">${formatNumber(parseFloat(r.amount || (r.quantity * r.unitPrice)) || 0)}</span> },
        { id: "needByDate", header: "Need By", width: "120px", cell: r => r.needByDate ? formatDate(r.needByDate) : "—" },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status || "Open"} /> },
    ];

    const invoiceColumns: SpreadsheetColumn<any>[] = [
        { id: "invoiceNumber", header: "Invoice #", width: "160px", cell: r => <span className="font-mono font-medium text-blue-600">{r.invoiceNumber}</span> },
        { id: "invoiceDate", header: "Invoice Date", width: "120px", cell: r => formatDate(r.invoiceDate) },
        { id: "invoiceAmount", header: "Amount", width: "130px", cell: r => <span className="font-semibold">${formatNumber(parseFloat(r.invoiceAmount || 0))}</span> },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
    ];

    if (isLoading) return <PageSkeleton />;
    if (!po) return <div className="p-8 text-center text-muted-foreground">Purchase Order not found.</div>;

    const totalAmount = parseFloat(po.totalAmount || 0);
    const invoicedAmount = invoices.reduce((s: number, i: any) => s + parseFloat(i.invoiceAmount || 0), 0);
    const openAmount = totalAmount - invoicedAmount;

    return (
        <StandardPage
            title={`PO: ${po.poNumber}`}
            description="Purchase Order detail — lines, receipts, and linked AP invoices."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Procurement", href: "/scm/procurement" },
                { label: po.poNumber }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setLocation("/scm/procurement")}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    {(po.status === "Draft" || po.status === "Pending Approval") && (
                        <>
                            <Button variant="outline" className="text-red-600 border-red-200"
                                onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}>
                                <XCircle className="h-4 w-4 mr-2" /> Reject
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700"
                                onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
                                <CheckCircle className="h-4 w-4 mr-2" /> Approve
                            </Button>
                        </>
                    )}
                </div>
            }
        >
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Supplier</CardTitle></CardHeader>
                    <CardContent><div className="font-semibold">{po.supplier?.supplierName || po.supplierId}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Status</CardTitle></CardHeader>
                    <CardContent><StatusBadge status={po.status} /></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />PO Amount</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold">${formatNumber(totalAmount)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><LinkIcon className="h-3 w-3" />Open Balance</CardTitle></CardHeader>
                    <CardContent><div className={`text-xl font-bold ${openAmount > 0 ? "text-amber-600" : "text-green-700"}`}>${formatNumber(openAmount)}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="lines" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="lines"><Package className="h-4 w-4 mr-2" />Lines ({lines.length})</TabsTrigger>
                    <TabsTrigger value="invoices"><FileText className="h-4 w-4 mr-2" />Linked Invoices ({invoices.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="lines">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Order Lines</CardTitle>
                            <CardDescription>Ordered items with quantities, prices, and receipt status.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <InteractiveSpreadsheet data={lines} columns={lineColumns} onChange={() => { }} containerHeight="500px" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Linked AP Invoices</CardTitle>
                            <CardDescription>Supplier invoices matched against this purchase order.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <InteractiveSpreadsheet data={invoices} columns={invoiceColumns} onChange={() => { }} containerHeight="400px" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
