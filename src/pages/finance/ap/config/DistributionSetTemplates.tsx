import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Copy } from "lucide-react";

interface DistLine {
    lineSeq: number;
    description: string;
    glAccount: string;
    percentage: number;
    costCenter: string;
}

interface DistSet {
    id: string;
    setCode: string;
    name: string;
    description: string;
    category: string;
    status: "Active" | "Inactive";
    autoCreate: boolean;
    lines: DistLine[];
}

const CATEGORIES = ["Administrative", "IT Overhead", "Marketing", "Operations", "R&D", "Sales", "Shared Services"];
const GL_ACCOUNTS = [
    "01-000-5100-000", "01-000-5200-000", "01-000-5300-000",
    "01-MKT-5100-000", "01-IT-5100-000", "01-OPS-5100-000", "01-RD-5100-000",
];
const COST_CENTERS = ["ADM", "IT", "MKT", "OPS", "RD", "SLS", "SVC"];

const MOCK: DistSet[] = [
    {
        id: "DS001", setCode: "DS-IT", name: "IT Overhead Allocation", description: "Split IT costs 60/40 across all departments", category: "IT Overhead", status: "Active", autoCreate: true,
        lines: [
            { lineSeq: 1, description: "IT Core", glAccount: "01-IT-5100-000", percentage: 60, costCenter: "IT" },
            { lineSeq: 2, description: "IT Shared", glAccount: "01-000-5200-000", percentage: 40, costCenter: "SVC" },
        ],
    },
    {
        id: "DS002", setCode: "DS-MK", name: "Marketing – 50/50 Split", description: "Equal split across brand and digital", category: "Marketing", status: "Active", autoCreate: true,
        lines: [
            { lineSeq: 1, description: "Brand Marketing", glAccount: "01-MKT-5100-000", percentage: 50, costCenter: "MKT" },
            { lineSeq: 2, description: "Digital Marketing", glAccount: "01-000-5100-000", percentage: 50, costCenter: "MKT" },
        ],
    },
    {
        id: "DS003", setCode: "DS-ADMIN", name: "Admin – G&A Pool", description: "All admin costs to G&A cost pool", category: "Administrative", status: "Active", autoCreate: false,
        lines: [{ lineSeq: 1, description: "G&A Expenses", glAccount: "01-000-5300-000", percentage: 100, costCenter: "ADM" }],
    },
    {
        id: "DS004", setCode: "DS-OPS", name: "Operations – Dept Allocation", description: "Operations overhead across Op units", category: "Operations", status: "Inactive", autoCreate: false,
        lines: [
            { lineSeq: 1, description: "Ops Primary", glAccount: "01-OPS-5100-000", percentage: 75, costCenter: "OPS" },
            { lineSeq: 2, description: "Ops Shared", glAccount: "01-000-5200-000", percentage: 25, costCenter: "SVC" },
        ],
    },
];

