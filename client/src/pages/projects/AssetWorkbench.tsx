import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, ArrowUpRight, DollarSign, CheckCircle2 } from "lucide-react";

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

interface AssetResponse {
    items: ProjectAsset[];
    total: number;
}

export default function AssetWorkbench() {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    const { data: results, isLoading } = useQuery<AssetResponse>({
        queryKey: ['/api/ppm/assets', page, pageSize],
        queryFn: async ({ queryKey }) => {
            const [url, p, ps] = queryKey;
            const offset = (Number(p) - 1) * Number(ps);
            const res = await fetch(`${url}?limit=${ps}&offset=${offset}`);
            if (!res.ok) throw new Error("Failed to fetch assets");
            return res.json();
        }
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
                        <CardTitle className="text-sm font-medium">Total CIP Portfolio</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {results?.total || 0} Assets
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Readiness</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="font-medium">Operational</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                <StandardTable
                    data={results?.items || []}
                    columns={columns}
                    isLoading={isLoading}
                    page={page}
                    pageSize={pageSize}
                    totalItems={results?.total}
                    onPageChange={setPage}
                    onRowClick={(item) => console.log('View asset', item.id)}
                />
            </Card>
        </div>
    );
}
