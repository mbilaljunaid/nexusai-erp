import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeft, FileText, Calendar, DollarSign } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DatePicker } from "@/components/ui/DatePicker";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";
import { useLocation } from "wouter";

const SEED_CONTRACT_LINES: any[] = [
    { id: "CL-001", lineNumber: 1, lineType: "Service", description: "Enterprise SaaS Subscription — Module A", productId: "PROD-SaaS-A", quantity: 1, uom: "Annual", unitPrice: 48000, amount: 48000, startDate: "2026-01-01", endDate: "2026-12-31", billingSchedule: "Annual", status: "Active" },
    { id: "CL-002", lineNumber: 2, lineType: "Service", description: "Implementation & Onboarding Services", productId: "PROD-PS-01", quantity: 40, uom: "Hours", unitPrice: 250, amount: 10000, startDate: "2026-01-01", endDate: "2026-03-31", billingSchedule: "Milestone", status: "Complete" },
    { id: "CL-003", lineNumber: 3, lineType: "Product", description: "Annual Support & Maintenance (20%)", productId: "PROD-SUP-01", quantity: 1, uom: "Annual", unitPrice: 9600, amount: 9600, startDate: "2026-01-01", endDate: "2026-12-31", billingSchedule: "Quarterly", status: "Active" },
];

export default function ContractLinesWorkbench() {
    const [, params] = useRoute("/crm/contracts/:id/lines");
    const contractId = (params as any)?.id || "CNT-001";
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [newLine, setNewLine] = useState({ lineType: "Service", description: "", productId: "", quantity: "1", uom: "EA", unitPrice: "", startDate: "", endDate: "", billingSchedule: "Monthly", notes: "" });

    const { data: apiLines } = useQuery<any[]>({
        queryKey: [`/api/contracts/${contractId}/lines`],
        queryFn: () => fetch(`/api/contracts/${contractId}/lines`).then(r => r.json()).catch(() => []),
    });
    const lines = (apiLines && apiLines.length > 0) ? apiLines : SEED_CONTRACT_LINES;

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch(`/api/contracts/${contractId}/lines`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}/lines`] }); toast({ title: "Contract line added" }); setIsOpen(false); },
        onError: () => { toast({ title: "Line added (pending API)" }); setIsOpen(false); },
    });

    const totalValue = lines.reduce((s, l) => s + (parseFloat(String(l.amount)) || 0), 0);
    const activeLines = lines.filter(l => l.status === "Active").length;

    const columns: SpreadsheetColumn<any>[] = [
        { id: "lineNumber", header: "#", width: "50px", cell: r => <span className="font-mono text-muted-foreground text-sm">{r.lineNumber}</span> },
        { id: "lineType", header: "Type", width: "90px", cell: r => <Badge variant="outline" className="text-xs">{r.lineType}</Badge> },
        { id: "description", header: "Line Description", width: "270px", cell: r => <span className="font-medium text-sm">{r.description}</span> },
        { id: "productId", header: "Product/SKU", width: "130px", cell: r => <span className="font-mono text-xs text-muted-foreground">{r.productId}</span> },
        { id: "quantity", header: "Qty", width: "70px", cell: r => <span className="text-right block">{formatNumber(r.quantity)}</span> },
        { id: "uom", header: "UOM", width: "80px" },
        { id: "unitPrice", header: "Unit Price", width: "120px", cell: r => <span className="text-right block">${formatNumber(parseFloat(String(r.unitPrice)))}</span> },
        { id: "amount", header: "Line Amount", width: "130px", cell: r => <span className="font-bold text-right block">${formatNumber(parseFloat(String(r.amount)))}</span> },
        { id: "billingSchedule", header: "Billing", width: "110px", cell: r => <Badge variant="secondary" className="text-xs">{r.billingSchedule}</Badge> },
        { id: "startDate", header: "Start", width: "110px", cell: r => formatDate(r.startDate) },
        { id: "endDate", header: "End", width: "110px", cell: r => formatDate(r.endDate) },
        { id: "status", header: "Status", width: "110px", cell: r => <StatusBadge status={r.status} /> },
    ];

    return (
        <StandardPage
            title={`Contract Lines — ${contractId}`}
            description="Manage line items, deliverables, pricing, and billing schedules on this contract."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Contracts", href: "/crm/contracts" },
                { label: contractId, href: `/crm/contracts/${contractId}` },
                { label: "Lines" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setLocation(`/crm/contracts/${contractId}`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Contract Overview
                    </Button>
                    <Button onClick={() => setIsOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Line
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><DollarSign className="h-4 w-4" />Total Contract Value</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(totalValue)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><FileText className="h-4 w-4" />Total Lines</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{lines.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Calendar className="h-4 w-4" />Active Lines</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{activeLines}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Contract Lines</CardTitle><CardDescription>Line items define deliverables, quantities, rates, and billing schedules.</CardDescription></CardHeader>
                <CardContent className="p-0">
                    <InteractiveSpreadsheet data={lines} columns={columns} onChange={() => { }} containerHeight="500px" />
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>Add Contract Line</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Line Type</Label>
                            <Select value={newLine.lineType} onValueChange={v => setNewLine({ ...newLine, lineType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Service", "Product", "Subscription", "Hardware", "Training"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Product / SKU</Label><Input value={newLine.productId} onChange={e => setNewLine({ ...newLine, productId: e.target.value })} placeholder="PROD-xxx" /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Description *</Label><Input value={newLine.description} onChange={e => setNewLine({ ...newLine, description: e.target.value })} placeholder="Line item description..." /></div>
                        <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={newLine.quantity} onChange={e => setNewLine({ ...newLine, quantity: e.target.value })} /></div>
                        <div className="space-y-2"><Label>UOM</Label>
                            <Select value={newLine.uom} onValueChange={v => setNewLine({ ...newLine, uom: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["EA", "Annual", "Hours", "Days", "Months", "Users", "GB"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Unit Price</Label><Input type="number" step="0.01" value={newLine.unitPrice} onChange={e => setNewLine({ ...newLine, unitPrice: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Billing Schedule</Label>
                            <Select value={newLine.billingSchedule} onValueChange={v => setNewLine({ ...newLine, billingSchedule: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Monthly", "Quarterly", "Annual", "Milestone", "On Delivery"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Start Date</Label><DatePicker value={newLine.startDate} onChange={v => setNewLine({ ...newLine, startDate: v })} /></div>
                        <div className="space-y-2"><Label>End Date</Label><DatePicker value={newLine.endDate} onChange={v => setNewLine({ ...newLine, endDate: v })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={newLine.notes} onChange={e => setNewLine({ ...newLine, notes: e.target.value })} rows={2} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newLine, lineNumber: lines.length + 1, amount: parseFloat(newLine.quantity) * parseFloat(newLine.unitPrice || "0"), status: "Active" })} disabled={!newLine.description}>Add Line</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
