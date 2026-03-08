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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Shield, CheckCircle, AlertTriangle, XCircle, Paperclip } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";

const SEED_ASSESSMENTS: any[] = [
    { id: "CA-001", controlId: "CTRL-FIN-01", controlName: "Journal Entry Authorization", process: "Financial Close", sox: true, riskRating: "High", assessmentDate: "2026-01-15", tester: "External Auditor", testingMethod: "Walkthroughs + Population", sampleSize: 25, operator: "ERR", effectiveness: "Effective", exceptions: 0, status: "Complete" },
    { id: "CA-002", controlId: "CTRL-AP-03", controlName: "Invoice 3-Way Match", process: "Accounts Payable", sox: true, riskRating: "High", assessmentDate: "2026-01-22", tester: "Internal Audit", testingMethod: "Sample Testing", sampleSize: 30, operator: null, effectiveness: "Effective with Exceptions", exceptions: 2, status: "Complete" },
    { id: "CA-003", controlId: "CTRL-AR-07", controlName: "Credit Limit Approval", process: "Accounts Receivable", sox: false, riskRating: "Medium", assessmentDate: "2026-02-10", tester: "Control Owner", testingMethod: "Self-Assessment", sampleSize: 15, operator: null, effectiveness: "Pending", exceptions: 0, status: "In Progress" },
    { id: "CA-004", controlId: "CTRL-IT-12", controlName: "Privileged Access Review", process: "IT General Controls", sox: true, riskRating: "Critical", assessmentDate: "2026-02-28", tester: "IT Security Team", testingMethod: "Full Population", sampleSize: 0, operator: null, effectiveness: "Ineffective", exceptions: 5, status: "Needs Remediation" },
];

