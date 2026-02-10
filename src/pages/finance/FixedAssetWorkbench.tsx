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
    Filter, Download, Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardWidget } from "@/components/layout/StandardDashboard";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

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

    // Queries
    const { data: assetResponse = { data: [], total: 0 }, isLoading: loadingAssets } = useQuery<any>({
        queryKey: ["/api/fa/assets"],
    });
    const assets = (assetResponse as any).data || [];

    const { data: stats = { totalCost: "0", activeCount: 0, retiredCount: 0 } } = useQuery<any>({
        queryKey: ["/api/fa/stats"],
    });

    const { data: massAdditions = [] } = useQuery<any>({
        queryKey: ["/api/fa/mass-additions"],
    });

    // Mutations
    const runDepreciationMutation = useMutation({
        mutationFn: async (vars: { bookId: string, periodName: string, periodEndDate: string }) => {
            const res = await fetch("/api/fa/depreciation/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

    const assetColumns: Column<any>[] = [
        { header: "Asset #", accessorKey: "assetNumber", cell: (row) => <span className="font-mono font-bold text-indigo-400">{row.assetNumber}</span> },
        { header: "Description", accessorKey: "description" },
        { header: "In Service", accessorKey: "datePlacedInService", cell: (row) => <span>{new Date(row.datePlacedInService).toLocaleDateString()}</span> },
        { header: "Cost", accessorKey: "originalCost", cell: (row) => <span className="text-right tabular-nums">${parseFloat(row.originalCost || "0").toLocaleString()}</span> },
        { header: "Method", accessorKey: "method" },
        {
            header: "Status", accessorKey: "status", cell: (row) => (
                <Badge variant={row.status === "ACTIVE" ? "default" : "secondary"}>{row.status}</Badge>
            )
        },
        {
            header: "Actions", id: "actions", cell: (row) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ArrowRightLeft className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400"><Trash2 className="h-4 w-4" /></Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-slate-950 text-slate-200 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-900 px-6 py-4 rounded-xl border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Fixed Asset Workbench</h1>
                        <p className="text-slate-400 text-sm">Asset Lifecycle, Depreciation & Compliance Hub</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Asset
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DashboardWidget title="Gross Asset Value" icon={TrendingUp}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">${parseFloat(stats.totalCost || "0").toLocaleString()}</span>
                        <span className="text-xs text-green-400">+12% vs last year</span>
                    </div>
                </DashboardWidget>
                <DashboardWidget title="Active Assets" icon={Briefcase}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-indigo-400">{stats.activeCount}</span>
                        <span className="text-xs text-slate-400">Managed in system</span>
                    </div>
                </DashboardWidget>
                <DashboardWidget title="Depreciation Coverage" icon={Calculator}>
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-bold text-yellow-400">98%</span>
                        <Progress value={98} className="h-1 bg-slate-800" indicatorClassName="bg-yellow-400" />
                    </div>
                </DashboardWidget>
                <DashboardWidget title="Retired (YTD)" icon={History}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-red-400">{(stats as any).retiredCount}</span>
                        <span className="text-xs text-slate-400">Lifecycle completion</span>
                    </div>
                </DashboardWidget>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <TabsList className="bg-slate-900 border-slate-800 p-1">
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Dashboard</TabsTrigger>
                    <TabsTrigger value="registry" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Asset Registry</TabsTrigger>
                    <TabsTrigger value="depreciation" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Depreciation Run</TabsTrigger>
                    <TabsTrigger value="mass-additions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Mass Additions</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white">Recent Transactions</CardTitle>
                                <CardDescription className="text-slate-400">Additions, Retirements, and Adjustments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-800">
                                            <TableHead className="text-slate-400">Type</TableHead>
                                            <TableHead className="text-slate-400">Asset</TableHead>
                                            <TableHead className="text-slate-400">Date</TableHead>
                                            <TableHead className="text-slate-400 text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="border-slate-800">
                                            <TableCell><Badge variant="outline" className="border-green-500/50 text-green-500">ADDITION</Badge></TableCell>
                                            <TableCell className="text-slate-200">Generator G-200</TableCell>
                                            <TableCell className="text-slate-400">2026-02-01</TableCell>
                                            <TableCell className="text-right text-white font-mono">$50,000.00</TableCell>
                                        </TableRow>
                                        <TableRow className="border-slate-800">
                                            <TableCell><Badge variant="outline" className="border-indigo-500/50 text-indigo-500">DEPR</Badge></TableCell>
                                            <TableCell className="text-slate-200">Server Rack A1</TableCell>
                                            <TableCell className="text-slate-400">2026-01-31</TableCell>
                                            <TableCell className="text-right text-white font-mono">$1,250.00</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="bg-slate-900 border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-white">Category Split</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300">Machinery</span>
                                        <span className="text-indigo-400 font-bold">45%</span>
                                    </div>
                                    <Progress value={45} className="h-1 bg-slate-800" indicatorClassName="bg-indigo-500" />

                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300">Furniture</span>
                                        <span className="text-green-400 font-bold">30%</span>
                                    </div>
                                    <Progress value={30} className="h-1 bg-slate-800" indicatorClassName="bg-green-500" />

                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300">IT Equipment</span>
                                        <span className="text-yellow-400 font-bold">25%</span>
                                    </div>
                                    <Progress value={25} className="h-1 bg-slate-800" indicatorClassName="bg-yellow-500" />
                                </CardContent>
                            </Card>

                            <Card className="bg-indigo-600 border-indigo-500 text-white">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Compliance Alert
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    3 Assets are missing L4 Lease references required for IFRS 16 reporting.
                                    <Button variant="secondary" className="mt-4 w-full bg-slate-100 hover:bg-white text-indigo-600 font-bold">
                                        Fix Now
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="registry">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-white">Asset Registry</CardTitle>
                                    <CardDescription className="text-slate-400">Manage your entire fixed asset portfolio</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input className="bg-slate-950 border-slate-700 pl-9 w-64" placeholder="Search by number or tag..." />
                                    </div>
                                    <Button variant="outline" className="bg-slate-800 border-slate-700">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                columns={assetColumns}
                                data={assets}
                                isLoading={loadingAssets}
                                keyExtractor={(r) => r.id}
                                filterColumn="description"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="depreciation">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-slate-900 border-slate-800 shadow-xl border-t-4 border-t-yellow-500">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-yellow-500" />
                                    Execute Period Run
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 uppercase font-bold">Asset Book</label>
                                            <Input disabled value="CORP_USD_BOOK" className="bg-slate-900 border-slate-800" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 uppercase font-bold">Current Period</label>
                                            <Input disabled value="FEB-2026" className="bg-slate-900 border-slate-800" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 uppercase font-bold">GL Post Date</label>
                                        <Input type="date" defaultValue="2026-02-10" className="bg-slate-900 border-slate-800" />
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6 shadow-xl shadow-indigo-500/10"
                                    onClick={() => runDepreciationMutation.mutate({
                                        bookId: "CORP-BOOK-1",
                                        periodName: "FEB-2026",
                                        periodEndDate: "2026-02-28"
                                    })}
                                    disabled={runDepreciationMutation.isPending}
                                >
                                    {runDepreciationMutation.isPending ? "Processing..." : "Initiate Depreciation Run"}
                                </Button>
                                <p className="text-xs text-center text-slate-500 italic">
                                    SLA journals will be generated automatically upon completion.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white">Run History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-800">
                                            <TableHead className="text-slate-400">Period</TableHead>
                                            <TableHead className="text-slate-400">Status</TableHead>
                                            <TableHead className="text-slate-400 text-right">Accounting</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="border-slate-800">
                                            <TableCell className="text-slate-200">JAN-2026</TableCell>
                                            <TableCell><Badge className="bg-green-500/10 text-green-500 border-0">Completed</Badge></TableCell>
                                            <TableCell className="text-right text-indigo-400 hover:underline cursor-pointer">GL-4492</TableCell>
                                        </TableRow>
                                        <TableRow className="border-slate-800">
                                            <TableCell className="text-slate-200">DEC-2025</TableCell>
                                            <TableCell><Badge className="bg-green-500/10 text-green-500 border-0">Completed</Badge></TableCell>
                                            <TableCell className="text-right text-indigo-400 hover:underline cursor-pointer">GL-3910</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="mass-additions">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div>
                                <CardTitle className="text-white">Mass Additions Queue</CardTitle>
                                <CardDescription className="text-slate-400">Purchased items from AP awaiting asset creation</CardDescription>
                            </div>
                            <Button variant="outline" className="bg-slate-800 border-slate-700" onClick={() => fetch("/api/fa/mass-additions/prepare", { method: "POST" }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/fa/mass-additions"] }))}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Import from AP
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableHead className="text-slate-400">Invoice</TableHead>
                                        <TableHead className="text-slate-400">Description</TableHead>
                                        <TableHead className="text-slate-400">Vendor</TableHead>
                                        <TableHead className="text-slate-400">Amount</TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(massAdditions as any[]).map((ma: any) => (
                                        <TableRow key={ma.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                                            <TableCell className="text-slate-300 font-mono">{ma.invoiceNumber}</TableCell>
                                            <TableCell className="text-white">{ma.description}</TableCell>
                                            <TableCell className="text-slate-400">{ma.vendorName}</TableCell>
                                            <TableCell className="font-bold text-white">${parseFloat(ma.amount).toLocaleString()}</TableCell>
                                            <TableCell><Badge variant="outline" className="border-yellow-500/50 text-yellow-500">{ma.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Prepare</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(massAdditions as any[]).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-slate-500 italic">
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
    );
}
