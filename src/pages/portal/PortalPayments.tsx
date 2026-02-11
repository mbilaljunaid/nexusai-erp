import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { CheckCircle, Download, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalPayments() {
    const { data: payments, isLoading } = useQuery({
        queryKey: ["/api/portal/payments"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/portal/payments");
            return res.json();
        }
    });

    const exportToCSV = () => {
        if (!payments || payments.length === 0) return;

        const headers = ["Receipt Number", "Date", "Invoice Number", "Amount", "Payment Method", "Status"];
        const rows = payments.map((p: any) => [
            p.receiptNumber,
            format(new Date(p.receiptDate), "yyyy-MM-dd"),
            p.invoiceNumber || "N/A",
            p.amount,
            p.paymentMethod,
            p.status
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payments_${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payment History</h1>
                <Button onClick={exportToCSV} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    {payments && payments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Receipt #</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Invoice #</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm text-slate-600">Amount</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Method</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment: any) => (
                                        <tr key={payment.id} className="border-b hover:bg-slate-50">
                                            <td className="py-3 px-4 font-mono text-sm">{payment.receiptNumber}</td>
                                            <td className="py-3 px-4 text-sm">{format(new Date(payment.receiptDate), "MMM dd, yyyy")}</td>
                                            <td className="py-3 px-4 text-sm">{payment.invoiceNumber || "-"}</td>
                                            <td className="py-3 px-4 text-right font-semibold text-emerald-600">${Number(payment.amount).toLocaleString()}</td>
                                            <td className="py-3 px-4 text-sm">{payment.paymentMethod}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    {payment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
