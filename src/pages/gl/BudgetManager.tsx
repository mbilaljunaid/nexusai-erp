import React, { useState, useEffect } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Plus, ShieldAlert, BadgeDollarSign, Loader2, Target,
    TrendingUp, AlertTriangle, CheckCircle2, Search, Filter, Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { useLedger } from "@/context/LedgerContext";
import { LedgerContextBadge } from "@/components/gl/LedgerContextBadge";
import { StandardPage } from "@/components/layout/StandardPage";
import { ContextualSearch } from "@/components/ContextualSearch";

// Types
interface BudgetBalance {
    id: string;
    codeCombinationId: string;
    periodName: string;
    budgetAmount: string;
    actualAmount: string;
    encumbranceAmount: string;
    fundsAvailable: string;
}

interface ControlRule {
    id: string;
    ruleName: string;
    ledgerId: string;
    controlLevel: "Absolute" | "Advisory" | "Track";
    enabled: boolean;
}

export default function BudgetManager() {
    const { toast } = useToast();
    const { currentLedgerId: selectedLedger, ledgers } = useLedger();
    const [activeTab, setActiveTab] = useState("monitors");
    const [balances, setBalances] = useState<BudgetBalance[]>([]);
    const [rules, setRules] = useState<ControlRule[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPeriod] = useState("Jan-2026");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedLedger]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "monitors") {
                const res = await fetch(`/api/gl/budget-balances?ledgerId=${selectedLedger}&periodName=${selectedPeriod}`);
                if (res.ok) setBalances(await res.json());
            } else if (activeTab === "rules") {
                const res = await fetch(`/api/gl/config/budget-rules?ledgerId=${selectedLedger}`);
                if (res.ok) setRules(await res.json());
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) return;
        setIsUploading(true);
        try {
            // Mock upload process
            await new Promise(r => setTimeout(r, 1500));
            toast({
                title: "Budget Uploaded",
                description: `Successfully imported budget data from ${uploadFile.name}.`,
                className: "bg-emerald-600 text-white border-none"
            });
            setUploadFile(null);
            // Close dialog handled by DialogTrigger
        } catch (e) {
            toast({ title: "Upload Failed", description: "Could not parse spreadsheet.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <StandardPage
            title="Budgetary Control & Monitoring"
            description="Real-time funds validation and expenditure tracking."
            actions={
                <div className="flex gap-3">
                    <LedgerContextBadge />
                    <Badge variant="outline" className="py-1.5 px-3">
                        Period: {selectedPeriod}
                    </Badge>
                </div>
            }
        >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-morphism border-0 shadow-lg p-1">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-blue-400">Total Budget</CardDescription>
                        <CardTitle className="text-3xl font-black text-white">$1,240,000</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={65} className="h-1.5 bg-blue-950" indicatorClassName="bg-blue-500" />
                        <p className="text-[10px] text-gray-500 mt-2">65% of annual allocation consumed</p>
                    </CardContent>
                </Card>
                <Card className="glass-morphism border-0 shadow-lg p-1">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-emerald-400">Actual Spent</CardDescription>
                        <CardTitle className="text-3xl font-black text-white">$806,000</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                            <TrendingUp className="h-3 w-3" /> +12% from last month
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-morphism border-0 shadow-lg p-1 border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-amber-500">Funds Available</CardDescription>
                        <CardTitle className="text-3xl font-black text-white">$434,000</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[10px] text-gray-500 leading-relaxed">Encumbrances of $24k excluded from availability</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-12">
                    <TabsTrigger value="monitors" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6">
                        <Target className="w-4 h-4 mr-2" /> Funds Monitor
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6">
                        <ShieldAlert className="w-4 h-4 mr-2" /> Control Rules
                    </TabsTrigger>
                    <TabsTrigger value="versions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6">
                        <BadgeDollarSign className="w-4 h-4 mr-2" /> Versions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="monitors" className="space-y-4">
                    <Card className="glass-morphism border-0 overflow-hidden shadow-2xl">
                        <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between py-6">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-400" /> Funds Available Inquiry
                                </CardTitle>
                                <CardDescription className="text-gray-400">Real-time status of budget vs actuals by account combination.</CardDescription>
                            </div>
                            <div className="flex gap-2 w-80">
                                <ContextualSearch
                                    placeholder="Search account..."
                                    fields={[
                                        { key: "account", label: "Account CCID", type: "text" },
                                        { key: "minBudget", label: "Min Budget", type: "number" }
                                    ]}
                                    onSearch={() => { }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="py-4 text-xs font-bold uppercase text-gray-400">Account CCID</TableHead>
                                        <TableHead className="py-4 text-xs font-bold uppercase text-blue-400">Budget</TableHead>
                                        <TableHead className="py-4 text-xs font-bold uppercase text-emerald-400">Actual</TableHead>
                                        <TableHead className="py-4 text-xs font-bold uppercase text-amber-400">Encumbrance</TableHead>
                                        <TableHead className="py-4 text-xs font-bold uppercase text-white">Available</TableHead>
                                        <TableHead className="py-4 text-xs font-bold uppercase text-gray-400">Usage %</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow className="hover:bg-transparent"><TableCell colSpan={6} className="h-40 text-center text-gray-500"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
                                    ) : balances.length === 0 ? (
                                        <TableRow className="hover:bg-transparent"><TableCell colSpan={6} className="h-60 text-center text-gray-500 flex flex-col items-center justify-center italic"><AlertTriangle className="h-8 w-8 mb-2 opacity-20" /> No funds inquiry data found for this period.</TableCell></TableRow>
                                    ) : (
                                        balances.map((b) => {
                                            const usage = (parseFloat(b.actualAmount) / parseFloat(b.budgetAmount)) * 100;
                                            return (
                                                <TableRow key={b.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                                    <TableCell className="font-mono text-xs text-blue-200">{b.codeCombinationId}</TableCell>
                                                    <TableCell className="font-bold text-blue-400">${parseFloat(b.budgetAmount).toLocaleString()}</TableCell>
                                                    <TableCell className="text-emerald-400">${parseFloat(b.actualAmount).toLocaleString()}</TableCell>
                                                    <TableCell className="text-amber-400">${parseFloat(b.encumbranceAmount).toLocaleString()}</TableCell>
                                                    <TableCell className="font-black text-white">${parseFloat(b.fundsAvailable).toLocaleString()}</TableCell>
                                                    <TableCell className="w-32">
                                                        <div className="flex flex-col gap-1">
                                                            <Progress value={usage} className="h-1 bg-white/5" indicatorClassName={usage > 90 ? "bg-red-500" : usage > 70 ? "bg-amber-500" : "bg-blue-500"} />
                                                            <span className="text-[9px] font-bold text-gray-500">{usage.toFixed(1)}% used</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>                </TabsContent>

                <TabsContent value="versions" className="space-y-4">
                    <Card className="glass-morphism border-0 shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between py-6">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <BadgeDollarSign className="h-5 w-5 text-emerald-400" /> Budget Versions & Control
                                </CardTitle>
                                <CardDescription className="text-gray-400">Manage budget definitions and version control status.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10">
                                            <Upload className="w-4 h-4 mr-2" /> Upload Spreadsheet
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Upload Budget Data</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Select CSV/Excel File</Label>
                                                <Input
                                                    type="file"
                                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                                />
                                            </div>
                                            <div className="p-3 bg-blue-50/10 rounded border border-blue-500/20 text-xs text-blue-400">
                                                <p className="font-semibold mb-1">Required Format:</p>
                                                <ul className="list-disc list-inside">
                                                    <li>Column A: Code Combination (e.g. 01-000-4100-0000-000)</li>
                                                    <li>Column B: Period Name (e.g. Jan-2026)</li>
                                                    <li>Column C: Budget Amount</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline">Cancel</Button>
                                            <Button onClick={handleUpload} disabled={!uploadFile || isUploading}>
                                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                Upload Data
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="premium-button shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white">
                                            <Plus className="w-4 h-4 mr-2" /> Define New Budget
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Define New Control Budget</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Budget Name</Label>
                                                <Input placeholder="e.g. FY2026 Corporate Budget" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Ledger</Label>
                                                <Select defaultValue={selectedLedger}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ledgers.map(l => (
                                                            <SelectItem key={l.id} value={l.id}>{l.name} ({l.currencyCode})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Control Level</Label>
                                                <Select defaultValue="track">
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="absolute">Absolute (Hard Stop)</SelectItem>
                                                        <SelectItem value="advisory">Advisory (Warning)</SelectItem>
                                                        <SelectItem value="track">Track Only (None)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline">Cancel</Button>
                                            <Button onClick={() => toast({ title: "Budget Defined", description: "New budget definition created successfully." })}>Create Definition</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="py-4 text-xs font-bold uppercase text-gray-400">Budget Name</TableHead>
                                        <TableHead className="py-4 text-xs font-bold uppercase text-gray-400">Ledger</TableHead>
                                        <TableHead className="py-4 text-xs font-bold uppercase text-gray-400">Period Range</TableHead>
                                        <TableHead className="py-4 text-xs font-bold uppercase text-gray-400">Status</TableHead>
                                        <TableHead className="py-4 text-right pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="border-white/5 hover:bg-white/5">
                                        <TableCell className="font-semibold text-white">FY2026 Corporate Base</TableCell>
                                        <TableCell className="text-gray-400">Primary Ledger</TableCell>
                                        <TableCell className="text-gray-400">Jan-26 to Dec-26</TableCell>
                                        <TableCell><StatusBadge status="Active" label="Open / Active" /></TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">Manage</Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-white/5 hover:bg-white/5">
                                        <TableCell className="font-semibold text-white">Q1 2026 Revised</TableCell>
                                        <TableCell className="text-gray-400">Primary Ledger</TableCell>
                                        <TableCell className="text-gray-400">Jan-26 to Mar-26</TableCell>
                                        <TableCell><StatusBadge status="Draft" /></TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
