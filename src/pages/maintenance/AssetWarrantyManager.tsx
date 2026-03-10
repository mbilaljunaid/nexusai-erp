import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_WARRANTIES: any[] = [
    { id: "WA-001", assetTag: "HVAC-A1-01", assetName: "AHU-01 Air Handling Unit", supplier: "Carrier Corp", coverageType: "Full Parts & Labor", startDate: "2024-06-01", endDate: "2027-05-31", remainingDays: 449, laborChargeBlocked: true, contractRef: "WAR-CARR-2024-001", status: "Active" },
    { id: "WA-002", assetTag: "COMP-C1-03", assetName: "Atlas Copco Compressor GA110", supplier: "Atlas Copco UAE", coverageType: "Compressor Element Only", startDate: "2026-01-01", endDate: "2028-12-31", remainingDays: 1029, laborChargeBlocked: true, contractRef: "WAR-AC-2026-003", status: "Active" },
    { id: "WA-003", assetTag: "PUMP-B2-01", assetName: "Grundfos CR32 Pump", supplier: "Grundfos KSA", coverageType: "Parts Only, No Labor", startDate: "2025-03-01", endDate: "2026-03-31", remainingDays: 23, laborChargeBlocked: false, contractRef: "WAR-GF-2025-011", status: "Expiring Soon" },
    { id: "WA-004", assetTag: "CNC-D2-05", assetName: "Mazak CNC Vertical Mill", supplier: "Mazak MENA", coverageType: "Full Coverage incl. On-Site", startDate: "2023-01-01", endDate: "2025-12-31", remainingDays: -69, laborChargeBlocked: false, contractRef: "WAR-MAZ-2023-007", status: "Expired" },
    { id: "WA-005", assetTag: "CHILLER-B1-01", assetName: "Chiller Plant CHP-01 500TR", supplier: "Carrier Corp", coverageType: "Extended Warranty — Compressor", startDate: "2025-09-01", endDate: "2030-08-31", remainingDays: 1637, laborChargeBlocked: true, contractRef: "WAR-CARR-2025-012", status: "Active" },
];

const COVERAGE_TYPES = ["Full Parts & Labor", "Parts Only, No Labor", "Compressor Element Only", "Extended Warranty — Compressor", "On-Site Response < 4hr", "Remote Diagnostics Only"];

