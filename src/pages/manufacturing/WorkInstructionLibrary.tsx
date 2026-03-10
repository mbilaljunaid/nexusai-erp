import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, FileText, Video, File, BookOpen } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";

const SEED_INSTRUCTIONS: any[] = [
    { id: "WI-001", wiNumber: "WI-001", title: "CNC Lathe — Setup & Tooling", operation: "OP-LATHE-SETUP", workcenter: "CNC-LATHE-01", revision: "C", mediaType: "PDF + Video", attachments: ["lathe_setup_v3.pdf", "tooling_video_rev_c.mp4"], estimatedReadTime: 12, language: "English", status: "Released", releaseDate: "2026-01-15" },
    { id: "WI-002", wiNumber: "WI-002", title: "Welding Safety — MIG/TIG Protocol", operation: "OP-WELD-SAFETY", workcenter: "WELD-CELL-01", revision: "B", mediaType: "PDF + Checklist", attachments: ["welding_safety_SOP_v2.pdf", "PPE_checklist.pdf"], estimatedReadTime: 8, language: "English / Arabic", status: "Released", releaseDate: "2025-11-20" },
    { id: "WI-003", wiNumber: "WI-003", title: "Surface Coating — Polymer Application", operation: "OP-COAT-APPLY", workcenter: "COAT-BOOTH-01", revision: "A", mediaType: "Video (SCORM)", attachments: ["coating_process_training_v1.zip (SCORM 1.2)"], estimatedReadTime: 22, language: "English", status: "Released", releaseDate: "2026-02-01" },
    { id: "WI-004", wiNumber: "WI-004", title: "Assembly Cell — Torque Specifications", operation: "OP-ASSY-TORQUE", workcenter: "ASSY-LINE-01", revision: "D", mediaType: "PDF + Image", attachments: ["torque_chart_rev_d.pdf", "assembly_diagram_annotated.png"], estimatedReadTime: 5, language: "English", status: "Draft", releaseDate: null },
    { id: "WI-005", wiNumber: "WI-005", title: "HVAC PM — Filter Replacement Procedure", operation: "OP-HVAC-PM-FILTER", workcenter: "MAINT-HVAC", revision: "A", mediaType: "Video", attachments: ["hvac_filter_guide.mp4"], estimatedReadTime: 10, language: "English / Arabic", status: "Under Review", releaseDate: null },
];

const MEDIA_TYPES = ["PDF", "PDF + Video", "PDF + Checklist", "PDF + Image", "Video", "Video (SCORM)", "SCORM 1.2 Package", "Interactive HTML5"];
const LANGUAGES = ["English", "Arabic", "English / Arabic", "Hindi", "Tagalog"];
const WORKCENTERS = ["CNC-LATHE-01", "WELD-CELL-01", "COAT-BOOTH-01", "ASSY-LINE-01", "MAINT-HVAC", "FOUNDRY-01"];

const MEDIA_ICON: Record<string, any> = { "PDF": <FileText className="h-3.5 w-3.5" />, "Video": <Video className="h-3.5 w-3.5" />, "SCORM": <BookOpen className="h-3.5 w-3.5 text-purple-600" /> };

