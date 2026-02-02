import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Truck, PackageCheck, Undo2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function ReceiptManager() {
    const { toast } = useToast();
    const [receivingPO, setReceivingPO] = useState<any>(null);
    const [receiptQuantities, setReceiptQuantities] = useState<Record<string, string>>({});
    const [returnReceiptLine, setReturnReceiptLine] = useState<any>(null);
    const [returnQty, setReturnQty] = useState("");

    const { data: pos = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/purchase-orders"],
        queryFn: () => fetch("/api/procurement/purchase-orders").then(r => r.json()).catch(() => [])
    });

    const { data: suppliers = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/suppliers"],
        queryFn: () => fetch("/api/procurement/suppliers").then(r => r.json()).catch(() => [])
    });

    const { data: receipts = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/receipts"],
        queryFn: () => fetch("/api/procurement/receipts").then(r => r.json()).catch(() => [])
    });

    const createReceiptMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/procurement/receipts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/receipts"] });
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
            setReceivingPO(null);
            setReceiptQuantities({});
            toast({ title: "Receipt created" });
        }
    });

    const returnItemsMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/procurement/receipts/return", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/receipts"] });
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/ap/invoices"] });
            setReturnReceiptLine(null);
            setReturnQty("");
            toast({ title: "Return Processed & Debit Memo Created" });
        }
    });

    const submitReceipt = () => {
        if (!receivingPO) return;
        const linesToReceive = receivingPO.lines.map((line: any) => ({
            poLineId: line.id,
            quantity: receiptQuantities[line.id] || "0",
            itemId: line.itemId
        })).filter((l: any) => parseFloat(l.quantity) > 0);

        if (linesToReceive.length === 0) {
            toast({ title: "No quantities entered", variant: "destructive" });
            return;
        }
        createReceiptMutation.mutate({ purchaseOrderId: receivingPO.id, lines: linesToReceive });
    };

    const submitReturn = () => {
        if (!returnReceiptLine || !returnQty) return;
        returnItemsMutation.mutate({ receiptLineId: returnReceiptLine.id, quantityToReturn: parseFloat(returnQty) });
    };

    return (
        <div className="space-y-4">
            {!receivingPO ? (
                <Card>
                    <CardHeader><CardTitle className="text-base">Ready for Receipt</CardTitle></CardHeader>
                    <CardContent>
                        {pos.filter((p: any) => p.status === 'Open').length === 0 ? (
                            <p className="text-muted-foreground">No Open POs to receive.</p>
                        ) : (
                            pos.filter((p: any) => p.status === 'Open').map((po: any) => (
                                <div key={po.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-semibold">{po.poNumber}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {suppliers.find(s => s.id === (po.supplier?.id || po.supplierId))?.supplierName} • {po.lines?.length} Lines
                                        </p>
                                    </div>
                                    <Button size="sm" onClick={() => setReceivingPO(po)}>Receive</Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Receiving against {receivingPO.poNumber}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setReceivingPO(null)}>Cancel</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {receivingPO.lines?.map((line: any) => {
                            const remaining = parseFloat(line.quantity) - parseFloat(line.quantityReceived || 0);
                            return (
                                <div key={line.id} className="grid grid-cols-4 gap-4 items-center border-b pb-2">
                                    <div className="col-span-2">
                                        <p className="font-medium">{line.itemDescription}</p>
                                        <p className="text-xs text-muted-foreground">Ordered: {line.quantity} | Received: {line.quantityReceived || 0}</p>
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder={`Max ${remaining}`}
                                        value={receiptQuantities[line.id] || ""}
                                        onChange={(e) => setReceiptQuantities({ ...receiptQuantities, [line.id]: e.target.value })}
                                    />
                                    <div className="text-sm text-right text-muted-foreground">Remaining: {remaining}</div>
                                </div>
                            );
                        })}
                        <Button
                            className="w-full"
                            onClick={submitReceipt}
                            disabled={createReceiptMutation.isPending}
                        >
                            <PackageCheck className="w-4 h-4 mr-2" /> Confirm Receipt
                        </Button>
                    </CardContent>
                </Card>
            )}

            {returnReceiptLine && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader><CardTitle>Return Item</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">Returning: <strong>{returnReceiptLine.poLine?.itemDescription || "Item"}</strong></p>
                            <p className="text-xs text-muted-foreground">Original Receipt: {returnReceiptLine.header?.receiptNumber}</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-semibold">Received</label><Input disabled value={returnReceiptLine.quantityReceived} /></div>
                                <div><label className="text-xs font-semibold">Already Returned</label><Input disabled value={returnReceiptLine.quantityReturned || 0} /></div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold">Quantity to Return</label>
                                <Input type="number" value={returnQty} onChange={e => setReturnQty(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => { setReturnReceiptLine(null); setReturnQty(""); }}>Cancel</Button>
                                <Button variant="destructive" onClick={submitReturn} disabled={!returnQty || parseFloat(returnQty) <= 0}>
                                    <Undo2 className="w-4 h-4 mr-2" /> Confirm Return
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader><CardTitle className="text-base">Recent Receipts & Returns</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {receipts.length === 0 ? (
                        <p className="text-muted-foreground">No receipts found</p>
                    ) : (
                        receipts.map((r: any) => (
                            <div key={r.id} className="p-3 border rounded-lg mb-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{r.receiptNumber}</p>
                                        <span className="text-xs text-muted-foreground">{new Date(r.receiptDate).toLocaleDateString()} • PO: {r.purchaseOrder?.poNumber}</span>
                                    </div>
                                </div>
                                <div className="mt-2 space-y-1">
                                    {r.lines?.map((line: any) => (
                                        <div key={line.id} className="flex justify-between items-center text-sm bg-muted/20 p-2 rounded">
                                            <span>{line.poLine?.itemDescription || "Item"} (Rx: {line.quantityReceived})</span>
                                            <div className="flex items-center gap-2">
                                                {line.quantityReturned > 0 && <Badge variant="destructive" className="text-[10px] h-5">Returned: {line.quantityReturned}</Badge>}
                                                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => setReturnReceiptLine(line)}>Return</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
