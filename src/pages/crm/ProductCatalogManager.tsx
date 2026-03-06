import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit, Trash2, Archive, Eye, DollarSign, Layers } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    listPrice: number;
    costPrice: number;
    status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
    productFamily: string;
    isBundle: boolean;
    bundleComponents?: { productId: string; quantity: number }[];
    pricingTiers?: { minQty: number; price: number }[];
}

interface PriceBook {
    id: string;
    name: string;
    isStandard: boolean;
    effectiveDate: string;
    expirationDate?: string;
    products: { productId: string; price: number }[];
}

export default function ProductCatalogManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // Fetch products
    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ["catalog-products", statusFilter, categoryFilter],
        queryFn: async () => {
            let url = "/api/crm/catalog/products?";
            if (statusFilter !== "all") url += `status=${statusFilter}&`;
            if (categoryFilter !== "all") url += `category=${categoryFilter}&`;

            const res = await fetch(url);
            return res.json();
        }
    });

    // Fetch price books
    const { data: priceBooks = [] } = useQuery<PriceBook[]>({
        queryKey: ["price-books"],
        queryFn: async () => {
            const res = await fetch("/api/crm/catalog/price-books");
            return res.json();
        }
    });

    // Create/Update product mutation
    const saveProductMutation = useMutation({
        mutationFn: async (product: Partial<Product>) => {
            const method = product.id ? "PUT" : "POST";
            const url = product.id
                ? `/api/crm/catalog/products/${product.id}`
                : "/api/crm/catalog/products";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product)
            });
            if (!res.ok) throw new Error("Failed to save product");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
            toast({
                title: "Success",
                description: "Product saved successfully"
            });
            setSelectedProduct(null);
            setIsEditing(false);
        }
    });

    // Archive product mutation
    const archiveProductMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/crm/catalog/products/${id}/archive`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to archive");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
            toast({
                title: "Archived",
                description: "Product archived successfully"
            });
        }
    });

    const activeProducts = products.filter(p => p.status === "ACTIVE");
    const bundles = products.filter(p => p.isBundle);
    const categories = [...new Set(products.map(p => p.category))];



    return (
        <StandardPage
            title="Product Catalog Manager"
            description="Manage products, bundles, pricing tiers, and price books"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Product Catalog" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                Total Products
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{products.length}</div>
                            <div className="text-xs text-blue-700">{activeProducts.length} active</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                Product Bundles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">{bundles.length}</div>
                            <div className="text-xs text-purple-700">Multi-product packages</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Price Books
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{priceBooks.length}</div>
                            <div className="text-xs text-green-700">Active pricing strategies</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase">Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{categories.length}</div>
                            <div className="text-xs text-amber-700">Product categories</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Actions */}
                <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Status:</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Category:</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={() => { setSelectedProduct({} as Product); setIsEditing(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Product
                    </Button>
                </div>

                <Tabs defaultValue="products" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="products">Products ({activeProducts.length})</TabsTrigger>
                        <TabsTrigger value="bundles">Bundles ({bundles.length})</TabsTrigger>
                        <TabsTrigger value="pricebooks">Price Books ({priceBooks.length})</TabsTrigger>
                    </TabsList>

                    {/* Products Tab */}
                    <TabsContent value="products">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Catalog</CardTitle>
                                <CardDescription>All products with pricing and availability</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">List Price</TableHead>
                                            <TableHead className="text-right">Cost</TableHead>
                                            <TableHead className="text-right">Margin</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                                    No products found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            products.map((product) => {
                                                const margin = product.listPrice > 0
                                                    ? ((product.listPrice - product.costPrice) / product.listPrice * 100).toFixed(0)
                                                    : 0;

                                                return (
                                                    <TableRow key={product.id}>
                                                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                                                        <TableCell className="font-medium">
                                                            {product.name}
                                                            {product.isBundle && (
                                                                <Badge variant="outline" className="ml-2 text-xs">
                                                                    <Layers className="h-3 w-3 mr-1" />
                                                                    Bundle
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-sm">{product.category}</TableCell>
                                                        <TableCell className="text-right font-mono">${product.listPrice.toLocaleString()}</TableCell>
                                                        <TableCell className="text-right font-mono text-muted-foreground">${product.costPrice.toLocaleString()}</TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={cn(`font-semibold ${Number(margin) >= 40 ? 'text-green-700' : 'text-amber-700'}`)}>
                                                                {margin}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge status={product.status} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => { setSelectedProduct(product); setIsEditing(false); }}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => { setSelectedProduct(product); setIsEditing(true); }}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                {product.status !== "ARCHIVED" && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => archiveProductMutation.mutate(product.id)}
                                                                    >
                                                                        <Archive className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Bundles Tab */}
                    <TabsContent value="bundles">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Bundles</CardTitle>
                                <CardDescription>Multi-product packages with special pricing</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {bundles.map((bundle) => (
                                        <Card key={bundle.id} className="border-l-4 border-l-purple-500">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{bundle.name}</CardTitle>
                                                        <CardDescription className="mt-1">
                                                            SKU: {bundle.sku} • List Price: ${bundle.listPrice.toLocaleString()}
                                                        </CardDescription>
                                                    </div>
                                                    <StatusBadge status={bundle.status} />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm">
                                                    <div className="font-medium mb-2">Bundle Components:</div>
                                                    <ul className="space-y-1 text-muted-foreground">
                                                        {bundle.bundleComponents?.map((comp, idx) => (
                                                            <li key={idx}>• Product ID: {comp.productId} (Qty: {comp.quantity})</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {bundles.length === 0 && (
                                        <div className="text-center text-muted-foreground py-8">
                                            No bundles configured
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Price Books Tab */}
                    <TabsContent value="pricebooks">
                        <Card>
                            <CardHeader>
                                <CardTitle>Price Books</CardTitle>
                                <CardDescription>Pricing strategies for different customer segments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {priceBooks.map((pb) => (
                                        <Card key={pb.id} className="border-l-4 border-l-green-500">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            {pb.name}
                                                            {pb.isStandard && (
                                                                <Badge variant="outline">Standard</Badge>
                                                            )}
                                                        </CardTitle>
                                                        <CardDescription className="mt-1">
                                                            Effective: {pb.effectiveDate}
                                                            {pb.expirationDate && ` • Expires: ${pb.expirationDate}`}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm text-muted-foreground">
                                                    {pb.products.length} products configured
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {priceBooks.length === 0 && (
                                        <div className="text-center text-muted-foreground py-8">
                                            No price books configured
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Product Detail/Edit Dialog */}
                {selectedProduct && (
                    <Dialog open={!!selectedProduct} onOpenChange={() => { setSelectedProduct(null); setIsEditing(false); }}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{isEditing ? (selectedProduct.id ? "Edit Product" : "New Product") : "Product Details"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Product Name</Label>
                                                <Input defaultValue={selectedProduct.name} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>SKU</Label>
                                                <Input defaultValue={selectedProduct.sku} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select defaultValue={selectedProduct.category}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map(cat => (
                                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Status</Label>
                                                <Select defaultValue={selectedProduct.status}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>List Price</Label>
                                                <Input type="number" defaultValue={selectedProduct.listPrice} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Cost Price</Label>
                                                <Input type="number" defaultValue={selectedProduct.costPrice} />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => { setSelectedProduct(null); setIsEditing(false); }}>
                                                Cancel
                                            </Button>
                                            <Button onClick={() => saveProductMutation.mutate(selectedProduct)}>
                                                Save Product
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm font-medium">SKU</div>
                                                <div className="text-sm text-muted-foreground font-mono">{selectedProduct.sku}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">Category</div>
                                                <div className="text-sm text-muted-foreground">{selectedProduct.category}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">List Price</div>
                                                <div className="text-sm text-muted-foreground">${selectedProduct.listPrice.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">Cost Price</div>
                                                <div className="text-sm text-muted-foreground">${selectedProduct.costPrice.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </StandardPage>
    );
}
