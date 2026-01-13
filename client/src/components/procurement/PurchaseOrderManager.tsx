import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VendorPicker } from "@/components/finance/VendorPicker";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function PurchaseOrderManager() {
    const { toast } = useToast();
    const [newPO, setNewPO] = useState({ poNumber: "", supplierId: "", status: "Draft", lines: [] as any[] });
    const [newLine, setNewLine] = useState({ description: "", quantity: "1", unitPrice: "0" });

    const { data: pos = [], isLoading: posLoading } = useQuery<any[]>({
        queryKey: ["/api/procurement/purchase-orders"],
        queryFn: () => fetch("/api/procurement/purchase-orders").then(r => r.json()).catch(() => [])
    });

    const { data: suppliers = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/suppliers"],
        queryFn: () => fetch("/api/procurement/suppliers").then(r => r.json()).catch(() => [])
    });


    const createPOMutation = useMutation({
        mutationFn: (data: any) => {
            const totalAmount = data.lines.reduce((sum: number, line: any) => sum + (parseFloat(line.quantity) * parseFloat(line.unitPrice)), 0);
            const payload = {
                ...data,
                totalAmount,
                lines: data.lines.map((line: any, index: number) => ({
                    lineNumber: index + 1,
                    itemDescription: line.description,
                    categoryName: "General",
                    quantity: parseFloat(line.quantity),
                    unitPrice: parseFloat(line.unitPrice),
                    lineAmount: parseFloat(line.quantity) * parseFloat(line.unitPrice)
                }))
            };
            return fetch("/api/procurement/purchase-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).then(r => r.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
            setNewPO({ poNumber: "", supplierId: "", status: "Draft", lines: [] });
            setNewLine({ description: "", quantity: "1", unitPrice: "0" });
            toast({ title: "PO created" });
        },
    });

    const deletePOMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/procurement/purchase-orders/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
            toast({ title: "PO deleted" });
        }
    });

    const addLine = () => {
        if (!newLine.description) return;
        setNewPO({ ...newPO, lines: [...newPO.lines, newLine] });
        setNewLine({ description: "", quantity: "1", unitPrice: "0" });
    };

    const removeLine = (index: number) => {
        const updatedLines = [...newPO.lines];
        updatedLines.splice(index, 1);
        setNewPO({ ...newPO, lines: updatedLines });
    };

    const calculateTotal = () => newPO.lines.reduce((sum, line) => sum + (parseFloat(line.quantity) * parseFloat(line.unitPrice)), 0).toFixed(2);

    return (
        <div className="space-y-4">
            <Card data-testid="card-new-po">
                <CardHeader>
                    <CardTitle className="text-base">Create Purchase Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        <Input
                            placeholder="PO Number"
                            value={newPO.poNumber}
                            onChange={(e) => setNewPO({ ...newPO, poNumber: e.target.value })}
                            data-testid="input-po-number"
                        />
                        <VendorPicker
                            value={newPO.supplierId}
                            onChange={(v) => setNewPO({ ...newPO, supplierId: v })}
                        />
                        <div className="flex items-center text-sm font-bold text-muted-foreground border px-3 rounded-md bg-muted/50">
                            Total: ${calculateTotal()}
                        </div>
                    </div>
                    <div className="border rounded-md p-3 bg-muted/20">
                        <h4 className="text-sm font-semibold mb-2">Line Items</h4>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            <Input
                                placeholder="Description"
                                value={newLine.description}
                                onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                                className="col-span-2"
                            />
                            <Input
                                placeholder="Qty"
                                type="number"
                                value={newLine.quantity}
                                onChange={(e) => setNewLine({ ...newLine, quantity: e.target.value })}
                            />
                            <Input
                                placeholder="Price"
                                type="number"
                                value={newLine.unitPrice}
                                onChange={(e) => setNewLine({ ...newLine, unitPrice: e.target.value })}
                            />
                        </div>
                        <Button size="sm" variant="secondary" onClick={addLine} disabled={!newLine.description} className="w-full mb-2">
                            <Plus className="w-3 h-3 mr-2" /> Add Line
                        </Button>
                        {newPO.lines.map((line, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-2 border-b last:border-0">
                                <span>{line.description} ({line.quantity} x ${line.unitPrice})</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeLine(idx)}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button
                        disabled={createPOMutation.isPending || !newPO.poNumber || !newPO.supplierId || newPO.lines.length === 0}
                        className="w-full"
                        onClick={() => createPOMutation.mutate(newPO)}
                        data-testid="button-create-po"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create PO (Draft)
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {posLoading ? <p>Loading...</p> : pos.length === 0 ? <p className="text-muted-foreground">No POs created</p> : pos.map((po: any) => (
                        <div key={po.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`po-${po.id}`}>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{po.poNumber}</p>
                                    <Badge variant={po.status === 'Draft' ? 'outline' : 'default'}>{po.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {suppliers.find((s: any) => s.id === (po.supplier?.id || po.supplierId))?.supplierName || "Unknown Supplier"} • ${po.totalAmount || "0.00"} • {po.lines?.length || 0} Lines
                                </p>
                            </div>
                            <div className="flex gap-2 items-center">
                                {po.status === 'Draft' && (
                                    <Button size="sm" variant="outline" onClick={() => fetch(`/api/procurement/purchase-orders/${po.id}/approve`, { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }))}>
                                        Approve
                                    </Button>
                                )}
                                {po.status === 'Approved' && (
                                    <Button size="sm" variant="default" onClick={() => fetch(`/api/procurement/purchase-orders/${po.id}/open`, { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }))}>
                                        Open
                                    </Button>
                                )}
                                <Button size="icon" variant="ghost" onClick={() => deletePOMutation.mutate(po.id)} data-testid={`button-delete-${po.id}`}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
