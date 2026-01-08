import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ProductForm } from "@/components/forms/ProductForm";
import type { Product } from "@shared/schema";

export default function ProductsDetail() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ["/api/crm/products"],
    });

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.productCode && p.productCode.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const activeCount = products.filter(p => p.isActive === 1).length;

    return (
        <div className="space-y-6 flex flex-col flex-1 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Link href="/crm">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-semibold">Products</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage your product catalog. Total: {products.length} • Active: {activeCount}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 items-center shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div>Loading...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No products found. Create one below.
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <Card
                            key={product.id}
                            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedProduct(product)}
                        >
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${product.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            {product.productCode && (
                                                <Badge variant="outline" className="font-mono text-xs">{product.productCode}</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Status</p>
                                        <Badge variant={product.isActive ? "default" : "secondary"}>
                                            {product.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="pt-6 border-t mt-4">
                <h2 className="text-xl font-semibold mb-4">+ New Product</h2>
                <div className="bg-card border rounded-lg p-6">
                    <ProductForm />
                </div>
            </div>

            {/* Detail Sheet */}
            <Sheet open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <SheetContent className="sm:max-w-xl w-[90vw] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl flex items-center gap-2">
                            <Package className="h-6 w-6 text-primary" />
                            {selectedProduct?.name}
                        </SheetTitle>
                        <SheetDescription>
                            {selectedProduct?.id}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedProduct && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                                <div>
                                    <p className="text-muted-foreground">Product Code</p>
                                    <p className="font-medium">{selectedProduct.productCode || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge variant={selectedProduct.isActive ? "default" : "secondary"}>
                                        {selectedProduct.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Created At</p>
                                    <p className="font-medium">{selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {selectedProduct.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
