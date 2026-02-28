import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Unlink } from "lucide-react";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { useToast } from "@/hooks/use-toast";

export default function ARReceiptDetail() {
    const [, params] = useRoute("/finance/ar/receipts/:id");
    const receiptId = (params as any)?.id;
    const { toast } = useToast();

    const [accountingModalOpen, setAccountingModalOpen] = useState(false);

    const { data: receipts, isLoading } = useQuery<any[]>({
        queryKey: ["/api/ar/receipts"],
        queryFn: () => fetch("/api/ar/receipts").then(r => r.json()),
    });

    const receipt = receipts?.find((r: any) => r.id === Number(receiptId)) || receipts?.find((r: any) => String(r.id) === receiptId);

    const { data: apps = [], isLoading: isLoadingApps } = useQuery<any[]>({
        queryKey: ["/api/ar/receipts", receiptId, "applications"],
        enabled: !!receiptId,
        queryFn: () => fetch(`/api/ar/receipts/${receiptId}/applications`).then(r => r.json()),
    });

    const unapplyMutation = useMutation({
        mutationFn: async (id: string) => await apiRequest("POST", `/api/ar/applications/${id}/unapply`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/receipts"] });
            toast({ title: "Receipt Unapplied Successfully" });
        }
    });

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!receipt) return <div className="p-8 text-center text-muted-foreground">Receipt not found.</div>;

    const isApplied = receipt.status === 'Applied';

    return (
        <StandardPage
            title={`Receipt: ${receipt.transactionId}`}
            description="View receipt details, applied invoices, and accounting."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Receivable", href: "/finance/accounts-receivable" },
                { label: "Receipts", href: "/finance/ar/receipts" },
                { label: receipt.transactionId || "Details" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAccountingModalOpen(true)}>
                        <FileText className="mr-2 h-4 w-4" /> View GL Accounting
                    </Button>
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Payment Method</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold">{receipt.paymentMethod}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Receipt Amount</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-green-600">${parseFloat(receipt.amount || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle></CardHeader>
                    <CardContent>
                        <Badge variant={isApplied ? 'default' : 'secondary'} className="text-sm">
                            {receipt.status || 'Unapplied'}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Customer ID</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-lg font-medium">{receipt.customerId || receipt.customerName || "Unknown"}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6 border-orange-200">
                <CardHeader className="bg-orange-50">
                    <CardTitle>Invoice Applications</CardTitle>
                    <CardDescription>Invoices that this receipt has been applied to.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoadingApps ? (
                        <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin h-6 w-6" /></div>
                    ) : apps.length === 0 ? (
                        <div className="text-muted-foreground text-center py-6">No active applications found.</div>
                    ) : (
                        <div className="space-y-4">
                            {apps.map((a: any) => (
                                <div key={a.id} className="flex justify-between items-center p-3 border rounded-md">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Target Invoice</div>
                                        <div className="font-mono font-medium">{a.invoiceId}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Applied Amount</div>
                                            <div className="font-bold text-green-600">${parseFloat(a.amountApplied || 0).toLocaleString()}</div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => unapplyMutation.mutate(a.id)}
                                            disabled={unapplyMutation.isPending}
                                            className="text-destructive hover:text-white hover:bg-destructive border-destructive"
                                        >
                                            <Unlink className="w-4 h-4 mr-1" /> Unapply
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <ViewAccountingModal
                open={accountingModalOpen}
                onOpenChange={setAccountingModalOpen}
                entityId={receiptId}
            />
        </StandardPage>
    );
}
