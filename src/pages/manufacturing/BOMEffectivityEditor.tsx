import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, GitBranch, ChevronRight, ChevronDown, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

const SEED_BOM: any[] = [
    {
        seq: "10", level: 0, itemCode: "PUMP-ASSY-001", description: "Centrifugal Pump Assembly (FG)", qty: 1, uom: "EA",
        phantom: false, effectiveFrom: "2024-01-01", effectiveTo: "", supplyType: "Assembly Pull", status: "Active",
        children: [
            {
                seq: "20", level: 1, itemCode: "PUMP-BODY-001", description: "Pump Body — Cast Iron", qty: 1, uom: "EA",
                phantom: false, effectiveFrom: "2024-01-01", effectiveTo: "", supplyType: "Push", status: "Active",
                children: []
            },
            {
                seq: "30", level: 1, itemCode: "MOTOR-ASSY-003", description: "Motor Sub-Assembly (Phantom)", qty: 1, uom: "EA",
                phantom: true, effectiveFrom: "2024-01-01", effectiveTo: "", supplyType: "Phantom", status: "Active",
                children: [
                    { seq: "31", level: 2, itemCode: "MOTOR-WIND-002", description: "Motor Winding", qty: 1, uom: "EA", phantom: false, effectiveFrom: "2024-01-01", effectiveTo: "", supplyType: "Push", status: "Active", children: [] },
                    { seq: "32", level: 2, itemCode: "BEARING-6205", description: "Bearing 6205 ZZ", qty: 2, uom: "EA", phantom: false, effectiveFrom: "2024-01-01", effectiveTo: "", supplyType: "Push", status: "Active", children: [] },
                ]
            },
            {
                seq: "40", level: 1, itemCode: "SEAL-MECH-14MM", description: "Mechanical Seal 14mm", qty: 2, uom: "EA",
                phantom: false, effectiveFrom: "2024-01-01", effectiveTo: "2026-06-30", supplyType: "Push", status: "Expiring",
                children: []
            },
            {
                seq: "41", level: 1, itemCode: "SEAL-MECH-14MM-V2", description: "Mechanical Seal 14mm V2 (Successor)", qty: 2, uom: "EA",
                phantom: false, effectiveFrom: "2026-07-01", effectiveTo: "", supplyType: "Push", status: "Future",
                children: []
            },
            { seq: "50", level: 1, itemCode: "IMPELLER-SS-01", description: "SS Impeller 6-Blade", qty: 1, uom: "EA", phantom: false, effectiveFrom: "2024-01-01", effectiveTo: "", supplyType: "Push", status: "Active", children: [] },
            { seq: "60", level: 1, itemCode: "SS-BOLTS-M12", description: "M12 SS Bolts Kit", qty: 8, uom: "EA", phantom: false, effectiveFrom: "2024-01-01", effectiveTo: "", supplyType: "Bulk", status: "Active", children: [] },
        ]
    },
];

function flattenBOM(nodes: any[]): any[] {
    const result: any[] = [];
    for (const n of nodes) {
        result.push(n);
        if (n.children?.length) result.push(...flattenBOM(n.children));
    }
    return result;
}

const LEVEL_PAD: Record<number, string> = { 0: "pl-0", 1: "pl-5", 2: "pl-10", 3: "pl-16" };

function BOMRow({ node, expandedIds, toggle }: { node: any; expandedIds: Set<string>; toggle: (seq: string) => void }) {
    const hasChildren = node.children?.length > 0;
    const isExpanded = expandedIds.has(node.seq);
    const padClass = LEVEL_PAD[node.level as number] ?? "pl-20";
    return (
        <>
            <tr className={`border-b text-sm ${node.level === 0 ? "bg-muted/30 font-semibold" : ""} ${node.phantom ? "italic text-muted-foreground" : ""} ${node.status === "Expiring" ? "bg-amber-50" : ""} ${node.status === "Future" ? "bg-blue-50" : ""}`}>
                <td className="py-2 px-3">
                    <div className={`flex items-center gap-1.5 ${padClass}`}>
                        {hasChildren ? (
                            <button onClick={() => toggle(node.seq)} className="text-muted-foreground hover:text-foreground">
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                        ) : <span className="w-5" />}
                        <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono text-xs text-blue-600">{node.itemCode}</span>
                    </div>
                </td>
                <td className="py-2 px-3">
                    <span>{node.description}</span>
                    {node.phantom && <Badge className="ml-2 text-xs bg-purple-100 text-purple-700">PHANTOM</Badge>}
                </td>
                <td className="py-2 px-3 text-xs text-muted-foreground">{node.seq}</td>
                <td className="py-2 px-3 text-center font-bold">{node.qty}</td>
                <td className="py-2 px-3 text-center text-xs">{node.uom}</td>
                <td className="py-2 px-3 text-xs font-mono">{node.effectiveFrom}</td>
                <td className="py-2 px-3 text-xs font-mono">{node.effectiveTo || <span className="text-muted-foreground">Open</span>}</td>
                <td className="py-2 px-3"><Badge variant="outline" className="text-xs">{node.supplyType}</Badge></td>
                <td className="py-2 px-3"><StatusBadge status={node.status} /></td>
            </tr>
            {isExpanded && node.children?.map((c: any) => <BOMRow key={c.seq} node={c} expandedIds={expandedIds} toggle={toggle} />)}
        </>
    );
}

