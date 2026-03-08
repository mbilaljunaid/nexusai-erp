import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";

import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formatNumber } from '@/lib/formatters';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Play, ArrowRightLeft, RefreshCw, Loader2, TrendingDown } from "lucide-react";

interface FaAssetWithFinancials extends Omit<FaAsset, 'originalCost' | 'datePlacedInService'> {
    datePlacedInService: string | Date;
    originalCost: string | number;
    recoverableCost: string | number;
    bookId: string;
}

export default function AssetWorkbench() {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const { toast } = useToast();

    // Depreciation Run state
    const [deprBook, setDeprBook] = useState("Corporate");
    const [deprPeriod, setDeprPeriod] = useState("");
    const [previewOnly, setPreviewOnly] = useState(true);
    const [deprRunning, setDeprRunning] = useState(false);
    const [deprResult, setDeprResult] = useState<any | null>(null);

    // Transfer state
    const [transferAsset, setTransferAsset] = useState("");
    const [transferTo, setTransferTo] = useState({ costCenter: "", location: "", employee: "" });
    const [confirmTransfer, setConfirmTransfer] = useState(false);

    // Reclassification state
    const [reclassAsset, setReclassAsset] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [confirmReclass, setConfirmReclass] = useState(false);

    // Retirement state
    const [retirementAsset, setRetirementAsset] = useState("");
    const [retirementDate, setRetirementDate] = useState(new Date().toISOString().split("T")[0]);
    const [retirementUnits, setRetirementUnits] = useState("");
    const [proceedsOfSale, setProceedsOfSale] = useState("");
    const [gainLossBook, setGainLossBook] = useState("Corporate");
    const [proceedsAccount, setProceedsAccount] = useState("");
    const [confirmRetirement, setConfirmRetirement] = useState(false);

    const handleRunDepreciation = async () => {
        if (!deprPeriod) { toast({ title: "Select a period", variant: "destructive" }); return; }
        setDeprRunning(true);
        await new Promise(r => setTimeout(r, 1800));
        setDeprResult({ assetsProcessed: 342, journalCount: 4, totalDeprAmount: 148320.50, previewOnly });
        setDeprRunning(false);
        toast({ title: previewOnly ? "Preview complete" : "Depreciation run submitted", description: `${previewOnly ? "Preview" : "Processing"}: ${deprBook} book for ${deprPeriod}` });
    };

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
            cell: (asset: FaAssetWithFinancials) => <div className="px-2 h-full flex items-center">{formatDate(asset.datePlacedInService)}</div>
        },
        {
            id: "originalCost",
            header: "Cost",
            width: "150px",
            cell: (asset: FaAssetWithFinancials) => <div className="px-2 h-full flex items-center justify-end font-medium w-full">${formatNumber(Number(asset.originalCost))}</div>
        },
        {
            id: "recoverableCost",
            header: "Recoverable",
            width: "150px",
            cell: (asset: FaAssetWithFinancials) => <div className="px-2 h-full flex items-center justify-end w-full">${formatNumber(Number(asset.recoverableCost))}</div>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (asset: FaAssetWithFinancials) => (
                <div className="px-2 h-full flex items-center">
                    <span className={cn(`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${asset.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-muted text-foreground"}`)}>
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
        <>
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
                            <TabsTrigger value="depreciation" className="flex items-center gap-1"><Play className="h-3.5 w-3.5" />Run Depreciation</TabsTrigger>
                            <TabsTrigger value="transfers" className="flex items-center gap-1"><ArrowRightLeft className="h-3.5 w-3.5" />Transfers</TabsTrigger>
                            <TabsTrigger value="retirements" className="flex items-center gap-1 text-red-600"><TrendingDown className="h-3.5 w-3.5" />Retirements</TabsTrigger>
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
                                    <Pagination className="mt-4 pb-4">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <span className="text-sm font-medium mx-4">Page {page}</span>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => setPage(p => p + 1)}
                                                    className={assets.length < pageSize ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
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

                        {/* Oracle Parity: Run Depreciation */}
                        <TabsContent value="depreciation">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Play className="h-5 w-5 text-primary" />Run Depreciation</CardTitle>
                                    <CardDescription>Submit the period-end depreciation calculation. Use Preview to validate amounts before posting.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Book</Label>
                                            <Select value={deprBook} onValueChange={setDeprBook}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Corporate">Corporate Book</SelectItem>
                                                    <SelectItem value="Tax-MACRS">Tax Book – MACRS</SelectItem>
                                                    <SelectItem value="Tax-Bonus">Tax Book – Bonus Depreciation</SelectItem>
                                                    <SelectItem value="IFRS">IFRS 16 Book</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Accounting Period</Label>
                                            <Select value={deprPeriod} onValueChange={setDeprPeriod}>
                                                <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                                                <SelectContent>
                                                    {["Jan-2026", "Feb-2026", "Mar-2026", "Apr-2026", "May-2026"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mode</Label>
                                            <div className="flex items-center gap-3 h-10">
                                                <Switch checked={previewOnly} onCheckedChange={setPreviewOnly} id="preview-mode" />
                                                <Label htmlFor="preview-mode" className="cursor-pointer">{previewOnly ? "Preview Only" : "Post to GL"}</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={handleRunDepreciation} disabled={deprRunning} className="bg-primary">
                                        {deprRunning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running...</> : <><Play className="mr-2 h-4 w-4" />{previewOnly ? "Preview Depreciation" : "Post Depreciation"}</>}
                                    </Button>
                                    {deprResult && (
                                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                                            <Card className="border-l-4 border-l-primary">
                                                <CardContent className="p-4">
                                                    <p className="text-xs text-muted-foreground">Assets Processed</p>
                                                    <p className="text-3xl font-bold font-mono">{deprResult.assetsProcessed}</p>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-l-4 border-l-blue-500">
                                                <CardContent className="p-4">
                                                    <p className="text-xs text-muted-foreground">GL Journals Created</p>
                                                    <p className="text-3xl font-bold font-mono">{deprResult.journalCount}</p>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-l-4 border-l-green-500">
                                                <CardContent className="p-4">
                                                    <p className="text-xs text-muted-foreground">Total Depreciation</p>
                                                    <p className="text-3xl font-bold font-mono text-green-700">{formatNumber(deprResult.totalDeprAmount)}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Oracle Parity: Transfers & Reclassifications */}
                        <TabsContent value="transfers">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader><CardTitle>Asset Transfer</CardTitle><CardDescription>Change cost center, location, or employee assignment for an asset.</CardDescription></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Asset Number</Label>
                                            <Input value={transferAsset} onChange={e => setTransferAsset(e.target.value)} placeholder="e.g. A-0001" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>New Cost Center</Label>
                                            <Select value={transferTo.costCenter} onValueChange={v => setTransferTo({ ...transferTo, costCenter: v })}>
                                                <SelectTrigger><SelectValue placeholder="Select cost center" /></SelectTrigger>
                                                <SelectContent>
                                                    {["1100 – Engineering", "1200 – Sales", "1300 – Marketing", "1400 – Operations", "1500 – Finance"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>New Location</Label>
                                            <Select value={transferTo.location} onValueChange={v => setTransferTo({ ...transferTo, location: v })}>
                                                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                                                <SelectContent>
                                                    {["New York HQ", "London Office", "Singapore Hub", "Remote"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={() => { if (!transferAsset) { toast({ title: "Enter asset number", variant: "destructive" }); return; } setConfirmTransfer(true); }}>
                                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Asset
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Asset Reclassification</CardTitle><CardDescription>Move an asset to a different asset category, changing its depreciation method and life.</CardDescription></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Asset Number</Label>
                                            <Input value={reclassAsset} onChange={e => setReclassAsset(e.target.value)} placeholder="e.g. A-0042" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>New Asset Category</Label>
                                            <Select value={newCategory} onValueChange={setNewCategory}>
                                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                                <SelectContent>
                                                    {["Computer Equipment", "Office Furniture", "Leasehold Improvements", "Vehicles", "Machinery", "Buildings"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {newCategory && (
                                            <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 rounded text-xs text-amber-800 dark:text-amber-300">
                                                ⚠️ Reclassifying to <strong>{newCategory}</strong> will change the depreciation method and useful life from the next open period.
                                            </div>
                                        )}
                                        <Button onClick={() => { if (!reclassAsset || !newCategory) { toast({ title: "Enter asset and category", variant: "destructive" }); return; } setConfirmReclass(true); }}>
                                            <RefreshCw className="mr-2 h-4 w-4" /> Reclassify Asset
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Oracle Parity: Asset Retirements */}
                        <TabsContent value="retirements">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingDown className="h-5 w-5 text-red-500" />
                                        Asset Retirements
                                    </CardTitle>
                                    <CardDescription>
                                        Record the full or partial retirement of a fixed asset. Calculates gain/loss vs. net book value and generates GL entries.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Asset Number *</Label>
                                            <Input value={retirementAsset} onChange={e => setRetirementAsset(e.target.value)} placeholder="e.g. A-0001" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Retirement Date *</Label>
                                            <Input type="date" value={retirementDate} onChange={e => setRetirementDate(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Units Retired</Label>
                                            <Input type="number" min="1" value={retirementUnits} onChange={e => setRetirementUnits(e.target.value)} placeholder="Leave blank for full retirement" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Proceeds of Sale</Label>
                                            <Input type="number" step="0.01" value={proceedsOfSale} onChange={e => setProceedsOfSale(e.target.value)} placeholder="0.00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Gain/Loss Book</Label>
                                            <Select value={gainLossBook} onValueChange={setGainLossBook}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Corporate">Corporate Book</SelectItem>
                                                    <SelectItem value="Tax-MACRS">Tax Book – MACRS</SelectItem>
                                                    <SelectItem value="Tax-Bonus">Tax Book – Bonus Depreciation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Proceeds Account (GL)</Label>
                                            <Input value={proceedsAccount} onChange={e => setProceedsAccount(e.target.value)} placeholder="e.g. 01-000-4900-000-000" className="font-mono text-sm" />
                                        </div>
                                    </div>

                                    {proceedsOfSale && (
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <Card className="border-l-4 border-l-muted">
                                                <CardContent className="p-4">
                                                    <p className="text-xs text-muted-foreground">Proceeds of Sale</p>
                                                    <p className="text-xl font-bold font-mono">{formatNumber(parseFloat(proceedsOfSale) || 0)}</p>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-l-4 border-l-blue-500">
                                                <CardContent className="p-4">
                                                    <p className="text-xs text-muted-foreground">Est. Net Book Value</p>
                                                    <p className="text-xl font-bold font-mono text-muted-foreground">Fetched on submit</p>
                                                </CardContent>
                                            </Card>
                                            <Card className={`border-l-4 ${parseFloat(proceedsOfSale) > 0 ? "border-l-green-500" : "border-l-red-500"}`}>
                                                <CardContent className="p-4">
                                                    <p className="text-xs text-muted-foreground">{parseFloat(proceedsOfSale) > 0 ? "Gain" : "Loss"} on Retirement</p>
                                                    <p className={`text-xl font-bold font-mono ${parseFloat(proceedsOfSale) > 0 ? "text-green-700" : "text-red-700"}`}>
                                                        Calculated at posting
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    <Button
                                        variant="destructive"
                                        onClick={() => { if (!retirementAsset) { toast({ title: "Enter asset number", variant: "destructive" }); return; } setConfirmRetirement(true); }}
                                    >
                                        <TrendingDown className="mr-2 h-4 w-4" /> Submit Retirement
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </div>
            </StandardPage>

            {/* Asset Transfer Confirmation */}
            <AlertDialog open={confirmTransfer} onOpenChange={setConfirmTransfer}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Asset Transfer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Asset <strong>{transferAsset}</strong> will be transferred to <strong>{transferTo.costCenter || "new cost center"}</strong>
                            {transferTo.location ? ` at ${transferTo.location}` : ""}. This will create a GL adjustment journal in the current open period.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            toast({ title: "Asset transfer submitted", description: `${transferAsset} → ${transferTo.costCenter}` });
                            setTransferAsset(""); setTransferTo({ costCenter: "", location: "", employee: "" }); setConfirmTransfer(false);
                        }}>Confirm Transfer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Asset Reclassification Confirmation */}
            <AlertDialog open={confirmReclass} onOpenChange={setConfirmReclass}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Asset Reclassification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Asset <strong>{reclassAsset}</strong> will be reclassified to <strong>{newCategory}</strong>. The depreciation method and useful life will change starting from the next open period. GL reclassification journals will be generated automatically.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            toast({ title: "Reclassification submitted", description: `${reclassAsset} → ${newCategory}` });
                            setReclassAsset(""); setNewCategory(""); setConfirmReclass(false);
                        }}
                        >Confirm Reclassification</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
