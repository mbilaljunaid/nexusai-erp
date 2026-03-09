import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Weight, Boxes, Save, RefreshCw, AlertCircle, Plus, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";

export default function CatchWeightEntry() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isEntryOpen, setIsEntryOpen] = useState(false);

    const [entryData, setEntryData] = useState({
        itemId: "",
        lotNumber: "",
        primaryQty: "",
        secondaryQty: "",
        primaryUom: "CASE",
        secondaryUom: "LBS"
    });

    const { data: inventory, isLoading } = useQuery({
        queryKey: ["/api/inventory/onhand/catch-weight"],
        queryFn: async () => {
            // Stub backend data reflecting dual UOMs
            return [
                { id: "LOT-BEEF-001", itemId: "ITM-CHUCK-ROAST", description: "Select Beef Chuck Roast (Variable Box)", primaryUom: "CASE", primaryQty: 10, secondaryUom: "LBS", secondaryQty: 805.5, nominalConversion: 80, locator: "A1-02-B" },
                { id: "LOT-PLTY-411", itemId: "ITM-CHKN-BRST", description: "Boneless Chicken Breasts (Bulk)", primaryUom: "CASE", primaryQty: 45, secondaryUom: "LBS", secondaryQty: 2260.2, nominalConversion: 50, locator: "B2-COLD" },
                { id: "LOT-FISH-773", itemId: "ITM-SLMN-WHL", description: "Whole Atlantic Salmon", primaryUom: "EACH", primaryQty: 120, secondaryUom: "LBS", secondaryQty: 1450.8, nominalConversion: 12, locator: "F1-FREEZE" },
            ];
        }
    });

    const recordMutation = useMutation({
        mutationFn: async () => {
            // Simulate physical measurement DB commit
            return new Promise((resolve) => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            setIsEntryOpen(false);
            setEntryData({ itemId: "", lotNumber: "", primaryQty: "", secondaryQty: "", primaryUom: "CASE", secondaryUom: "LBS" });
            toast({ title: "Catch Weight Recorded", description: "The variable conversion metrics have been synchronized with the on-hand balances." });
        }
    });

    const getVarianceWarning = (primary: number, secondary: number, nominal: number) => {
        if (!primary || !secondary || !nominal) return null;
        const expected = primary * nominal;
        const variance = Math.abs((secondary - expected) / expected) * 100;

        if (variance > 10) return <Badge variant="destructive">High Variance ({variance.toFixed(1)}%)</Badge>;
        if (variance > 5) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Review Required</Badge>;
        return <Badge variant="outline" className="text-green-600 bg-green-50">Standard Tolerance</Badge>;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Catch Weight Management</h1>
                    <p className="text-muted-foreground mt-1">Record accurate variable secondary units (Lot / Weight) during warehousing routines.</p>
                </div>

                <Dialog open={isEntryOpen} onOpenChange={setIsEntryOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700"><Weight className="w-4 h-4 mr-2" /> Log Catch Weight Result</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Boxes className="w-5 h-5 text-emerald-600" /> Enter Dimensional Weigh-In</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Target Item</Label>
                                <Select value={entryData.itemId} onValueChange={v => setEntryData({ ...entryData, itemId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select Catch Weight Item..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ITM-CHUCK-ROAST">ITM-CHUCK-ROAST - Beef Chuck (Boxed)</SelectItem>
                                        <SelectItem value="ITM-CHKN-BRST">ITM-CHKN-BRST - Chicken Breast</SelectItem>
                                        <SelectItem value="ITM-SLMN-WHL">ITM-SLMN-WHL - Whole Salmon</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label>Receiving Lot / Serial</Label>
                                <Input placeholder="Scan barcode or type lot number..." value={entryData.lotNumber} onChange={e => setEntryData({ ...entryData, lotNumber: e.target.value })} />
                            </div>

                            <div className="space-y-4 col-span-2 border rounded-md p-4 bg-muted/20 mt-2">
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <div className="space-y-2">
                                        <Label>Primary Quantity (Logistical)</Label>
                                        <div className="flex gap-2">
                                            <Input type="number" placeholder="0" value={entryData.primaryQty} onChange={e => setEntryData({ ...entryData, primaryQty: e.target.value })} />
                                            <Select value={entryData.primaryUom} onValueChange={v => setEntryData({ ...entryData, primaryUom: v })}>
                                                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CASE">CASE</SelectItem>
                                                    <SelectItem value="EACH">EACH</SelectItem>
                                                    <SelectItem value="PALLET">PALLET</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1 text-emerald-700 font-medium">Secondary Quantity (Pricing) <Weight className="w-3 h-3" /></Label>
                                        <div className="flex gap-2">
                                            <Input type="number" placeholder="0.00" value={entryData.secondaryQty} onChange={e => setEntryData({ ...entryData, secondaryQty: e.target.value })} className="border-emerald-200 focus-visible:ring-emerald-500" />
                                            <Select value={entryData.secondaryUom} onValueChange={v => setEntryData({ ...entryData, secondaryUom: v })}>
                                                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LBS">LBS</SelectItem>
                                                    <SelectItem value="KG">KG</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Costing will calculate based on Secondary Qty.
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsEntryOpen(false)}>Cancel</Button>
                                <Button
                                    disabled={!entryData.itemId || !entryData.primaryQty || !entryData.secondaryQty || recordMutation.isPending}
                                    onClick={() => recordMutation.mutate()}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {recordMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Commit Transfer
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-950/20 border-emerald-500/20">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-emerald-500">Dual UOM Lots Active</div>
                                <div className="text-3xl font-bold">482</div>
                            </div>
                            <Boxes className="w-8 h-8 text-emerald-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Variable Conversion Balances (On-Hand)</CardTitle>
                    <CardDescription>Review inventory items where the primary stocking unit deviates from the exact secondary pricing mass.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item / Description</TableHead>
                                <TableHead>Lot Number</TableHead>
                                <TableHead>Locator</TableHead>
                                <TableHead className="text-right">Primary (Stock)</TableHead>
                                <TableHead className="text-right border-l bg-muted/10">Exactly Weighed (Price)</TableHead>
                                <TableHead className="text-right">Avg Conversion</TableHead>
                                <TableHead>Tolerance Check</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory?.map((inv: any) => {
                                const actualAvg = (inv.secondaryQty / inv.primaryQty) || 0;
                                return (
                                    <TableRow key={inv.id}>
                                        <TableCell>
                                            <div className="font-medium text-sm">{inv.itemId}</div>
                                            <div className="text-xs text-muted-foreground">{inv.description}</div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                                        <TableCell>{inv.locator}</TableCell>
                                        <TableCell className="text-right">
                                            <span className="font-semibold">{formatNumber(inv.primaryQty)}</span> <span className="text-xs text-muted-foreground">{inv.primaryUom}</span>
                                        </TableCell>
                                        <TableCell className="text-right border-l bg-muted/10">
                                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatNumber(inv.secondaryQty)}</span> <span className="text-xs text-muted-foreground">{inv.secondaryUom}</span>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                            {formatNumber(actualAvg)} {inv.secondaryUom}/{inv.primaryUom}
                                        </TableCell>
                                        <TableCell>
                                            {getVarianceWarning(inv.primaryQty, inv.secondaryQty, inv.nominalConversion)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {!isLoading && (!inventory || inventory.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground font-medium">
                                        No variable conversion units in physical inventory.
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
