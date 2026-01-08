
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { FileText, Calendar, DollarSign, ArrowRight, Percent, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { ApInvoice } from "@shared/schema";
import { ApSideSheet } from "./ApSideSheet";
import { apiRequest } from "@/lib/queryClient";

async function fetchInvoices() {
    const res = await apiRequest("GET", "/api/ap/invoices");
    return res.json();
}

export function ApInvoiceList() {
    const [selectedInvoice, setSelectedInvoice] = useState<ApInvoice | null>(null);

    const { data: invoices, isLoading } = useQuery<ApInvoice[]>({
        queryKey: ['/api/ap/invoices'],
        queryFn: fetchInvoices
    });

    if (isLoading) {
        return <div className="p-4 text-center">Loading invoices...</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'success'; // bg-green-100 text-green-800
            case 'Posted': return 'default';
            case 'Overdue': return 'destructive';
            case 'Draft': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.isArray(invoices) && invoices.map((invoice) => (
                    <Card
                        key={invoice.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 group"
                        style={{ borderLeftColor: invoice.status === 'Overdue' ? '#ef4444' : invoice.status === 'Paid' ? '#22c55e' : '#a855f7' }}
                        onClick={() => setSelectedInvoice(invoice)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        {invoice.invoiceNumber}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        Supplier ID: {invoice.supplierId}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant={getStatusColor(invoice.status || "Draft") as any}>
                                        {invoice.status}
                                    </Badge>
                                    {invoice.recognitionStatus === "Pending" && (
                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 rounded border border-blue-100">
                                            Recog Pending
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 mt-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> Amount
                                    </span>
                                    <span className="font-bold text-lg">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(Number(invoice.amount))}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Due:
                                    </span>
                                    <span>
                                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No Date'}
                                    </span>
                                </div>

                                {Number(invoice.taxAmount) > 0 && (
                                    <div className="flex justify-between items-center text-xs pt-1 border-t border-dashed">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Percent className="h-3 w-3" /> Tax
                                        </span>
                                        <span>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(Number(invoice.taxAmount))}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="text-xs h-6 text-primary hover:text-primary/80">
                                    View Details <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!Array.isArray(invoices) || invoices.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        <FileText className="h-10 w-10 mb-4 opacity-20" />
                        <p>No invoices found.</p>
                        <Button variant="ghost" className="mt-2 text-primary">Seed demo data to get started</Button>
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
