import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { useState } from "react";
import { ArSideSheet } from "./ArSideSheet";

export function ArInvoiceList() {
    const { data: invoices, isLoading } = useQuery({
        queryKey: ["/api/ar/invoices"],
        queryFn: api.ar.invoices.list
    });
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    if (isLoading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => <Card key={i} className="h-40 animate-pulse bg-muted" />)}
    </div>;

    if (!Array.isArray(invoices) || invoices.length === 0) {
        return (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No sales invoices found</h3>
                <p className="text-muted-foreground max-w-xs">
                    Create your first sales invoice or seed demo data to see them here.
                </p>
            </Card>
        );
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {invoices.map((inv: any) => (
                    <Card
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        className="group hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden border-l-4 border-l-emerald-500 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors w-fit">
                                        <FileText className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    {inv.recognitionStatus === "Completed" && (
                                        <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50/50 border-emerald-200">Revenue Recognized</Badge>
                                    )}
                                </div>
                                <Badge variant={
                                    inv.status === "Paid" ? "default" :
                                        inv.status === "Overdue" ? "destructive" :
                                            "secondary"
                                } className={inv.status === "Paid" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                    {inv.status}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-bold text-lg leading-none mb-1 group-hover:text-emerald-600 transition-colors">
                                        {inv.invoiceNumber}
                                    </h3>
                                    <div className="flex items-center text-xs text-muted-foreground uppercase tracking-widest font-semibold opacity-70">
                                        <User className="mr-1 h-3 w-3" />
                                        {inv.customerId.substring(0, 8)}...
                                    </div>
                                </div>

                                <div className="flex justify-between items-end pt-2 border-t border-emerald-50/50">
                                    <div className="space-y-1">
                                        <div className="text-2xl font-black text-emerald-900 tracking-tight">
                                            <span className="text-xs font-normal text-muted-foreground mr-1">$</span>
                                            {parseFloat(inv.totalAmount).toLocaleString()}
                                        </div>
                                        <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {inv.dueDate ? format(new Date(inv.dueDate), "MMM dd, yyyy") : "N/A"}
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-emerald-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ArSideSheet
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                data={selectedInvoice}
                type="invoice"
            />
        </>
    );
}
