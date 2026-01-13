import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle, XCircle, ArrowRightLeft } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function RequisitionManager() {
    const { toast } = useToast();
    const [reqView, setReqView] = useState("my-reqs");
    const [cart, setCart] = useState<any[]>([]);
    const [reqDescription, setReqDescription] = useState("Monthly Supplies");

    const { data: requisitions = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/requisitions"],
        queryFn: () => fetch("/api/procurement/requisitions").then(r => r.json()).catch(() => [])
    });

    const { data: items = [] } = useQuery<any[]>({
        queryKey: ["/api/inventory/items"],
        queryFn: () => fetch("/api/inventory/items").then(r => r.json()).catch(() => [])
    });

    const createRequisitionMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/procurement/requisitions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/requisitions"] });
            setCart([]);
            setReqView("my-reqs");
            toast({ title: "Requisition created" });
        }
    });

    const reqAction = (id: string, action: string) => {
        fetch(`/api/procurement/requisitions/${id}/${action}`, { method: 'POST' }).then(() => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/requisitions"] });
            if (action === 'convert-to-po') queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
            toast({ title: `Requisition ${action} successful` });
        });
    };

    const addToCart = (item: any) => {
        setCart([...cart, { itemId: item.id, description: item.description, quantity: 1, unitPrice: 10, categoryName: item.categoryName }]);
        toast({ title: "Added to cart" });
    };

    const submitRequisition = () => {
        if (cart.length === 0) return;
        createRequisitionMutation.mutate({ description: reqDescription, lines: cart, requesterId: "USER-1" });
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Button size="sm" variant={reqView === "my-reqs" ? "default" : "secondary"} onClick={() => setReqView("my-reqs")}>My Requisitions</Button>
                <Button size="sm" variant={reqView === "shop" ? "default" : "secondary"} onClick={() => setReqView("shop")}>Shop Catalog</Button>
            </div>

            {reqView === "shop" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3">
                        {items.length === 0 ? (
                            <p className="text-muted-foreground col-span-2">No items in catalog.</p>
                        ) : (
                            items.map((item: any) => (
                                <Card key={item.id} className="cursor-pointer hover:border-primary" onClick={() => addToCart(item)}>
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold">{item.itemNumber}</h4>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        <Badge variant="secondary" className="mt-2">{item.categoryName || "General"}</Badge>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                    <Card className="h-fit">
                        <CardHeader><CardTitle className="text-base">Requisition Cart ({cart.length})</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Input placeholder="Requisition Title" value={reqDescription} onChange={e => setReqDescription(e.target.value)} />
                            {cart.map((line, idx) => (
                                <div key={idx} className="flex justify-between text-sm border-b pb-1">
                                    <span>{line.description} (x{line.quantity})</span>
                                    <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => { const c = [...cart]; c.splice(idx, 1); setCart(c); }}><Trash2 className="w-3 h-3" /></Button>
                                </div>
                            ))}
                            <Button className="w-full" disabled={cart.length === 0} onClick={submitRequisition}>Submit Requisition</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {reqView === "my-reqs" && (
                <Card>
                    <CardHeader><CardTitle>All Requisitions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {requisitions.length === 0 ? (
                            <p className="text-muted-foreground">No requisitions found.</p>
                        ) : (
                            requisitions.map((req: any) => (
                                <div key={req.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{req.reqNumber}</p>
                                            <Badge variant={req.status === 'Approved' ? 'default' : req.status === 'Rejected' ? 'destructive' : 'outline'}>{req.status}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground text-nowrap">{req.description} • ${req.totalAmount}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {req.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => reqAction(req.id, 'submit')}>Submit</Button>}
                                        {req.status === 'Pending Approval' && (
                                            <>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => reqAction(req.id, 'approve')}><CheckCircle className="w-4 h-4 mr-1" /> Approve</Button>
                                                <Button size="sm" variant="destructive" onClick={() => reqAction(req.id, 'reject')}><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
                                            </>
                                        )}
                                        {req.status === 'Approved' && <Button size="sm" variant="secondary" onClick={() => reqAction(req.id, 'convert-to-po')}><ArrowRightLeft className="w-4 h-4 mr-1" /> Convert to PO</Button>}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
