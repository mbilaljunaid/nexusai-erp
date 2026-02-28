import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, Download, FileText, Loader2, Trash2 } from "lucide-react";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { useToast } from "@/hooks/use-toast";

export default function APPaymentDetail() {
    const [, params] = useRoute("/finance/ap/payments/:id");
    const batchId = (params as any)?.id;
    const { toast } = useToast();

    const [accountingModalOpen, setAccountingModalOpen] = useState(false);

    // Normally this would be a specific get endpoint, simulating with list filtering for now if missing
    // or using the standard get
    const { data: batches, isLoading } = useQuery<any[]>({
        queryKey: ["/api/ap/payment-batches"],
        queryFn: () => fetch("/api/ap/payment-batches").then(r => r.json()),
        refetchInterval: 5000
    });

    const batch = batches?.find((b: any) => b.id === Number(batchId));

    const selectInvoicesMutation = useMutation({
        mutationFn: (id: number) => fetch(`/api/ap/payment-batches/${id}/select`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/payment-batches"] });
            toast({ title: "Invoices selected for payment" });
        }
    });

    const confirmMutation = useMutation({
        mutationFn: (id: number) => fetch(`/api/ap/payment-batches/${id}/confirm`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/payment-batches"] });
            toast({ title: "Payment batch confirmed" });
        }
    });

    const voidMutation = useMutation({
        mutationFn: (id: number) => fetch(`/api/ap/payment-batches/${id}/void`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/payment-batches"] });
            toast({ title: "Payment batch voided successfully" });
        }
    });

    const downloadISO20022 = async () => {
        try {
            const response = await fetch(`/api/ap/payment-batches/${batchId}/iso20022`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ISO20022_BCH_${batchId}.xml`;
            a.click();
            toast({ title: "ISO20022 file downloaded" });
        } catch (error) {
            toast({ title: "Download failed", variant: "destructive" });
        }
    };

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!batch) return <div className="p-8 text-center text-muted-foreground">Payment Batch not found.</div>;

    const status = batch.status?.toUpperCase() || "NEW";
    const displayBatchId = batch.batchName || batch.id.substring(0, 8).toUpperCase();

    return (
        <StandardPage
            title={`Payment Batch: ${displayBatchId}`}
            description={`Manage payment execution for ${batch.paymentMethodCode || 'EFT'} run.`}
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Payment Batches", href: "/finance/ap/payments" },
                { label: `${batch.id}` }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAccountingModalOpen(true)}>
                        <FileText className="mr-2 h-4 w-4" /> View GL Accounting
                    </Button>
                    {(status === "DRAFT" || status === "NEW") && (
                        <Button
                            variant="default"
                            onClick={() => selectInvoicesMutation.mutate(batch.id)}
                            disabled={selectInvoicesMutation.isPending}
                        >
                            <Play className="h-4 w-4 mr-2" /> Select Invoices
                        </Button>
                    )}
                    {status === "SELECTED" && (
                        <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => confirmMutation.mutate(batch.id)}
                            disabled={confirmMutation.isPending}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" /> Confirm & Pay
                        </Button>
                    )}
                    {(status === "CONFIRMED" || status === "PAID" || status === "COMPLETED") && (
                        <>
                            <Button variant="outline" onClick={downloadISO20022}>
                                <Download className="h-4 w-4 mr-2" /> Export ISO20022 XML
                            </Button>
                            <Button variant="destructive" onClick={() => voidMutation.mutate(batch.id)} disabled={voidMutation.isPending}>
                                <Trash2 className="h-4 w-4 mr-2" /> Void Payment
                            </Button>
                        </>
                    )}
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Business Unit</CardTitle></CardHeader>
                    <CardContent><div className="text-lg font-bold">{batch.businessUnitId || "System Default"}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Payment Method</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold">{batch.paymentMethodCode}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">${parseFloat(batch.totalAmount || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Invoice Count</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{batch.paymentCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Processing Status</CardTitle></CardHeader>
                    <CardContent>
                        <Badge
                            variant={
                                status === "CONFIRMED" || status === "PAID" || status === "COMPLETED" ? "default" :
                                    status === "ERROR" ? "destructive" :
                                        status === "SELECTED" ? "secondary" : "outline"
                            }
                            className="text-sm"
                        >
                            {status}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Batch Details & Log</CardTitle>
                    <CardDescription>System execution history will appear here.</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center border-dashed border-2 rounded-lg bg-slate-50 mt-4 mx-6 mb-6">
                    <p className="text-muted-foreground">
                        {status === "NEW" || status === "DRAFT" ? "Ready to select invoices based on profile criteria." :
                            status === "SELECTED" ? `${batch.paymentCount} invoices locked for this execution run. Pending confirmation.` :
                                "Payment run executed. Related invoices are marked as fully paid and accounted."}
                    </p>
                </CardContent>
            </Card>

            <ViewAccountingModal
                open={accountingModalOpen}
                onOpenChange={setAccountingModalOpen}
                entityId={batchId}
            />
        </StandardPage>
    );
}
