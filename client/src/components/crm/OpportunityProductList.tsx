
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OpportunityLineItem, Product } from "@shared/schema";

interface OpportunityProductListProps {
    opportunityId: string;
}

export function OpportunityProductList({ opportunityId }: OpportunityProductListProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState<string>("");

    // Fetch Line Items
    const { data: lineItems = [], isLoading: isLoadingItems } = useQuery<OpportunityLineItem[]>({
        queryKey: [`/api/crm/opportunities/${opportunityId}/line-items`],
    });

    // Fetch Products for selection
    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ["/api/crm/products"],
    });

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) && p.isActive
    );

    // Mutations
    const addLineItemMutation = useMutation({
        mutationFn: async () => {
            if (!selectedProduct) throw new Error("No product selected");
            return apiRequest("POST", `/api/crm/opportunities/${opportunityId}/line-items`, {
                opportunityId,
                productId: selectedProduct.id,
                quantity: Number(quantity),
                unitPrice: Number(unitPrice),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/crm/opportunities/${opportunityId}/line-items`] });
            queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] }); // To update amount
            toast({ title: "Success", description: "Product added to opportunity" });
            setIsAddOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to add product", variant: "destructive" });
        }
    });

    const deleteLineItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            return apiRequest("DELETE", `/api/crm/opportunities/${opportunityId}/line-items/${itemId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/crm/opportunities/${opportunityId}/line-items`] });
            queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
            toast({ title: "Success", description: "Product removed" });
        },
    });

    const resetForm = () => {
        setSelectedProduct(null);
        setQuantity(1);
        setUnitPrice("");
        setProductSearch("");
    };

    // Helper to find product name from ID (since line item only has productId)
    const getProductName = (productId: string) => {
        return products.find(p => p.id === productId)?.name || "Unknown Product";
    };

    const calculateTotal = (items: OpportunityLineItem[]) => {
        return items.reduce((acc, item) => acc + (Number(item.totalPrice) || (Number(item.unitPrice) * item.quantity)), 0);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Products ({lineItems.length})</h3>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" /> Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Product to Opportunity</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {!selectedProduct ? (
                                /* Product Search View */
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search products..."
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto border rounded-md">
                                        {filteredProducts.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">No active products found</div>
                                        ) : (
                                            filteredProducts.map(product => (
                                                <div
                                                    key={product.id}
                                                    className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                                                    onClick={() => setSelectedProduct(product)}
                                                >
                                                    <div>
                                                        <p className="font-medium text-sm">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">{product.productCode}</p>
                                                    </div>
                                                    <Badge variant="secondary">Select</Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Quantity & Price View */
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                                        <span className="font-semibold">{selectedProduct.name}</span>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>Change</Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Quantity</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Sales Price</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={unitPrice}
                                                onChange={(e) => setUnitPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2 text-right font-medium">
                                        Total: ${((Number(unitPrice) || 0) * quantity).toFixed(2)}
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => addLineItemMutation.mutate()}
                                        disabled={addLineItemMutation.isPending || !unitPrice}
                                    >
                                        Add to Opportunity
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Sales Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingItems ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">Loading products...</TableCell>
                            </TableRow>
                        ) : lineItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No products added yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            lineItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            {getProductName(item.productId ?? "")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-semibold">
                                        ${(Number(item.totalPrice) || (Number(item.unitPrice) * item.quantity)).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => deleteLineItemMutation.mutate(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        {lineItems.length > 0 && (
                            <TableRow className="bg-muted/50 font-semibold">
                                <TableCell colSpan={3} className="text-right">Grand Total</TableCell>
                                <TableCell className="text-right">${calculateTotal(lineItems).toFixed(2)}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
