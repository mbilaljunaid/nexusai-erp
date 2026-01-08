import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, CreditCard, Banknote, Landmark, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";

export function ArReceiptList() {
    const { data: receipts, isLoading } = useQuery({
        queryKey: ["/api/ar/receipts"],
        queryFn: api.ar.receipts.list
    });

    const getPaymentIcon = (method: string) => {
        switch (method?.toLowerCase()) {
            case "bank": return <Landmark className="h-4 w-4" />;
            case "creditcard": return <CreditCard className="h-4 w-4" />;
            case "wire": return <Banknote className="h-4 w-4" />;
            default: return <Receipt className="h-4 w-4" />;
        }
    };

    if (isLoading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
    </div>;

    if (!Array.isArray(receipts) || receipts.length === 0) {
        return (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No receipts found</h3>
                <p className="text-muted-foreground max-w-xs">
                    Payments applied to invoices will appear here as receipts.
                </p>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {receipts.map((receipt: any) => (
                <Card key={receipt.id} className="group hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm border border-emerald-100 group-hover:border-emerald-200 transition-colors">
                                {getPaymentIcon(receipt.paymentMethod)}
                            </div>
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50">
                                {receipt.status}
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Amount Received</div>
                                    <div className="text-2xl font-bold text-emerald-700">
                                        ${parseFloat(receipt.amount).toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Date</div>
                                    <div className="flex items-center text-sm font-medium">
                                        <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                                        {receipt.receiptDate ? format(new Date(receipt.receiptDate), "MMM dd, yyyy") : "N/A"}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-emerald-100/50">
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>Method: <span className="text-foreground font-medium">{receipt.paymentMethod || "Other"}</span></span>
                                    <span>Ref: <span className="text-foreground font-medium">{receipt.transactionId?.substring(0, 8) || "N/A"}</span></span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
