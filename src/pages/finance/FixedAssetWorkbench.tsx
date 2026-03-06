import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Briefcase, TrendingUp, AlertCircle, History,
    Plus, Calculator, ArrowRightLeft, Trash2, Search,
    Filter, Download, Calendar, Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useEnterpriseStore } from "@/lib/enterpriseStore";
import { ContextualSearch } from "@/components/ContextualSearch";
import { DatePicker } from '@/components/ui/DatePicker';

interface Asset {
    id: string;
    assetNumber: string;
    description: string;
    majorCategory: string;
    originalCost: string;
    netBookValue: string;
    status: string;
    datePlacedInService: string;
}

export default function FixedAssetWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("dashboard");
    const { selectedLegalEntity, legalEntityId } = useEnterpriseStore() as any;
    const activeLedgerId = (selectedLegalEntity as any)?.ledgerId || legalEntityId;
    const faHeaders: Record<string, string> = {};
    if (activeLedgerId) {
        faHeaders['x-ledger-id'] = activeLedgerId;
        faHeaders['x-legal-entity-id'] = activeLedgerId;
    }

    // Queries
    const { data: assetResponse = { data: [], total: 0 }, isLoading: loadingAssets } = useQuery<any>({
        queryKey: ["/api/fa/assets", activeLedgerId],
    });
    const assets = (assetResponse as any).data || [];

    const { data: stats = { totalCost: "0", activeCount: 0, retiredCount: 0 } } = useQuery<any>({
        queryKey: ["/api/fa/stats", activeLedgerId],
    });

    const { data: massAdditions = [] } = useQuery<any>({
        queryKey: ["/api/fa/mass-additions", activeLedgerId],
    });

    // Mutations
    const runDepreciationMutation = useMutation({
        mutationFn: async (vars: { bookId: string, periodName: string, periodEndDate: string }) => {
            const res = await fetch("/api/fa/depreciation/run", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...faHeaders },
                body: JSON.stringify(vars)
            });
            if (!res.ok) throw new Error("Failed to run depreciation");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Depreciation Started", description: "The process is running in the background." });
            queryClient.invalidateQueries({ queryKey: ["/api/fa/assets"] });
        }
    });

    const assetColumns: any[] = [
        { id: "assetNumber", header: "Asset #", width: "150px", cell: (row: any) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.assetNumber}</span> },
        {
            id: "assetTag",
            header: "Asset Tag",
            width: "150px",
            cell: (row: any) => <span className="font-mono text-blue-600 font-semibold">{row.assetTag}</span>
        },
        {
            id: "description",
            header: "Description",
            width: "250px", cell: (row: any) => <span>{row.description}</span>
        },
        { id: "datePlacedInService", header: "In Service", width: "150px", cell: (row: any) => <span>{formatDate(row.datePlacedInService)}</span> },
        { id: "originalCost", header: "Cost", width: "150px", cell: (row: any) => <span className="tabular-nums">${parseFloat(row.originalCost || "0").toLocaleString()}</span> },
        {
            id: "category",
            header: "Category",
            width: "150px",
            cell: (row: any) => <Badge variant="outline">{row.category}</Badge>
        },
        { id: "method", header: "Method", width: "150px", cell: (row: any) => <span>{row.method}</span> },
        {
            id: "status",
            header: "Status",
            width: "150px", cell: (row: any) => (
                <Badge variant={row.status === "ACTIVE" ? "default" : "secondary"}>{row.status}</Badge>
            )
        },
        {
            id: "actions", header: "Actions", width: "150px", cell: (row: any) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ArrowRightLeft className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Fixed Asset Workbench"
            description="Asset Lifecycle, Depreciation & Compliance Hub"
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Fixed Assets" }]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Asset
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Ledger Context Banner */}
                {activeLedgerId && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm">
                        <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                            Scoped to Ledger: {activeLedgerId}
                        </span>
                        <span className="text-indigo-500 dark:text-indigo-500 text-xs">— Asset Book Ledger Filter Active</span>
                    </div>
                )}
                {/* Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gross Asset Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${parseFloat(stats.totalCost || "0").toLocaleString()}
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                +12% vs last year
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
                            <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {stats.activeCount}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Managed in system
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Depreciation Coverage</CardTitle>
                            <Calculator className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-500">
                                98%
                            </div>
                            <Progress value={98} className="mt-2 h-2" indicatorClassName="bg-amber-500" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Retired (YTD)</CardTitle>
                            <History className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">
                                {(stats as any).retiredCount}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Lifecycle completion
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                    <TabsList>
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="registry">Asset Registry</TabsTrigger>
                        <TabsTrigger value="depreciation">Depreciation Run</TabsTrigger>
                        <TabsTrigger value="mass-additions">Mass Additions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Recent Transactions</CardTitle>
                                    <CardDescription>Additions, Retirements, and Adjustments</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Asset</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell><Badge variant="outline" className="text-green-600 border-green-600">ADDITION</Badge></TableCell>
                                                <TableCell className="font-medium">Generator G-200</TableCell>
                                                <TableCell className="text-muted-foreground">2026-02-01</TableCell>
                                                <TableCell className="text-right font-mono">$50,000.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><Badge variant="outline" className="text-indigo-600 border-indigo-600">DEPR</Badge></TableCell>
                                                <TableCell className="font-medium">Server Rack A1</TableCell>
                                                <TableCell className="text-muted-foreground">2026-01-31</TableCell>
                                                <TableCell className="text-right font-mono">$1,250.00</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Category Split</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Machinery</span>
                                            <span className="text-indigo-600 font-bold">45%</span>
                                        </div>
                                        <Progress value={45} className="h-2" indicatorClassName="bg-indigo-600" />

                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Furniture</span>
                                            <span className="text-green-600 font-bold">30%</span>
                                        </div>
                                        <Progress value={30} className="h-2" indicatorClassName="bg-green-600" />

                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">IT Equipment</span>
                                            <span className="text-amber-500 font-bold">25%</span>
                                        </div>
                                        <Progress value={25} className="h-2" indicatorClassName="bg-amber-500" />
                                    </CardContent>
                                </Card>

                                <Card className="bg-indigo-600 text-white shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Compliance Alert
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <p className="mb-4">3 Assets are missing L4 Lease references required for IFRS 16 reporting.</p>
                                        <Button variant="secondary" className="w-full text-indigo-600 font-bold">
                                            Fix Now
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="registry">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Asset Registry</CardTitle>
                                        <CardDescription>Manage your entire fixed asset portfolio</CardDescription>
                                    </div>
                                    <div className="flex gap-2 w-80">
                                        <div className="flex-1">
                                            <ContextualSearch
                                                placeholder="Search by number or tag..."
                                                fields={[
                                                    { key: "assetNumber", label: "Asset Number", type: "text" },
                                                    { key: "assetTag", label: "Asset Tag", type: "text" },
                                                    { key: "status", label: "Status", type: "select", options: [{ value: "ACTIVE", label: "Active" }, { value: "RETIRED", label: "Retired" }] }
                                                ]}
                                                onSearch={() => { }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <InteractiveSpreadsheet
                                    columns={assetColumns}
                                    data={assets}
                                    onChange={() => { }}
                                    virtualized={true}
                                    containerHeight="600px"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="depreciation">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-t-4 border-t-amber-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5 text-amber-500" />
                                        Execute Period Run
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-4 bg-muted/50 rounded-lg border space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs text-muted-foreground uppercase font-bold">Asset Book</label>
                                                <Input disabled value="CORP_USD_BOOK" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-muted-foreground uppercase font-bold">Current Period</label>
                                                <Input disabled value="FEB-2026" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-muted-foreground uppercase font-bold">GL Post Date</label>
                                            <DatePicker value="2026-02-10" onChange={() => { }} />
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full text-lg py-6"
                                        onClick={() => runDepreciationMutation.mutate({
                                            bookId: "CORP-BOOK-1",
                                            periodName: "FEB-2026",
                                            periodEndDate: "2026-02-28"
                                        })}
                                        disabled={runDepreciationMutation.isPending}
                                    >
                                        {runDepreciationMutation.isPending ? "Processing..." : "Initiate Depreciation Run"}
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground italic">
                                        SLA journals will be generated automatically upon completion.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Run History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Period</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Accounting</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-medium">JAN-2026</TableCell>
                                                <TableCell><StatusBadge status="Completed" /></TableCell>
                                                <TableCell className="text-right text-indigo-600 hover:underline cursor-pointer">GL-4492</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">DEC-2025</TableCell>
                                                <TableCell><StatusBadge status="Completed" /></TableCell>
                                                <TableCell className="text-right text-indigo-600 hover:underline cursor-pointer">GL-3910</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="mass-additions">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle>Mass Additions Queue</CardTitle>
                                    <CardDescription>Purchased items from AP awaiting asset creation</CardDescription>
                                </div>
                                <Button variant="outline" onClick={() => fetch("/api/fa/mass-additions/prepare", { method: "POST" }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/fa/mass-additions"] }))}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Import from AP
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Vendor</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(massAdditions as any[]).map((ma: any) => (
                                            <TableRow key={ma.id}>
                                                <TableCell className="font-mono">{ma.invoiceNumber}</TableCell>
                                                <TableCell className="font-medium">{ma.description}</TableCell>
                                                <TableCell className="text-muted-foreground">{ma.vendorName}</TableCell>
                                                <TableCell className="font-bold">${parseFloat(ma.amount).toLocaleString()}</TableCell>
                                                <TableCell><Badge variant="outline" className="text-amber-600 border-amber-600">{ma.status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm">Prepare</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(massAdditions as any[]).length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                                                    AP integration queue is empty.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
