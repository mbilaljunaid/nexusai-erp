import React, { useState } from 'react';
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
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
import { BOMTree } from "@/components/manufacturing/BOMTree";

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

    const rawInventoryQuery = useQuery<{ items?: InventoryItem[] } | any>({
        queryKey: ["/api/scm/inventory"],
        queryFn: async () => {
            const res = await fetch("/api/scm/inventory");
            return res.json();
        }
    });

    const rawData = rawInventoryQuery.data;
    const inventory: InventoryItem[] = Array.isArray(rawData) ? rawData : (rawData?.items || []);

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
        setBomComponents([...bomComponents, { id: Math.random().toString(36).substr(2, 9), componentId: "", name: "New Node", sku: "TBD", quantity: 1, uom: "EA", children: [] } as any]);
    };

    const handleSave = () => {
        if (!newBomNumber || !newBomProduct || bomComponents.length === 0) {
            toast({ title: "Validation Error", description: "Please fill all required fields and add at least one component", variant: "destructive" });
            return;
        }

        // Flatten tree for backend
        const flatItems: any[] = [];
        const traverse = (nodes: any[], parentId?: string) => {
            nodes.forEach(node => {
                flatItems.push({
                    componentId: node.componentId,
                    quantity: node.quantity,
                    uom: node.uom,
                    parentId: parentId || null
                });
                if (node.children && node.children.length > 0) {
                    traverse(node.children, node.componentId);
                }
            });
        };
        traverse(bomComponents);

        const payload = {
            header: {
                bomNumber: newBomNumber,
                productId: newBomProduct,
                status: "active"
            },
            items: flatItems
        };
        createMutation.mutate(payload);
    };

    const bomsWithNames = boms.map(b => {
        const product = inventory.find(i => i.id === b.productId);
        return { ...b, displayName: product ? product.itemName : b.productId };
    });

    const columns: SpreadsheetColumn<any>[] = [
        {
            id: "bomNumber",
            header: "BOM #",
            width: "150px",
            cell: (row: any) => <div className="p-2"><span className="font-mono font-bold text-blue-700">{row.bomNumber}</span></div>
        },
        {
            id: "displayName",
            header: "Product",
            width: "250px",
            cell: (row: any) => <div className="p-2">{row.displayName}</div>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (row: any) => (
                <div className="p-2">
                    <Badge variant={row.status === "active" ? "default" : "secondary"}>
                        {row.status}
                    </Badge>
                </div>
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
                                    <CardTitle className="text-sm font-medium">BOM Visual Designer</CardTitle>
                                    <Button size="sm" variant="outline" onClick={addComponent}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Root Item
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <BOMTree data={bomComponents as any} onChange={(d) => setBomComponents(d as any)} />
                                </CardContent>
                            </Card>

                            <div className="fixed bottom-0 left-0 right-0 p-6 bg-card border-t flex justify-end gap-2">
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
            <InteractiveSpreadsheet
                data={bomsWithNames}
                columns={columns}
                onChange={() => { }} virtualized={true} containerHeight="600px"
            />
        </StandardPage>
    );
}
