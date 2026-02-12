import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StandardTableimport PIMService from '@/services/pimService';
import { Package, Upload, FileText } from 'lucide-react';

export default function ProductCatalog Dashboard() {
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
            console.error('Error loading catalog:', error);
        } finally {
            setLoading(false);
        }
    };

    const productColumns = [
        {
            key: 'sku', header: 'SKU',
            label: 'SKU',
            render: (row: any) => <span className="font-mono text-sm">{row.sku}</span>
        },
        { key: 'name', header: 'Product', label: 'Product' },
        {
            key: 'category',
            header: 'Category',
            label: 'Category',
            render: (row: any) => <span>{row.pim_categories?.name || '-'}</span>
        },
        {
            key: 'brand',
            header: 'Brand',
            label: 'Brand',
            render: (row: any) => <span>{row.pim_brands?.name || '-'}</span>
        },
        {
            key: 'product_type',
            header: 'Type',
            label: 'Type',
            render: (row: any) => <Badge variant="outline">{row.product_type}</Badge>
        },
        {
            key: 'status',
            header: 'Status',
            label: 'Status',
            render: (row: any) => (
                <Badge variant={row.status === 'published' ? 'default' : 'secondary'}>
                    {row.status}
                </Badge>
            )
        }
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Product Catalog (PIM)</h1>
                    <p className="text-gray-500 mt-1">Product Information Management</p>
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
                        <CardTitle className="text-sm text-gray-500">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Published</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {products.filter(p => p.status === 'published').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{categories.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Pending Review</CardTitle>
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
                        <CardContent>
                            <StandardTable
                                columns={productColumns}
                                data={products}
                                pageSize={20}
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
                                            <div className="text-sm text-gray-500">{cat.path}</div>
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
                            <p className="text-gray-400">Attribute management UI coming soon</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
