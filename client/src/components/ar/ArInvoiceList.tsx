import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useState } from "react";
import { ArSideSheet } from "./ArSideSheet";
import { CreateTransactionDialog } from "./CreateTransactionDialog";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { ArInvoice } from "@shared/schema";
import { format } from "date-fns";

export function ArInvoiceList() {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const { data, isLoading } = useQuery<{ data: ArInvoice[], total: number }>({
        queryKey: ["/api/ar/invoices", page, pageSize],
        queryFn: () => api.ar.invoices.list({ limit: pageSize, offset: (page - 1) * pageSize })
    });

    const invoices = data?.data || [];
    const totalCount = data?.total || 0;

    const columns: Column<ArInvoice>[] = [
        {
            header: "Invoice #",
            accessorKey: "invoiceNumber",
            className: "font-semibold"
        },
        {
            header: "Customer",
            cell: (inv) => (
                <div className="flex flex-col">
                    <span className="font-medium text-xs text-muted-foreground uppercase tracking-widest opacity-70">
                        {String(inv.customerId).substring(0, 8)}...
                    </span>
                </div>
            )
        },
        {
            header: "Total Amount",
            cell: (inv) => (
                <div className="font-mono font-bold text-emerald-900">
                    <span className="text-[10px] font-normal text-muted-foreground mr-0.5">$</span>
                    {parseFloat(String(inv.totalAmount || 0)).toLocaleString()}
                </div>
            )
        },
        {
            header: "Due Date",
            cell: (inv) => inv.dueDate ? format(new Date(inv.dueDate), "MMM dd, yyyy") : "N/A"
        },
        {
            header: "Status",
            cell: (inv) => (
                <Badge variant={
                    inv.status === "Paid" ? "default" :
                        inv.status === "Overdue" ? "destructive" :
                            "secondary"
                } className={inv.status === "Paid" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                    {inv.status}
                </Badge>
            )
        },
        {
            header: "Revenue",
            cell: (inv) => inv.recognitionStatus === "Completed" ? (
                <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50/50 border-emerald-200">Recognized</Badge>
            ) : null
        }
    ];

    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl font-bold">Sales Invoices</CardTitle>
                </div>
                <CreateTransactionDialog />
            </CardHeader>
            <CardContent>
                <StandardTable
                    data={invoices}
                    columns={columns}
                    isLoading={isLoading}
                    page={page}
                    pageSize={pageSize}
                    totalItems={totalCount}
                    onPageChange={setPage}
                    onRowClick={setSelectedInvoice}
                    keyExtractor={(i) => i.id}
                />
            </CardContent>

            <ArSideSheet
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                data={selectedInvoice}
                type="invoice"
            />
        </Card>
    );
}

