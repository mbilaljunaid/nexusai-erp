
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FaAsset } from "@shared/schema";
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
import { StandardTable, Column } from "@/components/ui/StandardTable";

interface FaAssetWithFinancials extends FaAsset {
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

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ["/api/fa/stats"],
        queryFn: api.fa.assets.getStats
    });

    const assets = assetsData?.data || [];
    const totalCount = assetsData?.total || 0;

    const columns: Column<FaAssetWithFinancials>[] = [
        {
            header: "Asset Number",
            accessorKey: "assetNumber",
            className: "font-medium"
        },
        {
            header: "Description",
            accessorKey: "description"
        },
        {
            header: "Category",
            accessorKey: "categoryId"
        },
        {
            header: "In Service Date",
            cell: (asset) => new Date(asset.datePlacedInService).toLocaleDateString()
        },
        {
            header: "Cost",
            className: "text-right font-medium",
            cell: (asset) => `$${Number(asset.originalCost).toLocaleString()}`
        },
        {
            header: "Recoverable",
            className: "text-right",
            cell: (asset) => `$${Number(asset.recoverableCost).toLocaleString()}`
        },
        {
            header: "Status",
            cell: (asset) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${asset.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                    {asset.status}
                </span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (asset) => (
                asset.status === "ACTIVE" && <RetireAssetDialog asset={asset} />
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fixed Assets</h1>
                    <p className="text-muted-foreground">
                        Manage your asset lifecycle, depreciation, and reporting.
                    </p>
                </div>
                <div className="flex gap-2">
                    <AddAssetDialog />
                </div>
            </div>

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
                        <CardContent>
                            <StandardTable
                                data={assets}
                                columns={columns}
                                isLoading={isLoadingAssets}
                                page={page}
                                pageSize={pageSize}
                                totalItems={totalCount}
                                onPageChange={setPage}
                                keyExtractor={(i) => i.id}
                            />
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
    );
}
