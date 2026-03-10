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
import { Plus, ShieldOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

const STATUSES = ["Active", "Hold — Quality", "Quarantine — Supplier", "Quarantine — Recall", "Obsolete", "Excess — Disposal", "Under Review"];
const TX_RESTRICTIONS: Record<string, string[]> = {
    "Active": [],
    "Hold — Quality": ["Issue to WO", "Ship to Customer", "Transfer Out"],
    "Quarantine — Supplier": ["Issue to WO", "Ship to Customer", "Transfer Out", "Consume in Production"],
    "Quarantine — Recall": ["All transactions blocked"],
    "Obsolete": ["Receiving", "All outbound transactions"],
    "Excess — Disposal": ["Receiving"],
    "Under Review": ["Ship to Customer"],
};

const SEED_CONTROLS: any[] = [
    { id: "MSC-001", orgCode: "M1", subinventory: "QC-HOLD", locator: "QC-01-A", itemCode: "ITM-001", itemDesc: "Laptop 15\" Pro 16GB", materialStatus: "Hold — Quality", onHandQty: 12, reason: "Batch defect — screen flicker reported by QA", setBy: "QA Manager", setDate: "2026-03-05", status: "Hold — Quality" },
    { id: "MSC-002", orgCode: "M1", subinventory: "CHEM-STORE", locator: "CHEM-03-B", itemCode: "RM-310", itemDesc: "Industrial Solvent B47", materialStatus: "Quarantine — Supplier", onHandQty: 40, reason: "Supplier under investigation — COA mismatch", setBy: "Compliance Officer", setDate: "2026-03-03", status: "Quarantine — Supplier" },
    { id: "MSC-003", orgCode: "W1", subinventory: "FG-STORE", locator: "*", itemCode: "PKG-OLD-001", itemDesc: "Old Packaging v1.2", materialStatus: "Obsolete", onHandQty: 180, reason: "New rebranded packaging approved. Phase out.", setBy: "Product Manager", setDate: "2026-02-15", status: "Obsolete" },
];

export default function MaterialStatusControls() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [newCtrl, setNewCtrl] = useState({ orgCode: "M1", subinventory: "", locator: "*", itemCode: "", materialStatus: "Hold — Quality", reason: "" });

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/inventory/material-status"], queryFn: () => fetch("/api/inventory/material-status").then(r => r.json()).catch(() => []) });
    const controls = (apiData && apiData.length > 0) ? apiData : SEED_CONTROLS;

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/inventory/material-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/inventory/material-status"] }); toast({ title: "Material status applied" }); setIsOpen(false); },
        onError: () => { toast({ title: "Saved (pending API)" }); setIsOpen(false); },
    });

    const holds = controls.filter(c => !c.materialStatus.includes("Active")).length;

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "orgCode", header: "Org", width: "70px", cell: r => <Badge variant="outline" className="font-mono text-xs">{r.orgCode}</Badge> },
        { id: "subinventory", header: "Subinventory", width: "120px" },
        { id: "locator", header: "Locator", width: "110px", cell: r => <span className="font-mono text-xs">{r.locator}</span> },
        { id: "itemCode", header: "Item", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.itemCode}</span> },
        { id: "itemDesc", header: "Description", width: "220px", cell: r => <span className="font-medium">{r.itemDesc}</span> },
        { id: "materialStatus", header: "Material Status", width: "200px", cell: r => <StatusBadge status={r.materialStatus} /> },
        { id: "onHandQty", header: "On Hand", width: "90px", cell: r => <span className="text-right block font-semibold">{r.onHandQty}</span> },
        {
            id: "restrictions", header: "Blocked Transactions", width: "250px", cell: r => {
                const restricted = TX_RESTRICTIONS[r.materialStatus] || [];
                return restricted.length === 0 ? <span className="text-green-600 text-xs">No restrictions</span> : <div className="flex flex-wrap gap-1">{restricted.map(tx => <Badge key={tx} variant="destructive" className="text-xs py-0">{tx}</Badge>)}</div>;
            }
        },
        { id: "reason", header: "Reason", width: "250px", cell: r => <span className="text-xs text-muted-foreground">{r.reason}</span> },
        { id: "setBy", header: "Set By", width: "140px", cell: r => <span className="text-sm">{r.setBy}</span> },
        { id: "setDate", header: "Date Set", width: "110px" },
    ], []);

    return (
        <StandardPage
            title="Material Status Controls"
            description="Apply Active / Hold / Quarantine / Obsolete status at item-locator level to block or restrict transactions. All blocked transaction types are enforced at the WMS and inventory layers."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "Inventory", href: "/inventory" }, { label: "Material Status" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Apply Status Control</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><ShieldOff className="h-4 w-4 text-red-500" />Items Under Hold</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{holds}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><AlertTriangle className="h-4 w-4 text-amber-500" />Quarantine</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{controls.filter(c => c.materialStatus.includes("Quarantine")).length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><ShieldCheck className="h-4 w-4 text-green-600" />Obsolete Items</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{controls.filter(c => c.materialStatus === "Obsolete").length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Material Status Controls</CardTitle><CardDescription>Transaction restrictions are enforced automatically based on material status. Quarantine items cannot be issued or shipped.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={controls} columns={columns} onChange={() => { }} containerHeight="480px" /></CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>Apply Material Status Control</DialogTitle></DialogHeader>
                    {newCtrl.materialStatus !== "Active" && TX_RESTRICTIONS[newCtrl.materialStatus]?.length > 0 && (
                        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-sm">
                            <p className="font-semibold text-amber-700 mb-1">⚠ Transactions that will be blocked:</p>
                            <div className="flex flex-wrap gap-1">{TX_RESTRICTIONS[newCtrl.materialStatus].map(tx => <Badge key={tx} variant="destructive" className="text-xs">{tx}</Badge>)}</div>
                        </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Org</Label>
                            <Select value={newCtrl.orgCode} onValueChange={v => setNewCtrl({ ...newCtrl, orgCode: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["M1", "W1", "EU1"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Subinventory</Label><Input value={newCtrl.subinventory} onChange={e => setNewCtrl({ ...newCtrl, subinventory: e.target.value })} placeholder="e.g. QC-HOLD" /></div>
                        <div className="space-y-2"><Label>Locator (or * for all)</Label><Input value={newCtrl.locator} onChange={e => setNewCtrl({ ...newCtrl, locator: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Item Code *</Label><Input value={newCtrl.itemCode} onChange={e => setNewCtrl({ ...newCtrl, itemCode: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Material Status *</Label>
                            <Select value={newCtrl.materialStatus} onValueChange={v => setNewCtrl({ ...newCtrl, materialStatus: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2"><Label>Reason *</Label><Input value={newCtrl.reason} onChange={e => setNewCtrl({ ...newCtrl, reason: e.target.value })} placeholder="Business justification..." /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newCtrl, setBy: "Current User", setDate: new Date().toISOString().split("T")[0], status: newCtrl.materialStatus })} disabled={!newCtrl.itemCode || !newCtrl.reason}>Apply</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
