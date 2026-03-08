import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Play, RefreshCw, CheckSquare, Filter, AlertTriangle, FileText, ArrowRight } from "lucide-react";

interface AssetRow {
    id: string;
    assetNumber: string;
    description: string;
    category: string;
    book: string;
    currentMethod: string;
    currentLife: number;
    currentConvention: string;
    originalCost: number;
    nbv: number;
    selected: boolean;
}

const MOCK_ASSETS: AssetRow[] = [
    { id: "1", assetNumber: "FA-00892", description: "Dell PowerEdge R750 Server", category: "IT Equipment", book: "CORPORATE", currentMethod: "STLN", currentLife: 60, currentConvention: "HALF_YEAR", originalCost: 18500, nbv: 12333, selected: false },
    { id: "2", assetNumber: "FA-00893", description: "Cisco Catalyst Switch Stack", category: "IT Equipment", book: "CORPORATE", currentMethod: "STLN", currentLife: 60, currentConvention: "HALF_YEAR", originalCost: 9800, nbv: 6534, selected: false },
    { id: "3", assetNumber: "FA-00851", description: "Office Fit-Out — Floor 3", category: "Leasehold Improvements", book: "CORPORATE", currentMethod: "STLN", currentLife: 120, currentConvention: "MID_MONTH", originalCost: 245000, nbv: 204167, selected: false },
    { id: "4", assetNumber: "FA-00844", description: "CNC Machining Centre", category: "Manufacturing Equipment", book: "CORPORATE", currentMethod: "DB150", currentLife: 84, currentConvention: "HALF_YEAR", originalCost: 87500, nbv: 52500, selected: false },
    { id: "5", assetNumber: "FA-00831", description: "Delivery Fleet — Van #3", category: "Vehicles", book: "CORPORATE", currentMethod: "STLN", currentLife: 60, currentConvention: "HALF_YEAR", originalCost: 38000, nbv: 19000, selected: false },
    { id: "6", assetNumber: "FA-00820", description: "Photolithography Machine", category: "Lab Equipment", book: "CORPORATE", currentMethod: "DB200", currentLife: 96, currentConvention: "HALF_YEAR", originalCost: 320000, nbv: 213333, selected: false },
];

const DEPRN_METHODS = [
    { value: "STLN", label: "Straight-Line (STLN)" },
    { value: "DB150", label: "Declining Balance 150%" },
    { value: "DB200", label: "Declining Balance 200% (DDB)" },
    { value: "SYD", label: "Sum-of-Years Digits" },
    { value: "UNITS", label: "Units of Production" },
    { value: "MACRS", label: "MACRS (5/7/15 yr)" },
];

const CONVENTIONS = [
    { value: "HALF_YEAR", label: "Half-Year" },
    { value: "MID_MONTH", label: "Mid-Month" },
    { value: "MID_QUARTER", label: "Mid-Quarter" },
    { value: "FULL_MONTH", label: "Full-Month" },
    { value: "ACTUAL_DAYS", label: "Actual Days" },
];

