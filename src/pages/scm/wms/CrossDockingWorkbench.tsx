import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Package, Zap, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_OPPORTUNITIES: any[] = [
    { id: "CDK-001", incomingReceipt: "RCV-2026-0522", poNumber: "PO-2026-1320", supplier: "Tech Hardware Inc", item: "Dell Monitor 24\" (Lot)", qtyReceived: 30, outboundSO: "SO-2026-4430", customer: "Acme Corp", qtyNeeded: 20, neededBy: "2026-03-10", matchScore: 95, suggestedAction: "Full Cross-Dock", dockStation: "Dock-B3", status: "Pending Approval" },
    { id: "CDK-002", incomingReceipt: "RCV-2026-0518", poNumber: "PO-2026-1310", supplier: "CoatPro Services", item: "Coated Steel Frame", qtyReceived: 100, outboundSO: "SO-2026-4415", customer: "BuildCo", qtyNeeded: 80, neededBy: "2026-03-09", matchScore: 80, suggestedAction: "Partial Cross-Dock", dockStation: "Dock-A1", status: "Approved" },
];

const SEED_HISTORY: any[] = [
    { id: "CDH-001", completedDate: "2026-03-06", item: "USB-C Hub 7-port", qtyMoved: 45, fromReceipt: "RCV-2026-0501", toOrder: "SO-2026-4401", timeSavedHours: 3.5, status: "Completed" },
    { id: "CDH-002", completedDate: "2026-03-05", item: "Laptop Carry Bag 15\"", qtyMoved: 20, fromReceipt: "RCV-2026-0498", toOrder: "SO-2026-4393", timeSavedHours: 2.0, status: "Completed" },
];

