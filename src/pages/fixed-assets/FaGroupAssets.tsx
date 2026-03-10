import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Plus, AlertTriangle, TrendingDown, Calculator, RefreshCw, FileText } from "lucide-react";

// Oracle FA: Group Assets — pool-based depreciation similar to ADR / mass asset grouping

interface GroupAsset {
    id: string;
    groupCode: string;
    groupName: string;
    category: string;
    deprnMethod: string;
    deprnRate: number;
    convention: string;
    memberCount: number;
    totalCost: number;
    totalNbv: number;
    currency: string;
    status: "Active" | "Inactive";
}

const MOCK_GROUPS: GroupAsset[] = [
    { id: "1", groupCode: "GRP-IT-001", groupName: "IT Hardware Group – APAC", category: "IT Equipment", deprnMethod: "Group STLN", deprnRate: 20, convention: "Half-Year", memberCount: 34, totalCost: 1250000, totalNbv: 712500, currency: "USD", status: "Active" },
    { id: "2", groupCode: "GRP-VEH-001", groupName: "Fleet – Light Commercial Vehicles", category: "Vehicles", deprnMethod: "Group DB150", deprnRate: 25, convention: "Half-Year", memberCount: 12, totalCost: 540000, totalNbv: 324000, currency: "GBP", status: "Active" },
    { id: "3", groupCode: "GRP-MFG-001", groupName: "Manufacturing Plant Pool", category: "Manufacturing Equipment", deprnMethod: "Group DB200", deprnRate: 15, convention: "Mid-Year", memberCount: 8, totalCost: 4200000, totalNbv: 2940000, currency: "USD", status: "Active" },
];

const DEPRN_METHODS = ["Group STLN", "Group DB150", "Group DB200", "ADR (Asset Depreciation Range)", "MACRS Group"];

export function FaGroupAssets() {
    const { toast } = useToast();
    const [groups, setGroups] = useState<GroupAsset[]>(MOCK_GROUPS);
    const [showAdd, setShowAdd] = useState(false);
    const [selected, setSelected] = useState<GroupAsset | null>(null);
    const [form, setForm] = useState<Partial<GroupAsset>>({
        deprnMethod: "Group STLN", deprnRate: 20, convention: "Half-Year", currency: "USD", status: "Active", memberCount: 0, totalCost: 0, totalNbv: 0,
    });

    const handleAdd = () => {
        if (!form.groupCode || !form.groupName) { toast({ title: "Code and name required", variant: "destructive" }); return; }
        setGroups(prev => [...prev, { id: Date.now().toString(), ...form } as GroupAsset]);
        setShowAdd(false);
        setForm({ deprnMethod: "Group STLN", deprnRate: 20, convention: "Half-Year", currency: "USD", status: "Active", memberCount: 0, totalCost: 0, totalNbv: 0 });
        toast({ title: "Group asset created", className: "bg-green-900 border-green-700 text-white" });
    };

    const totalGroups = groups.filter(g => g.status === "Active").length;
    const totalAssets = groups.filter(g => g.status === "Active").reduce((s, g) => s + g.memberCount, 0);

    return (
        <StandardPage
            title="Group Assets"
            description="Configure pool-based depreciation groups — individual member assets depreciate using group-level rates"
            actions={<Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Group</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                    { label: "Active Groups", value: totalGroups.toString(), color: "text-blue-400" },
                    { label: "Total Member Assets", value: totalAssets.toString(), color: "text-green-400" },
                    { label: "Total Group Pool Cost", value: formatNumber(groups.reduce((s, g) => s + g.totalCost, 0)), color: "text-purple-400" },
                ].map(m => (
                    <Card key={m.label}>
                        <CardContent className="pt-4 pb-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className={`text-xl font-bold ${m.color} mt-1`}>{m.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-3">
                {groups.map(g => (
                    <Card key={g.id} className="border-border hover:border-primary/40 transition-colors cursor-pointer"
                        onClick={() => setSelected(g)}>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-mono font-bold text-primary text-sm">{g.groupCode}</span>
                                        <span className="font-medium text-sm">{g.groupName}</span>
                                        <Badge className="text-xs">{g.category}</Badge>
                                        <Badge className={g.status === "Active" ? "bg-green-500/20 text-green-400 text-xs" : "bg-muted text-muted-foreground text-xs"}>{g.status}</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                                        <div><p className="text-muted-foreground">Method</p><p>{g.deprnMethod}</p></div>
                                        <div><p className="text-muted-foreground">Rate</p><p>{g.deprnRate}%</p></div>
                                        <div><p className="text-muted-foreground">Convention</p><p>{g.convention}</p></div>
                                        <div><p className="text-muted-foreground">Members</p><p className="font-bold">{g.memberCount}</p></div>
                                        <div><p className="text-muted-foreground">Total Cost</p><p>{formatNumber(g.totalCost)} {g.currency}</p></div>
                                        <div><p className="text-muted-foreground">Net Book Value</p><p className="font-medium">{formatNumber(g.totalNbv)} {g.currency}</p></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Dialog */}
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Group Asset</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Group Code *</Label>
                            <Input className="mt-1 h-8 text-xs font-mono" placeholder="GRP-IT-002"
                                onChange={e => setForm(p => ({ ...p, groupCode: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Group Name *</Label>
                            <Input className="mt-1 h-8 text-xs" onChange={e => setForm(p => ({ ...p, groupName: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Asset Category</Label>
                            <Select value={form.category || "IT Equipment"} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["IT Equipment", "Vehicles", "Manufacturing Equipment", "Leasehold Improvements", "Lab Equipment", "Furniture"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Depreciation Method</Label>
                            <Select value={form.deprnMethod} onValueChange={v => setForm(p => ({ ...p, deprnMethod: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{DEPRN_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Annual Rate (%)</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" value={form.deprnRate}
                                onChange={e => setForm(p => ({ ...p, deprnRate: parseFloat(e.target.value) }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Convention</Label>
                            <Select value={form.convention} onValueChange={v => setForm(p => ({ ...p, convention: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{["Half-Year", "Mid-Month", "Mid-Quarter", "Full-Month"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Create Group</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default FaGroupAssets;