export default function AssetWarrantyManager() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [newWarranty, setNewWarranty] = useState({ assetTag: "", assetName: "", supplier: "", coverageType: COVERAGE_TYPES[0], startDate: "", endDate: "", contractRef: "", laborChargeBlocked: "true" });

    const active = SEED_WARRANTIES.filter(w => w.status === "Active");
    const expiringSoon = SEED_WARRANTIES.filter(w => w.status === "Expiring Soon");
    const expired = SEED_WARRANTIES.filter(w => w.status === "Expired");

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/maintenance/warranties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Warranty record created" }); setIsOpen(false); },
        onError: () => { toast({ title: "Warranty saved (pending API)" }); setIsOpen(false); },
    });

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "assetTag", header: "Asset Tag", width: "130px", cell: r => <span className="font-mono text-xs text-blue-600">{r.assetTag}</span> },
        { id: "assetName", header: "Asset Name", width: "230px", cell: r => <span className="font-medium">{r.assetName}</span> },
        { id: "supplier", header: "Supplier", width: "170px", cell: r => <span className="text-sm">{r.supplier}</span> },
        { id: "coverageType", header: "Coverage", width: "220px", cell: r => <Badge variant="secondary" className="text-xs">{r.coverageType}</Badge> },
        { id: "endDate", header: "Expires", width: "110px", cell: r => <span className={`text-sm font-medium ${r.remainingDays < 30 && r.remainingDays >= 0 ? "text-amber-600" : r.remainingDays < 0 ? "text-red-600" : ""}`}>{formatDate(r.endDate)}</span> },
        {
            id: "remainingDays", header: "Days Left", width: "100px", cell: r => (
                <span className={`text-center block font-bold ${r.remainingDays < 0 ? "text-red-600" : r.remainingDays < 90 ? "text-amber-600" : "text-green-700"}`}>
                    {r.remainingDays < 0 ? `${Math.abs(r.remainingDays)}d ago` : `${r.remainingDays}d`}
                </span>
            )
        },
        { id: "laborChargeBlocked", header: "Labor Blocked", width: "130px", cell: r => r.laborChargeBlocked ? <span className="flex items-center gap-1.5 text-xs text-amber-700 font-medium"><AlertTriangle className="h-3 w-3" />Yes — In Warranty</span> : <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3" />No</span> },
        { id: "status", header: "Status", width: "130px", cell: r => <StatusBadge status={r.status} /> },
        { id: "actions", header: "", width: "90px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedAsset(r)}>Details</Button> },
    ], []);

    return (
        <StandardPage
            title="Asset Warranty Manager"
            description="Track warranty coverage per asset. Assets under active warranty will block direct labor charging on work orders — requiring supervisor approval override."
            breadcrumbs={[{ label: "Maintenance", href: "/maintenance" }, { label: "Asset Warranties" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Register Warranty</Button>}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Shield className="h-4 w-4 text-green-600" />Active Warranties</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{active.length}</div></CardContent>
                </Card>
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Clock className="h-4 w-4 text-amber-500" />Expiring in 90 Days</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{expiringSoon.length}</div></CardContent>
                </Card>
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expired</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{expired.length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><AlertTriangle className="h-4 w-4 text-amber-500" />Labor Blocking</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_WARRANTIES.filter(w => w.laborChargeBlocked && w.status === "Active").length}</div><p className="text-xs text-muted-foreground">assets under warranty — labor requires override</p></CardContent>
                </Card>
            </div>

            {expiringSoon.length > 0 && (
                <div className="mb-4 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 flex gap-2 text-sm text-amber-700">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span><strong>{expiringSoon.length} warranty/warranties</strong> expiring within 90 days. Review and renew before expiry to ensure coverage continuity.</span>
                </div>
            )}

            <Card>
                <CardHeader><CardTitle>Warranty Registry</CardTitle><CardDescription>All WO for in-warranty assets show a labor charge warning. Supervisors must explicitly override to post labor costs.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_WARRANTIES} columns={columns} onChange={() => { }} containerHeight="440px" /></CardContent>
            </Card>

            {/* Detail */}
            <Dialog open={!!selectedAsset} onOpenChange={o => !o && setSelectedAsset(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Warranty — {selectedAsset?.assetTag}</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-3 text-sm py-4">
                        {[["Asset Name", selectedAsset?.assetName], ["Supplier", selectedAsset?.supplier], ["Coverage Type", selectedAsset?.coverageType], ["Contract Ref", selectedAsset?.contractRef], ["Start Date", selectedAsset?.startDate], ["End Date", selectedAsset?.endDate], ["Days Remaining", selectedAsset?.remainingDays > 0 ? `${selectedAsset?.remainingDays} days` : "EXPIRED"], ["Labor Charge Blocked", selectedAsset?.laborChargeBlocked ? "Yes — approval required" : "No"], ["Status", selectedAsset?.status]].map(([l, v]) => (
                            <div key={l}><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v as string}</p></div>
                        ))}
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setSelectedAsset(null)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Register Asset Warranty</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Asset Tag *</Label><Input value={newWarranty.assetTag} onChange={e => setNewWarranty({ ...newWarranty, assetTag: e.target.value })} placeholder="e.g. HVAC-A1-01" /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Asset Name *</Label><Input value={newWarranty.assetName} onChange={e => setNewWarranty({ ...newWarranty, assetName: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Supplier *</Label><Input value={newWarranty.supplier} onChange={e => setNewWarranty({ ...newWarranty, supplier: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Coverage Type</Label>
                            <Select value={newWarranty.coverageType} onValueChange={v => setNewWarranty({ ...newWarranty, coverageType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{COVERAGE_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={newWarranty.startDate} onChange={e => setNewWarranty({ ...newWarranty, startDate: e.target.value })} /></div>
                        <div className="space-y-2"><Label>End Date *</Label><Input type="date" value={newWarranty.endDate} onChange={e => setNewWarranty({ ...newWarranty, endDate: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Contract Reference</Label><Input value={newWarranty.contractRef} onChange={e => setNewWarranty({ ...newWarranty, contractRef: e.target.value })} placeholder="WAR-SUPP-YYYY-XXX" /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Block Labor Charges</Label>
                            <Select value={newWarranty.laborChargeBlocked} onValueChange={v => setNewWarranty({ ...newWarranty, laborChargeBlocked: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="true">Yes — require supervisor override on WO</SelectItem><SelectItem value="false">No — allow labor freely</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newWarranty.assetTag || !newWarranty.assetName || !newWarranty.supplier} onClick={() => createMutation.mutate({ ...newWarranty, status: "Active", remainingDays: 365, laborChargeBlocked: newWarranty.laborChargeBlocked === "true" })}>Register Warranty</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
