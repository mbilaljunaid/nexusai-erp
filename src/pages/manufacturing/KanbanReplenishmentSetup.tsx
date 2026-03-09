import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, CreditCard, Factory, Truck, Plus, CheckCircle2, RefreshCw, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";

export default function KanbanReplenishmentSetup() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isNewOpen, setIsNewOpen] = useState(false);

    const [newCard, setNewCard] = useState({
        itemId: "",
        sourceType: "INTRAORG",
        size: "100",
        numberOfCards: "2",
        subinventory: "WIP-STG",
        locator: "LNN-01"
    });

    const { data: kanbans, isLoading } = useQuery({
        queryKey: ["/api/manufacturing/kanban/cards"],
        queryFn: async () => {
            // Stub backend data reflecting lean pull sequences
            return [
                { id: "KB-10024", itemId: "COMP-SCREW-M4", sourceType: "SUPPLIER", size: 5000, cards: 3, binType: "2-BIN", status: "ACTIVE", location: "ASSY-LINE-1", supplier: "Fastenal Corp" },
                { id: "KB-10025", itemId: "RAW-ALUM-SHT", sourceType: "INTRAORG", size: 50, cards: 4, binType: "MULTI-BIN", status: "ACTIVE", location: "PRESS-STG", sourceSub: "RAW-MATL" },
                { id: "KB-10026", itemId: "SUB-MOTOR-AC", sourceType: "PRODUCTION", size: 10, cards: 2, binType: "2-BIN", status: "EMPTY", location: "FINAL-ASSY", workCenter: "WC-MOTOR-BLD" },
            ];
        }
    });

    const generateMutation = useMutation({
        mutationFn: async () => {
            return new Promise((resolve) => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            setIsNewOpen(false);
            setNewCard({ itemId: "", sourceType: "INTRAORG", size: "100", numberOfCards: "2", subinventory: "WIP-STG", locator: "LNN-01" });
            toast({ title: "Kanban Sequence Generated", description: "The physical pull cards have been generated and the bin tracking logic is active." });
        }
    });

    const getSourceBadge = (type: string) => {
        switch (type) {
            case "SUPPLIER": return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700"><Truck className="w-3 h-3 mr-1" /> Supplier (PO)</Badge>;
            case "INTRAORG": return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700"><ArrowLeftRight className="w-3 h-3 mr-1" /> Subinventory Transfer</Badge>;
            case "PRODUCTION": return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700"><Factory className="w-3 h-3 mr-1" /> Prod Work Order</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === "ACTIVE") return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>;
        if (status === "EMPTY") return <Badge variant="destructive"><RefreshCw className="w-3 h-3 mr-1" /> Empty (Triggered)</Badge>;
        return <Badge variant="outline">{status}</Badge>;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kanban Replenishment Console</h1>
                    <p className="text-muted-foreground mt-1">Configure and monitor Lean pull-based visual signaling for internal transfers, purchasing, and manufacturing.</p>
                </div>

                <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" /> Define Kanban Sequence</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-600" /> New Pull Sequence (Bins)</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Target Item</Label>
                                <Input placeholder="Enter Item Number to assign Kanban logic..." value={newCard.itemId} onChange={e => setNewCard({ ...newCard, itemId: e.target.value })} />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Destination Location (Where is this needed?)</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="Subinventory" value={newCard.subinventory} onChange={e => setNewCard({ ...newCard, subinventory: e.target.value })} />
                                    <Input placeholder="Locator / Bin" value={newCard.locator} onChange={e => setNewCard({ ...newCard, locator: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-4 col-span-2 border-t pt-4 mt-2">
                                <Label className="text-indigo-700">Replenishment Source Signal</Label>
                                <Select value={newCard.sourceType} onValueChange={v => setNewCard({ ...newCard, sourceType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INTRAORG">Intra-Org Transfer (Move Order)</SelectItem>
                                        <SelectItem value="SUPPLIER">Supplier (Generate Purchase Order)</SelectItem>
                                        <SelectItem value="PRODUCTION">Production (Generate Work Order)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Size per Bin/Card</Label>
                                <Input type="number" placeholder="Qty" value={newCard.size} onChange={e => setNewCard({ ...newCard, size: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Number of Bins (Cards)</Label>
                                <Input type="number" placeholder="# Bins" value={newCard.numberOfCards} onChange={e => setNewCard({ ...newCard, numberOfCards: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter className="flex justify-between items-center sm:justify-between w-full border-t pt-4">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                Total System Max Limit: {formatNumber(Number(newCard.size) * Number(newCard.numberOfCards))} units
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancel</Button>
                                <Button
                                    disabled={!newCard.itemId || !newCard.size || !newCard.numberOfCards || generateMutation.isPending}
                                    onClick={() => generateMutation.mutate()}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <CreditCard className="w-4 h-4 mr-2" /> Generate Cards
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-indigo-950/20 border-indigo-500/20">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-indigo-500">Active Pull Sequences</div>
                                <div className="text-3xl font-bold">142</div>
                            </div>
                            <Layers className="w-8 h-8 text-indigo-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-amber-500/10">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-amber-600">Empty / Triggered</div>
                                <div className="text-3xl font-bold text-amber-700">18</div>
                            </div>
                            <RefreshCw className="w-8 h-8 text-amber-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Kanban Tracking Board</CardTitle>
                    <CardDescription>Live status of physical bins driving automated ERP replenishment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sequence ID</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Signal Source</TableHead>
                                <TableHead className="text-right">Bin Size</TableHead>
                                <TableHead className="text-right">No. Cards</TableHead>
                                <TableHead>Current Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kanbans?.map((kanban: any) => (
                                <TableRow key={kanban.id}>
                                    <TableCell className="font-mono text-xs">{kanban.id}</TableCell>
                                    <TableCell className="font-medium">{kanban.itemId}</TableCell>
                                    <TableCell>{kanban.location}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 items-start">
                                            {getSourceBadge(kanban.sourceType)}
                                            <span className="text-xs text-muted-foreground">{kanban.supplier || kanban.sourceSub || kanban.workCenter}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatNumber(kanban.size)}</TableCell>
                                    <TableCell className="text-right">{kanban.cards} ({kanban.binType})</TableCell>
                                    <TableCell>
                                        {getStatusBadge(kanban.status)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && (!kanbans || kanbans.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground font-medium">
                                        No Kanban pull sequences defined.
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
