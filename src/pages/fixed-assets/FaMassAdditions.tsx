import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Plus, RefreshCw, Play, CheckCircle2, Download, Layers } from "lucide-react";

// Oracle FA: Mass Additions — import asset lines from AP invoices / PO receipts

interface MassAdditionLine {
    id: string; source: "AP Invoice" | "PO Receipt" | "Manual"; sourceRef: string; supplier: string; description: string; amount: number; quantity: number; currency: string; poNumber: string; category: string; status: "New" | "On Hold" | "Posted" | "Deleted";
    selected: boolean;
}

const MOCK_LINES: MassAdditionLine[] = [
    { id: "1", source: "AP Invoice", sourceRef: "INV-2026-00841", supplier: "Dell Technologies", description: "PowerEdge R750 Server (x3)", amount: 55500, quantity: 3, currency: "USD", poNumber: "PO-2026-0142", category: "IT Equipment", status: "New", selected: false },
    { id: "2", source: "AP Invoice", sourceRef: "INV-2026-00842", supplier: "Cisco Systems", description: "Catalyst 9300 Switch Stack", amount: 28750, quantity: 1, currency: "USD", poNumber: "PO-2026-0143", category: "IT Equipment", status: "New", selected: false },
    { id: "3", source: "AP Invoice", sourceRef: "INV-2026-00798", supplier: "KONE Elevators", description: "Lift Modernisation – Floor 1-4", amount: 185000, quantity: 1, currency: "GBP", poNumber: "PO-2026-0121", category: "Leasehold Improvements", status: "On Hold", selected: false },
    { id: "4", source: "PO Receipt", sourceRef: "RCV-2026-00312", supplier: "Agilent Technologies", description: "LC-MS/MS Analytical System", amount: 420000, quantity: 1, currency: "USD", poNumber: "PO-2026-0138", category: "Lab Equipment", status: "New", selected: false },
    { id: "5", source: "AP Invoice", sourceRef: "INV-2026-00751", supplier: "Mercedes-Benz", description: "Sprinter Van Fleet (x2)", amount: 96000, quantity: 2, currency: "GBP", poNumber: "PO-2026-0110", category: "Vehicles", status: "New", selected: false },
];

export function FaMassAdditions() {
    const { toast } = useToast();
    const [lines, setLines] = useState<MassAdditionLine[]>(MOCK_LINES);
    const [posting, setPosting] = useState(false);
    const [tab, setTab] = useState("new");

    const selected = lines.filter(l => l.selected && l.status === "New");
    const filtered = lines.filter(l => {
        if (tab === "new") return l.status === "New";
        if (tab === "onhold") return l.status === "On Hold";
        if (tab === "posted") return l.status === "Posted";
        return true;
    });

    const toggle = (id: string) => setLines(prev => prev.map(l => l.id === id ? { ...l, selected: !l.selected } : l));
    const toggleAll = (v: boolean) => setLines(prev => prev.map(l => l.status === "New" ? { ...l, selected: v } : l));

    const handlePost = async () => {
        if (!selected.length) { toast({ title: "Select at least one line", variant: "destructive" }); return; }
        setPosting(true);
        await new Promise(r => setTimeout(r, 1800));
        setLines(prev => prev.map(l => l.selected ? { ...l, status: "Posted", selected: false } : l));
        setPosting(false);
        toast({
            title: `${selected.length} asset(s) posted to Fixed Assets`,
            description: "Assets created in Pending Depreciation status. Run depreciation to activate.",
            className: "bg-green-900 border-green-700 text-white",
        });
    };

    return (
        <StandardPage
            title="Mass Additions"
            description="Review and post asset lines sourced from AP invoices and PO receipts into Fixed Assets"
            actions={
                <div className="flex gap-2">
                    <Button size="sm" variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Fetch from AP/PO</Button>
                    <Button size="sm" onClick={handlePost} disabled={posting || selected.length === 0}>
                        {posting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                        {posting ? "Posting..." : `Post to Assets (${selected.length})`}
                    </Button>
                </div>
            }
        >
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="new">New ({lines.filter(l => l.status === "New").length})</TabsTrigger>
                    <TabsTrigger value="onhold">On Hold ({lines.filter(l => l.status === "On Hold").length})</TabsTrigger>
                    <TabsTrigger value="posted">Posted ({lines.filter(l => l.status === "Posted").length})</TabsTrigger>
                </TabsList>

                <TabsContent value={tab}>
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead className="border-b border-border bg-muted/20 text-muted-foreground">
                                    <tr>
                                        {tab === "new" && (
                                            <th className="p-3 w-8">
                                                <Checkbox checked={selected.length > 0 && selected.length === lines.filter(l => l.status === "New").length}
                                                    onCheckedChange={(v) => toggleAll(!!v)} aria-label="Select all" />
                                            </th>
                                        )}
                                        <th className="p-3 text-left">Source Ref</th>
                                        <th className="p-3 text-left">Source</th>
                                        <th className="p-3 text-left">Supplier</th>
                                        <th className="p-3 text-left">Description</th>
                                        <th className="p-3 text-left">Category</th>
                                        <th className="p-3 text-right">Qty</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map(l => (
                                        <tr key={l.id} className={`hover:bg-muted/10 cursor-pointer ${l.selected ? "bg-primary/5" : ""}`}
                                            onClick={() => tab === "new" && toggle(l.id)}>
                                            {tab === "new" && (
                                                <td className="p-3" onClick={e => e.stopPropagation()}>
                                                    {l.status === "New" && <Checkbox checked={l.selected} onCheckedChange={() => toggle(l.id)} aria-label={`Select ${l.sourceRef}`} />}
                                                </td>
                                            )}
                                            <td className="p-3 font-mono text-primary">{l.sourceRef}</td>
                                            <td className="p-3"><Badge className="text-xs">{l.source}</Badge></td>
                                            <td className="p-3">{l.supplier}</td>
                                            <td className="p-3">{l.description}</td>
                                            <td className="p-3 text-muted-foreground">{l.category}</td>
                                            <td className="p-3 text-right">{l.quantity}</td>
                                            <td className="p-3 text-right font-medium">{formatNumber(l.amount)} {l.currency}</td>
                                            <td className="p-3">
                                                <Badge className={
                                                    l.status === "New" ? "bg-blue-500/20 text-blue-400" :
                                                        l.status === "On Hold" ? "bg-amber-500/20 text-amber-400" :
                                                            l.status === "Posted" ? "bg-green-500/20 text-green-400" : "bg-muted"
                                                }>{l.status}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No lines in this status</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}

export default FaMassAdditions;
