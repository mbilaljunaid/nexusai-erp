
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FaAsset } from "@/types/erp-types";
import { AssetStatCards } from "@/components/fixed-assets/AssetStatCards";
import { AddAssetDialog } from "@/components/fixed-assets/AddAssetDialog";
import { RetireAssetDialog } from "@/components/fixed-assets/RetireAssetDialog";
import { MassAdditionsTable } from "@/components/fixed-assets/MassAdditionsTable";
import { AssetRollForwardReport } from "@/components/fixed-assets/AssetRollForwardReport";
import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from '@/components/layout/StandardPage';

interface FaAssetWithFinancials extends Omit<FaAsset, 'originalCost' | 'datePlacedInService'> {
    datePlacedInService: string | Date;
    originalCost: string | number;
    recoverableCost: string | number;
    bookId: string;
}

export default function AssetWorkbench() {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data: assetsData, isLoading: isLoadingAssets } = useQuery<{ data: FaAssetWithFinancials[], total: number }>({
        queryKey: ["/api/fa/assets", page, pageSize],
        queryFn: () => api.fa.assets.list({ limit: pageSize, offset: (page - 1) * pageSize })
    });

    const { data: stats, isLoading: isLoadingStats } = useQuery<any>({
        queryKey: ["/api/fa/stats"],
        queryFn: api.fa.assets.getStats
    });

    const assets = assetsData?.data || [];
    const totalCount = assetsData?.total || 0;

    const columns: any[] = [
        {
            id: "assetNumber",
            header: "Asset Number",
            width: "150px",
            cell: (asset: FaAssetWithFinancials) => <div className="px-2 h-full flex items-center font-medium">{asset.assetNumber}</div>
        },
        {
            id: "description",
            header: "Description",
            width: "250px",
            cell: (asset: FaAssetWithFinancials) => <div className="px-2 h-full flex items-center">{asset.description}</div>
        },
        {
            id: "categoryId",
            header: "Category",
            width: "150px",
            cell: (asset: FaAssetWithFinancials) => <div className="px-2 h-full flex items-center">{asset.categoryId}</div>
        },
        {
            id: "datePlacedInService",
            header: "In Service Date",
            width: "150px",
            cell: (asset: FaAssetWithFinancials) => <div className="px-2 h-full flex items-center">{new Date(asset.datePlacedInService).toLocaleDateString()}</div>
        },
        {
            id: "originalCost",
            header: "Cost",
            width: "150px",
            cell: (asset: FaAssetWithFinancials) => <div className="px-2 h-full flex items-center justify-end font-medium w-full">${Number(asset.originalCost).toLocaleString()}</div>
        },
        {
            id: "recoverableCost",
            header: "Recoverable",
            width: "150px",
            cell: (asset: FaAssetWithFinancials) => <div className="px-2 h-full flex items-center justify-end w-full">${Number(asset.recoverableCost).toLocaleString()}</div>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (asset: FaAssetWithFinancials) => (
                <div className="px-2 h-full flex items-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${asset.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {asset.status}
                    </span>
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            width: "100px",
            cell: (asset: FaAssetWithFinancials) => (
                <div className="px-2 h-full flex items-center justify-end w-full">
                    {asset.status === "ACTIVE" && <RetireAssetDialog asset={asset as any} />}
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Fixed Assets"
            description="Manage your asset lifecycle, depreciation, and reporting."
            actions={
                <div className="flex gap-2">
                    <AddAssetDialog />
                </div>
            }
        >
            <div className="space-y-6">
                <AssetStatCards stats={stats} isLoading={isLoadingStats} />

                <Tabs defaultValue="register" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="register">Asset Register</TabsTrigger>
                        <TabsTrigger value="mass-additions">Mass Additions</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="register">
                        <Card>
                            <CardHeader>
                                <CardTitle>Asset Register</CardTitle>
                                <CardDescription>
                                    A list of all assets in the Corporate Book.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 h-[500px]">
                                <InteractiveSpreadsheet
                                    data={assets as any[]}
                                    columns={columns}
                                    onChange={() => { }}
                                    virtualized={true}
                                    containerHeight="500px"
                                />
                                <div className="p-4 bg-muted/20 border-t flex justify-end gap-2 items-center">
                                    <span className="text-xs text-muted-foreground mr-4">Page {page}</span>
                                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="text-xs border px-2 py-1 rounded disabled:opacity-50">Prev</button>
                                    <button disabled={assets.length < pageSize} onClick={() => setPage(page + 1)} className="text-xs border px-2 py-1 rounded disabled:opacity-50">Next</button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="mass-additions">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mass Additions</CardTitle>
                                <CardDescription>
                                    Review and post assets imported from Accounts Payable.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MassAdditionsTable />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports">
                        <AssetRollForwardReport />
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