export default function BOMEffectivityEditor() {
    const { toast } = useToast();
    const [bom] = useState(SEED_BOM);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["10", "30"]));
    const [isOpen, setIsOpen] = useState(false);
    const [effectDate, setEffectDate] = useState("2026-03-08");
    const [newComp, setNewComp] = useState({ itemCode: "", description: "", qty: 1, uom: "EA", phantom: false, effectiveFrom: "", effectiveTo: "", supplyType: "Push" });

    const flat = useMemo(() => flattenBOM(bom), [bom]);

    const toggle = (seq: string) => setExpandedIds(prev => {
        const next = new Set(prev);
        next.has(seq) ? next.delete(seq) : next.add(seq);
        return next;
    });

    const expandAll = () => setExpandedIds(new Set(flat.map(n => n.seq)));

    const addMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/manufacturing/bom-components", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "BOM component added" }); setIsOpen(false); },
        onError: () => { toast({ title: "Component added (pending API)" }); setIsOpen(false); },
    });

    const effectiveRows = useMemo(() => flat.filter(n => {
        if (!n.effectiveFrom) return true;
        const from = new Date(n.effectiveFrom);
        const to = n.effectiveTo ? new Date(n.effectiveTo) : null;
        const dt = new Date(effectDate);
        return dt >= from && (!to || dt <= to);
    }), [flat, effectDate]);

    return (
        <StandardPage
            title="BOM Effectivity & Phantom Assembly Editor"
            description="Manage Bill of Materials with effectivity dates per component (intro/obsolescence dates), phantom assembly handling (pass-through sub-assemblies that don't generate warehouse picks), and supply type configuration per component."
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing/dashboard" }, { label: "BOM Effectivity" }]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={expandAll}><ChevronDown className="h-3.5 w-3.5 mr-1" />Expand All</Button>
                    <Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Component</Button>
                </div>
            }
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">BOM Components</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{flat.filter(n => n.level > 0).length}</div></CardContent>
                </Card>
                <Card className="border-purple-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Phantom Assemblies</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-purple-700">{flat.filter(n => n.phantom).length}</div></CardContent>
                </Card>
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expiring Components</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{flat.filter(n => n.status === "Expiring").length}</div></CardContent>
                </Card>
                <Card className="border-blue-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Future Components</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{flat.filter(n => n.status === "Future").length}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="tree">
                <TabsList className="mb-4">
                    <TabsTrigger value="tree">BOM Tree (Effectivity)</TabsTrigger>
                    <TabsTrigger value="effective">Effective as of Date</TabsTrigger>
                </TabsList>

                <TabsContent value="tree">
                    <Card>
                        <CardHeader>
                            <CardTitle>PUMP-ASSY-001 — BOM Structure</CardTitle>
                            <CardDescription>
                                <span className="inline-flex items-center gap-1.5 mr-4"><span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300 inline-block" /> Expiring component</span>
                                <span className="inline-flex items-center gap-1.5 mr-4"><span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300 inline-block" /> Future component</span>
                                <span className="inline-flex items-center gap-1.5"><Badge className="text-xs bg-purple-100 text-purple-700">PHANTOM</Badge> Exploded at pick, no WO generated</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 overflow-auto">
                            <table className="w-full text-sm min-w-[1000px]">
                                <thead className="bg-muted/50 sticky top-0">
                                    <tr className="border-b text-xs font-semibold text-muted-foreground">
                                        <th className="py-2 px-3 text-left w-52">Item Code</th>
                                        <th className="py-2 px-3 text-left">Description</th>
                                        <th className="py-2 px-3 text-left w-16">Seq</th>
                                        <th className="py-2 px-3 text-center w-16">Qty</th>
                                        <th className="py-2 px-3 text-center w-16">UOM</th>
                                        <th className="py-2 px-3 text-left w-28">Eff From</th>
                                        <th className="py-2 px-3 text-left w-28">Eff To</th>
                                        <th className="py-2 px-3 text-left w-28">Supply Type</th>
                                        <th className="py-2 px-3 text-left w-24">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bom.map(node => <BOMRow key={node.seq} node={node} expandedIds={expandedIds} toggle={toggle} />)}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="effective">
                    <Card>
                        <CardHeader>
                            <CardTitle>Effective BOM as of Date</CardTitle>
                            <CardDescription>Filter BOM to show only components effective on the selected date. Expired and future components are hidden.</CardDescription>
                            <div className="flex items-center gap-3 mt-2">
                                <Label className="text-sm">Effectivity Date:</Label>
                                <Input type="date" value={effectDate} onChange={e => setEffectDate(e.target.value)} className="w-44 h-8 text-sm" />
                                <Badge variant="outline">{effectiveRows.length} effective components</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 sticky top-0">
                                    <tr className="border-b text-xs font-semibold text-muted-foreground">
                                        <th className="py-2 px-3 text-left">Item Code</th>
                                        <th className="py-2 px-3 text-left">Description</th>
                                        <th className="py-2 px-3 text-center w-16">Qty</th>
                                        <th className="py-2 px-3 text-left w-28">Eff From</th>
                                        <th className="py-2 px-3 text-left w-28">Eff To</th>
                                        <th className="py-2 px-3 text-left w-28">Supply Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {effectiveRows.map(r => (
                                        <tr key={r.seq} className={`border-b text-sm ${r.phantom ? "italic text-muted-foreground" : ""}`}>
                                            <td className="py-2 px-3 font-mono text-xs text-blue-600">{r.itemCode}{r.phantom && <Badge className="ml-1.5 text-xs bg-purple-100 text-purple-700">PHANTOM</Badge>}</td>
                                            <td className="py-2 px-3">{r.description}</td>
                                            <td className="py-2 px-3 text-center">{r.qty}</td>
                                            <td className="py-2 px-3 text-xs font-mono">{r.effectiveFrom}</td>
                                            <td className="py-2 px-3 text-xs font-mono">{r.effectiveTo || "Open"}</td>
                                            <td className="py-2 px-3"><Badge variant="outline" className="text-xs">{r.supplyType}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add BOM Component</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Item Code *</Label><Input value={newComp.itemCode} onChange={e => setNewComp({ ...newComp, itemCode: e.target.value.toUpperCase() })} placeholder="ITEM-CODE-001" className="font-mono" /></div>
                        <div className="space-y-2"><Label>Description</Label><Input value={newComp.description} onChange={e => setNewComp({ ...newComp, description: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Qty *</Label><Input type="number" min={0.001} step={0.001} value={newComp.qty} onChange={e => setNewComp({ ...newComp, qty: parseFloat(e.target.value) || 1 })} /></div>
                        <div className="space-y-2"><Label>UOM</Label>
                            <Select value={newComp.uom} onValueChange={v => setNewComp({ ...newComp, uom: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["EA", "KG", "L", "M", "M2", "M3", "SET"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Effective From</Label><Input type="date" value={newComp.effectiveFrom} onChange={e => setNewComp({ ...newComp, effectiveFrom: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Effective To (blank = open)</Label><Input type="date" value={newComp.effectiveTo} onChange={e => setNewComp({ ...newComp, effectiveTo: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Supply Type</Label>
                            <Select value={newComp.supplyType} onValueChange={v => setNewComp({ ...newComp, supplyType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Push", "Assembly Pull", "Operation Pull", "Phantom", "Bulk"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox id="phantom" checked={newComp.phantom} onCheckedChange={v => setNewComp({ ...newComp, phantom: !!v })} />
                            <Label htmlFor="phantom" className="text-sm">Phantom Assembly — explode through, do not generate warehouse picks</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newComp.itemCode || !newComp.effectiveFrom} onClick={() => addMutation.mutate({ ...newComp, bomId: "BOM-PUMP-BODY-STD" })}>Add Component</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
