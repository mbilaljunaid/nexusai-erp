
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FaAsset } from "@shared/schema";
import { AssetStatCards } from "@/components/fixed-assets/AssetStatCards";
import { AddAssetDialog } from "@/components/fixed-assets/AddAssetDialog";
import { RetireAssetDialog } from "@/components/fixed-assets/RetireAssetDialog";
import { MassAdditionsTable } from "@/components/fixed-assets/MassAdditionsTable";
import { AssetRollForwardReport } from "@/components/fixed-assets/AssetRollForwardReport";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2, Plus, Play, FileBarChart } from "lucide-react";

interface FaAssetWithFinancials extends FaAsset {
    datePlacedInService: string | Date;
    originalCost: string | number;
    recoverableCost: string | number;
    bookId: string;
}

export default function AssetWorkbench() {
    const { data: assets, isLoading } = useQuery<FaAssetWithFinancials[]>({
        queryKey: ["/api/fa/assets"],
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

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

            <AssetStatCards assets={assets || []} />

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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asset Number</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>In Service Date</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                        <TableHead className="text-right">Recoverable</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assets?.map((asset) => (
                                        <TableRow key={asset.id}>
                                            <TableCell className="font-medium">{asset.assetNumber}</TableCell>
                                            <TableCell>{asset.description}</TableCell>
                                            <TableCell>{asset.categoryId}</TableCell>
                                            <TableCell>
                                                {new Date(asset.datePlacedInService).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ${Number(asset.originalCost).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ${Number(asset.recoverableCost).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {asset.status === "ACTIVE" ? (
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                                                        {asset.status}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {asset.status === "ACTIVE" && (
                                                    <RetireAssetDialog asset={asset} />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!assets?.length && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                                No assets found. Create one manually or via Mass Additions.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
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
