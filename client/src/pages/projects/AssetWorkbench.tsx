import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, ArrowUpRight, DollarSign } from "lucide-react";

interface ProjectAsset {
    id: string;
    description: string;
    assetNumber: string;
    status: string;
    cost: string;
    datePlacedInService: string;
    locationId: string;
    categoryId: string;
    faAssetId: string;
    createdAt: string;
}

export default function AssetWorkbench() {
    const { data: assets, isLoading } = useQuery<ProjectAsset[]>({
        queryKey: ['/api/ppm/assets'],
    });

    const columns: Column<ProjectAsset>[] = [
        {
            header: "Asset Name", accessorKey: "description", cell: (item) => (
                <div>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-xs text-muted-foreground">{item.assetNumber}</div>
                </div>
            )
        },
        {
            header: "Status", accessorKey: "status", cell: (item) => (
                <Badge variant={item.status === 'INTERFACED' ? 'default' : item.status === 'NEW' ? 'secondary' : 'outline'}>
                    {item.status}
                </Badge>
            )
        },
        {
            header: "CIP Cost", accessorKey: "cost", cell: (item) => (
                <div className="font-mono flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    {parseFloat(item.cost).toLocaleString()}
                </div>
            )
        },
        { header: "In Service Date", accessorKey: "datePlacedInService", cell: (item) => item.datePlacedInService ? new Date(item.datePlacedInService).toLocaleDateString() : '-' },
        {
            header: "FA Interface", accessorKey: "faAssetId", cell: (item) => item.faAssetId ? (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Building className="h-3 w-3" />
                    Interfaced
                </div>
            ) : (
                <span className="text-xs text-muted-foreground">Pending</span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Capital Asset Workbench</h2>
                    <p className="text-muted-foreground">Manage Construction-in-Progress (CIP) assets and capitalization</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Run Capitalization</Button>
                    <Button>Create Asset</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total CIP Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${assets ? assets.reduce((acc, curr) => acc + parseFloat(curr.cost), 0).toLocaleString() : '0.00'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Interface</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {assets ? assets.filter(a => a.status === 'NEW').length : 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                <StandardTable
                    data={assets || []}
                    columns={columns}
                    isLoading={isLoading}
                    pageSize={10}
                    onRowClick={(item) => console.log('View asset', item.id)}
                />
            </Card>
        </div>
    );
}
