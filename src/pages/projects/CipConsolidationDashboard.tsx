import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, CheckCircle2, Send, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface PortfolioAsset {
    id: string;
    projectId: string;
    projectName: string;
    assetName: string;
    assetType: string;
    status: "DRAFT" | "INF-PENDING" | "INTERFACED";
    totalCost: number;
    lineCount: number;
}

interface ConsolidationBatch {
    id: string;
    batchName: string;
    createdDate: string;
    assetCount: number;
    totalValue: number;
    status: "PENDING" | "SUBMITTED" | "COMPLETE";
}

export default function CipConsolidationDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());

    // Fetch portfolio assets (all projects)
    const { data: assets = [] } = useQuery<PortfolioAsset[]>({
        queryKey: ["portfolio-assets"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/cip/portfolio");
            return res.json();
        }
    });

    // Fetch consolidation batches
    const { data: batches = [] } = useQuery<ConsolidationBatch[]>({
        queryKey: ["consolidation-batches"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/cip/batches");
            if (!res.ok) throw new Error("Failed to fetch consolidation batches");
            return res.json();
        }
    });

    // Create consolidated batch mutation
    const consolidateMutation = useMutation({
        mutationFn: async (assetIds: string[]) => {
            const res = await fetch("/api/ppm/cip/consolidate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assetIds })
            });
            if (!res.ok) throw new Error("Consolidation failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consolidation-batches"] });
            setSelectedAssetIds(new Set());
            toast({
                title: "Batch Created",
                description: "Consolidated capitalization batch created successfully."
            });
        }
    });

    const toggleAssetSelection = (assetId: string) => {
        const newSelection = new Set(selectedAssetIds);
        if (newSelection.has(assetId)) {
            newSelection.delete(assetId);
        } else {
            newSelection.add(assetId);
        }
        setSelectedAssetIds(newSelection);
    };

    const selectedAssets = assets.filter(a => selectedAssetIds.has(a.id));
    const selectedValue = selectedAssets.reduce((sum, a) => sum + a.totalCost, 0);

    const groupedByProject = assets.reduce((acc, asset) => {
        if (!acc[asset.projectId]) {
            acc[asset.projectId] = { projectName: asset.projectName, assets: [] };
        }
        acc[asset.projectId].assets.push(asset);
        return acc;
    }, {} as Record<string, { projectName: string; assets: PortfolioAsset[] }>);

    return (
        <StandardPage
            title="Multi-Project CIP Consolidation"
            description="Consolidate construction-in-progress assets across multiple projects for portfolio-level capitalization."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "CIP Consolidation" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Assets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{assets.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                                {Object.keys(groupedByProject).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Selected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">{selectedAssetIds.size}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Selected Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">${selectedValue.toFixed(0)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Portfolio Assets */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="h-5 w-5" /> Portfolio Assets
                                </CardTitle>
                                <CardDescription>CIP assets across all projects</CardDescription>
                            </div>
                            <Button
                                onClick={() => consolidateMutation.mutate(Array.from(selectedAssetIds))}
                                disabled={selectedAssetIds.size === 0 || consolidateMutation.isPending}
                            >
                                <Package className="h-4 w-4 mr-2" />
                                {consolidateMutation.isPending ? "Creating..." : `Consolidate (${selectedAssetIds.size})`}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {Object.entries(groupedByProject).map(([projectId, { projectName, assets: projectAssets }]) => (
                            <div key={projectId} className="mb-6 last:mb-0">
                                <h3 className="font-bold text-sm mb-2 text-primary">{projectName}</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">Select</TableHead>
                                            <TableHead>Asset Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Cost</TableHead>
                                            <TableHead className="text-right">Lines</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projectAssets.map((asset) => (
                                            <TableRow key={asset.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedAssetIds.has(asset.id)}
                                                        onCheckedChange={() => toggleAssetSelection(asset.id)}
                                                        disabled={asset.status === "INTERFACED"}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{asset.assetName}</TableCell>
                                                <TableCell><Badge variant="outline">{asset.assetType}</Badge></TableCell>
                                                <TableCell className="text-right font-mono">${asset.totalCost.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">{asset.lineCount}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={asset.status === "INTERFACED" ? "default" : "secondary"}
                                                        className={asset.status === "INTERFACED" ? "bg-green-600" : ""}
                                                    >
                                                        {asset.status === "INTERFACED" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                        {asset.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Consolidation Batches */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle>Consolidation History</CardTitle>
                        <CardDescription>Previous consolidated capitalization batches</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {batches.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No consolidation batches yet. Select assets and consolidate.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Batch Name</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Assets</TableHead>
                                        <TableHead className="text-right">Total Value</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">{batch.batchName}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{batch.createdDate}</TableCell>
                                            <TableCell className="text-right">{batch.assetCount}</TableCell>
                                            <TableCell className="text-right font-mono">${batch.totalValue.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={batch.status === "COMPLETE" ? "default" : "secondary"}>
                                                    {batch.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
