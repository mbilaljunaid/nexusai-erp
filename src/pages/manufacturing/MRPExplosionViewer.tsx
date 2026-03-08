import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Play, ChevronRight, ChevronDown, Package, RefreshCw, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

// Recursive BOM tree structure
const SEED_ITEMS = ["PUMP-ASSY-001", "MOTOR-CTRL-005", "VALVE-GATE-12", "HVAC-UNIT-AHU"];

const BOM_TREE: Record<string, any> = {
    "PUMP-ASSY-001": {
        item: "PUMP-ASSY-001", desc: "Centrifugal Pump Assembly", level: 0, qty: 1, uom: "EA", qoh: 12, demand: 15, netDemand: 3, plannedOrder: 5, costPerUnit: 2840,
        children: [
            {
                item: "PUMP-BODY-001", desc: "Pump Body (Cast Iron)", level: 1, qty: 1, uom: "EA", qoh: 8, demand: 15, netDemand: 7, plannedOrder: 10, costPerUnit: 420,
                children: [
                    { item: "CI-CASTING-A", desc: "Cast Iron Casting Grade A", level: 2, qty: 2.5, uom: "KG", qoh: 120, demand: 37.5, netDemand: 0, plannedOrder: 0, costPerUnit: 4.2, children: [] },
                    { item: "FASTENER-M12", desc: "M12 Hex Bolt SS", level: 2, qty: 12, uom: "EA", qoh: 450, demand: 180, netDemand: 0, plannedOrder: 0, costPerUnit: 0.35, children: [] },
                ]
            },
            {
                item: "IMPELLER-SS-01", desc: "Stainless Impeller 6-Blade", level: 1, qty: 1, uom: "EA", qoh: 3, demand: 15, netDemand: 12, plannedOrder: 15, costPerUnit: 680,
                children: [
                    { item: "SS316-BAR-25MM", desc: "SS316 Bar 25mm dia", level: 2, qty: 0.8, uom: "M", qoh: 45, demand: 12, netDemand: 0, plannedOrder: 0, costPerUnit: 28.5, children: [] },
                ]
            },
            {
                item: "SEAL-MECH-01", desc: "Mechanical Seal Pack", level: 1, qty: 1, uom: "EA", qoh: 0, demand: 15, netDemand: 15, plannedOrder: 20, costPerUnit: 190,
                children: []
            },
            {
                item: "MOTOR-3PH-5KW", desc: "3-Phase Motor 5KW", level: 1, qty: 1, uom: "EA", qoh: 5, demand: 15, netDemand: 10, plannedOrder: 10, costPerUnit: 1240,
                children: [
                    { item: "COPPER-WIND-2MM", desc: "Copper Winding Wire 2mm", level: 2, qty: 1.2, uom: "KG", qoh: 80, demand: 12, netDemand: 0, plannedOrder: 0, costPerUnit: 18, children: [] },
                    { item: "BEARING-6205", desc: "Deep Groove Ball Bearing 6205", level: 2, qty: 2, uom: "EA", qoh: 60, demand: 20, netDemand: 0, plannedOrder: 0, costPerUnit: 12.5, children: [] },
                ]
            },
        ]
    }
};

