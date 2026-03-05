import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus, Send, FileText, CheckCircle2, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectAsset {
    id: string;
    projectId: string;
    assetName: string;
    assetDescription: string;
    assetNumber?: string;
    status: "DRAFT" | "INF-PENDING" | "INTERFACED";
    assetType: string;
    faAssetId?: string;
    createdAt: string;
    totalCapitalizedAmount?: number;
    lineCount?: number;
}

interface AssetLine {
    id: string;
    projectAssetId: string;
    expenditureItemId: string;
    expenditureDescription: string;
    capitalizedAmount: number;
    status: "NEW" | "INTERFACED";
    createdAt: string;
}

export default function CipWorkbench() {
    const { projectId } = useParams<{ projectId: string }>();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
    const [newAsset, setNewAsset] = useState({
        assetName: "",
        assetDescription: "",
        assetType: "EQUIPMENT"
    });

    // Fetch project assets
    const { data: assets = [], isLoading: assetsLoading } = useQuery<ProjectAsset[]>({
        queryKey: ["project-assets", projectId],
        queryFn: async () => {
            const res = await fetch(`/api/ppm/projects/${projectId}/assets`);
            return res.json();
        },
        enabled: !!projectId
    });

    // Fetch asset lines for selected asset
    const { data: assetLines = [] } = useQuery<AssetLine[]>({
        queryKey: ["asset-lines", selectedAssetId],
        queryFn: async () => {
            // Mock implementation - replace with actual API
            return [];
        },
        enabled: !!selectedAssetId
    });

    // Create asset mutation
    const createAssetMutation = useMutation({
        mutationFn: async (assetData: typeof newAsset) => {
            const res = await fetch("/api/ppm/project-assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    ...assetData
                })
            });
            if (!res.ok) throw new Error("Failed to create asset");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-assets"] });
            setIsCreateDialogOpen(false);
            setNewAsset({ assetName: "", assetDescription: "", assetType: "EQUIPMENT" });
            toast({
                title: "Asset Created",
                description: "Project asset created successfully."
            });
        }
    });

    // Generate asset lines mutation
    const generateLinesMutation = useMutation({
        mutationFn: async (assetId: string) => {
            const res = await fetch(`/api/ppm/assets/${assetId}/generate-lines`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Failed to generate lines");
            return res.json();
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["asset-lines"] });
            queryClient.invalidateQueries({ queryKey: ["project-assets"] });
            setIsGenerateDialogOpen(false);
            toast({
                title: "Lines Generated",
                description: `${result.linesGenerated} asset lines created.`
            });
        }
    });

    // Capitalize asset mutation
    const capitalizeMutation = useMutation({
        mutationFn: async (assetId: string) => {
            const res = await fetch(`/api/ppm/assets/${assetId}/capitalize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Failed to capitalize asset");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-assets"] });
            toast({
                title: "Asset Capitalized",
                description: "Asset has been interfaced to Fixed Assets module."
            });
        }
    });

    const selectedAsset = assets.find(a => a.id === selectedAssetId);



    return (
        <StandardPage
            title="CIP Workbench"
            description="Manage Construction-in-Progress (CIP) assets and capitalize to Fixed Assets."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "CIP Workbench" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Draft Assets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">
                                {assets.filter(a => a.status === "DRAFT").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">
                                {assets.filter(a => a.status === "INF-PENDING").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Capitalized</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">
                                {assets.filter(a => a.status === "INTERFACED").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Total Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">
                                ${assets.reduce((sum, a) => sum + (a.totalCapitalizedAmount || 0), 0).toFixed(0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Asset Registry */}
                    <Card className="lg:col-span-2 border-t-4 border-t-blue-500">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" /> Project Assets (CIP)
                                    </CardTitle>
                                    <CardDescription>Assets under construction for this project.</CardDescription>
                                </div>
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="h-4 w-4 mr-2" /> New Asset
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Project Asset</DialogTitle>
                                            <DialogDescription>Define a new capitalizable asset for this project.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="assetName">Asset Name *</Label>
                                                <Input
                                                    id="assetName"
                                                    value={newAsset.assetName}
                                                    onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })}
                                                    placeholder="e.g., Manufacturing Equipment"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="assetDescription">Description</Label>
                                                <Textarea
                                                    id="assetDescription"
                                                    value={newAsset.assetDescription}
                                                    onChange={(e) => setNewAsset({ ...newAsset, assetDescription: e.target.value })}
                                                    placeholder="Detailed asset description"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="assetType">Asset Type</Label>
                                                <Select value={newAsset.assetType} onValueChange={(v) => setNewAsset({ ...newAsset, assetType: v })}>
                                                    <SelectTrigger id="assetType">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                                        <SelectItem value="BUILDING">Building</SelectItem>
                                                        <SelectItem value="SOFTWARE">Software</SelectItem>
                                                        <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                            <Button
                                                onClick={() => createAssetMutation.mutate(newAsset)}
                                                disabled={createAssetMutation.isPending || !newAsset.assetName}
                                            >
                                                {createAssetMutation.isPending ? "Creating..." : "Create Asset"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {assetsLoading ? (
                                <TableSkeleton rows={5} /> : assets.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No assets created yet. Click "New Asset" to start.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Asset Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Lines</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assets.map((asset) => (
                                            <TableRow
                                                key={asset.id}
                                                className={selectedAssetId === asset.id ? "bg-blue-50" : "cursor-pointer hover:bg-muted/50"}
                                                onClick={() => setSelectedAssetId(asset.id)}
                                            >
                                                <TableCell className="font-medium">{asset.assetName}</TableCell>
                                                <TableCell><Badge variant="outline">{asset.assetType}</Badge></TableCell>
                                                <TableCell>{asset.lineCount || 0} lines</TableCell>
                                                <TableCell className="text-right font-mono">${(asset.totalCapitalizedAmount || 0).toFixed(2)}</TableCell>
                                                <TableCell><StatusBadge status={asset.status} /></TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedAssetId(asset.id);
                                                        }}
                                                    >
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Asset Details & Actions */}
                    <Card className="lg:col-span-1 border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle className="text-sm">Asset Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedAsset ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Select an asset to view details and actions
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 bg-muted rounded-lg space-y-2">
                                        <h4 className="font-bold text-sm">{selectedAsset.assetName}</h4>
                                        <p className="text-xs text-muted-foreground">{selectedAsset.assetDescription}</p>
                                        <div className="flex justify-between text-xs pt-2 border-t">
                                            <span className="text-muted-foreground">Status:</span>
                                            <StatusBadge status={selectedAsset.status} />
                                        </div>
                                        {selectedAsset.assetNumber && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Asset #:</span>
                                                <span className="font-mono">{selectedAsset.assetNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Button
                                            className="w-full justify-start"
                                            variant={selectedAsset.status === "DRAFT" ? "default" : "secondary"}
                                            size="sm"
                                            onClick={() => {
                                                setIsGenerateDialogOpen(true);
                                            }}
                                            disabled={selectedAsset.status === "INTERFACED"}
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Generate Asset Lines
                                        </Button>

                                        <Button
                                            className="w-full justify-start"
                                            variant={selectedAsset.status === "INF-PENDING" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => capitalizeMutation.mutate(selectedAsset.id)}
                                            disabled={selectedAsset.status !== "DRAFT" || capitalizeMutation.isPending}
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {capitalizeMutation.isPending ? "Processing..." : "Capitalize to FA"}
                                        </Button>
                                    </div>

                                    {assetLines.length > 0 && (
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold uppercase text-muted-foreground">Asset Lines</h5>
                                            <div className="max-h-48 overflow-y-auto space-y-1">
                                                {assetLines.map((line) => (
                                                    <div key={line.id} className="p-2 bg-white rounded border text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground truncate">{line.expenditureDescription}</span>
                                                            <span className="font-mono">${line.capitalizedAmount.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Generate Lines Dialog */}
                <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate Asset Lines</DialogTitle>
                            <DialogDescription>
                                Auto-generate asset lines from capitalizable expenditure items for this asset.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-sm text-muted-foreground">
                                This will scan all expenditures marked as "capitalizable" for this project and create asset lines.
                                Only unassigned expenditures will be included.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={() => selectedAsset && generateLinesMutation.mutate(selectedAsset.id)}
                                disabled={generateLinesMutation.isPending}
                            >
                                {generateLinesMutation.isPending ? "Generating..." : "Generate Lines"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </StandardPage>
    );
}
