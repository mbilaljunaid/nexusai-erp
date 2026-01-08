import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Search, Package, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { ProductForm } from "@/components/forms/ProductForm";
import type { Product } from "@shared/schema";
import { Plus, CheckCircle2, XCircle, Info, Calendar } from "lucide-react";

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
        <div className="space-y-6 flex flex-col flex-1 overflow-y-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 pb-4 border-b">
                <div className="flex items-center gap-2">
                    <Link href="/crm">
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2 italic">
                            Manage and track enterprise offerings
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="shad-primary-btn group transition-all duration-300">
                                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                                Add Product
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-xl w-[90vw]">
                            <SheetHeader className="mb-6">
                                <SheetTitle className="text-2xl font-bold">Register New Product</SheetTitle>
                                <SheetDescription>Enter the details for the new product in the catalog.</SheetDescription>
                            </SheetHeader>
                            <div className="mt-4">
                                <ProductForm />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900 overflow-hidden relative">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10">
                        <Package className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Products</p>
                        <p className="text-3xl font-bold">{products.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-100 dark:border-green-900 overflow-hidden relative">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10">
                        <CheckCircle2 className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Active</p>
                        <p className="text-3xl font-bold">{activeCount}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900 overflow-hidden relative">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10">
                        <XCircle className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Inactive</p>
                        <p className="text-3xl font-bold">{products.length - activeCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Area */}
            <div className="flex gap-4 items-center shrink-0">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by name or product code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 border-muted-foreground/20 focus-visible:ring-primary transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border-2 border-dashed bg-muted/20">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <Package className="h-10 w-10 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-lg font-semibold">No products found</h3>
                        <p className="text-muted-foreground max-w-xs mt-2">
                            {searchQuery ? `No products matching "${searchQuery}"` : "Your product catalog is currently empty. Get started by adding your first product."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="group shadow-sm hover:shadow-xl hover:-translate-y-1 border-muted-foreground/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full bg-card"
                                onClick={() => setSelectedProduct(product)}
                            >
                                <div className={`h-1.5 w-full ${product.isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-muted'}`} />
                                <CardContent className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl transition-colors duration-300 ${product.isActive ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 group-hover:bg-blue-100' : 'bg-muted text-muted-foreground'}`}>
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <Badge variant={product.isActive ? "default" : "secondary"} className={`${product.isActive ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''} font-medium px-2 py-0.5 text-[10px] uppercase tracking-wider`}>
                                            {product.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>

                                    <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-4 font-mono uppercase tracking-widest">{product.productCode || 'NO-CODE'}</p>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 italic flex-1">
                                        {product.description || "No description provided."}
                                    </p>

                                    <div className="pt-4 border-t border-muted/20 flex items-center justify-between text-[11px] text-muted-foreground mt-auto">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown'}
                                        </div>
                                        <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details <ArrowLeft className="h-3 w-3 rotate-180" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
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
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="bg-muted/30 border-none shadow-none">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-background shadow-sm">
                                            <Info className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Product Code</p>
                                            <p className="font-mono text-sm">{selectedProduct.productCode || 'N/A'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-muted/30 border-none shadow-none">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-background shadow-sm">
                                            {selectedProduct.isActive ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</p>
                                            <Badge variant={selectedProduct.isActive ? "default" : "secondary"} className="h-5 px-1.5 py-0">
                                                {selectedProduct.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-muted/30 border-none shadow-none">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-background shadow-sm">
                                            <Calendar className="h-4 w-4 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Created Date</p>
                                            <p className="text-sm font-medium">{selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Detailed Description
                                </h3>
                                <div className="p-6 rounded-xl bg-card border shadow-sm min-h-[120px]">
                                    <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap italic">
                                        {selectedProduct.description || "No official description has been provided for this product yet. Please update the product records to include technical specifications and use cases."}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Actions (Placeholder for now) */}
                            <div className="pt-6 border-t flex gap-3">
                                <Button variant="outline" className="flex-1">Edit Records</Button>
                                <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10">Archive Product</Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
