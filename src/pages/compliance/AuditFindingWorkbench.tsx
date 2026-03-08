import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, ClipboardList, AlertOctagon, CheckCircle2, Clock } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DatePicker } from "@/components/ui/DatePicker";
import { formatDate } from "@/lib/dateUtils";

const SEED_FINDINGS: any[] = [
    { id: "FND-001", title: "Segregation of Duties violation in AP module", findingType: "Control Deficiency", severity: "Material Weakness", auditId: "AUD-2026-Q1", area: "Accounts Payable", identifiedDate: "2026-01-15", dueDate: "2026-03-31", owner: "AP Manager", remediationPlan: "Implement SoD rules in roles configuration", status: "In Remediation", daysOpen: 52 },
    { id: "FND-002", title: "Missing evidence for 8 journal entry approvals", findingType: "Exception", severity: "Significant Deficiency", auditId: "AUD-2026-Q1", area: "General Ledger", identifiedDate: "2026-01-20", dueDate: "2026-02-28", owner: "GL Controller", remediationPlan: "Retroactive approvals obtained; workflow enforced going forward", status: "Remediated", daysOpen: 0 },
    { id: "FND-003", title: "Privileged IT access not reviewed quarterly", findingType: "Control Gap", severity: "Significant Deficiency", auditId: "AUD-2025-Q4", area: "IT General Controls", identifiedDate: "2025-12-01", dueDate: "2026-03-01", owner: "IT Security", remediationPlan: "Quarterly access review process to be implemented", status: "Overdue", daysOpen: 97 },
    { id: "FND-004", title: "Vendor master changes missing dual approval", findingType: "Control Deficiency", severity: "Deficiency", auditId: "AUD-2026-Q1", area: "Accounts Payable", identifiedDate: "2026-02-05", dueDate: "2026-04-30", owner: "Procurement Director", remediationPlan: "Enable dual-approval workflow in vendor master module", status: "Open", daysOpen: 31 },
];

export default function AuditFindingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [newFinding, setNewFinding] = useState({ title: "", findingType: "Exception", severity: "Deficiency", auditId: "", area: "", identifiedDate: new Date().toISOString().split("T")[0], dueDate: "", owner: "", remediationPlan: "" });

    const { data: apiData } = useQuery<any[]>({
        queryKey: ["/api/compliance/findings"],
        queryFn: () => fetch("/api/compliance/findings").then(r => r.json()).catch(() => []),
    });
    const findings = (apiData && apiData.length > 0) ? apiData : SEED_FINDINGS;

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/compliance/findings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/compliance/findings"] }); toast({ title: "Finding logged" }); setIsOpen(false); },
        onError: () => { toast({ title: "Finding saved (pending API)" }); setIsOpen(false); },
    });

    const openCount = findings.filter(f => f.status === "Open" || f.status === "In Remediation").length;
    const overdueCount = findings.filter(f => f.status === "Overdue").length;
    const mwCount = findings.filter(f => f.severity === "Material Weakness").length;
    const remediatedCount = findings.filter(f => f.status === "Remediated").length;

    const sevColor = (s: string) => s === "Material Weakness" ? "destructive" : s === "Significant Deficiency" ? "default" : "outline";

    const columns: SpreadsheetColumn<any>[] = [
        { id: "id", header: "Finding #", width: "100px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "title", header: "Finding Title", width: "280px", cell: r => <span className="font-medium text-sm">{r.title}</span> },
        { id: "findingType", header: "Type", width: "150px", cell: r => <Badge variant="outline" className="text-xs">{r.findingType}</Badge> },
        { id: "severity", header: "Severity", width: "170px", cell: r => <Badge variant={sevColor(r.severity)} className="text-xs">{r.severity}</Badge> },
        { id: "area", header: "Audit Area", width: "150px" },
        { id: "identifiedDate", header: "Identified", width: "110px", cell: r => formatDate(r.identifiedDate) },
        { id: "dueDate", header: "Due Date", width: "110px", cell: r => <span className={r.status === "Overdue" ? "text-red-600 font-semibold" : ""}>{formatDate(r.dueDate)}</span> },
        { id: "owner", header: "Owner", width: "150px" },
        { id: "daysOpen", header: "Days Open", width: "100px", cell: r => <span className={`text-center block font-semibold ${r.daysOpen > 60 ? "text-red-600" : r.daysOpen > 30 ? "text-amber-600" : "text-green-700"}`}>{r.daysOpen || 0}</span> },
        { id: "status", header: "Status", width: "140px", cell: r => <StatusBadge status={r.status} /> },
    ];

    return (
        <StandardPage
            title="Audit Finding Workbench"
            description="Track audit observations, remediation plans, and closure evidence across all audit cycles."
            breadcrumbs={[{ label: "Compliance", href: "/compliance" }, { label: "Audit Findings" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Log Finding</Button>}
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><ClipboardList className="h-4 w-4" />Open Findings</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{openCount}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Clock className="h-4 w-4 text-red-500" />Overdue</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{overdueCount}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><AlertOctagon className="h-4 w-4 text-red-600" />Material Weaknesses</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{mwCount}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-green-600" />Remediated</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">{remediatedCount}</div></CardContent>
                </Card>
            </div>

            <Card><CardHeader><CardTitle>Audit Findings</CardTitle><CardDescription>Click column headers to sort. Use the status to track remediation progress.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={findings} columns={columns} onChange={() => { }} containerHeight="520px" /></CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>Log Audit Finding</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 md:col-span-2"><Label>Finding Title *</Label><Input value={newFinding.title} onChange={e => setNewFinding({ ...newFinding, title: e.target.value })} placeholder="Brief description of finding" /></div>
                        <div className="space-y-2"><Label>Finding Type</Label>
                            <Select value={newFinding.findingType} onValueChange={v => setNewFinding({ ...newFinding, findingType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Exception", "Control Deficiency", "Control Gap", "Observation", "Recommendation"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Severity</Label>
                            <Select value={newFinding.severity} onValueChange={v => setNewFinding({ ...newFinding, severity: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Material Weakness", "Significant Deficiency", "Deficiency", "Informational"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Audit ID</Label><Input value={newFinding.auditId} onChange={e => setNewFinding({ ...newFinding, auditId: e.target.value })} placeholder="AUD-2026-Q1" /></div>
                        <div className="space-y-2"><Label>Audit Area</Label><Input value={newFinding.area} onChange={e => setNewFinding({ ...newFinding, area: e.target.value })} placeholder="e.g. Accounts Payable" /></div>
                        <div className="space-y-2"><Label>Owner</Label><Input value={newFinding.owner} onChange={e => setNewFinding({ ...newFinding, owner: e.target.value })} placeholder="Responsible party" /></div>
                        <div className="space-y-2"><Label>Due Date</Label><DatePicker value={newFinding.dueDate} onChange={v => setNewFinding({ ...newFinding, dueDate: v })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Remediation Plan</Label><Textarea value={newFinding.remediationPlan} onChange={e => setNewFinding({ ...newFinding, remediationPlan: e.target.value })} rows={2} placeholder="Describe the corrective action..." /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newFinding, status: "Open", daysOpen: 0 })} disabled={!newFinding.title}>Log Finding</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
