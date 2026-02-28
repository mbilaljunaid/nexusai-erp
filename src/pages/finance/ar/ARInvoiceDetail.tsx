import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, FileText, Loader2, Sparkles, Send } from "lucide-react";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { useToast } from "@/hooks/use-toast";

export default function ARInvoiceDetail() {
    const [, params] = useRoute("/finance/ar/invoices/:id");
    const invoiceId = (params as any)?.id;
    const { toast } = useToast();

    const [accountingModalOpen, setAccountingModalOpen] = useState(false);

    const { data: invoiceData, isLoading } = useQuery<any>({
        queryKey: [`/api/ar/invoices/${invoiceId}`],
        enabled: !!invoiceId,
        queryFn: async () => {
            const res = await fetch(`/api/ar/invoices/${invoiceId}`);
            if (!res.ok) throw new Error("Failed to fetch invoice");
            return res.json();
        }
    });

    const approveMutation = useMutation({
        mutationFn: async () => await apiRequest("POST", `/api/billing/invoices/${invoiceId}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/ar/invoices/${invoiceId}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
            toast({ title: "Invoice Approved" });
        }
    });

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!invoiceData) return <div className="p-8 text-center text-muted-foreground">Invoice not found.</div>;

    const invoice = invoiceData.invoice || invoiceData;
    const lines = invoiceData.lines || [];
    const status = invoice.status?.toUpperCase() || (invoice.glStatus ? 'ISSUED' : 'DRAFT');

    return (
        <StandardPage
            title={`AR Invoice: ${invoice.invoiceNumber || invoice.id}`}
            description="Manage customer invoice, view lines, and accounting."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Receivable", href: "/finance/accounts-receivable" },
                { label: "Invoices", href: "/finance/ar/invoices" },
                { label: invoice.invoiceNumber || "Details" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAccountingModalOpen(true)}>
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground hover:text-primary" /> View Accounting
                    </Button>
                    <Button variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                        <Sparkles className="mr-2 h-4 w-4" /> AI Summary
                    </Button>
                    {status === 'DRAFT' && (
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate()}
                            disabled={approveMutation.isPending}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                    )}
                    {(status === 'ISSUED' || status === 'APPROVED') && (
                        <Button variant="outline" className="text-orange-600 border-orange-200">
                            <AlertTriangle className="mr-2 h-4 w-4" /> Create Credit Memo
                        </Button>
                    )}
                    <Button>
                        <Send className="mr-2 h-4 w-4" /> Send to Customer
                    </Button>
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Customer ID</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold">{invoice.customerId || invoice.customerName}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">${parseFloat(invoice.totalAmount || invoice.amount || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle></CardHeader>
                    <CardContent>
                        <Badge variant={status === 'PAID' ? 'outline' : status === 'DRAFT' ? 'secondary' : 'default'} className="text-sm">
                            {status}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">GL Status</CardTitle></CardHeader>
                    <CardContent>
                        <Badge variant="outline" className={invoice.glStatus === 'Posted' || invoice.glStatus === 'Accounted' ? "bg-green-50 text-green-700 text-sm" : "bg-yellow-50 text-yellow-700 text-sm"}>
                            {invoice.glStatus || 'Unaccounted'}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Invoice Content</CardTitle>
                    <CardDescription>Lines and tax breakdown</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[200px]">
                    {lines && lines.length > 0 ? (
                        <div className="space-y-4">
                            {lines.map((l: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 border rounded-md bg-card">
                                    <div className="space-y-1">
                                        <div className="font-medium">Item: {l.itemId || l.description}</div>
                                        <div className="text-sm text-muted-foreground">Qty: {l.quantity || 1} &times; ${parseFloat(l.unitPrice || l.amount || 0).toLocaleString()}</div>
                                    </div>
                                    <div className="font-semibold">${parseFloat(l.amount || 0).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex bg-slate-50 border border-dashed rounded-lg p-8 items-center justify-center text-muted-foreground">
                            Invoice lines have not been fully modeled for this entity yet.
                        </div>
                    )}
                </CardContent>
            </Card>

            <ViewAccountingModal
                open={accountingModalOpen}
                onOpenChange={setAccountingModalOpen}
                entityId={invoiceId}
            />
        </StandardPage>
    );
}
