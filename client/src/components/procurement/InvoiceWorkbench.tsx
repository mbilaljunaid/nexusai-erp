import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function InvoiceWorkbench() {
    const { toast } = useToast();
    const [newInvoice, setNewInvoice] = useState({ invoiceNumber: "", supplierId: "", purchaseOrderId: "", amount: "", invoiceDate: "" });
    const [paymentAmount, setPaymentAmount] = useState("");

    const { data: pos = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/purchase-orders"],
        queryFn: () => fetch("/api/procurement/purchase-orders").then(r => r.json()).catch(() => [])
    });

    const { data: suppliers = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/suppliers"],
        queryFn: () => fetch("/api/procurement/suppliers").then(r => r.json()).catch(() => [])
    });

    const { data: invoices = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/ap/invoices"],
        queryFn: () => fetch("/api/procurement/ap/invoices").then(r => r.json()).catch(() => [])
    });

    const createInvoiceMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/procurement/ap/invoices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/ap/invoices"] });
            setNewInvoice({ invoiceNumber: "", supplierId: "", purchaseOrderId: "", amount: "", invoiceDate: "" });
            toast({ title: "Invoice created" });
        }
    });

    const validateInvoiceMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/procurement/ap/invoices/${id}/validate`, { method: "POST" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/ap/invoices"] });
            toast({ title: "Invoice Validated" });
        }
    });

    const payInvoiceMutation = useMutation({
        mutationFn: ({ id, amount }: { id: string, amount: string }) => fetch(`/api/procurement/ap/invoices/${id}/pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, paymentMethod: "Wire" })
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/ap/invoices"] });
            setPaymentAmount("");
            toast({ title: "Payment Recorded" });
        }
    });

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader><CardTitle className="text-base">Create Invoice</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                        <Input
                            placeholder="Invoice Number"
                            value={newInvoice.invoiceNumber}
                            onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                        />
                        <Select value={newInvoice.supplierId} onValueChange={(v) => setNewInvoice({ ...newInvoice, supplierId: v })}>
                            <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                            <SelectContent>
                                {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.supplierName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={newInvoice.purchaseOrderId} onValueChange={(v) => setNewInvoice({ ...newInvoice, purchaseOrderId: v })}>
                            <SelectTrigger><SelectValue placeholder="Match PO (Optional)" /></SelectTrigger>
                            <SelectContent>
                                {pos.filter((p: any) => p.supplierId === newInvoice.supplierId || p.supplier?.id === newInvoice.supplierId).map((p: any) => (
                                    <SelectItem key={p.id} value={p.id}>{p.poNumber}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder="Amount"
                            value={newInvoice.amount}
                            onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                        />
                    </div>
                    <Button
                        className="w-full"
                        disabled={createInvoiceMutation.isPending || !newInvoice.invoiceNumber || !newInvoice.supplierId || !newInvoice.amount}
                        onClick={() => createInvoiceMutation.mutate(newInvoice)}
                    >
                        Create Invoice
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base">Invoices Workbench</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {invoices.length === 0 ? (
                        <p className="text-muted-foreground">No invoices found.</p>
                    ) : (
                        invoices.map((inv: any) => (
                            <div key={inv.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{inv.invoiceNumber}</p>
                                        <Badge variant={inv.status === 'Paid' ? 'default' : inv.status === 'Validated' ? 'secondary' : 'outline'}>{inv.status}</Badge>
                                        {Number(inv.amount) < 0 && <Badge variant="destructive" className="ml-2">Debit Memo</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{inv.supplier?.supplierName} • ${inv.amount} • {new Date(inv.invoiceDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    {inv.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => validateInvoiceMutation.mutate(inv.id)}>Validate</Button>}
                                    {(inv.status === 'Validated' || inv.status === 'Partially Paid') && Number(inv.amount) > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Input className="w-24 h-8" placeholder="Amount" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
                                            <Button size="sm" onClick={() => payInvoiceMutation.mutate({ id: inv.id, amount: paymentAmount || inv.amount })}>Pay</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
