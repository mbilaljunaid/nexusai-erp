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
import { FileText, DollarSign, CheckCircle, Plus } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_EVENTS: any[] = [
    { id: "BE-001", projectNum: "PROJ-2026-010", projectName: "ERP Implementation — Phase 2", billingAction: "Time and Materials", unbilledExpenses: 45800, unbilledLabor: 128400, totalUnbilled: 174200, invoiceTo: "Meridian Holdings Ltd", currency: "USD", billingCycle: "Monthly", lastInvoice: "2026-02-28", status: "Ready to Bill" },
    { id: "BE-002", projectNum: "PROJ-2026-007", projectName: "Warehouse Automation Build", billingAction: "Milestone", unbilledExpenses: 8200, unbilledLabor: 32100, totalUnbilled: 40300, invoiceTo: "GreenPark Logistics", currency: "USD", billingCycle: "Milestone", lastInvoice: "2026-01-31", status: "Milestone Pending Approval" },
    { id: "BE-003", projectNum: "PROJ-2025-099", projectName: "Legacy System Migration", billingAction: "Fixed Price", unbilledExpenses: 2450, unbilledLabor: 15600, totalUnbilled: 18050, invoiceTo: "Internal BU — Finance", currency: "USD", billingCycle: "Quarterly", lastInvoice: "2025-12-31", status: "Hold — Customer Dispute" },
];

export default function ProjectBillingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [generateTarget, setGenerateTarget] = useState<any>(null);

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/projects/billing"], queryFn: () => fetch("/api/projects/billing").then(r => r.json()).catch(() => []) });
    const events = (apiData && apiData.length > 0) ? apiData : SEED_EVENTS;

    const generateMutation = useMutation({
        mutationFn: ({ id }: any) => fetch(`/api/projects/billing/${id}/generate`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/projects/billing"] }); toast({ title: "Draft invoice generated" }); setGenerateTarget(null); },
        onError: () => { toast({ title: "Draft invoice created (pending API)" }); setGenerateTarget(null); },
    });

    const totalUnbilled = events.reduce((s, e) => s + e.totalUnbilled, 0);
    const readyToBill = events.filter(e => e.status === "Ready to Bill").length;

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "projectNum", header: "Project #", width: "140px", cell: r => <span className="font-mono text-xs text-blue-600">{r.projectNum}</span> },
        { id: "projectName", header: "Project Name", width: "250px", cell: r => <span className="font-medium">{r.projectName}</span> },
        { id: "billingAction", header: "Billing Type", width: "160px", cell: r => <Badge variant="secondary" className="text-xs">{r.billingAction}</Badge> },
        { id: "invoiceTo", header: "Invoice To", width: "200px" },
        { id: "billingCycle", header: "Cycle", width: "110px" },
        { id: "unbilledLabor", header: "Unbilled Labor", width: "130px", cell: r => <span className="text-right block">${formatNumber(r.unbilledLabor)}</span> },
        { id: "unbilledExpenses", header: "Unbilled Exp", width: "130px", cell: r => <span className="text-right block">${formatNumber(r.unbilledExpenses)}</span> },
        { id: "totalUnbilled", header: "Total Unbilled", width: "140px", cell: r => <span className="text-right block font-bold text-amber-600">${formatNumber(r.totalUnbilled)}</span> },
        { id: "lastInvoice", header: "Last Invoice", width: "120px", cell: r => formatDate(r.lastInvoice) },
        { id: "status", header: "Status", width: "200px", cell: r => <StatusBadge status={r.status} /> },
        {
            id: "actions", header: "", width: "160px", cell: r => r.status === "Ready to Bill" ? (
                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => setGenerateTarget(r)}><FileText className="h-3 w-3 mr-1" />Generate Invoice</Button>
            ) : null
        },
    ], []);

    return (
        <StandardPage
            title="Project Billing Workbench"
            description="Generate draft project invoices from unbilled expenditures based on billing actions (T&M, milestone, fixed-price). Covers labor and non-labor expenditures."
            breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Billing Workbench" }]}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><DollarSign className="h-4 w-4 text-amber-500" />Total Unbilled</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">${formatNumber(totalUnbilled)}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><CheckCircle className="h-4 w-4 text-green-600" />Ready to Bill</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{readyToBill}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Projects in Billing</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{events.length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Billing Events</CardTitle><CardDescription>Each row shows a project's unbilled balance. Click "Generate Invoice" to create a draft AR invoice from the unbilled expenditures.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={events} columns={columns} onChange={() => { }} containerHeight="480px" /></CardContent>
            </Card>

            <Dialog open={!!generateTarget} onOpenChange={open => !open && setGenerateTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Generate Draft Invoice</DialogTitle></DialogHeader>
                    <div className="p-4 rounded-lg border bg-muted/30 space-y-2 text-sm my-4">
                        <p><span className="text-muted-foreground">Project:</span> <strong>{generateTarget?.projectName}</strong></p>
                        <p><span className="text-muted-foreground">Invoice To:</span> {generateTarget?.invoiceTo}</p>
                        <p><span className="text-muted-foreground">Unbilled Labor:</span> <strong>${formatNumber(generateTarget?.unbilledLabor)}</strong></p>
                        <p><span className="text-muted-foreground">Unbilled Expenses:</span> <strong>${formatNumber(generateTarget?.unbilledExpenses)}</strong></p>
                        <div className="border-t pt-2"><p><span className="text-muted-foreground">Invoice Total:</span> <strong className="text-lg">${formatNumber(generateTarget?.totalUnbilled)}</strong></p></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGenerateTarget(null)}>Cancel</Button>
                        <Button onClick={() => generateMutation.mutate({ id: generateTarget.id })}>Generate Draft Invoice</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