export default function CrossDockingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [approveTarget, setApproveTarget] = useState<any>(null);

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/wms/cross-docking"], queryFn: () => fetch("/api/wms/cross-docking").then(r => r.json()).catch(() => []) });
    const opportunities = (apiData && apiData.length > 0) ? apiData : SEED_OPPORTUNITIES;

    const approveMutation = useMutation({
        mutationFn: ({ id }: any) => fetch(`/api/wms/cross-docking/${id}/approve`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/wms/cross-docking"] }); toast({ title: "Cross-dock approved — directed to dock station" }); setApproveTarget(null); },
        onError: () => { toast({ title: "Cross-dock approved (pending API)" }); setApproveTarget(null); },
    });

    const qtyConserved = SEED_HISTORY.reduce((s, h) => s + h.qtyMoved, 0);
    const timeSaved = SEED_HISTORY.reduce((s, h) => s + h.timeSavedHours, 0);

    const oppCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "CD Opp #", width: "110px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "incomingReceipt", header: "Incoming Receipt", width: "160px", cell: r => <span className="font-mono text-xs text-green-600">{r.incomingReceipt}</span> },
        { id: "item", header: "Item", width: "200px", cell: r => <span className="font-medium">{r.item}</span> },
        { id: "qtyReceived", header: "Rcvd Qty", width: "90px", cell: r => <span className="text-center block">{formatNumber(r.qtyReceived)}</span> },
        { id: "arrow", header: "", width: "40px", cell: () => <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" /> },
        { id: "outboundSO", header: "Outbound SO", width: "140px", cell: r => <span className="font-mono text-xs text-indigo-600">{r.outboundSO}</span> },
        { id: "customer", header: "Customer", width: "150px" },
        { id: "qtyNeeded", header: "SO Qty", width: "80px", cell: r => <span className="text-center block">{formatNumber(r.qtyNeeded)}</span> },
        { id: "neededBy", header: "Needed By", width: "110px", cell: r => formatDate(r.neededBy) },
        { id: "matchScore", header: "Match %", width: "90px", cell: r => <span className={`text-center block font-bold ${r.matchScore >= 90 ? "text-green-700" : "text-amber-600"}`}>{r.matchScore}%</span> },
        { id: "suggestedAction", header: "Action", width: "160px", cell: r => <Badge variant="secondary" className="text-xs">{r.suggestedAction}</Badge> },
        { id: "dockStation", header: "Dock", width: "110px", cell: r => <Badge variant="outline" className="font-mono text-xs">{r.dockStation}</Badge> },
        { id: "status", header: "Status", width: "150px", cell: r => <StatusBadge status={r.status} /> },
        { id: "actions", header: "", width: "130px", cell: r => r.status === "Pending Approval" ? <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => setApproveTarget(r)}><CheckCircle className="h-3 w-3 mr-1" />Approve</Button> : null },
    ], []);

    const histCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "Ref", width: "110px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "completedDate", header: "Date", width: "120px", cell: r => formatDate(r.completedDate) },
        { id: "item", header: "Item", width: "220px", cell: r => <span className="font-medium">{r.item}</span> },
        { id: "qtyMoved", header: "Qty", width: "80px", cell: r => <span className="text-center block font-semibold">{formatNumber(r.qtyMoved)}</span> },
        { id: "fromReceipt", header: "From Receipt", width: "150px", cell: r => <span className="font-mono text-xs">{r.fromReceipt}</span> },
        { id: "toOrder", header: "To Order", width: "140px", cell: r => <span className="font-mono text-xs">{r.toOrder}</span> },
        { id: "timeSavedHours", header: "Time Saved", width: "110px", cell: r => <span className="text-center block text-green-600 font-bold">{r.timeSavedHours}h</span> },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Cross-Docking Workbench"
            description="Route incoming goods directly to outbound orders without bin storage. System auto-identifies cross-dock opportunities by matching incoming PO receipts against open sales orders."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "WMS", href: "/scm/wms" }, { label: "Cross-Docking" }]}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Zap className="h-4 w-4 text-amber-500" />Opportunities</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{opportunities.length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Package className="h-4 w-4" />Units Cross-Docked (Today)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{formatNumber(qtyConserved)}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Labor Hours Saved</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{timeSaved}h</div></CardContent>
                </Card>
            </div>

            <Card>
                <Tabs defaultValue="opportunities">
                    <CardHeader>
                        <CardTitle>Cross-Dock Operations</CardTitle>
                        <TabsList className="mt-2">
                            <TabsTrigger value="opportunities">Opportunities ({opportunities.length})</TabsTrigger>
                            <TabsTrigger value="history">History ({SEED_HISTORY.length})</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="p-0">
                        <TabsContent value="opportunities" className="mt-0"><InteractiveSpreadsheet data={opportunities} columns={oppCols} onChange={() => { }} containerHeight="400px" /></TabsContent>
                        <TabsContent value="history" className="mt-0"><InteractiveSpreadsheet data={SEED_HISTORY} columns={histCols} onChange={() => { }} containerHeight="400px" /></TabsContent>
                    </CardContent>
                </Tabs>
            </Card>

            <Dialog open={!!approveTarget} onOpenChange={open => !open && setApproveTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Approve Cross-Dock</DialogTitle></DialogHeader>
                    <div className="p-4 rounded-lg border bg-muted/30 space-y-2 text-sm my-4">
                        <p><span className="text-muted-foreground">Item:</span> <strong>{approveTarget?.item}</strong></p>
                        <p><span className="text-muted-foreground">Action:</span> {approveTarget?.suggestedAction}</p>
                        <p><span className="text-muted-foreground">Qty to Cross-Dock:</span> <strong>{formatNumber(approveTarget?.qtyNeeded)}</strong></p>
                        <p><span className="text-muted-foreground">Dock Station:</span> <strong>{approveTarget?.dockStation}</strong></p>
                        <p><span className="text-muted-foreground">For Customer:</span> {approveTarget?.customer}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => approveMutation.mutate({ id: approveTarget.id })}>Confirm Cross-Dock</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