export function FaMassChange() {
    const { toast } = useToast();
    const [assets, setAssets] = useState<AssetRow[]>(MOCK_ASSETS);
    const [changeType, setChangeType] = useState("method");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterBook, setFilterBook] = useState("CORPORATE");
    const [newMethod, setNewMethod] = useState("");
    const [newLife, setNewLife] = useState("");
    const [newConvention, setNewConvention] = useState("");
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<{ changed: number; skipped: number } | null>(null);

    const selected = assets.filter(a => a.selected);
    const categories = ["all", ...Array.from(new Set(assets.map(a => a.category)))];

    const filtered = filterCategory === "all" ? assets : assets.filter(a => a.category === filterCategory);

    const toggleAll = (v: boolean) => setAssets(prev => prev.map(a => filtered.some(f => f.id === a.id) ? { ...a, selected: v } : a));
    const toggle = (id: string) => setAssets(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a));

    const handleRun = async () => {
        if (selected.length === 0) {
            toast({ title: "No assets selected", variant: "destructive" });
            return;
        }
        if (changeType === "method" && !newMethod) {
            toast({ title: "Select a new depreciation method", variant: "destructive" });
            return;
        }
        if (changeType === "life" && !newLife) {
            toast({ title: "Enter a new useful life", variant: "destructive" });
            return;
        }
        setRunning(true);
        await new Promise(r => setTimeout(r, 1800));
        setAssets(prev => prev.map(a => {
            if (!a.selected) return a;
            return {
                ...a,
                currentMethod: changeType === "method" && newMethod ? newMethod : a.currentMethod,
                currentLife: changeType === "life" && newLife ? parseInt(newLife) : a.currentLife,
                currentConvention: changeType === "convention" && newConvention ? newConvention : a.currentConvention,
                selected: false,
            };
        }));
        setResult({ changed: selected.length, skipped: 0 });
        setRunning(false);
        toast({
            title: `Mass Change Completed`,
            description: `${selected.length} asset(s) updated. GL adjusting journals will post in next depreciation run.`,
            className: "bg-green-900 border-green-700 text-white",
        });
    };

    return (
        <StandardPage
            title="FA Mass Change"
            description="Bulk update depreciation method, life, or convention across multiple assets"
        >
            {result && (
                <Card className="border-green-500 bg-green-500/10 mb-4">
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-400">
                                Mass Change applied to {result.changed} asset(s). {result.skipped === 0 ? "All successful." : `${result.skipped} skipped.`}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Change Parameters */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Change Parameters</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="change-type">Change Type</Label>
                            <Select value={changeType} onValueChange={setChangeType}>
                                <SelectTrigger id="change-type" className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="method">Depreciation Method</SelectItem>
                                    <SelectItem value="life">Useful Life (Months)</SelectItem>
                                    <SelectItem value="convention">Prorate Convention</SelectItem>
                                    <SelectItem value="method_life">Method + Life (Combined)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(changeType === "method" || changeType === "method_life") && (
                            <div>
                                <Label htmlFor="new-method">New Depreciation Method</Label>
                                <Select value={newMethod} onValueChange={setNewMethod}>
                                    <SelectTrigger id="new-method" className="mt-1"><SelectValue placeholder="Select method" /></SelectTrigger>
                                    <SelectContent>
                                        {DEPRN_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(changeType === "life" || changeType === "method_life") && (
                            <div>
                                <Label htmlFor="new-life">New Useful Life (Months)</Label>
                                <Input id="new-life" type="number" min="1" className="mt-1" placeholder="e.g. 60"
                                    value={newLife} onChange={e => setNewLife(e.target.value)} />
                            </div>
                        )}

                        {changeType === "convention" && (
                            <div>
                                <Label htmlFor="new-convention">New Convention</Label>
                                <Select value={newConvention} onValueChange={setNewConvention}>
                                    <SelectTrigger id="new-convention" className="mt-1"><SelectValue placeholder="Select convention" /></SelectTrigger>
                                    <SelectContent>
                                        {CONVENTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="eff-date">Effective Date</Label>
                            <Input id="eff-date" type="date" className="mt-1" value={effectiveDate}
                                onChange={e => setEffectiveDate(e.target.value)} />
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-400">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Changes adjust catch-up depreciation in the current period. GL adjusting journals are auto-created.
                        </div>

                        <Separator />
                        <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{selected.length}</span> assets selected
                        </div>

                        <Button className="w-full" onClick={handleRun} disabled={running || selected.length === 0}>
                            {running ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                            {running ? "Processing..." : "Run Mass Change"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Asset Selection */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Select Assets</CardTitle>
                            <div className="flex gap-2">
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="h-8 w-48 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toggleAll(true)}>Select All</Button>
                                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => toggleAll(false)}>Clear</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-auto">
                                <table className="w-full text-xs">
                                    <thead className="border-b border-border">
                                        <tr className="text-muted-foreground">
                                            <th className="p-3 text-left w-8"></th>
                                            <th className="p-3 text-left">Asset #</th>
                                            <th className="p-3 text-left">Description</th>
                                            <th className="p-3 text-left">Category</th>
                                            <th className="p-3 text-right">Current Method</th>
                                            <th className="p-3 text-right">Life (mo)</th>
                                            <th className="p-3 text-right">NBV</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filtered.map(a => (
                                            <tr key={a.id} className={`hover:bg-muted/20 cursor-pointer ${a.selected ? "bg-primary/5" : ""}`}
                                                onClick={() => toggle(a.id)}>
                                                <td className="p-3" onClick={e => e.stopPropagation()}>
                                                    <Checkbox checked={a.selected} onCheckedChange={() => toggle(a.id)} aria-label={`Select ${a.assetNumber}`} />
                                                </td>
                                                <td className="p-3 font-mono text-primary">{a.assetNumber}</td>
                                                <td className="p-3">{a.description}</td>
                                                <td className="p-3"><Badge className="text-xs">{a.category}</Badge></td>
                                                <td className="p-3 text-right font-mono">{a.currentMethod}</td>
                                                <td className="p-3 text-right">{a.currentLife}</td>
                                                <td className="p-3 text-right font-medium">{formatNumber(a.nbv)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}

export default FaMassChange;
