import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { CheckCircle, Download, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { ExportButton } from "@/components/ExportButton";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function PortalPayments() {
    const { data: payments, isLoading } = useQuery<any>({
        queryKey: ["/api/portal/payments"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/portal/payments");
            return res.json();
        }
    });
    const exportData = payments?.map((p: any) => ({
        "Receipt Number": p.receiptNumber,
        "Date": format(new Date(p.receiptDate), "yyyy-MM-dd"),
        "Invoice Number": p.invoiceNumber || "N/A",
        "Amount": p.amount,
        "Payment Method": p.paymentMethod,
        "Status": p.status
    })) || [];
    if (isLoading) {
        return (
            <StandardPage title="Payment History">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-96" />
            </StandardPage>
        );
    }

    const columns: SpreadsheetColumn<any>[] = [
        { id: "receiptNumber", header: "Receipt #", width: "150px", cell: (payment: any) => <span className="font-mono text-sm">{payment.receiptNumber}</span> },
        { id: "date", header: "Date", width: "150px", cell: (payment: any) => <span>{format(new Date(payment.receiptDate), "MMM dd, yyyy")}</span> },
        { id: "invoiceNumber", header: "Invoice #", width: "150px", cell: (payment: any) => <span>{payment.invoiceNumber || "-"}</span> },
        { id: "amount", header: "Amount", width: "120px", cell: (payment: any) => <span className="font-semibold text-emerald-600">${Number(payment.amount).toLocaleString()}</span> },
        { id: "method", header: "Method", width: "120px", cell: (payment: any) => <span>{payment.paymentMethod}</span> },
        {
            id: "status", header: "Status", width: "150px", cell: (payment: any) => (
                <StatusBadge status={payment.status} />
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">

                <ExportButton
                    data={exportData}
                    filename={`payments_${format(new Date(), "yyyy-MM-dd")}`}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    {payments && payments.length > 0 ? (
                        <div className="overflow-x-auto border rounded-xl shadow-sm">
                            <InteractiveSpreadsheet
                                data={payments}
                                columns={columns}
                                virtualized={true}
                                containerHeight="500px"
                                onChange={() => { }}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No payment history found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