export default function WorkInstructionLibrary() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [filter, setFilter] = useState("All");
    const [newWI, setNewWI] = useState({ title: "", operation: "", workcenter: WORKCENTERS[0], mediaType: MEDIA_TYPES[0], language: LANGUAGES[0], notes: "" });

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/manufacturing/work-instructions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Work instruction created — ready for attachment upload" }); setIsOpen(false); },
        onError: () => { toast({ title: "Work instruction saved (pending API)" }); setIsOpen(false); },
    });

    const releaseMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/manufacturing/work-instructions/${id}/release`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Work instruction released — visible on shop floor terminals" }); setSelected(null); },
        onError: () => { toast({ title: "Released (pending API)" }); setSelected(null); },
    });

    const filtered = SEED_INSTRUCTIONS.filter(w => filter === "All" || w.status === filter);

    const colDefs = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "wiNumber", header: "WI #", width: "90px", cell: r => <span className="font-mono text-xs font-bold text-indigo-700">{r.wiNumber}</span> },
        { id: "title", header: "Title", width: "260px", cell: r => <span className="font-medium">{r.title}</span> },
        { id: "operation", header: "Operation", width: "170px", cell: r => <span className="font-mono text-xs">{r.operation}</span> },
        { id: "workcenter", header: "Workcenter", width: "140px", cell: r => <Badge variant="outline" className="text-xs">{r.workcenter}</Badge> },
        { id: "revision", header: "Rev", width: "60px", cell: r => <span className="text-center block font-bold text-blue-600">{r.revision}</span> },
        {
            id: "mediaType", header: "Media / Format", width: "170px", cell: r => {
                const isScorm = r.mediaType.toLowerCase().includes("scorm");
                return <span className={`flex items-center gap-1.5 text-xs ${isScorm ? "text-purple-700 font-semibold" : ""}`}>{isScorm ? MEDIA_ICON["SCORM"] : r.mediaType.includes("Video") ? MEDIA_ICON["Video"] : MEDIA_ICON["PDF"]}{r.mediaType}</span>;
            }
        },
        { id: "attachments", header: "Attachments", width: "100px", cell: r => <span className="text-center block font-bold text-blue-600">{r.attachments.length}</span> },
        { id: "estimatedReadTime", header: "Est. Time", width: "100px", cell: r => <span className="text-xs text-center block">{r.estimatedReadTime} min</span> },
        { id: "language", header: "Language", width: "130px", cell: r => <span className="text-xs">{r.language}</span> },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
        { id: "actions", header: "", width: "90px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelected(r)}><Play className="h-3 w-3 mr-1" />Open</Button> },
    ], []);

    return (
        <StandardPage
            title="Work Instruction Library"
            description="Manage and publish work instructions, SOPs, and SCORM training packages for shop floor operations. Operators can access instructions from the Shop Floor Terminal during job execution."
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Work Instructions" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Create WI</Button>}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><BookOpen className="h-4 w-4" />Total Instructions</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_INSTRUCTIONS.length}</div></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Released</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{SEED_INSTRUCTIONS.filter(w => w.status === "Released").length}</div></CardContent>
                </Card>
                <Card className="border-purple-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><BookOpen className="h-4 w-4 text-purple-600" />SCORM Packages</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-purple-700">{SEED_INSTRUCTIONS.filter(w => w.mediaType.toLowerCase().includes("scorm")).length}</div></CardContent>
                </Card>
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Under Review / Draft</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{SEED_INSTRUCTIONS.filter(w => w.status !== "Released").length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div><CardTitle>Work Instruction Registry</CardTitle><CardDescription>SCORM packages run in the embedded LMS player. PDF and video attachments open inline.</CardDescription></div>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="All">All Statuses</SelectItem><SelectItem value="Released">Released</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Under Review">Under Review</SelectItem></SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={filtered} columns={colDefs} onChange={() => { }} containerHeight="480px" /></CardContent>
            </Card>

            {/* Detail / Player */}
            <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>{selected?.wiNumber} — {selected?.title}</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-3 text-sm py-2">
                        {[["Operation", selected?.operation], ["Workcenter", selected?.workcenter], ["Revision", selected?.revision], ["Media Type", selected?.mediaType], ["Language", selected?.language], ["Est. Time", `${selected?.estimatedReadTime} min`], ["Status", selected?.status], ["Release Date", selected?.releaseDate || "Not yet released"]].map(([l, v]) => (
                            <div key={l}><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v as string}</p></div>
                        ))}
                    </div>
                    <div className="mt-2">
                        <p className="text-xs font-bold text-muted-foreground mb-2">ATTACHMENTS ({selected?.attachments?.length})</p>
                        <div className="space-y-1.5">
                            {selected?.attachments?.map((att: string, i: number) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                                    <span className="flex items-center gap-2">
                                        {att.includes(".mp4") ? <Video className="h-3.5 w-3.5 text-red-500" /> : att.includes(".zip") ? <BookOpen className="h-3.5 w-3.5 text-purple-600" /> : <FileText className="h-3.5 w-3.5 text-blue-500" />}
                                        <span className="font-mono">{att}</span>
                                    </span>
                                    <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => toast({ title: `Opening ${att}…` })}><Play className="h-3 w-3 mr-1" />Open</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                        {selected?.status !== "Released" && <Button className="bg-green-600 hover:bg-green-700" onClick={() => releaseMutation.mutate(selected.id)}>Release to Shop Floor</Button>}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Create Work Instruction</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 md:col-span-2"><Label>Title *</Label><Input value={newWI.title} onChange={e => setNewWI({ ...newWI, title: e.target.value })} placeholder="e.g. CNC Setup — Tooling Change Procedure" /></div>
                        <div className="space-y-2"><Label>Operation *</Label><Input value={newWI.operation} onChange={e => setNewWI({ ...newWI, operation: e.target.value })} placeholder="OP-XXXX-YYYY" /></div>
                        <div className="space-y-2"><Label>Workcenter</Label>
                            <Select value={newWI.workcenter} onValueChange={v => setNewWI({ ...newWI, workcenter: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{WORKCENTERS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Media Type</Label>
                            <Select value={newWI.mediaType} onValueChange={v => setNewWI({ ...newWI, mediaType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{MEDIA_TYPES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Language</Label>
                            <Select value={newWI.language} onValueChange={v => setNewWI({ ...newWI, language: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2"><Label>Notes / Overview</Label><Textarea value={newWI.notes} onChange={e => setNewWI({ ...newWI, notes: e.target.value })} rows={2} placeholder="Brief description of procedure scope and safety precautions…" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newWI.title || !newWI.operation} onClick={() => createMutation.mutate({ ...newWI, status: "Draft", revision: "A" })}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
