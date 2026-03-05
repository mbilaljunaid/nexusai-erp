import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, ArrowUpRight, DollarSign, CheckCircle2 } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

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

    const columns: SpreadsheetColumn<any>[] = [
        {
            id: "description", header: "Asset Name", width: "30%", cell: (item: any) => (
                <div className="p-2">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-xs text-muted-foreground">{item.assetNumber}</div>
                </div>
            )
        },
        {
            id: "status", header: "Status", width: "15%", cell: (item: any) => (
                <div className="p-2">
                    <Badge variant={item.status === 'INTERFACED' ? 'default' : item.status === 'NEW' ? 'secondary' : 'outline'}>
                        {item.status}
                    </Badge>
                </div>
            )
        },
        {
            id: "cost", header: "CIP Cost", width: "15%", cell: (item: any) => (
                <div className="p-2 font-mono flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    {parseFloat(item.cost).toLocaleString()}
                </div>
            )
        },
        { id: "datePlacedInService", header: "In Service Date", width: "20%", cell: (item: any) => <div className="p-2">{item.datePlacedInService ? new Date(item.datePlacedInService).toLocaleDateString() : '-'}</div> },
        {
            id: "faAssetId", header: "FA Interface", width: "20%", cell: (item: any) => <div className="p-2">
                {item.faAssetId ? (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Building className="h-3 w-3" />
                        Interfaced
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                )}
            </div>
        }
    ];

    return (
        <StandardPage
            title="Capital Asset Workbench"
            description="Manage Construction-in-Progress (CIP) assets and capitalization"
            actions={
                <>
                    <Button variant="outline">Run Capitalization</Button>
                    <Button>Create Asset</Button>
                </>
            }
        >

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
                {isLoading ? (
                    <TableSkeleton rows={5} />
                ) : (
                    <InteractiveSpreadsheet
                        data={results?.items || []}
                        columns={columns}
                        virtualized={true}
                        containerHeight="600px"
                        onChange={() => { }}
                    />
                )}
            </Card>
        </StandardPage>
    );
}
