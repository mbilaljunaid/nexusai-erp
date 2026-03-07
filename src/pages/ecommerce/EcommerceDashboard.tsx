import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarketplaceService, ReturnsService, DAMService } from '@/services/ecommerceService';
import { Store, Package, Image, Loader2 } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";


export default function EcommerceDashboard() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [rmas, setRMAs] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [vendorsData, rmasData, assetsData] = await Promise.all([
                MarketplaceService.getVendors(),
                ReturnsService.getRMAs(),
                DAMService.getAssets({ file_type: 'image' })
            ]);
            setVendors(vendorsData);
            setRMAs(rmasData);
            setAssets(assetsData);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>;
    }

    return (
        <StandardPage title="E-commerce Platform">
            

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center">
                        <Store className="h-4 w-4 mr-2" />Vendors</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{vendors.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Pending Approvals</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{vendors.filter(v => v.status === 'pending').length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center">
                        <Package className="h-4 w-4 mr-2" />Returns</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{rmas.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center">
                        <Image className="h-4 w-4 mr-2" />Assets</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{assets.length}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="marketplace">
                <TabsList>
                    <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                    <TabsTrigger value="returns">Returns</TabsTrigger>
                    <TabsTrigger value="dam">Digital Assets</TabsTrigger>
                </TabsList>

                <TabsContent value="marketplace" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Marketplace Vendors</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {vendors.map(vendor => (
                                    <div key={vendor.id} className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">{vendor.vendor_name}</div>
                                            <div className="text-sm text-gray-500">Commission: {vendor.commission_rate}%</div>
                                        </div>
                                        <Badge variant={vendor.status === 'approved' ? 'default' : 'secondary'}>{vendor.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="returns" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Return Requests (RMA)</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {rmas.map(rma => (
                                    <div key={rma.id} className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">{rma.rma_number}</div>
                                            <div className="text-sm text-gray-500">Reason: {rma.reason}</div>
                                        </div>
                                        <Badge>{rma.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dam" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Digital Assets</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4">
                                {assets.slice(0, 12).map(asset => (
                                    <div key={asset.id} className="border rounded p-2">
                                        <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                                            <Image className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <div className="text-xs truncate">{asset.filename}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
