import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FileText, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { useState } from "react";
import { InvoiceSideSheet } from "./InvoiceSideSheet";

export function ApInvoiceList() {
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

    const { data: invoices, isLoading } = useQuery({
        queryKey: ['/api/ap/invoices'],
        queryFn: () => api.ap.invoices.list()
    });

    if (isLoading) {
        return <div className="p-4 text-center">Loading invoices...</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'default'; // primary
            case 'Paid': return 'secondary'; // gray
            case 'PendingApproval': return 'warning'; // yellow (needs custom variant but using outline for now if warning not defined)
            case 'OnHold': return 'destructive'; // red
            default: return 'outline';
        }
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {invoices?.map((invoice: any) => (
                    <Card
                        key={invoice.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 group"
                        style={{ borderLeftColor: invoice.status === 'OnHold' ? 'red' : 'transparent' }}
                        onClick={() => setSelectedInvoiceId(invoice.id)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        {invoice.invoiceNumber}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        Supplier ID: {invoice.supplierId}
                                    </CardDescription>
                                </div>
                                <Badge variant={getStatusColor(invoice.status) as any}>
                                    {invoice.status}
                                </Badge>
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
                            </div>
                            <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="text-xs h-6">
                                    View Details <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!invoices || invoices.length === 0) && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No invoices found. Use the AI widget to create test data or simulate ingestion.
                    </div>
                )}
            </div>

            <InvoiceSideSheet
                invoiceId={selectedInvoiceId}
                onClose={() => setSelectedInvoiceId(null)}
            />
        </>
    );
}
