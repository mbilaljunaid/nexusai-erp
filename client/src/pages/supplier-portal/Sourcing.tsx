
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gavel, Search, Calendar, ChevronRight, FileText, Send, AlertCircle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SupplierSourcing() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
    const [bidLines, setBidLines] = useState<any[]>([]);
    const [notes, setNotes] = useState("");

    const { data: rfqs, isLoading } = useQuery({
        queryKey: ["/api/portal/supplier/rfqs"],
        queryFn: async () => {
            const token = localStorage.getItem("supplier_portal_token");
            const res = await fetch("/api/portal/supplier/rfqs", {
                headers: { "x-portal-token": token || "" }
            });
            return res.json();
        }
    }) as any;

    const { data: rfqDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: [`/api/portal/supplier/rfqs/${selectedRFQ?.id}`],
        queryFn: async () => {
            const token = localStorage.getItem("supplier_portal_token");
            const res = await fetch(`/api/portal/supplier/rfqs/${selectedRFQ.id}`, {
                headers: { "x-portal-token": token || "" }
            });
            return res.json();
        },
        enabled: !!selectedRFQ
    }) as any;

    useEffect(() => {
        if (rfqDetails?.lines) {
            setBidLines(rfqDetails.lines.map((l: any) => ({
                rfqLineId: l.id,
                itemDescription: l.itemDescription,
                offeredPrice: "",
                offeredQuantity: l.targetQuantity,
                supplierLeadTime: ""
            })));
        }
    }, [rfqDetails]);

    const submitBidMutation = useMutation({
        mutationFn: async (payload: any) => {
            const token = localStorage.getItem("supplier_portal_token");
            const res = await fetch(`/api/portal/supplier/rfqs/${selectedRFQ.id}/bid`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-portal-token": token || ""
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Bid submission failed");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Bid Submitted", description: "Your quote has been registered for evaluation." });
            queryClient.invalidateQueries({ queryKey: ["/api/portal/supplier/rfqs"] });
            setSelectedRFQ(null);
            setBidLines([]);
            setNotes("");
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    const isBidValid = bidLines.every(l => l.offeredPrice && l.offeredQuantity);

    if (isLoading) return <div className="p-8">Loading sourcing opportunities...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gavel className="w-6 h-6 text-primary" /> Sourcing Opportunities
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Review active RFQs and submit your best quotes.</p>
                </div>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold uppercase tracking-wider">Note to Suppliers</AlertTitle>
                <AlertDescription className="text-xs">
                    Please ensure all line prices are entered as net-unit-pricing. T&Cs of the final award will be based on the master agreement linked to this RFQ.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 gap-4">
                {rfqs?.map((rfq: any) => (
                    <Card key={rfq.id} className="hover:border-primary/50 transition-all group cursor-pointer" onClick={() => setSelectedRFQ(rfq)}>
                        <CardContent className="p-0">
                            <div className="flex items-center p-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <Badge variant="outline" className="font-mono text-[10px]">{rfq.rfqNumber}</Badge>
                                        <h3 className="font-bold text-sm tracking-tight">{rfq.title}</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{rfq.description}</p>
                                </div>
                                <div className="flex items-center gap-8 pr-4">
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Close Date</p>
                                        <p className="text-xs font-medium">{rfq.closeDate ? new Date(rfq.closeDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {rfqs?.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl opacity-50">
                        <Gavel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm font-medium">No open sourcing events at this time.</p>
                    </div>
                )}
            </div>

            {/* Bidding Modal */}
            <Dialog open={!!selectedRFQ} onOpenChange={() => setSelectedRFQ(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono text-[10px]">{selectedRFQ?.rfqNumber}</Badge>
                            <DialogTitle>Submit Bid: {selectedRFQ?.title}</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs">
                            Please provide line-level pricing and any specific lead times or notes.
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingDetails ? (
                        <div className="py-12 text-center text-xs">Fetching requirements...</div>
                    ) : (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-muted/30 p-4 rounded-lg border">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">Requirements Description</h4>
                                    <p className="text-xs">{rfqDetails?.description}</p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Line Item Quotes</h4>
                                    <div className="rounded-xl border overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead className="text-[10px]">Requirement</TableHead>
                                                    <TableHead className="text-[10px] text-center">Target Qty</TableHead>
                                                    <TableHead className="text-[10px] text-right">Offered Price</TableHead>
                                                    <TableHead className="text-[10px] text-right">Lead Time (Days)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {bidLines.map((line, idx) => (
                                                    <TableRow key={line.rfqLineId}>
                                                        <TableCell className="text-xs font-medium py-3">
                                                            {line.itemDescription}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-center">
                                                            {line.offeredQuantity}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <span className="text-[10px] text-muted-foreground">$</span>
                                                                <Input
                                                                    type="number"
                                                                    className="h-8 w-24 text-right text-xs bg-primary/5 focus:bg-white"
                                                                    value={line.offeredPrice}
                                                                    onChange={e => {
                                                                        const l = [...bidLines];
                                                                        l[idx].offeredPrice = e.target.value;
                                                                        setBidLines(l);
                                                                    }}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                type="number"
                                                                className="h-8 w-20 text-right text-xs"
                                                                value={line.supplierLeadTime}
                                                                onChange={e => {
                                                                    const l = [...bidLines];
                                                                    l[idx].supplierLeadTime = e.target.value;
                                                                    setBidLines(l);
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest">Supplier Remarks</Label>
                                    <Textarea
                                        placeholder="Any additional information regarding your bid..."
                                        className="text-xs min-h-[100px]"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="bg-muted/10 p-4 -m-6 mt-6 rounded-b-lg flex justify-between items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px]">All fields are mandatory for submission.</span>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setSelectedRFQ(null)}>Cancel</Button>
                            <Button
                                onClick={() => submitBidMutation.mutate({ notes, lines: bidLines })}
                                disabled={!isBidValid || submitBidMutation.isPending}
                                className="gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {submitBidMutation.isPending ? "Submitting..." : "Submit Formal Bid"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
