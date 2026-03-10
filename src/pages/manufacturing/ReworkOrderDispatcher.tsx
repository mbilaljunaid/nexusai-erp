import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wrench, RefreshCw, AlertTriangle, Send, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdHocMaterial {
    itemId: string;
    quantity: number;
}

export default function ReworkOrderDispatcher() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDispatchOpen, setIsDispatchOpen] = useState(false);
    const [reworkTarget, setReworkTarget] = useState("");
    const [defectCode, setDefectCode] = useState("");
    const [routingType, setRoutingType] = useState("AD_HOC");
    const [materials, setMaterials] = useState<AdHocMaterial[]>([]);

    const { data: activeReworkOrders, isLoading } = useQuery({
        queryKey: ["/api/manufacturing/rework-orders"],
        queryFn: async () => {
            // Stub backend
            return [
                { id: "WO-RWK-9001", item: "Engine Block V8", defect: "DEF-POROSITY", routing: "Standard Rework Router 2", status: "IN_PROGRESS", priority: 1, date: "2026-03-09" },
                { id: "WO-RWK-9002", item: "Transmission Housing", defect: "DEF-CRACK", routing: "Ad-hoc (Weld & Grind)", status: "RELEASED", priority: 2, date: "2026-03-08" },
            ];
        }
    });

    const { data: inventory = [] } = useQuery({
        queryKey: ["/api/inventory/items-list"],
        queryFn: async () => {
            return [
                { id: "ITEM-A1", itemName: "Engine Block V8", sku: "ENG-V8" },
                { id: "ITEM-A2", itemName: "Transmission Housing", sku: "TRN-HSG" },
                { id: "MAT-WELD", itemName: "Welding Wire 0.8mm", sku: "WLD-08" },
                { id: "MAT-SEAL", itemName: "Industrial Sealant", sku: "SEA-IND" },
            ];
        }
    });

    const dispatchMutation = useMutation({
        mutationFn: async () => {
            return new Promise(resolve => setTimeout(resolve, 1000));
        },
        onSuccess: () => {
            toast({ title: "Rework Order Dispatched", description: "Non-standard work order has been released to the shop floor." });
            setIsDispatchOpen(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setReworkTarget("");
        setDefectCode("");
        setRoutingType("AD_HOC");
        setMaterials([]);
    };

    const addMaterial = () => setMaterials([...materials, { itemId: "", quantity: 1 }]);

    const updateMaterial = (index: number, field: keyof AdHocMaterial, value: any) => {
        const updated = [...materials];
        updated[index] = { ...updated[index], [field]: value };
        setMaterials(updated);
    };

    const removeMaterial = (index: number) => setMaterials(materials.filter((_, i) => i !== index));

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rework & Non-Standard WIP</h1>
                    <p className="text-muted-foreground mt-1">Dispatch ad-hoc work orders without standard BOM requirements for repair, tear-down, and rework.</p>
                </div>

                <Dialog open={isDispatchOpen} onOpenChange={setIsDispatchOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <Wrench className="w-4 h-4 mr-2" /> Dispatch Rework Order
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5 text-orange-600" /> Create Non-Standard Work Order</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Target Assembly / Item</Label>
                                <Select value={reworkTarget} onValueChange={setReworkTarget}>
                                    <SelectTrigger><SelectValue placeholder="Select defective item" /></SelectTrigger>
                                    <SelectContent>
                                        {inventory.filter((i: any) => i.id.startsWith("ITEM")).map((i: any) => (
                                            <SelectItem key={i.id} value={i.id}>{i.itemName} ({i.sku})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Defect Code / Reason</Label>
                                <Select value={defectCode} onValueChange={setDefectCode}>
                                    <SelectTrigger><SelectValue placeholder="Reason for rework" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DEF-POROSITY">Casting Porosity</SelectItem>
                                        <SelectItem value="DEF-CRACK">Hairline Crack</SelectItem>
                                        <SelectItem value="DEF-TOLERANCE">Out of Dimensional Tolerance</SelectItem>
                                        <SelectItem value="DEF-QA_FAIL">General QA Rejection</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 col-span-2 border-t pt-4">
                                <Label>Routing Strategy</Label>
                                <Select value={routingType} onValueChange={setRoutingType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AD_HOC">Ad-Hoc / Manual Operations Routing</SelectItem>
                                        <SelectItem value="STD_REWORK_1">Standard Rework Router (Weld & Grind)</SelectItem>
                                        <SelectItem value="STD_TEARDOWN">Complete Teardown & Salvage Router</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 col-span-2 border-t pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <Label>Ad-Hoc Material Issuance (Optional)</Label>
                                    <Button variant="outline" size="sm" onClick={addMaterial}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                                </div>
                                {materials.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">No specific materials required. Dispatch order as labor-only routing.</p>
                                )}
                                {materials.map((mat, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Select value={mat.itemId} onValueChange={(v) => updateMaterial(idx, "itemId", v)}>
                                            <SelectTrigger className="flex-1"><SelectValue placeholder="Select material" /></SelectTrigger>
                                            <SelectContent>
                                                {inventory.filter((i: any) => i.id.startsWith("MAT")).map((i: any) => (
                                                    <SelectItem key={i.id} value={i.id}>{i.itemName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" className="w-24" value={mat.quantity} onChange={e => updateMaterial(idx, "quantity", parseFloat(e.target.value) || 0)} placeholder="Qty" />
                                        <Button variant="ghost" size="icon" onClick={() => removeMaterial(idx)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDispatchOpen(false)}>Cancel</Button>
                            <Button disabled={!reworkTarget || !defectCode || dispatchMutation.isPending} onClick={() => dispatchMutation.mutate()} className="bg-orange-600 hover:bg-orange-700">
                                <Send className="w-4 h-4 mr-2" /> Dispatch to Floor
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-orange-950/20 border-orange-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-orange-500 mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            <div className="font-semibold text-sm">Active Rework</div>
                        </div>
                        <div className="text-3xl font-bold">12</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Non-Standard Work Orders</CardTitle>
                    <CardDescription>Monitor the progress of defective ad-hoc repair jobs escaping standard MRP logic.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Work Order ID</TableHead>
                                <TableHead>Defective Item</TableHead>
                                <TableHead>Defect / Reason</TableHead>
                                <TableHead>Routing / Strategy</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeReworkOrders?.map((ro: any) => (
                                <TableRow key={ro.id}>
                                    <TableCell className="font-medium text-orange-600 dark:text-orange-400">{ro.id}</TableCell>
                                    <TableCell>{ro.item}</TableCell>
                                    <TableCell>{ro.defect}</TableCell>
                                    <TableCell>{ro.routing}</TableCell>
                                    <TableCell>
                                        {ro.priority === 1 ? <Badge variant="destructive">Urgent</Badge> : <Badge variant="secondary">Normal</Badge>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ro.status === "IN_PROGRESS" ? "default" : "outline"}>
                                            {ro.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
