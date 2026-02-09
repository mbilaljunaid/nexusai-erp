// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { StandardTable } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Plus, Package, Eye, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ItemDirectory() {
    const [location, setLocation] = useLocation();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Items
    const { data: items = [], isLoading } = useQuery({
        queryKey: ["/api/mdm/items"],
    });

    // Table Columns
    const columns = [
        {
            header: "Item Number", accessorKey: "itemNumber", sortable: true, cell: (row: any) => (
                <span className="font-mono font-medium">{row.itemNumber}</span>
            )
        },
        { header: "Name", accessorKey: "itemName", sortable: true },
        {
            header: "Type", accessorKey: "itemType", cell: (row: any) => (
                <Badge variant="outline">{row.itemType}</Badge>
            )
        },
        { header: "UOM", accessorKey: "primaryUomCode" },
        {
            header: "Status", accessorKey: "itemStatus", cell: (row: any) => (
                <span className={`px-2 py-1 rounded text-xs ${row.itemStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    row.itemStatus === 'OBSOLETE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {row.itemStatus}
                </span>
            )
        },
        {
            header: "Actions", id: "actions", cell: (row: any) => (
                <Button variant="ghost" size="sm" onClick={() => setLocation(`/mdm/items/${row.id}`)}>
                    <Eye className="h-4 w-4 mr-2" /> View
                </Button>
            )
        }
    ];

    // Create Mutation
    const [newItem, setNewItem] = useState({
        itemNumber: "",
        itemName: "",
        primaryUomCode: "EA",
        itemType: "GOODS",
        description: ""
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/mdm/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/items"] });
            setIsSheetOpen(false);
            setNewItem({ itemNumber: "", itemName: "", primaryUomCode: "EA", itemType: "GOODS", description: "" });
            toast({ title: "Success", description: "Item created successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const handleCreate = () => {
        if (!newItem.itemNumber || !newItem.itemName) {
            toast({ title: "Validation Error", description: "Item Number and Name are required.", variant: "destructive" });
            return;
        }
        createMutation.mutate(newItem);
    };

    return (
        <StandardPage
            title="Product Information Management"
            description="Centralized Item Master (Products, Services, BOMs)"
            breadcrumbs={[{ label: "MDM", href: "/mdm/governance" }, { label: "Item Master" }]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setLocation("/mdm/import")}>
                        <Upload className="mr-2 h-4 w-4" /> Bulk Import
                    </Button>
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Create Item</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Create New Item</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-4 mt-6">
                                <div>
                                    <Label>Item Number</Label>
                                    <Input
                                        placeholder="e.g. SRV-001"
                                        value={newItem.itemNumber}
                                        onChange={(e) => setNewItem({ ...newItem, itemNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Item Name</Label>
                                    <Input
                                        placeholder="e.g. Consulting Services"
                                        value={newItem.itemName}
                                        onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Type</Label>
                                        <Select value={newItem.itemType} onValueChange={(val) => setNewItem({ ...newItem, itemType: val })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GOODS">Goods</SelectItem>
                                                <SelectItem value="SERVICE">Service</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>UOM</Label>
                                        <Input
                                            value={newItem.primaryUomCode}
                                            onChange={(e) => setNewItem({ ...newItem, primaryUomCode: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                                    {createMutation.isPending ? "Creating..." : "Create Item"}
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            }
        >
            <Card>
                <CardContent className="p-0">
                    <StandardTable
                        data={items}
                        columns={columns}
                        loading={isLoading}
                        filterColumn="itemName"
                        filterPlaceholder="Search items..."
                    />
                </CardContent>
            </Card>
        </StandardPage >
    );
}