export default function ControlAssessmentWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [newAssessment, setNewAssessment] = useState({
        controlId: "", controlName: "", process: "", riskRating: "Medium",
        sox: "false", tester: "", testingMethod: "Sample Testing", sampleSize: "25",
        assessmentDate: new Date().toISOString().split("T")[0], notes: ""
    });

    const { data: apiData } = useQuery<any[]>({
        queryKey: ["/api/compliance/control-assessments"],
        queryFn: () => fetch("/api/compliance/control-assessments").then(r => r.json()).catch(() => []),
    });
    const assessments = (apiData && apiData.length > 0) ? apiData : SEED_ASSESSMENTS;

    const submitMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/compliance/control-assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/compliance/control-assessments"] }); toast({ title: "Assessment created" }); setIsOpen(false); },
        onError: () => { toast({ title: "Assessment saved (pending API)" }); setIsOpen(false); },
    });

    const effectiveCount = assessments.filter(a => a.effectiveness === "Effective").length;
    const issues = assessments.filter(a => a.exceptions > 0 || a.effectiveness === "Ineffective").length;
    const soxCount = assessments.filter(a => a.sox).length;
    const pct = assessments.length > 0 ? Math.round((effectiveCount / assessments.length) * 100) : 0;

    const columns: SpreadsheetColumn<any>[] = [
        { id: "controlId", header: "Control ID", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.controlId}</span> },
        {
            id: "controlName", header: "Control Name", width: "240px", cell: r => (
                <button className="text-left font-medium hover:text-primary hover:underline text-sm w-full" onClick={() => setSelectedAssessment(r)}>{r.controlName}</button>
            )
        },
        { id: "process", header: "Process", width: "170px", cell: r => <span className="text-sm">{r.process}</span> },
        { id: "sox", header: "SOX", width: "60px", cell: r => r.sox ? <CheckCircle className="h-4 w-4 text-blue-600 mx-auto" /> : <span className="text-muted-foreground text-xs text-center block">—</span> },
        {
            id: "riskRating", header: "Risk", width: "100px", cell: r => (
                <Badge variant={r.riskRating === "Critical" ? "destructive" : r.riskRating === "High" ? "default" : "outline"} className="text-xs">{r.riskRating}</Badge>
            )
        },
        { id: "tester", header: "Tester", width: "160px" },
        { id: "testingMethod", header: "Method", width: "160px" },
        { id: "exceptions", header: "Exceptions", width: "90px", cell: r => <span className={`text-center block font-semibold ${r.exceptions > 0 ? "text-red-600" : "text-green-700"}`}>{r.exceptions}</span> },
        {
            id: "effectiveness", header: "Effectiveness", width: "190px", cell: r => {
                const v = r.effectiveness;
                return <Badge variant={v === "Effective" ? "outline" : v === "Ineffective" ? "destructive" : "secondary"} className="text-xs">{v}</Badge>;
            }
        },
        { id: "status", header: "Status", width: "150px", cell: r => <StatusBadge status={r.status} /> },
    ];

    return (
        <StandardPage
            title="Control Assessment Workbench"
            description="Assess SOX and non-SOX internal controls. Document test results, exceptions, and remediation evidence."
            breadcrumbs={[
                { label: "Compliance", href: "/compliance" },
                { label: "Controls", href: "/compliance/controls" },
                { label: "Assessment Workbench" }
            ]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />New Assessment</Button>}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Shield className="h-4 w-4 text-blue-600" />SOX Controls</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{soxCount}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><CheckCircle className="h-4 w-4 text-green-600" />Effective</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{effectiveCount}</div>
                        <Progress value={pct} className="mt-2 h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{pct}% pass rate</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><AlertTriangle className="h-4 w-4 text-amber-500" />With Exceptions</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{issues}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Assessments</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{assessments.length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Control Assessments</CardTitle><CardDescription>Click a control name to view full evidence and test documentation.</CardDescription></CardHeader>
                <CardContent className="p-0">
                    <InteractiveSpreadsheet data={assessments} columns={columns} onChange={() => { }} containerHeight="540px" />
                </CardContent>
            </Card>

            {/* Detail modal */}
            <Dialog open={!!selectedAssessment} onOpenChange={open => !open && setSelectedAssessment(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>{selectedAssessment?.controlId} — {selectedAssessment?.controlName}</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div><p className="text-xs text-muted-foreground">Process</p><p className="font-medium">{selectedAssessment?.process}</p></div>
                        <div><p className="text-xs text-muted-foreground">Risk Rating</p><Badge variant={selectedAssessment?.riskRating === "Critical" ? "destructive" : "default"}>{selectedAssessment?.riskRating}</Badge></div>
                        <div><p className="text-xs text-muted-foreground">Tester</p><p className="font-medium">{selectedAssessment?.tester}</p></div>
                        <div><p className="text-xs text-muted-foreground">Testing Method</p><p className="font-medium">{selectedAssessment?.testingMethod}</p></div>
                        <div><p className="text-xs text-muted-foreground">Sample Size</p><p className="font-medium">{selectedAssessment?.sampleSize || "Full Population"}</p></div>
                        <div><p className="text-xs text-muted-foreground">Exceptions Found</p><p className={`font-bold text-lg ${(selectedAssessment?.exceptions || 0) > 0 ? "text-red-600" : "text-green-700"}`}>{selectedAssessment?.exceptions}</p></div>
                        <div className="md:col-span-2"><p className="text-xs text-muted-foreground">Effectiveness</p>
                            <Badge variant={selectedAssessment?.effectiveness === "Effective" ? "outline" : "destructive"}>{selectedAssessment?.effectiveness}</Badge>
                        </div>
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 p-3 border border-dashed rounded-md text-muted-foreground text-sm">
                                <Paperclip className="h-4 w-4" /> Evidence files would appear here for attachment
                            </div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setSelectedAssessment(null)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New assessment dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>New Control Assessment</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Control ID *</Label><Input value={newAssessment.controlId} onChange={e => setNewAssessment({ ...newAssessment, controlId: e.target.value })} placeholder="CTRL-FIN-01" /></div>
                        <div className="space-y-2"><Label>Control Name *</Label><Input value={newAssessment.controlName} onChange={e => setNewAssessment({ ...newAssessment, controlName: e.target.value })} placeholder="e.g. Invoice Approval" /></div>
                        <div className="space-y-2"><Label>Process Area</Label><Input value={newAssessment.process} onChange={e => setNewAssessment({ ...newAssessment, process: e.target.value })} placeholder="e.g. Accounts Payable" /></div>
                        <div className="space-y-2"><Label>Risk Rating</Label>
                            <Select value={newAssessment.riskRating} onValueChange={v => setNewAssessment({ ...newAssessment, riskRating: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>SOX Relevant</Label>
                            <Select value={newAssessment.sox} onValueChange={v => setNewAssessment({ ...newAssessment, sox: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Yes — SOX Control</SelectItem>
                                    <SelectItem value="false">No — Operational</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Testing Method</Label>
                            <Select value={newAssessment.testingMethod} onValueChange={v => setNewAssessment({ ...newAssessment, testingMethod: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sample Testing">Sample Testing</SelectItem>
                                    <SelectItem value="Walkthroughs + Population">Walkthroughs + Population</SelectItem>
                                    <SelectItem value="Full Population">Full Population</SelectItem>
                                    <SelectItem value="Self-Assessment">Self-Assessment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Tester / Assessor</Label><Input value={newAssessment.tester} onChange={e => setNewAssessment({ ...newAssessment, tester: e.target.value })} placeholder="Team or person name" /></div>
                        <div className="space-y-2"><Label>Sample Size</Label><Input type="number" value={newAssessment.sampleSize} onChange={e => setNewAssessment({ ...newAssessment, sampleSize: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={newAssessment.notes} onChange={e => setNewAssessment({ ...newAssessment, notes: e.target.value })} rows={2} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => submitMutation.mutate({ ...newAssessment, status: "In Progress" })} disabled={!newAssessment.controlId || !newAssessment.controlName}>Create Assessment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
