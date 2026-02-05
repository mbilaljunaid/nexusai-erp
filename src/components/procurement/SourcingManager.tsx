import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function SourcingManager() {
    const { toast } = useToast();
    const [newRFQ, setNewRFQ] = useState({ title: "", lines: [] as any[] });
    const [newRFQLine, setNewRFQLine] = useState({ description: "", targetQuantity: "" });
    const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
    const [newQuote, setNewQuote] = useState({ supplierId: "", quoteAmount: "" });

    const { data: rfqs = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/sourcing/rfqs"],
        queryFn: () => fetch("/api/procurement/sourcing/rfqs").then(r => r.json()).catch(() => [])
    });

    const { data: suppliers = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/suppliers"],
        queryFn: () => fetch("/api/procurement/suppliers").then(r => r.json()).catch(() => [])
    });

    const createRFQMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/procurement/sourcing/rfqs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/sourcing/rfqs"] });
            setNewRFQ({ title: "", lines: [] });
            toast({ title: "RFQ created" });
        }
    });

    const publishRFQMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/procurement/sourcing/rfqs/${id}/publish`, { method: "POST" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/sourcing/rfqs"] });
            toast({ title: "RFQ Published" });
        }
    });

    const submitQuoteMutation = useMutation({
        mutationFn: (data: any) => fetch(`/api/procurement/sourcing/rfqs/${data.id}/quotes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data.payload)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/sourcing/rfqs"] });
            setNewQuote({ supplierId: "", quoteAmount: "" });
            toast({ title: "Quote Submitted" });
        }
    });

    const awardQuoteMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/procurement/sourcing/quotes/${id}/award`, { method: "POST" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/sourcing/rfqs"] });
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
            toast({ title: "Quote Awarded & PO Created" });
        }
    });

    const addRFQLine = () => {
        if (!newRFQLine.description) return;
        setNewRFQ({ ...newRFQ, lines: [...newRFQ.lines, newRFQLine] });
        setNewRFQLine({ description: "", targetQuantity: "" });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader><CardTitle className="text-base">Create RFQ</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <Input placeholder="RFQ Title" value={newRFQ.title} onChange={e => setNewRFQ({ ...newRFQ, title: e.target.value })} />
                        <div className="border p-4 rounded bg-muted/20">
                            <p className="text-sm font-semibold mb-2">Target Lines</p>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    placeholder="Item Description"
                                    value={newRFQLine.description}
                                    onChange={e => setNewRFQLine({ ...newRFQLine, description: e.target.value })}
                                />
                                <Input
                                    placeholder="Qty"
                                    type="number"
                                    className="w-20"
                                    value={newRFQLine.targetQuantity}
                                    onChange={e => setNewRFQLine({ ...newRFQLine, targetQuantity: e.target.value })}
                                />
                                <Button size="sm" onClick={addRFQLine}><Plus className="w-4 h-4" /></Button>
                            </div>
                            {newRFQ.lines.map((l, idx) => (
                                <div key={idx} className="text-xs border-b pb-1 mb-1">{l.description} (x{l.targetQuantity})</div>
                            ))}
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => createRFQMutation.mutate(newRFQ)}
                            disabled={!newRFQ.title || newRFQ.lines.length === 0}
                        >
                            Create Draft RFQ
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">Active RFQs</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {rfqs.map((rfq: any) => (
                            <div key={rfq.id} className="p-3 border rounded-lg hover-elevate">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <p className="font-semibold text-sm">{rfq.rfqNumber}: {rfq.title}</p>
                                        <Badge variant={rfq.status === 'Active' ? 'default' : rfq.status === 'Awarded' ? 'secondary' : 'outline'}>{rfq.status}</Badge>
                                    </div>
                                    {rfq.status === 'Draft' && <Button size="sm" onClick={() => publishRFQMutation.mutate(rfq.id)}>Publish</Button>}
                                    {rfq.status === 'Active' && <Button size="sm" variant="outline" onClick={() => setSelectedRFQ(selectedRFQ?.id === rfq.id ? null : rfq)}>Manage Quotes</Button>}
                                </div>
                                <p className="text-xs text-muted-foreground">{rfq.quotes?.length || 0} quotes received</p>

                                {selectedRFQ?.id === rfq.id && (
                                    <div className="mt-3 border-t pt-2 bg-muted/10 p-2 rounded">
                                        <p className="font-semibold text-xs mb-2">Submit Mock Quote</p>
                                        <div className="flex gap-2 mb-3">
                                            <Select value={newQuote.supplierId} onValueChange={v => setNewQuote({ ...newQuote, supplierId: v })}>
                                                <SelectTrigger className="h-8"><SelectValue placeholder="Supplier" /></SelectTrigger>
                                                <SelectContent>
                                                    {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.supplierName}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                placeholder="Total $"
                                                className="h-8 w-24"
                                                value={newQuote.quoteAmount}
                                                onChange={e => setNewQuote({ ...newQuote, quoteAmount: e.target.value })}
                                            />
                                            <Button size="sm" onClick={() => submitQuoteMutation.mutate({ id: rfq.id, payload: newQuote })}>Submit</Button>
                                        </div>
                                        <p className="font-semibold text-xs mb-2">Received Quotes</p>
                                        {rfq.quotes?.map((q: any) => (
                                            <div key={q.id} className="flex justify-between items-center text-xs border-b pb-1 mb-1">
                                                <span>{q.supplier?.supplierName}: ${q.quoteAmount}</span>
                                                {q.status === 'Submitted' && <Button size="sm" className="h-6" onClick={() => awardQuoteMutation.mutate(q.id)}>Award</Button>}
                                                {q.status === 'Awarded' && <Badge className="h-5 bg-green-600">Winner</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
