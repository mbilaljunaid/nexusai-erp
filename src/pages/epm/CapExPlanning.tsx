import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Calculator, Plus, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/dateUtils";

export default function CapExPlanning() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedModelId, setSelectedModelId] = useState<string>("");

    const { data: models = [] } = useQuery({
        queryKey: ["/api/epm/strategic-models"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/epm/strategic-models");
            return res.json();
        }
    });

    const { data: assets = [], isLoading } = useQuery({
        queryKey: ["/api/epm/capex-assets", selectedModelId],
        queryFn: async () => {
            const url = selectedModelId ? `/api/epm/capex-assets?modelId=${selectedModelId}` : "/api/epm/capex-assets";
            const res = await apiRequest("GET", url);
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/epm/capex-assets", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Asset added successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/epm/capex-assets"] });
        }
    });

    const [newAsset, setNewAsset] = useState({
        modelId: "",
        assetName: "",
        assetCategory: "IT Equipment",
        purchasePrice: 0,
        usefulLifeYears: 5,
        salvageValue: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        depreciationMethod: "Straight Line"
    });

    const columns = [
        {
            id: "assetName",
            header: "Asset Name",
            width: "250px",
            cell: (row: any) => <span className="font-medium">{row.assetName}</span>
        },
        {
            id: "assetCategory",
            header: "Category",
            width: "150px",
            cell: (row: any) => <span>{row.assetCategory}</span>
        },
        {
            id: "purchasePrice",
            header: "Purchase Price",
            width: "150px",
            cell: (row: any) => <span className="font-mono text-right w-full block">${parseFloat(row.purchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        },
        {
            id: "usefulLifeYears",
            header: "Life (Yrs)",
            width: "100px",
            cell: (row: any) => <span className="text-center w-full block">{row.usefulLifeYears}</span>
        },
        {
            id: "depreciationMethod",
            header: "Depreciation",
            width: "150px",
            cell: (row: any) => <span>{row.depreciationMethod}</span>
        },
        {
            id: "purchaseDate",
            header: "Purchase Date",
            width: "120px",
            cell: (row: any) => <span>{formatDate(row.purchaseDate)}</span>
        }
    ];

    const totalInvestment = assets.reduce((sum: number, asset: any) => sum + parseFloat(asset.purchasePrice || 0), 0);

    return (
        <StandardPage
            title="CapEx Planning"
            description="Manage capital asset plans and calculate automated depreciation grids."
            breadcrumbs={[
                { label: 'EPM Dashboard', href: '/epm' },
                { label: 'Planning', href: '/epm/planning' },
                { label: 'CapEx Planning' }
            ]}
            actions={
                <div className="flex items-center gap-4">
                    <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                        <SelectTrigger className="w-[250px] bg-white">
                            <SelectValue placeholder="All Strategic Models" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Models</SelectItem>
                            {models.map((m: any) => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="font-semibold shadcn-button-premium">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Planned Asset
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Capital Asset</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Strategic Model</Label>
                                    <Select
                                        value={newAsset.modelId}
                                        onValueChange={v => setNewAsset(p => ({ ...p, modelId: v }))}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Model Context" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">None (Standalone)</SelectItem>
                                            {models.map((m: any) => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Asset Name</Label>
                                    <Input
                                        value={newAsset.assetName}
                                        onChange={e => setNewAsset(p => ({ ...p, assetName: e.target.value }))}
                                        placeholder="e.g. New HQ Server Rack"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={newAsset.assetCategory} onValueChange={v => setNewAsset(p => ({ ...p, assetCategory: v }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                                                <SelectItem value="Machinery">Machinery</SelectItem>
                                                <SelectItem value="Buildings">Buildings</SelectItem>
                                                <SelectItem value="Vehicles">Vehicles</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Depreciation Method</Label>
                                        <Select value={newAsset.depreciationMethod} onValueChange={v => setNewAsset(p => ({ ...p, depreciationMethod: v }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Straight Line">Straight Line</SelectItem>
                                                <SelectItem value="Declining Balance">Declining Balance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Purchase Price ($)</Label>
                                        <Input
                                            type="number"
                                            value={newAsset.purchasePrice}
                                            onChange={e => setNewAsset(p => ({ ...p, purchasePrice: parseFloat(e.target.value) }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Salvage Value ($)</Label>
                                        <Input
                                            type="number"
                                            value={newAsset.salvageValue}
                                            onChange={e => setNewAsset(p => ({ ...p, salvageValue: parseFloat(e.target.value) }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Life (Years)</Label>
                                        <Input
                                            type="number"
                                            value={newAsset.usefulLifeYears}
                                            onChange={e => setNewAsset(p => ({ ...p, usefulLifeYears: parseInt(e.target.value) }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Purchase Date</Label>
                                    <Input
                                        type="date"
                                        value={newAsset.purchaseDate}
                                        onChange={e => setNewAsset(p => ({ ...p, purchaseDate: e.target.value }))}
                                    />
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => createMutation.mutate(newAsset)}
                                    disabled={!newAsset.assetName || newAsset.purchasePrice <= 0 || createMutation.isPending}
                                >
                                    <Calculator className="mr-2 h-4 w-4" /> Save & Calculate Depreciation
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >
            <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="col-span-1 border rounded-lg p-6 bg-card flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Planned Assets</p>
                        <h3 className="text-2xl font-bold tracking-tight">{assets.length}</h3>
                    </div>
                </div>
                <div className="col-span-1 border rounded-lg p-6 bg-card flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Planned CapEx</p>
                        <h3 className="text-2xl font-bold tracking-tight">${totalInvestment.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            <div className="h-[600px] border rounded-lg bg-background overflow-hidden relative shadow-sm">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-muted-foreground">
                        <Package className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No CapEx Assets</p>
                        <p className="text-sm opacity-70">Add assets to begin depreciation planning.</p>
                    </div>
                ) : (
                    <InteractiveSpreadsheet
                        data={assets}
                        columns={columns}
                        onChange={() => { }}
                        virtualized={true}
                        containerHeight="600px"
                    />
                )}
            </div>
        </StandardPage>
    );
}
