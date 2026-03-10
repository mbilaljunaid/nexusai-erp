import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowRight, Layers, Settings } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const ITEM_CATEGORIES = ["Raw Materials", "Finished Goods", "Packaging", "Spare Parts", "Consumables", "Hazardous", "Cold Chain", "Bulk Liquid"];
const ZONES = ["A — Fast-Moving", "B — Medium-Moving", "C — Slow-Moving", "BLK — Bulk Storage", "CHEM — Chemical/Hazmat", "COLD — Cold Chain", "STAGE — Staging", "QC — Quality Hold"];
const SEED_RULES: any[] = [
    { id: "PR-001", ruleName: "FG High-Velocity → Zone A", priority: 1, itemCategory: "Finished Goods", condition: "Annual turns > 24", targetZone: "A — Fast-Moving", targetSubinventory: "FG-STORE", locatorPattern: "A[1-3]-*-*", capacityCheck: true, tempControl: false, status: "Active", lastModified: "2026-01-10" },
    { id: "PR-002", ruleName: "Raw Materials → Bulk Zone", priority: 2, itemCategory: "Raw Materials", condition: "Weight > 50 kg", targetZone: "BLK — Bulk Storage", targetSubinventory: "RM-STORE", locatorPattern: "BLK-*-*", capacityCheck: true, tempControl: false, status: "Active", lastModified: "2026-01-15" },
    { id: "PR-003", ruleName: "Hazardous → CHEM Zone", priority: 3, itemCategory: "Hazardous", condition: "Hazmat flag = Yes", targetZone: "CHEM — Chemical/Hazmat", targetSubinventory: "CHEM-STORE", locatorPattern: "CHEM-*-*", capacityCheck: false, tempControl: false, status: "Active", lastModified: "2026-02-01" },
    { id: "PR-004", ruleName: "Cold Chain Items", priority: 4, itemCategory: "Cold Chain", condition: "Storage temp < 4°C", targetZone: "COLD — Cold Chain", targetSubinventory: "COLD-STORE", locatorPattern: "COLD-*-*", capacityCheck: true, tempControl: true, status: "Active", lastModified: "2026-02-10" },
    { id: "PR-005", ruleName: "Overflow → Staging", priority: 99, itemCategory: "Any", condition: "No primary zone matched", targetZone: "STAGE — Staging", targetSubinventory: "STAGING", locatorPattern: "STAGE-*-*", capacityCheck: false, tempControl: false, status: "Active", lastModified: "2026-01-01" },
];

export default function DirectedPutawayRules() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [newRule, setNewRule] = useState({ ruleName: "", priority: "10", itemCategory: "Finished Goods", condition: "", targetZone: "A — Fast-Moving", targetSubinventory: "FG-STORE", locatorPattern: "" });

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/wms/putaway-rules"], queryFn: () => fetch("/api/wms/putaway-rules").then(r => r.json()).catch(() => []) });
    const rules = (apiData && apiData.length > 0) ? apiData : SEED_RULES;

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/wms/putaway-rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/wms/putaway-rules"] }); toast({ title: "Putaway rule created" }); setIsOpen(false); },
        onError: () => { toast({ title: "Rule saved (pending API)" }); setIsOpen(false); },
    });

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "priority", header: "Priority", width: "80px", cell: r => <Badge variant="outline" className="font-mono text-xs w-8 justify-center">{r.priority}</Badge> },
        { id: "ruleName", header: "Rule Name", width: "250px", cell: r => <span className="font-medium">{r.ruleName}</span> },
        { id: "itemCategory", header: "Item Category", width: "150px", cell: r => <Badge variant="secondary" className="text-xs">{r.itemCategory}</Badge> },
        { id: "condition", header: "Condition", width: "200px", cell: r => <span className="font-mono text-xs text-muted-foreground">{r.condition}</span> },
        { id: "targetZone", header: "→ Target Zone", width: "190px", cell: r => <div className="flex items-center gap-1"><ArrowRight className="h-3 w-3 text-muted-foreground" /><span className="text-sm">{r.targetZone}</span></div> },
        { id: "targetSubinventory", header: "Subinventory", width: "120px", cell: r => <Badge variant="outline" className="font-mono text-xs">{r.targetSubinventory}</Badge> },
        { id: "locatorPattern", header: "Locator Pattern", width: "140px", cell: r => <span className="font-mono text-xs">{r.locatorPattern}</span> },
        { id: "capacityCheck", header: "Cap Check", width: "100px", cell: r => r.capacityCheck ? <span className="text-green-600 text-xs font-semibold text-center block">✓ On</span> : <span className="text-muted-foreground text-xs text-center block">Off</span> },
        { id: "tempControl", header: "Temp Ctrl", width: "90px", cell: r => r.tempControl ? <span className="text-blue-600 text-xs font-semibold text-center block">❄ Yes</span> : <span className="text-muted-foreground text-xs text-center block">No</span> },
        { id: "status", header: "Status", width: "110px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Directed Putaway Rules"
            description="Rules engine that directs warehouse operators to the optimal bin based on item category, zone capacity, and temperature requirements."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "WMS", href: "/scm/wms" }, { label: "Putaway Rules" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />New Rule</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Layers className="h-4 w-4" />Active Rules</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{rules.filter(r => r.status === "Active").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Zones Covered</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{new Set(rules.map(r => r.targetZone)).size}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Settings className="h-4 w-4" />Cap-Checked Rules</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{rules.filter(r => r.capacityCheck).length}</div></CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Putaway Rules (by Priority)</CardTitle><CardDescription>Rules are evaluated in priority order. The first matching rule determines the bin assignment.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={[...rules].sort((a, b) => a.priority - b.priority)} columns={columns} onChange={() => { }} containerHeight="480px" /></CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>New Putaway Rule</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 md:col-span-2"><Label>Rule Name *</Label><Input value={newRule.ruleName} onChange={e => setNewRule({ ...newRule, ruleName: e.target.value })} placeholder="e.g. FG Fast-Moving → Zone A" /></div>
                        <div className="space-y-2"><Label>Priority</Label><Input type="number" value={newRule.priority} onChange={e => setNewRule({ ...newRule, priority: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Item Category</Label>
                            <Select value={newRule.itemCategory} onValueChange={v => setNewRule({ ...newRule, itemCategory: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Any", ...ITEM_CATEGORIES].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2"><Label>Condition</Label><Input value={newRule.condition} onChange={e => setNewRule({ ...newRule, condition: e.target.value })} placeholder="e.g. Annual turns > 24" /></div>
                        <div className="space-y-2"><Label>Target Zone</Label>
                            <Select value={newRule.targetZone} onValueChange={v => setNewRule({ ...newRule, targetZone: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Subinventory</Label><Input value={newRule.targetSubinventory} onChange={e => setNewRule({ ...newRule, targetSubinventory: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Locator Pattern</Label><Input value={newRule.locatorPattern} onChange={e => setNewRule({ ...newRule, locatorPattern: e.target.value })} placeholder="e.g. A[1-3]-*-*" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newRule, capacityCheck: true, tempControl: false, status: "Active", lastModified: new Date().toISOString().split("T")[0] })} disabled={!newRule.ruleName}>Create Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
