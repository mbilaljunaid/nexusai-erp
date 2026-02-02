
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gavel, Plus, Search, Calendar, ChevronRight, FileText, CheckCircle2, Trophy, Eye, Brain, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SourcingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
    const [newRFQ, setNewRFQ] = useState({
        title: "",
        description: "",
        closeDate: "",
        lines: [{ itemDescription: "", targetQuantity: "", unitOfMeasure: "EA" }]
    });

    const { data: rfqs, isLoading: isLoadingRfqs } = useQuery({
        queryKey: ["/api/sourcing/rfqs"],
        initialData: []
    }) as any;

    const { data: rfqDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: [`/api/sourcing/rfqs/${selectedRFQ?.id}`],
        enabled: !!selectedRFQ
    }) as any;

    const { data: bidsComparison } = useQuery({
        queryKey: [`/api/sourcing/rfqs/${selectedRFQ?.id}/compare-bids`],
        enabled: !!selectedRFQ && (selectedRFQ?.status === 'PUBLISHED' || selectedRFQ?.status === 'EVALUATING' || selectedRFQ?.status === 'AWARDED')
    }) as any;

    const { data: rfqAnalysis } = useQuery({
        queryKey: [`/api/sourcing/rfqs/${selectedRFQ?.id}/analysis`],
        enabled: !!selectedRFQ && (selectedRFQ?.status === 'PUBLISHED' || selectedRFQ?.status === 'EVALUATING')
    }) as any;

    const createRFQMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/sourcing/rfqs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create RFQ");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "RFQ Created", description: "Strategic sourcing event initialized as draft." });
            queryClient.invalidateQueries({ queryKey: ["/api/sourcing/rfqs"] });
            setIsCreateModalOpen(false);
            setNewRFQ({ title: "", description: "", closeDate: "", lines: [{ itemDescription: "", targetQuantity: "", unitOfMeasure: "EA" }] });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    const publishRFQMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/sourcing/rfqs/${id}/publish`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to publish RFQ");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "RFQ Published", description: "Visibility enabled for all qualified suppliers." });
            queryClient.invalidateQueries({ queryKey: ["/api/sourcing/rfqs"] });
            setSelectedRFQ(null);
        }
    });

    const awardRFQMutation = useMutation({
        mutationFn: async (bidId: string) => {
            const res = await fetch(`/api/sourcing/rfqs/${selectedRFQ?.id}/award`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bidId })
            });
            if (!res.ok) throw new Error("Awarding failed");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "RFQ Awarded", description: "Contract draft has been generated for the winner." });
            queryClient.invalidateQueries({ queryKey: ["/api/sourcing/rfqs"] });
            setSelectedRFQ(null);
        }
    });

    const addLine = () => {
        setNewRFQ({ ...newRFQ, lines: [...newRFQ.lines, { itemDescription: "", targetQuantity: "", unitOfMeasure: "EA" }] });
    };

    if (isLoadingRfqs) return <div className="p-8">Loading sourcing events...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-primary" /> Negotiation & Sourcing
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Manage RFQs, evaluate bids, and optimize procurement value.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Create RFQ
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-[10px] font-bold uppercase tracking-wider">RFQ Number</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Title</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Close Date</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rfqs?.map((rfq: any) => (
                                <TableRow key={rfq.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setSelectedRFQ(rfq)}>
                                    <TableCell className="font-mono text-xs font-medium text-primary">{rfq.rfqNumber}</TableCell>
                                    <TableCell className="text-xs font-semibold">{rfq.title}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={rfq.status === 'PUBLISHED' ? 'default' : rfq.status === 'AWARDED' ? 'outline' : 'secondary'}
                                            className="text-[10px] px-2 py-0 h-5"
                                        >
                                            {rfq.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[11px] text-muted-foreground">
                                        {rfq.closeDate ? new Date(rfq.closeDate).toLocaleDateString() : 'No Limit'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Create RFQ Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>New Sourcing Event (RFQ)</DialogTitle>
                        <DialogDescription>Define line items and bidding parameters.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">RFQ Title</Label>
                                <Input placeholder="e.g. Annual IT Hardware Supply" value={newRFQ.title} onChange={e => setNewRFQ({ ...newRFQ, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Close Date</Label>
                                <Input type="date" value={newRFQ.closeDate} onChange={e => setNewRFQ({ ...newRFQ, closeDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Description</Label>
                            <Textarea placeholder="Detailed sourcing requirements..." value={newRFQ.description} onChange={e => setNewRFQ({ ...newRFQ, description: e.target.value })} />
                        </div>
                        <div className="pt-4 border-t">
                            <div className="flex justify-between items-center mb-4">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Line Items</Label>
                                <Button variant="outline" size="sm" onClick={addLine} className="h-7 text-[10px] gap-1">
                                    <Plus className="w-3 h-3" /> Add Line
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {newRFQ.lines.map((line, idx) => (
                                    <div key={idx} className="flex gap-3 items-end">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-[10px]">Item Description</Label>
                                            <Input
                                                className="h-8 text-xs"
                                                value={line.itemDescription}
                                                onChange={e => {
                                                    const lines = [...newRFQ.lines];
                                                    lines[idx].itemDescription = e.target.value;
                                                    setNewRFQ({ ...newRFQ, lines });
                                                }}
                                            />
                                        </div>
                                        <div className="w-24 space-y-2">
                                            <Label className="text-[10px]">Qty</Label>
                                            <Input
                                                type="number"
                                                className="h-8 text-xs"
                                                value={line.targetQuantity}
                                                onChange={e => {
                                                    const lines = [...newRFQ.lines];
                                                    lines[idx].targetQuantity = e.target.value;
                                                    setNewRFQ({ ...newRFQ, lines });
                                                }}
                                            />
                                        </div>
                                        <div className="w-20 space-y-2">
                                            <Label className="text-[10px]">UOM</Label>
                                            <Input
                                                className="h-8 text-xs"
                                                value={line.unitOfMeasure}
                                                onChange={e => {
                                                    const lines = [...newRFQ.lines];
                                                    lines[idx].unitOfMeasure = e.target.value;
                                                    setNewRFQ({ ...newRFQ, lines });
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => createRFQMutation.mutate(newRFQ)} disabled={!newRFQ.title || newRFQ.lines.length === 0}>Create Draft</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* RFQ Details & Evaluation Modal */}
            <Dialog open={!!selectedRFQ} onOpenChange={() => setSelectedRFQ(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh]">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-8">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="font-mono text-[10px]">{selectedRFQ?.rfqNumber}</Badge>
                                <DialogTitle>{selectedRFQ?.title}</DialogTitle>
                            </div>
                            {selectedRFQ?.status === 'DRAFT' && (
                                <Button size="sm" onClick={() => publishRFQMutation.mutate(selectedRFQ.id)}>
                                    Publish RFQ
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    <Tabs defaultValue="details" className="mt-4">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="details">RFQ Details</TabsTrigger>
                            <TabsTrigger value="evaluation">Bid Evaluation</TabsTrigger>
                            <TabsTrigger value="ai-insights" className="gap-2"><Brain className="w-3 h-3" /> AI Insights</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="mt-4 space-y-6">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="col-span-1 space-y-4 border-r pr-6">
                                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Header Stats</h4>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-muted-foreground">Status</span>
                                            <Badge variant="secondary" className="w-fit">{selectedRFQ?.status}</Badge>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Closing</span>
                                            <span className="text-sm font-medium">{selectedRFQ?.closeDate ? new Date(selectedRFQ.closeDate).toLocaleDateString() : 'OPEN'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-muted-foreground">Total Bids</span>
                                            <span className="text-sm font-bold text-primary">{rfqDetails?.bids?.length || 0} Suppliers responded</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-4">Line Requirements</h4>
                                    <ScrollArea className="h-[300px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-[10px]">#</TableHead>
                                                    <TableHead className="text-[10px]">Description</TableHead>
                                                    <TableHead className="text-[10px]">Target Qty</TableHead>
                                                    <TableHead className="text-[10px]">UOM</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rfqDetails?.lines?.map((line: any) => (
                                                    <TableRow key={line.id}>
                                                        <TableCell className="text-xs text-muted-foreground">{line.lineNumber}</TableCell>
                                                        <TableCell className="text-xs font-medium">{line.itemDescription}</TableCell>
                                                        <TableCell className="text-xs font-bold">{Number(line.targetQuantity).toLocaleString()}</TableCell>
                                                        <TableCell className="text-xs">{line.unitOfMeasure}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="evaluation" className="mt-4">
                            {rfqDetails?.status === 'DRAFT' ? (
                                <div className="text-center py-20 bg-muted/10 border-2 border-dashed rounded-xl">
                                    <Gavel className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <h3 className="text-sm font-bold">Publish RFQ to receive bids</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Bids will appear here once suppliers respond.</p>
                                </div>
                            ) : (
                                <ScrollArea className="h-[450px]">
                                    <div className="space-y-4">
                                        {bidsComparison?.map((bid: any) => (
                                            <Card key={bid.id} className={`border-2 transition-colors ${bid.bidStatus === 'AWARDED' ? 'border-primary bg-primary/5' : 'hover:border-primary/20'}`}>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-bold">Supplier: {bid.supplierId}</h4>
                                                                {bid.bidStatus === 'AWARDED' && <Trophy className="w-4 h-4 text-primary" />}
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground">Submitted: {new Date(bid.submissionDate).toLocaleString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-primary">${bid.totalBidAmount.toLocaleString()}</p>
                                                            {selectedRFQ?.status === 'PUBLISHED' && (
                                                                <Button size="sm" variant="default" className="h-7 text-[10px]" onClick={() => awardRFQMutation.mutate(bid.id)}>
                                                                    Award Contract
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/50 rounded-lg border overflow-hidden">
                                                        <Table>
                                                            <TableHeader className="bg-muted/30">
                                                                <TableRow>
                                                                    <TableHead className="text-[9px] h-7 uppercase">Item</TableHead>
                                                                    <TableHead className="text-[9px] h-7 uppercase text-center">Qty</TableHead>
                                                                    <TableHead className="text-[9px] h-7 uppercase text-right">Price</TableHead>
                                                                    <TableHead className="text-[9px] h-7 uppercase text-right">Subtotal</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {bid.lines?.map((line: any) => (
                                                                    <TableRow key={line.id}>
                                                                        <TableCell className="text-[10px] py-1.5">{rfqDetails?.lines?.find((rl: any) => rl.id === line.rfqLineId)?.itemDescription}</TableCell>
                                                                        <TableCell className="text-[10px] py-1.5 text-center">{line.offeredQuantity}</TableCell>
                                                                        <TableCell className="text-[10px] py-1.5 text-right">${line.offeredPrice}</TableCell>
                                                                        <TableCell className="text-[10px] py-1.5 text-right font-semibold">${(Number(line.offeredPrice) * Number(line.offeredQuantity)).toLocaleString()}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </TabsContent>

                        <TabsContent value="ai-insights" className="mt-4">
                            {!rfqAnalysis || rfqAnalysis.totalBids === 0 ? (
                                <div className="text-center py-20 bg-muted/10 border-2 border-dashed rounded-xl">
                                    <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <h3 className="text-sm font-bold">No data for AI Analysis</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Wait for suppliers to submit bids.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-4 gap-4">
                                        <Card className="bg-blue-50/50 border-blue-100">
                                            <CardContent className="p-4">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Lowest Bid</p>
                                                <p className="text-2xl font-bold text-blue-700">${rfqAnalysis.lowestBid.toLocaleString()}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-indigo-50/50 border-indigo-100">
                                            <CardContent className="p-4">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Average Bid</p>
                                                <p className="text-2xl font-bold text-indigo-700">${rfqAnalysis.averageBid.toLocaleString()}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-amber-50/50 border-amber-100">
                                            <CardContent className="p-4">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Price Variance</p>
                                                <p className="text-2xl font-bold text-amber-700">
                                                    {((rfqAnalysis.highestBid - rfqAnalysis.lowestBid) / rfqAnalysis.lowestBid * 100).toFixed(1)}%
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-purple-50/50 border-purple-100">
                                            <CardContent className="p-4">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Est. Savings</p>
                                                <p className="text-2xl font-bold text-purple-700">
                                                    ${(rfqAnalysis.averageBid - rfqAnalysis.lowestBid).toLocaleString()}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <Card className="border-red-100 shadow-sm">
                                            <CardHeader className="pb-2 bg-red-50/30">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700">
                                                    <AlertTriangle className="w-4 h-4" /> Risk Analysis
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="text-[10px] h-8">Supplier</TableHead>
                                                            <TableHead className="text-[10px] h-8">Flags</TableHead>
                                                            <TableHead className="text-[10px] h-8 text-right">Risk Score</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {rfqAnalysis.riskAnalysis.filter((r: any) => r.riskScore > 0).length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-8">
                                                                    No significant risks detected by AI.
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            rfqAnalysis.riskAnalysis
                                                                .filter((r: any) => r.riskScore > 0)
                                                                .map((risk: any) => (
                                                                    <TableRow key={risk.bidId}>
                                                                        <TableCell className="text-xs font-medium">{risk.supplierId}</TableCell>
                                                                        <TableCell>
                                                                            <div className="flex gap-1 flex-wrap">
                                                                                {risk.flags.map((flag: string, i: number) => (
                                                                                    <Badge key={i} variant="destructive" className="text-[9px] px-1 py-0 h-4">{flag}</Badge>
                                                                                ))}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-xs font-bold text-right text-red-600">{risk.riskScore}/100</TableCell>
                                                                    </TableRow>
                                                                ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-green-100 shadow-sm">
                                            <CardHeader className="pb-2 bg-green-50/30">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-700">
                                                    <CheckCircle2 className="w-4 h-4" /> AI Recommendation
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 space-y-4">
                                                {(() => {
                                                    // Simple recommendation logic: Lowest price with Risk Score < 20
                                                    const bestBid = bidsComparison
                                                        ?.filter((b: any) => {
                                                            const analysis = rfqAnalysis.riskAnalysis.find((r: any) => r.bidId === b.id);
                                                            return !analysis || analysis.riskScore < 20;
                                                        })
                                                        .sort((a: any, b: any) => a.totalBidAmount - b.totalBidAmount)[0];

                                                    if (!bestBid) return <p className="text-sm text-muted-foreground">AI could not find a low-risk recommendation.</p>;

                                                    return (
                                                        <>
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-green-100 p-2 rounded-full">
                                                                    <Trophy className="w-5 h-5 text-green-700" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground uppercase font-bold">Top Candidate</p>
                                                                    <p className="text-lg font-bold">{bestBid.supplierId}</p>
                                                                </div>
                                                            </div>
                                                            <div className="bg-muted/30 p-3 rounded text-xs space-y-1">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Total Bid:</span>
                                                                    <span className="font-bold">${bestBid.totalBidAmount.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Savings vs Avg:</span>
                                                                    <span className="font-bold text-green-600">
                                                                        ${(rfqAnalysis.averageBid - bestBid.totalBidAmount).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => awardRFQMutation.mutate(bestBid.id)}>
                                                                Award to {bestBid.supplierId}
                                                            </Button>
                                                        </>
                                                    );
                                                })()}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div >
    );
}
