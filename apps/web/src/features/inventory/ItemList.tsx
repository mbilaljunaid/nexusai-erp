import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2 } from "lucide-react";

interface Item {
    id: string;
    name: string;
    sku: string;
    cost: number;
    price: number;
    stockLevel: number;
}

export function ItemList() {
    const [search, setSearch] = useState("");
    const tenantId = "tenant-1";

    const { data: items = [], isLoading } = useQuery<Item[]>({
        queryKey: [`/api/erp/${tenantId}/inventory/items`],
    });

    const createItemMutation = useMutation({
        mutationFn: async (newItem: Partial<Item>) => {
            return apiRequest("POST", `/api/erp/${tenantId}/inventory/items`, newItem);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/erp/${tenantId}/inventory/items`] });
        },
    });

    const handleCreateMockItem = () => {
        createItemMutation.mutate({
            name: `Product ${Math.floor(Math.random() * 100)}`,
            sku: `SKU-${Math.floor(Math.random() * 1000)}`,
            cost: Math.floor(Math.random() * 50),
            price: Math.floor(Math.random() * 100),
            stockLevel: Math.floor(Math.random() * 500),
        });
    };

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Inventory Items</h2>
                <Button onClick={handleCreateMockItem} disabled={createItemMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search items..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Stock (Qty)</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.sku}</TableCell>
                                    <TableCell>{item.stockLevel}</TableCell>
                                    <TableCell>${Number(item.cost).toFixed(2)}</TableCell>
                                    <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No items found
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
