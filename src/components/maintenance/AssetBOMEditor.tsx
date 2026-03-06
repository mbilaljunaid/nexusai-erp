
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, AlertCircle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface AssetBOMEditorProps {
    assetId: string;
}

export default function AssetBOMEditor({ assetId }: AssetBOMEditorProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newItem, setNewItem] = useState({ inventoryId: "", quantity: 1, isCritical: false });

    // 1. Fetch BOM
    const { data: bomParts, isLoading } = useQuery({
        queryKey: ["/api/maintenance/assets", assetId, "bom"],
        queryFn: async () => {
            // Mock data until API is wired
            // return fetch(`/api/maintenance/assets/${assetId}/bom`).then(r => r.json());
            return [
                { id: "1", inventoryId: "INV-001", itemNumber: "BRG-6205", description: "Ball Bearing", quantity: 2, isCritical: true },
                { id: "2", inventoryId: "INV-002", itemNumber: "FLT-AIR-05", description: "Air Filter", quantity: 1, isCritical: false }
            ];
        }
    });

    // 2. Add Part Mutation (Mock)
    const addMutation = useMutation({
        mutationFn: async (data: any) => {
            console.log("Adding BOM Item", data);
            // await fetch...
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/assets", assetId, "bom"] });
            setIsAddOpen(false);
            toast({ title: "Part Added", description: "Asset BOM updated." });
        }
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Bill of Materials</CardTitle>
                    <CardDescription>Spare parts definition for this asset</CardDescription>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" /> Add Part
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add Spare Part</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Item ID / SKU</Label>
                                <Input
                                    placeholder="Scan or type Item ID"
                                    value={newItem.inventoryId}
                                    onChange={e => setNewItem({ ...newItem, inventoryId: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Quantity Required</Label>
                                <Input
                                    type="number"
                                    value={newItem.quantity}
                                    onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                />
                            </div>
                            {/* Checkbox for critical would go here */}
                            <Button onClick={() => addMutation.mutate(newItem)}>Add to BOM</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item #</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Critical</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bomParts?.map((part: any) => (
                            <TableRow key={part.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    {part.itemNumber}
                                </TableCell>
                                <TableCell>{part.description}</TableCell>
                                <TableCell>{part.quantity}</TableCell>
                                <TableCell>
                                    {part.isCritical && (
                                        <Badge variant="destructive" className="flex w-fit gap-1 text-[10px]">
                                            <AlertCircle className="h-3 w-3" /> Critical
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
