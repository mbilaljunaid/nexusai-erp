
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Package } from "lucide-react";
import { POAcknowledgeModal } from "@/components/supplier-portal/POAcknowledgeModal";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function SupplierOrders() {
    const token = localStorage.getItem("supplier_token");
    const queryClient = useQueryClient();
    const [selectedPo, setSelectedPo] = useState<any>(null);

    // Fetch Orders
    const { data: orders, isLoading } = useQuery({
        queryKey: ["/api/portal/supplier/orders"],
        queryFn: async () => {
            const res = await fetch("/api/portal/supplier/orders", {
                headers: { "x-portal-token": token || "" }
            });
            if (!res.ok) throw new Error("Failed to fetch orders");
            return res.json();
        }
    });

    // Acknowledge Mutation
    // Acknowledge Mutation
    const acknowledgeMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/portal/supplier/orders/${id}/acknowledge`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-portal-token": token || ""
                }
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Order Acknowledged",
                description: "The purchase order has been confirmed.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/portal/supplier/orders"] });
            setSelectedPo(null);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SENT": return <Badge variant="secondary">New</Badge>;
            case "OPEN": return <Badge variant="outline" className="border-green-500 text-green-600">Acknowledged</Badge>;
            case "COMPLETED": return <Badge className="bg-green-600">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const createInvoiceMutation = useMutation({
        mutationFn: async (po: any) => {
            const payload = {
                invoiceNumber: `INV-${po.poNumber}-${Date.now()}`,
                items: [
                    // Mock item for MVP parity - simulating billing for the remaining amount
                    { poLineId: "mock-line", quantity: 1, unitPrice: Number(po.totalAmount) }
                ]
            };

            const res = await fetch(`/api/portal/supplier/orders/${po.id}/invoice`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-portal-token": token || ""
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Invoice Created", description: "Invoice submitted to AP successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleCreateInvoice = (po: any) => {
        if (confirm(`Create invoice for PO ${po.poNumber}?`)) {
            createInvoiceMutation.mutate(po);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        All Orders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders?.map((po: any) => (
                                    <TableRow key={po.id}>
                                        <TableCell className="font-medium">{po.poNumber}</TableCell>
                                        <TableCell>{po.orderDate ? format(new Date(po.orderDate), 'MMM d, yyyy') : '-'}</TableCell>
                                        <TableCell>{getStatusBadge(po.status)}</TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: po.currency || 'USD' }).format(Number(po.totalAmount))}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {po.status === 'SENT' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setSelectedPo(po)}
                                                    >
                                                        Acknowledge
                                                    </Button>
                                                )}
                                                {po.status === 'OPEN' && (
                                                    <>
                                                        <div className="flex items-center text-sm text-green-600 mr-2">
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Confirmed
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleCreateInvoice(po)}
                                                            disabled={createInvoiceMutation.isPending}
                                                        >
                                                            Create Invoice
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <POAcknowledgeModal
                isOpen={!!selectedPo}
                onClose={() => setSelectedPo(null)}
                onConfirm={() => selectedPo && acknowledgeMutation.mutate(selectedPo.id)}
                isLoading={acknowledgeMutation.isPending}
                poNumber={selectedPo?.poNumber}
            />
        </div>
    );
}
