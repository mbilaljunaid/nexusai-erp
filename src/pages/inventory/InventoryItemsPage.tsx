import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Search, Package } from "lucide-react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { StandardPage } from "@/components/layout/StandardPage";
import { ContextualSearch } from "@/components/ContextualSearch";
import { useEnterpriseStore } from "@/lib/enterpriseStore";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InventoryItemsPage() {
    const { toast } = useToast();
    const { inventoryOrgId } = useEnterpriseStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [newItem, setNewItem] = useState({ itemName: "", sku: "", quantity: "", category: "Raw Materials" });

    const invOrgHeaders = inventoryOrgId ? { "x-inventory-org-id": inventoryOrgId } : {};

    const { data: inventory = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/inventory/items", inventoryOrgId],
        queryFn: () => fetch("/api/inventory/items", { headers: invOrgHeaders }).then(r => r.json()).catch(() => [])
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/inventory/items", {
            method: "POST", headers: { "Content-Type": "application/json", ...invOrgHeaders }, body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/inventory/items", inventoryOrgId] });
            setNewItem({ itemName: "", sku: "", quantity: "", category: "Raw Materials" });
            toast({ title: "Item added to inventory" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/inventory/items/${id}`, { method: "DELETE", headers: invOrgHeaders }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/inventory/items", inventoryOrgId] });
            toast({ title: "Item removed" });
        },
    });

    const filtered = inventory.filter((item: any) =>
        item.itemName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <StandardPage
            title="Item Directory"
            description="Browse, add, and manage inventory items"
            breadcrumbs={[{ label: "Inventory", href: "/inventory" }, { label: "Items" }]}
        >
            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle className="text-base">Add New Item</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-4 gap-3">
                            <Input placeholder="Item name" value={newItem.itemName} onChange={e => setNewItem({ ...newItem, itemName: e.target.value })} />
                            <Input placeholder="SKU" value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} />
                            <Input placeholder="Quantity" type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} />
                            <Select value={newItem.category} onValueChange={v => setNewItem({ ...newItem, category: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                                    <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                                    <SelectItem value="WIP">Work in Progress</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button disabled={createMutation.isPending || !newItem.itemName} className="w-full" onClick={() => createMutation.mutate(newItem)}>
                            <Plus className="w-4 h-4 mr-2" /> Add Item
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-base">Current Stock Levels</CardTitle>
                            <div className="flex-1 min-w-72">
                                <ContextualSearch
                                    placeholder="Search items..."
                                    fields={[{ key: "query", label: "Search", type: "text" }]}
                                    onSearch={(filters) => setSearchQuery(filters.query || "")}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? <TableSkeleton rows={4} /> : (
                            filtered.length === 0 ? (
                                <p className="text-muted-foreground text-sm py-4 text-center">No items found.</p>
                            ) : filtered.map((item: any) => (
                                <div key={item.id} className="p-3 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold">{item.itemName}</p>
                                            <p className="text-sm text-muted-foreground">SKU: {item.sku} • Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(item.id)} aria-label="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
