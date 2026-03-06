
import { useState, useEffect } from "react";
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
import type { OpportunityLineItem, Product, Opportunity } from "@/types/erp-types";
import { PriceBookSelector } from "./PriceBookSelector"; // Ensure this import path is correct

interface OpportunityProductListProps {
    opportunityId: string;
}

interface PriceBookEntry {
    id: string; // This is the priceBookEntryId
    priceBookId: string;
    productId: string;
    unitPrice: string;
    isActive: number;
    productName: string;
    productCode: string;
    description: string;
}

export function OpportunityProductList({ opportunityId }: OpportunityProductListProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<PriceBookEntry | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState<string>("");

    // Fetch Opportunity to get Price Book ID
    const { data: opportunity } = useQuery<Opportunity>({
        queryKey: [`/api/crm/opportunities/${opportunityId}`],
        // Enabled true by default, but ensuring it runs
    });

    const priceBookId = opportunity?.priceBookId;

    // Fetch Line Items
    const { data: lineItems = [], isLoading: isLoadingItems } = useQuery<OpportunityLineItem[]>({
        queryKey: [`/api/crm/opportunities/${opportunityId}/line-items`],
    });

    // Fetch Products (Standard) - Used if no Price Book or as fallback for names
    const { data: allProducts = [] } = useQuery<Product[]>({
        queryKey: ["/api/crm/products"],
    });

    // Fetch Price Book Entries - Used if Price Book is selected
    const { data: priceBookEntries = [] } = useQuery<PriceBookEntry[]>({
        queryKey: [`/api/crm/price-books/${priceBookId}/entries`, productSearch],
        enabled: !!priceBookId,
    });

    // Determine which list to filter/show
    const displayProducts = priceBookId
        ? priceBookEntries
        : allProducts.filter(p => p.isActive && p.name.toLowerCase().includes(productSearch.toLowerCase()));

    // Mutation to update Opportunity Price Book
    const updateOppMutation = useMutation({
        mutationFn: async (newPriceBookId: string) => {
            return apiRequest("PATCH", `/api/crm/opportunities/${opportunityId}`, {
                priceBookId: newPriceBookId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/crm/opportunities/${opportunityId}`] });
            queryClient.invalidateQueries({ queryKey: [`/api/crm/opportunities/${opportunityId}/line-items`] });
            toast({ title: "Updated", description: "Price Book updated successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update Price Book", variant: "destructive" });
        }
    });

    // Mutation to Add Line Item
    const addLineItemMutation = useMutation({
        mutationFn: async () => {
            if (!selectedProduct) throw new Error("No product selected");

            const payload: any = {
                opportunityId,
                productId: selectedProduct.id,
                quantity: Number(quantity),
                unitPrice: Number(unitPrice),
            };

            if (selectedEntry) {
                payload.priceBookEntryId = selectedEntry.id;
            }

            return apiRequest("POST", `/api/crm/opportunities/${opportunityId}/line-items`, payload);
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
        setSelectedEntry(null);
        setQuantity(1);
        setUnitPrice("");
        setProductSearch("");
    };

    // Handler when selecting a product/entry
    const handleSelect = (item: Product | PriceBookEntry) => {
        if ('priceBookId' in item) {
            // It's a PriceBookEntry
            const entry = item as PriceBookEntry;
            // Find the full product object (optional, but good for consistency)
            const prod = allProducts.find(p => p.id === entry.productId);
            if (prod) setSelectedProduct(prod);
            else {
                // Construct a partial product if not found in allProducts
                setSelectedProduct({ id: entry.productId, name: entry.productName, productCode: entry.productCode } as Product);
            }
            setSelectedEntry(entry);
            setUnitPrice(entry.unitPrice);
        } else {
            // It's a generic Product (Standard Price Book / Manual)
            setSelectedProduct(item as Product);
            setSelectedEntry(null);
            setUnitPrice(""); // Or fetch standard price if available
        }
    };

    const getProductName = (productId: string) => {
        return allProducts.find(p => p.id === productId)?.name || "Unknown Product";
    };

    const calculateTotal = (items: OpportunityLineItem[]) => {
        return items.reduce((acc, item) => acc + (Number(item.totalPrice) || (Number(item.unitPrice) * item.quantity)), 0);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold mb-1">Products ({lineItems.length})</h3>
                    <div className="flex items-center gap-2">
                        <PriceBookSelector
                            value={priceBookId}
                            onChange={(val) => {
                                if (lineItems.length > 0) {
                                    if (!confirm("Changing the Price Book may affect existing line items. Continue?")) return;
                                }
                                updateOppMutation.mutate(val);
                            }}
                        />
                        {priceBookId && <Badge variant="outline" className="mt-6">Active Pricing</Badge>}
                    </div>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={resetForm} className="mt-6">
                            <Plus className="h-4 w-4 mr-2" /> Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Product {priceBookId ? "(via Price Book)" : "(Standard)"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {!selectedProduct ? (
                                /* Product Search View */
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder={priceBookId ? "Search Price Book entries..." : "Search products..."}
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto border rounded-md">
                                        {displayProducts.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">No active products found</div>
                                        ) : (
                                            displayProducts.map((item: any) => (
                                                <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                                    key={item.id}
                                                    className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                                                    onClick={() => handleSelect(item)}
                                                >
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {'productName' in item ? item.productName : item.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {'productCode' in item ? item.productCode : item.productCode}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        {'unitPrice' in item && (
                                                            <span className="block text-sm font-semibold">${Number(item.unitPrice).toFixed(2)}</span>
                                                        )}
                                                        <Badge variant="secondary" className="text-xs">Select</Badge>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Quantity & Price View */
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                                        <div>
                                            <span className="font-semibold block">{selectedProduct.name}</span>
                                            {selectedEntry && <span className="text-xs text-muted-foreground">Price Book Entry: {selectedEntry.unitPrice}</span>}
                                        </div>
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
                                            <Label>Sales Price {selectedEntry && "(Locked)"}</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={unitPrice}
                                                onChange={(e) => setUnitPrice(e.target.value)}
                                                disabled={!!selectedEntry} // Lock price if using Price Book
                                            />
                                            {selectedEntry && <p className="text-[10px] text-muted-foreground">Managed by Price Book</p>}
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
                                            <div>
                                                <div>{getProductName(item.productId ?? "")}</div>
                                                {item.priceBookEntryId && (
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1">PB Configured</Badge>
                                                )}
                                            </div>
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