export default function DistributionSetTemplates() {
    const { toast } = useToast();
    const [sets, setSets] = useState<DistSet[]>(MOCK);
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<DistSet | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DistSet | null>(null);

    // form state
    const [fCode, setFCode] = useState("");
    const [fName, setFName] = useState("");
    const [fDesc, setFDesc] = useState("");
    const [fCat, setFCat] = useState(CATEGORIES[0]);
    const [fAuto, setFAuto] = useState(true);
    const [fLines, setFLines] = useState<DistLine[]>([{ lineSeq: 1, description: "", glAccount: GL_ACCOUNTS[0], percentage: 100, costCenter: COST_CENTERS[0] }]);

    const totalPct = fLines.reduce((s, l) => s + l.percentage, 0);
    const pctValid = totalPct === 100;

    const resetForm = () => {
        setFCode(""); setFName(""); setFDesc(""); setFCat(CATEGORIES[0]); setFAuto(true);
        setFLines([{ lineSeq: 1, description: "", glAccount: GL_ACCOUNTS[0], percentage: 100, costCenter: COST_CENTERS[0] }]);
    };

    const openCreate = () => { resetForm(); setEditTarget(null); setCreateOpen(true); };
    const openEdit = (ds: DistSet) => {
        setFCode(ds.setCode); setFName(ds.name); setFDesc(ds.description);
        setFCat(ds.category); setFAuto(ds.autoCreate); setFLines(ds.lines.map(l => ({ ...l })));
        setEditTarget(ds); setCreateOpen(true);
    };

    const handleSave = () => {
        if (!fCode || !fName || !pctValid) {
            toast({ title: "Validation Error", description: "All fields required and distribution percentages must total 100%.", variant: "destructive" }); return;
        }
        const entry: DistSet = {
            id: editTarget?.id ?? `DS${String(sets.length + 1).padStart(3, "0")}`,
            setCode: fCode, name: fName, description: fDesc, category: fCat, status: "Active", autoCreate: fAuto,
            lines: fLines.map((l, i) => ({ ...l, lineSeq: i + 1 })),
        };
        setSets(prev => editTarget ? prev.map(s => s.id === editTarget.id ? entry : s) : [entry, ...prev]);
        toast({ title: editTarget ? "Distribution Set Updated" : "Distribution Set Created", description: `${fCode} — ${fLines.length} line(s), ${totalPct}% allocated.` });
        setCreateOpen(false); resetForm();
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setSets(prev => prev.filter(s => s.id !== deleteTarget.id));
        toast({ title: "Deleted", description: `Distribution Set ${deleteTarget.setCode} removed.` });
        setDeleteTarget(null);
    };

    const addLine = () => setFLines(prev => [...prev, { lineSeq: prev.length + 1, description: "", glAccount: GL_ACCOUNTS[0], percentage: 0, costCenter: COST_CENTERS[0] }]);
    const removeLine = (i: number) => setFLines(prev => prev.filter((_, idx) => idx !== i));
    const updateLine = (i: number, field: keyof DistLine, val: string | number) =>
        setFLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: field === "percentage" ? Number(val) : val } : l));

    const columns: SpreadsheetColumn<DistSet>[] = useMemo(() => [
        { id: "code", header: "Set Code", width: "120px", cellClassName: "font-mono font-bold text-sm", cell: r => r.setCode },
        { id: "name", header: "Name", width: "220px", cellClassName: "font-medium text-sm", cell: r => r.name },
        { id: "category", header: "Category", width: "130px", cell: r => <Badge variant="outline">{r.category}</Badge> },
        { id: "lines", header: "Lines", width: "70px", cellClassName: "font-mono text-center", cell: r => r.lines.length },
        {
            id: "pct", header: "Allocation", width: "280px",
            cell: r => (
                <div className="flex items-center gap-1">
                    {r.lines.map(l => (
                        <div key={l.lineSeq} className="flex flex-col items-center">
                            <div className="text-xs font-mono font-bold text-primary">{l.percentage}%</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[60px]">{l.costCenter}</div>
                        </div>
                    ))}
                </div>
            ),
        },
        { id: "auto", header: "Auto-Create", width: "100px", cell: r => <Badge variant={r.autoCreate ? "default" : "secondary"}>{r.autoCreate ? "Yes" : "No"}</Badge> },
        { id: "status", header: "Status", width: "90px", cell: r => <Badge variant={r.status === "Active" ? "default" : "secondary"}>{r.status}</Badge> },
        {
            id: "actions", header: "", width: "130px",
            cell: r => (
                <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openEdit(r)}>Edit</Button>
                    <Button size="sm" variant="outline" className="h-7 px-1 text-xs" onClick={() => setDeleteTarget(r)}><Trash2 className="h-3 w-3" /></Button>
                </div>
            ),
        },
    ], []);

    return (
        <StandardPage
            title="Distribution Set Templates"
            description="Define reusable GL distribution templates to auto-split AP invoice charges across accounts, cost centers, and percentages. Applied at invoice entry to eliminate manual line-by-line coding."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Distribution Sets" },
            ]}
            actions={<Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Set</Button>}
        >
            <div className="mb-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                <strong>Oracle AP Parity:</strong> Distribution Sets automatically create invoice distributions when applied. If <em>Auto-Create</em> is enabled, lines are generated immediately upon applying the set; otherwise the user reviews them. Total allocation across all lines must equal 100%.
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                    { l: "Total Sets", v: sets.length },
                    { l: "Active", v: sets.filter(s => s.status === "Active").length },
                    { l: "Auto-Create", v: sets.filter(s => s.autoCreate).length },
                    { l: "With Multiple Lines", v: sets.filter(s => s.lines.length > 1).length },
                ].map(m => (
                    <Card key={m.l}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{m.l}</p><p className="text-2xl font-bold font-mono">{m.v}</p></CardContent></Card>
                ))}
            </div>
            <InteractiveSpreadsheet<DistSet> data={sets} columns={columns} onChange={() => { }} containerHeight="380px" />

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? "Edit" : "New"} Distribution Set</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1"><Label>Set Code *</Label><Input className="font-mono" value={fCode} onChange={e => setFCode(e.target.value)} placeholder="DS-IT" /></div>
                            <div className="space-y-1"><Label>Name *</Label><Input value={fName} onChange={e => setFName(e.target.value)} /></div>
                            <div className="space-y-1"><Label>Description</Label><Input value={fDesc} onChange={e => setFDesc(e.target.value)} /></div>
                            <div className="space-y-1">
                                <Label>Category</Label>
                                <Select value={fCat} onValueChange={setFCat}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                                <input type="checkbox" id="auto" checked={fAuto} onChange={e => setFAuto(e.target.checked)} className="h-4 w-4" aria-label="Auto-Create distributions on apply" />
                                <Label htmlFor="auto">Auto-Create distributions on apply</Label>
                            </div>
                        </div>
                        <div className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Distribution Lines</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant={pctValid ? "default" : "destructive"}>{totalPct}% / 100%</Badge>
                                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={addLine}><Plus className="h-3 w-3 mr-1" /> Add Line</Button>
                                </div>
                            </div>
                            {fLines.map((l, i) => (
                                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                                    <Input className="col-span-2" placeholder="Description" value={l.description} onChange={e => updateLine(i, "description", e.target.value)} />
                                    <Select value={l.glAccount} onValueChange={v => updateLine(i, "glAccount", v)}>
                                        <SelectTrigger className="text-xs font-mono"><SelectValue /></SelectTrigger>
                                        <SelectContent>{GL_ACCOUNTS.map(a => <SelectItem key={a} value={a} className="font-mono text-xs">{a}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-1"><Input type="number" min={0} max={100} className="font-mono w-16" value={l.percentage} onChange={e => updateLine(i, "percentage", e.target.value)} /><span className="text-xs text-muted-foreground">%</span></div>
                                    <div className="flex items-center gap-1">
                                        <Select value={l.costCenter} onValueChange={v => updateLine(i, "costCenter", v)}>
                                            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>{COST_CENTERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                        </Select>
                                        {fLines.length > 1 && <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => removeLine(i)}><Trash2 className="h-3 w-3" /></Button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={!pctValid || !fCode || !fName}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Distribution Set</AlertDialogTitle>
                        <AlertDialogDescription>Delete <strong>{deleteTarget?.setCode} — {deleteTarget?.name}</strong>? Existing invoice distributions using this set will not be affected, but new invoices will not be able to continue using it.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
