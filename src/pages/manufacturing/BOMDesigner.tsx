import React, { useState } from 'react';
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Box, Save, Layout, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";

interface InventoryItem {
    id: string;
    itemName: string;
    sku: string;
}

interface BomItem {
    id?: string;
    componentId: string;
    quantity: number;
    uom: string;
}

interface BomHeader {
    id: string;
    bomNumber: string;
    productId: string;
    displayName?: string; // Virtual field for UI
    status: "active" | "draft" | "obsolete";
}

export default function BOMDesigner() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Form State
    const [newBomProduct, setNewBomProduct] = useState("");
    const [newBomNumber, setNewBomNumber] = useState("");
    const [bomComponents, setBomComponents] = useState<BomItem[]>([]);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    const { data, isLoading: bomsLoading } = useQuery<{ items: BomHeader[], total: number }>({
        queryKey: ["/api/manufacturing/bom", page, pageSize],
        queryFn: async () => {
            const offset = (page - 1) * pageSize;
            const res = await fetch(`/api/manufacturing/bom?limit=${pageSize}&offset=${offset}`);
            return res.json();
        }
    });

    const boms = data?.items || [];
    const totalItems = data?.total || 0;

    const { data: inventory = [] } = useQuery<InventoryItem[]>({
        queryKey: ["/api/scm/inventory"],
        queryFn: async () => {
            const res = await fetch("/api/scm/inventory");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/manufacturing/bom", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save BOM");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/bom"] });
            setIsSheetOpen(false);
            resetForm();
            toast({ title: "Success", description: "BOM saved successfully" });
        }
    });

    const resetForm = () => {
        setBomComponents([]);
        setNewBomNumber("");
        setNewBomProduct("");
    };

    const addComponent = () => {
        setBomComponents([...bomComponents, { componentId: "", quantity: 1, uom: "EA" }]);
    };

    const removeComponent = (index: number) => {
        setBomComponents(bomComponents.filter((_, i) => i !== index));
    };

    const updateComponent = (index: number, field: keyof BomItem, value: any) => {
        const updated = [...bomComponents];
        updated[index] = { ...updated[index], [field]: value };
        setBomComponents(updated);
    };

    const handleSave = () => {
        if (!newBomNumber || !newBomProduct || bomComponents.length === 0) {
            toast({ title: "Validation Error", description: "Please fill all required fields and add at least one component", variant: "destructive" });
            return;
        }

        const payload = {
            header: {
                bomNumber: newBomNumber,
                productId: newBomProduct,
                status: "active"
            },
            items: bomComponents.map(c => ({
                componentId: c.componentId,
                quantity: c.quantity,
                uom: c.uom
            }))
        };
        createMutation.mutate(payload);
    };

    const bomsWithNames = boms.map(b => {
        const product = inventory.find(i => i.id === b.productId);
        return { ...b, displayName: product ? product.itemName : b.productId };
    });

    const columns: Column<BomHeader & { displayName: string }>[] = [
        {
            header: "BOM #",
            accessorKey: "bomNumber",
            cell: (row: any) => <span className="font-mono font-bold text-blue-700">{row.bomNumber}</span>
        },
        {
            header: "Product",
            accessorKey: "displayName",
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: any) => (
                <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status}
                </Badge>
            )
        }
    ];

    return (
        <StandardPage
            title="Bill of Materials"
            breadcrumbs={[
                { label: "Manufacturing", href: "/manufacturing" },
                { label: "Engineering" },
                { label: "BOMs" }
            ]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => { resetForm(); setIsSheetOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" /> Create BOM
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Design New BOM</SheetTitle>
                            <SheetDescription>
                                Define the product header and required components for this Bill of Materials.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6 mt-6 pb-20">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>BOM Number</Label>
                                    <Input value={newBomNumber} onChange={e => setNewBomNumber(e.target.value)} placeholder="BOM-XXXX" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Product</Label>
                                    <Select value={newBomProduct} onValueChange={setNewBomProduct}>
                                        <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                                        <SelectContent>
                                            {inventory.map(item => (
                                                <SelectItem key={item.id} value={item.id}>{item.itemName} ({item.sku})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Components / Ingredients</CardTitle>
                                    <Button size="sm" variant="outline" onClick={addComponent}>
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {bomComponents.map((comp, idx) => (
                                            <div key={idx} className="flex gap-2 items-end border-b pb-3 group">
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-[10px] uppercase">Component</Label>
                                                    <Select value={comp.componentId} onValueChange={val => updateComponent(idx, "componentId", val)}>
                                                        <SelectTrigger className="h-8"><SelectValue placeholder="Select Comp" /></SelectTrigger>
                                                        <SelectContent>
                                                            {inventory.map(item => (
                                                                <SelectItem key={item.id} value={item.id}>{item.itemName}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-20 space-y-1">
                                                    <Label className="text-[10px] uppercase">Qty</Label>
                                                    <Input type="number" className="h-8" value={comp.quantity} onChange={e => updateComponent(idx, "quantity", parseFloat(e.target.value))} />
                                                </div>
                                                <div className="w-24 space-y-1">
                                                    <Label className="text-[10px] uppercase">UOM</Label>
                                                    <Select value={comp.uom} onValueChange={val => updateComponent(idx, "uom", val)}>
                                                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="EA">Each</SelectItem>
                                                            <SelectItem value="KG">KG</SelectItem>
                                                            <SelectItem value="L">Liters</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 mb-0" onClick={() => removeComponent(idx)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {bomComponents.length === 0 && (
                                            <div className="py-8 text-center text-xs text-muted-foreground border-dashed border-2 rounded-md">
                                                No components added.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={createMutation.isPending}>
                                    <Save className="mr-2 h-4 w-4" /> {createMutation.isPending ? "Saving..." : "Save BOM"}
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            }
        >
            <StandardTable
                data={bomsWithNames}
                columns={columns}
                isLoading={bomsLoading}
                keyExtractor={(item) => item.id}
                filterColumn="displayName"
                filterPlaceholder="Filter by product name..."
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPage}
            />
        </StandardPage>
    );
}
