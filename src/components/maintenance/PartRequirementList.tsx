
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Plus, Package, CheckCircle2, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface PartRequirementListProps {
    workOrderId: string;
}

export default function PartRequirementList({ workOrderId }: PartRequirementListProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newPart, setNewPart] = useState({ inventoryId: "", quantity: 1 });

    // 1. Fetch Materials for Work Order
    const { data: materials, isLoading } = useQuery({
        queryKey: ["/api/maintenance/work-orders", workOrderId, "materials"],
        queryFn: async () => {
            const res = await fetch(`/api/maintenance/work-orders/${workOrderId}/materials`);
            if (!res.ok) throw new Error("Failed to fetch materials");
            return res.json();
        }
    });

    // 2. Fetch Inventory Items (for selection)
    const { data: inventoryItems } = useQuery({
        queryKey: ["/api/inventory/items"],
        queryFn: async () => {
            const res = await fetch("/api/inventory/items");
            if (!res.ok) throw new Error("Failed to fetch inventory items");
            return res.json();
        }
    });

    // 3. Mutation: Add Requirement
    const addPartMutation = useMutation({
        mutationFn: async (data: typeof newPart) => {
            await fetch(`/api/maintenance/work-orders/${workOrderId}/materials`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inventoryId: data.inventoryId,
                    plannedQuantity: data.quantity
                })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders", workOrderId, "materials"] });
            setIsAddOpen(false);
            toast({ title: "Part Added", description: "Requirement added to work order." });
        }
    });

    // 4. Mutation: Issue Part (Consume)
    const issuePartMutation = useMutation({
        mutationFn: async (materialId: string) => {
            await fetch(`/api/maintenance/materials/${materialId}/issue`, {
                method: "POST"
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders", workOrderId, "materials"] });
            toast({ title: "Part Issued", description: "Inventory decremented successfully." });
        }
    });


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Parts & Materials
                </CardTitle>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" /> Add Part
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Part Requirement</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Select Part</Label>
                                <Select onValueChange={(v) => setNewPart({ ...newPart, inventoryId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Search inventory..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {inventoryItems?.map((item: any) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.itemNumber} - {item.description} ({item.quantityOnHand} OH)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    value={newPart.quantity}
                                    onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) })}
                                />
                            </div>
                            <Button onClick={() => addPartMutation.mutate(newPart)} disabled={!newPart.inventoryId}>
                                Add to Work Order
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {materials && materials.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-center">Issued</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials.map((mat: any) => (
                                <TableRow key={mat.id}>
                                    <TableCell>
                                        <div className="font-medium">{mat.item?.itemNumber || "Unknown Item"}</div>
                                        <div className="text-xs text-muted-foreground">{mat.item?.description}</div>
                                    </TableCell>
                                    <TableCell className="text-center">{mat.plannedQuantity}</TableCell>
                                    <TableCell className="text-center">
                                        {mat.actualQuantity > 0 ? (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                                                {mat.actualQuantity} Issued
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {mat.actualQuantity < mat.plannedQuantity ? (
                                            <Button size="sm" onClick={() => issuePartMutation.mutate(mat.id)}>
                                                Issue
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" disabled>
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p>No parts required yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