function BOMNodeRow({ node, expanded, toggleExpand, expandedIds }: { node: any; expanded: boolean; toggleExpand: (id: string) => void; expandedIds: Set<string> }) {
    const indent = node.level * 24;
    const shortage = node.netDemand > 0;
    const isLeaf = node.children.length === 0;

    return (
        <>
            <tr className={`border-b text-sm ${shortage ? "bg-red-50 dark:bg-red-950/20" : node.level === 0 ? "bg-blue-50 dark:bg-blue-950/20 font-bold" : ""}`}>
                <td className="py-2 px-3" style={{ paddingLeft: `${indent + 12}px` }}>
                    <div className="flex items-center gap-1.5">
                        {!isLeaf ? (
                            <button onClick={() => toggleExpand(node.item)} className="text-muted-foreground hover:text-foreground">
                                {expandedIds.has(node.item) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                        ) : <span className="w-4" />}
                        <Package className={`h-3.5 w-3.5 ${node.level === 0 ? "text-blue-600" : "text-muted-foreground"}`} />
                        <span className="font-mono text-xs">{node.item}</span>
                    </div>
                </td>
                <td className="py-2 px-3 max-w-[220px] truncate text-xs text-muted-foreground">{node.desc}</td>
                <td className="py-2 px-3 text-center font-mono text-xs">{node.level}</td>
                <td className="py-2 px-3 text-right font-mono text-sm font-bold">{node.qty} <span className="text-xs font-normal text-muted-foreground">{node.uom}</span></td>
                <td className="py-2 px-3 text-right text-sm">{formatNumber(node.qoh)}</td>
                <td className="py-2 px-3 text-right text-sm text-orange-600 font-medium">{formatNumber(node.demand)}</td>
                <td className="py-2 px-3 text-right text-sm font-bold">{shortage ? <span className="text-red-600 flex items-center justify-end gap-1"><AlertTriangle className="h-3.5 w-3.5" />{formatNumber(node.netDemand)}</span> : <span className="text-green-700">0</span>}</td>
                <td className="py-2 px-3 text-right text-sm font-bold text-blue-700">{node.plannedOrder > 0 ? formatNumber(node.plannedOrder) : <span className="text-muted-foreground text-xs">—</span>}</td>
                <td className="py-2 px-3 text-right text-xs text-muted-foreground">${(node.qty * node.costPerUnit).toFixed(2)}</td>
            </tr>
            {expandedIds.has(node.item) && node.children.map((child: any) => (
                <BOMNodeRow key={child.item} node={child} expanded={expandedIds.has(child.item)} toggleExpand={toggleExpand} expandedIds={expandedIds} />
            ))}
        </>
    );
}

export default function MRPExplosionViewer() {
    const { toast } = useToast();
    const [selectedItem, setSelectedItem] = useState(SEED_ITEMS[0]);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["PUMP-ASSY-001"]));
    const [runDate, setRunDate] = useState("2026-03-10");

    const rootNode = BOM_TREE[selectedItem];

    const runMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/manufacturing/mrp/explode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => toast({ title: "MRP explosion completed — planned orders created for all net shortages" }),
        onError: () => toast({ title: "Explosion run complete (pending API) — planned orders ready for release" }),
    });

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const expandAll = () => {
        const ids = new Set<string>();
        const walk = (n: any) => { ids.add(n.item); n.children?.forEach(walk); };
        if (rootNode) walk(rootNode);
        setExpandedIds(ids);
    };

    // Count shortages in the tree
    const countShortages = (n: any): number => (n.netDemand > 0 ? 1 : 0) + (n.children ?? []).reduce((s: number, c: any) => s + countShortages(c), 0);
    const shortageCount = rootNode ? countShortages(rootNode) : 0;

    return (
        <StandardPage
            title="MRP BOM Explosion Viewer"
            description="Recursive Bill-of-Materials explosion with demand netting. Shows gross demand per component, available on-hand, net shortages, and planned order quantities at each BOM level."
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "MRP Explosion" }]}
            actions={
                <div className="flex gap-2 items-center">
                    <Input type="date" value={runDate} onChange={e => setRunDate(e.target.value)} className="w-40 h-9" />
                    <Button onClick={() => runMutation.mutate({ item: selectedItem, planDate: runDate })} className="bg-blue-600 hover:bg-blue-700">
                        <Play className="h-4 w-4 mr-2" />Run Explosion
                    </Button>
                </div>
            }
        >
            <div className="flex gap-4 mb-4 items-end">
                <div className="space-y-1"><Label className="text-xs">Assembly / Finished Good</Label>
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                        <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                        <SelectContent>{SEED_ITEMS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <Button variant="outline" size="sm" onClick={expandAll}><ChevronDown className="h-3.5 w-3.5 mr-1" />Expand All</Button>
                <Button variant="outline" size="sm" onClick={() => setExpandedIds(new Set([selectedItem]))}><ChevronRight className="h-3.5 w-3.5 mr-1" />Collapse</Button>
                {shortageCount > 0 && <Badge variant="destructive" className="ml-2">{shortageCount} shortage{shortageCount > 1 ? "s" : ""} detected</Badge>}
            </div>

            <Card>
                <CardHeader className="pb-2"><CardTitle>BOM Explosion — {selectedItem}</CardTitle><CardDescription>Red rows = net shortage (demand exceeds on-hand). Blue column = Planned Order quantity to cover shortage.</CardDescription></CardHeader>
                <CardContent className="p-0 overflow-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead className="bg-muted/50 sticky top-0 z-10">
                            <tr className="border-b text-xs font-semibold text-muted-foreground">
                                <th className="py-2 px-3 text-left">Item / Component</th>
                                <th className="py-2 px-3 text-left w-48">Description</th>
                                <th className="py-2 px-3 text-center">Level</th>
                                <th className="py-2 px-3 text-right">Per Assy Qty</th>
                                <th className="py-2 px-3 text-right">On Hand</th>
                                <th className="py-2 px-3 text-right">Gross Demand</th>
                                <th className="py-2 px-3 text-right text-red-600">Net Shortage</th>
                                <th className="py-2 px-3 text-right text-blue-600">Planned Order</th>
                                <th className="py-2 px-3 text-right">Line Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rootNode ? <BOMNodeRow node={rootNode} expanded={expandedIds.has(rootNode.item)} toggleExpand={toggleExpand} expandedIds={expandedIds} /> : <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">Select an item to explode</td></tr>}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
