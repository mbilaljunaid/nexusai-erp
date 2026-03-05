import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Clock, Upload, Bell } from "lucide-react";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";

export default function SupplierPortal() {
    const [page, setPage] = useState(1);

    const { data: invoices, isLoading } = useQuery<any>({
        queryKey: ["/api/ap/portal/invoices"],
        queryFn: async () => {
            return [
                { id: "1", invoiceNumber: "INV-2026-001", date: "2026-05-01", amount: 15000.00, status: "Paid", paymentDate: "2026-05-15" },
                { id: "2", invoiceNumber: "INV-2026-002", date: "2026-06-10", amount: 4500.50, status: "Processing", paymentDate: null },
                { id: "3", invoiceNumber: "INV-2026-003", date: "2026-07-02", amount: 8900.00, status: "Pending Approval", paymentDate: null }
            ];
        }
    });

    const { data: purchaseOrders } = useQuery<any>({
        queryKey: ["/api/ap/portal/pos"],
        queryFn: async () => {
            return [
                { id: "1", poNumber: "PO-99450", date: "2026-04-20", amount: 20000.00, status: "Open" },
                { id: "2", poNumber: "PO-99512", date: "2026-06-01", amount: 4500.50, status: "Fulfilled" }
            ];
        }
    });

    const invoiceColumns: SpreadsheetColumn<any>[] = [
        { header: "Invoice #", id: "invoiceNumber", width: "150px", className: "font-mono font-medium" },
        { header: "Date", id: "date", width: "150px" },
        {
            header: "Amount",
            id: "amount", width: "150px",
            cell: (row) => <span className="font-semibold text-primary">${row.amount.toLocaleString()}</span>
        },
        {
            header: "Status",
            id: "status", width: "150px",
            cell: (row) => (
                <Badge variant={row.status === "Paid" ? "default" : row.status === "Processing" ? "secondary" : "outline"}>
                    {row.status}
                </Badge>
            )
        },
        { header: "Payment Date", id: "paymentDate", width: "150px", cell: (row) => row.paymentDate || "-" }
    ];

    const poColumns: SpreadsheetColumn<any>[] = [
        { header: "PO Number", id: "poNumber", width: "150px", className: "font-mono text-indigo-600 font-medium" },
        { header: "Issue Date", id: "date", width: "150px" },
        {
            header: "Total Value",
            id: "amount", width: "150px",
            cell: (row) => <span className="font-semibold">${row.amount.toLocaleString()}</span>
        },
        {
            header: "Status",
            id: "status", width: "150px",
            cell: (row) => <Badge variant={row.status === "Open" ? "default" : "secondary"}>{row.status}</Badge>
        }
    ];

    return (
        <StandardPage
            title="Supplier Self-Service Portal"
            description="Welcome back, Acme Corp. View your orders, submit invoices, and track payments."
            actions={
                <>
                    <Button variant="outline" size="icon">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Invoice
                    </Button>
                </>
            }
        >

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground mt-1">Invoices awaiting review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processing</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground mt-1">Invoices ready for payment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid (YTD)</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$15,000.00</div>
                        <p className="text-xs text-muted-foreground mt-1">Total payments received this year</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="invoices" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="invoices">My Invoices</TabsTrigger>
                    <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
                    <TabsTrigger value="profile">Company Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice History</CardTitle>
                            <CardDescription>Track the status of all submitted invoices</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InteractiveSpreadsheet
                                data={invoices || []}
                                columns={invoiceColumns}
                                isLoading={isLoading}
                             onChange={() => {}} containerHeight="600px" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Orders</CardTitle>
                            <CardDescription>Open and historical purchase orders assigned to you</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InteractiveSpreadsheet
                                data={purchaseOrders || []}
                                columns={poColumns}
                                isLoading={isLoading}
                             onChange={() => {}} containerHeight="600px" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Profile</CardTitle>
                            <CardDescription>Manage your banking and contact details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                                Profile management capabilities are currently locked by the buyer. Please contact procurement to update details.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
