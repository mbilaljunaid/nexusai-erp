import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Network, Search, ExternalLink, Link as LinkIcon, AlertTriangle, Truck, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DropShipB2BWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isLinkOpen, setIsLinkOpen] = useState(false);
    const [searchPo, setSearchPo] = useState("");
    const [searchSo, setSearchSo] = useState("");

    const { data: orchestrations, isLoading } = useQuery({
        queryKey: ["/api/procurement/dropship"],
        queryFn: async () => {
            // Stub backend data reflecting active Drop Ship / B2B flows
            return [
                { id: "DS-99012", type: "DROP_SHIP", salesOrder: "SO-50541", customer: "Acme Industrial", item: "COMP-SERV-RACK", supplier: "Dell Tech Servers", poNumber: "PO-77412", poStatus: "SHIPPED", soStatus: "AWAITING_RECEIPT" },
                { id: "B2B-44120", type: "BACK_TO_BACK", salesOrder: "SO-50601", customer: "Globex Corp", item: "SPEC-ALLOY-11", supplier: "Global Metals", poNumber: "PO-77488", poStatus: "IN_TRANSIT", soStatus: "AWAITING_SUPPLY" },
                { id: "DS-99015", type: "DROP_SHIP", salesOrder: "SO-50632", customer: "Stark Industries", item: "TURBINE-BLADE-Z", supplier: "AeroParts LLC", poNumber: "PO-77510", poStatus: "OPEN", soStatus: "PO_GENERATED" },
            ];
        }
    });

    const linkMutation = useMutation({
        mutationFn: async () => {
            return new Promise((resolve) => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            setIsLinkOpen(false);
            setSearchPo("");
            setSearchSo("");
            toast({ title: "B2B Orchestration Linked", description: "The Sales Order demand has been successfully hard-pegged to the Purchase Order supply." });
        }
    });

    const getTypeBadge = (type: string) => {
        if (type === "DROP_SHIP") return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800"><Truck className="w-3 h-3 mr-1" /> Drop Ship</Badge>;
        if (type === "BACK_TO_BACK") return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800"><Network className="w-3 h-3 mr-1" /> Back-to-Back</Badge>;
        return <Badge variant="outline">{type}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        if (status === "SHIPPED") return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Shipped (ASN)</Badge>;
        if (status === "IN_TRANSIT") return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">In Transit</Badge>;
        if (status === "AWAITING_RECEIPT") return <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Awaiting Cust Rct</Badge>;
        if (status === "AWAITING_SUPPLY") return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">Awaiting Cross-Dock</Badge>;
        return <Badge variant="secondary">{status}</Badge>;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Drop Ship & B2B Orchestration</h1>
                    <p className="text-muted-foreground mt-1">Monitor supply chain flows where Customer Sales Orders are pegged directly to Supplier Purchase Orders.</p>
                </div>

                <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700"><LinkIcon className="w-4 h-4 mr-2" /> Manual Orchestration Peg</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Network className="w-5 h-5 text-blue-600" /> Hard Peg Demand to Supply</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-4 rounded-md border p-4 bg-muted/10">
                                <Label className="text-blue-700 font-medium flex items-center gap-2">1. Locate Customer Demand</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="Enter Sales Order Number..." value={searchSo} onChange={e => setSearchSo(e.target.value)} />
                                    <Button variant="secondary"><Search className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            <div className="flex justify-center -my-3 relative z-10">
                                <div className="bg-background border rounded-full p-2"><LinkIcon className="w-4 h-4 text-muted-foreground" /></div>
                            </div>

                            <div className="space-y-4 rounded-md border p-4 bg-muted/10">
                                <Label className="text-emerald-700 font-medium flex items-center gap-2">2. Assign Supplier Replenishment</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="Enter Purchase Order Number..." value={searchPo} onChange={e => setSearchPo(e.target.value)} />
                                    <Button variant="secondary"><Search className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex justify-between items-center w-full">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-500" /> Costing will bypass standard inventory valuation.
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsLinkOpen(false)}>Cancel</Button>
                                <Button
                                    disabled={!searchPo || !searchSo || linkMutation.isPending}
                                    onClick={() => linkMutation.mutate()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Establish Link
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-950/20 border-blue-500/20">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-blue-500">Active Drop Ships</div>
                                <div className="text-3xl font-bold">84</div>
                            </div>
                            <Truck className="w-8 h-8 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-950/20 border-emerald-500/20">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-emerald-500">Active B2B Cross-Docks</div>
                                <div className="text-3xl font-bold">12</div>
                            </div>
                            <Network className="w-8 h-8 text-emerald-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Orchestration Hub</CardTitle>
                    <CardDescription>Monitor status mismatches between Supplier execution and Customer expectations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Orchestration ID</TableHead>
                                <TableHead>Flow Type</TableHead>
                                <TableHead>Demanding Sales Order</TableHead>
                                <TableHead>Supplying Purchase Order</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>PO Status</TableHead>
                                <TableHead>SO Line Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orchestrations?.map((orch: any) => (
                                <TableRow key={orch.id}>
                                    <TableCell className="font-mono text-xs">{orch.id}</TableCell>
                                    <TableCell>{getTypeBadge(orch.type)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-blue-600 dark:text-blue-400">{orch.salesOrder}</span>
                                            <span className="text-xs text-muted-foreground">{orch.customer}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{orch.poNumber}</span>
                                            <span className="text-xs text-muted-foreground">{orch.supplier}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">{orch.item}</TableCell>
                                    <TableCell>{getStatusBadge(orch.poStatus)}</TableCell>
                                    <TableCell>{getStatusBadge(orch.soStatus)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4 text-muted-foreground" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && (!orchestrations || orchestrations.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground font-medium">
                                        No active Drop Ship or B2B orchestrations.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
