
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Calendar, DollarSign, ArrowRight, Percent, CheckCircle2, Plus } from "lucide-react";
import { useState } from "react";
import { ApInvoice } from "@shared/schema";
import { ApSideSheet } from "./ApSideSheet";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

async function fetchInvoices() {
    const res = await apiRequest("GET", "/api/ap/invoices");
    return res.json();
}

export function ApInvoiceList() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [selectedInvoice, setSelectedInvoice] = useState<ApInvoice | null>(null);

    const { data: invoices, isLoading } = useQuery<ApInvoice[]>({
        queryKey: ['/api/ap/invoices'],
        queryFn: fetchInvoices
    });

    const validateMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiRequest("POST", `/api/ap/invoices/${id}/validate`);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['/api/ap/invoices'] });
            toast({
                title: "Validation Complete",
                description: `Invoice status: ${data.status}. Holds: ${data.holds.length}`,
                variant: data.status === "VALIDATED" ? "default" : "destructive",
            });
        },
        onError: (err: Error) => {
            toast({ title: "Validation Failed", description: err.message, variant: "destructive" });
        }
    });

    const handleValidate = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        validateMutation.mutate(id);
    };

    // Assuming `filteredInvoices` was intended to be used, but the filter condition was incomplete.
    // For now, we'll use `invoices` directly as the original code did, but now `invoices` is defined.
    // If filtering is needed, it should be added here.
    // const filteredInvoices = invoices?.filter((invoice: ApInvoice) => { /* add filter condition here */ });

    const hasInvoices = Array.isArray(invoices) && invoices.length > 0;

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="h-[200px]">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-full mb-4" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className={`grid gap-4 ${hasInvoices ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {hasInvoices ? invoices.map((invoice) => (
                    <Card
                        key={invoice.id}
                        className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 group relative overflow-hidden"
                        style={{ borderLeftColor: invoice.paymentStatus === 'UNPAID' ? '#ef4444' : invoice.paymentStatus === 'PAID' ? '#22c55e' : '#f59e0b' }}
                        onClick={() => setSelectedInvoice(invoice)}
                    >
                        <CardHeader className="pb-2 z-10 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        {invoice.invoiceNumber}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1 font-medium">
                                        Supplier ID: #SUP-{invoice.supplierId}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex gap-1">
                                        <Badge variant={invoice.paymentStatus === "PAID" ? "default" : invoice.paymentStatus === "UNPAID" ? "destructive" : "secondary"}>
                                            {invoice.paymentStatus}
                                        </Badge>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {invoice.invoiceStatus || "DRAFT"}
                                        </Badge>
                                        <Badge variant={invoice.validationStatus === "VALIDATED" ? "outline" : "destructive"} className={invoice.validationStatus === "VALIDATED" ? "text-green-600 border-green-200 bg-green-50" : ""}>
                                            {invoice.validationStatus || "NEVER"}
                                        </Badge>
                                    </div>
                                    {invoice.accountingStatus === "UNACCOUNTED" && (
                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase font-semibold tracking-wider">
                                            Unaccounted
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="z-10 relative">
                            <div className="space-y-3 mt-2">
                                <div className="flex justify-between items-end p-2 bg-muted/30 rounded-lg">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Total Amount</span>
                                    <span className="font-bold text-xl tracking-tight text-primary">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.invoiceCurrencyCode || 'USD' }).format(Number(invoice.invoiceAmount))}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                    {Number(invoice.taxAmount) > 0 && (
                                        <span className="flex items-center gap-1 text-xs bg-muted px-1.5 py-0.5 rounded">
                                            <Percent className="h-3 w-3" /> Tax Inc.
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 left-4 right-4">
                                {invoice.validationStatus !== "VALIDATED" ? (
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="h-7 text-xs bg-orange-500 hover:bg-orange-600"
                                        onClick={(e) => handleValidate(e, invoice.id)}
                                        disabled={validateMutation.isPending}
                                    >
                                        {validateMutation.isPending ? "Checking..." : "Validate"}
                                    </Button>
                                ) : <div />}

                                <Button variant="secondary" size="sm" className="text-xs h-7 shadow-sm">
                                    Details <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-xl bg-muted/10">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No Invoices Found</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-[400px] mb-6">
                            Get started by creating your first invoice or seeding demo data to see how the dashboard looks.
                        </p>
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Refresh Data
                        </Button>
                    </div>
                )}
            </div>

            <ApSideSheet
                open={!!selectedInvoice}
                onOpenChange={(open) => !open && setSelectedInvoice(null)}
                invoice={selectedInvoice || undefined}
                type="invoice"
            />
        </>
    );
}
