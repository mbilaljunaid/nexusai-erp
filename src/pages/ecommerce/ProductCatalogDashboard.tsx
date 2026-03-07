import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InteractiveSpreadsheet } from '@/components/ui/InteractiveSpreadsheet';
import { PIMService } from '@/services/pimService';
import { Package, Upload, FileText, Loader2 } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";


export default function ProductCatalogDashboard() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([
                PIMService.getProducts({ status: 'published' }),
                PIMService.getCategories()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const productColumns = [
        {
            id: 'sku', header: 'SKU',
            width: "150px",
            cell: (row: any) => <div className="px-2 h-full flex items-center font-mono text-sm">{row.sku}</div>
        },
        { id: 'name', header: 'Product', width: "300px", cell: (row: any) => <div className="px-2 h-full flex items-center">{row.name}</div> },
        {
            id: 'category',
            header: 'Category',
            width: "200px",
            cell: (row: any) => <div className="px-2 h-full flex items-center">{row.pim_categories?.name || '-'}</div>
        },
        {
            id: 'brand',
            header: 'Brand',
            width: "150px",
            cell: (row: any) => <div className="px-2 h-full flex items-center">{row.pim_brands?.name || '-'}</div>
        },
        {
            id: 'product_type',
            header: 'Type',
            width: "150px",
            cell: (row: any) => <div className="px-2 h-full flex items-center"><Badge variant="outline">{row.product_type}</Badge></div>
        },
        {
            id: 'status',
            header: 'Status',
            width: "150px",
            cell: (row: any) => (
                <div className="px-2 h-full flex items-center">
                    <Badge variant={row.status === 'published' ? 'default' : 'secondary'}>
                        {row.status}
                    </Badge>
                </div>
            )
        }
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>;
    }

    return (
        <StandardPage title="Product Catalog (PIM)">
            <div className="flex justify-between items-center">
                <div>

                    <p className="text-muted-foreground mt-1">Product Information Management</p>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Import
                    </Button>
                    <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button>
                        <Package className="h-4 w-4 mr-2" />
                        New Product
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Published</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {products.filter(p => p.status === 'published').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{categories.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {products.filter(p => p.status === 'pending_review').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="products">
                <TabsList>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Catalog</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[500px]">
                            <InteractiveSpreadsheet
                                columns={productColumns}
                                data={products}
                                onChange={() => { }}
                                virtualized={true}
                                containerHeight="500px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <div key={cat.id} className="p-3 border rounded flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">{cat.name}</div>
                                            <div className="text-sm text-muted-foreground">{cat.path}</div>
                                        </div>
                                        <Badge>{cat.level === 0 ? 'Root' : `Level ${cat.level}`}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attributes" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Custom Attributes</CardTitle>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center">
                            <p className="text-muted-foreground/70">Attribute management UI coming soon</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
