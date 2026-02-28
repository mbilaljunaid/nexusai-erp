import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, AlertCircle, FileText, Paperclip, Loader2 } from "lucide-react";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { StandardTable } from "@/components/ui/StandardTable";

export default function APInvoiceDetail() {
    const [, params] = useRoute("/finance/ap/invoices/:id");
    const invoiceId = (params as any)?.id;
    const { toast } = useToast();

    const [accountingModalOpen, setAccountingModalOpen] = useState(false);
    const [holdsDialogOpen, setHoldsDialogOpen] = useState(false);

    const { data: invoiceData, isLoading } = useQuery<any>({
        queryKey: [`/api/ap/invoices/${invoiceId}`],
        enabled: !!invoiceId,
        queryFn: async () => {
            const res = await fetch(`/api/erp/invoices/${invoiceId}`);
            if (!res.ok) throw new Error("Failed to fetch invoice");
            return res.json();
        }
    });

    const { data: holds = [] } = useQuery<any[]>({
        queryKey: [`/api/ap/invoices/${invoiceId}/holds`],
        enabled: !!invoiceId,
        queryFn: async () => {
            const res = await fetch(`/api/ap/invoices/${invoiceId}/holds`);
            if (!res.ok) return [];
            return res.json();
        }
    });

    const validateMutation = useMutation({
        mutationFn: async () => await apiRequest("POST", `/api/ap/invoices/${invoiceId}/validate`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/ap/invoices/${invoiceId}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
            toast({ title: "Invoice Validated" });
        }
    });

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!invoiceData) return <div className="p-8 text-center text-muted-foreground">Invoice not found or failed to load.</div>;

    // ERP invoices API usually returns `{ ...header, lines: [...] }` or just the invoice. We'll handle both.
    const invoice = invoiceData.invoice || invoiceData;
    const lines = invoiceData.lines || [];

    return (
        <StandardPage
            title={`Invoice: ${invoice.invoiceNumber || invoice.id}`}
            description={invoice.description || "View invoice details, lines, and accounting distributions."}
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Invoices", href: "/finance/ap/invoices" },
                { label: invoice.invoiceNumber || "Details" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAccountingModalOpen(true)}>
                        <FileText className="mr-2 h-4 w-4" /> View Accounting
                    </Button>
                    <Button variant="outline" onClick={() => setHoldsDialogOpen(true)}>
                        <AlertCircle className="mr-2 h-4 w-4" /> Holds ({holds.filter((h: any) => !h.released).length})
                    </Button>
                    {invoice.status === 'Draft' || invoice.status === 'Needs Revalidation' ? (
                        <Button onClick={() => validateMutation.mutate()} disabled={validateMutation.isPending}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {validateMutation.isPending ? "Validating..." : "Validate"}
                        </Button>
                    ) : null}
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Supplier</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold">{invoice.supplierId}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">${parseFloat(invoice.invoiceAmount || invoice.amount || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle></CardHeader>
                    <CardContent>
                        <Badge variant={invoice.status === 'Validated' || invoice.status === 'Paid' ? 'default' : 'secondary'} className="text-sm">
                            {invoice.status || 'Draft'}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">GL Status</CardTitle></CardHeader>
                    <CardContent>
                        <Badge variant="outline" className={invoice.glStatus === 'Accounted' ? "bg-green-50 text-green-700 text-sm" : "bg-yellow-50 text-yellow-700 text-sm"}>
                            {invoice.glStatus || 'Unaccounted'}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Invoice Lines & Distributions</CardTitle>
                </CardHeader>
                <CardContent>
                    {lines && lines.length > 0 ? (
                        <StandardTable<any>
                            data={lines}
                            columns={[
                                { header: "Line #", accessorKey: "lineNumber", width: "10%" },
                                { header: "Type", accessorKey: "lineType", width: "15%" },
                                { header: "Description", accessorKey: "description", width: "40%" },
                                { header: "Amount", cell: (r) => `$${parseFloat(r.amount || 0).toLocaleString()}`, width: "15%" },
                                { header: "PO Header ID", accessorKey: "poHeaderId", width: "20%" },
                            ]}
                        />
                    ) : (
                        <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                            No lines found for this invoice.
                        </div>
                    )}
                </CardContent>
            </Card>

            <ViewAccountingModal
                open={accountingModalOpen}
                onOpenChange={setAccountingModalOpen}
                entityId={invoiceId}
            />

            <Dialog open={holdsDialogOpen} onOpenChange={setHoldsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invoice Holds</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        {holds.length === 0 ? (
                            <div className="text-center text-muted-foreground">No holds apply to this invoice.</div>
                        ) : (
                            holds.map((h: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                                    <div>
                                        <div className="font-medium text-destructive">{h.holdReason}</div>
                                        <div className="text-xs text-muted-foreground">Placed: {new Date(h.holdDate).toLocaleDateString()}</div>
                                    </div>
                                    {h.released ? (
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Released</Badge>
                                    ) : (
                                        <Badge variant="destructive">Active</Badge>
                                    )}
                                </div>
                            ))
                        )}
                        <div className="flex justify-end pt-4">
                            <Button variant="outline" onClick={() => setHoldsDialogOpen(false)}>Close</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
