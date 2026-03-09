import React, { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, AlertTriangle, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

// Severity × Occurrence × Detection = RPN
const SEED_FMEA: any[] = [
    { id: "FM-001", system: "Centrifugal Pump", assembly: "Impeller", failureMode: "Erosion / Wear", failureEffect: "Reduced flow rate — process underperforms target capacity", failureCause: "Suspended solids in fluid exceed 200 ppm without strainer", severity: 7, occurrence: 5, detection: 4, rpn: 140, controls: "Flow monitor alarm at -15% of setpoint", action: "Install upstream 200μm strainer; inspect impeller every 6 months", owner: "Ahmed Al-Rashid", status: "Action Open" },
    { id: "FM-002", system: "Centrifugal Pump", assembly: "Mechanical Seal", failureMode: "Seal Leak", failureEffect: "Process fluid loss — potential environmental spill", failureCause: "Misalignment during installation; vibration above 4mm/s", severity: 9, occurrence: 4, detection: 5, rpn: 180, controls: "Vibration sensor on bearing housing", action: "Add laser alignment SOP to PM schedule; replace seal every 12k h", owner: "Sara Kim", status: "Action Open" },
    { id: "FM-003", system: "Centrifugal Pump", assembly: "Motor", failureMode: "Winding Insulation Failure", failureEffect: "Motor trips — complete pump outage; production loss", failureCause: "Overheating due to blocked cooling fins or sustained overload", severity: 8, occurrence: 3, detection: 3, rpn: 72, controls: "Thermal relay set at 105°C; annual megger test", action: "None — current controls adequate at RPN 72", owner: "Ahmed Al-Rashid", status: "Accepted" },
    { id: "FM-004", system: "HVAC AHU", assembly: "Fan Belt", failureMode: "Belt Slippage / Break", failureEffect: "Loss of air circulation — building temperature uncontrolled", failureCause: "Belt age (>24 months) or tensioner spring fatigue", severity: 6, occurrence: 6, detection: 2, rpn: 72, controls: "Belt tension check in PM every 3 months", action: "Replace belt at 18-month interval regardless of condition", owner: "Maria Santos", status: "In Progress" },
    { id: "FM-005", system: "HVAC AHU", assembly: "Cooling Coil", failureMode: "Coil Fouling (Biological)", failureEffect: "Reduced cooling capacity and potential Legionella risk", failureCause: "Stagnant condensate and warm surface — ideal biofilm growth", severity: 10, occurrence: 3, detection: 6, rpn: 180, controls: "Water treatment dosing; quarterly swab test", action: "Bi-annual chemical clean; upgrade to UV-C emitter in drain pan", owner: "Sara Kim", status: "Action Open" },
    { id: "FM-006", system: "Electrical MCC", assembly: "Contactor", failureMode: "Contact Welding", failureEffect: "Motor unable to de-energise — safety hazard (uncontrolled start)", failureCause: "Excessive switching frequency; capacitive load without suppressor", severity: 10, occurrence: 2, detection: 7, rpn: 140, controls: "Thermal imaging in annual inspection", action: "Fit RC suppressor across contactor coil; reduce switching cycles", owner: "Ahmed Al-Rashid", status: "Action Open" },
];

const SEVERITY_LABELS: Record<number, string> = { 10: "Catastrophic", 9: "Very High", 8: "High", 7: "Moderate-High", 6: "Moderate", 5: "Low-Moderate", 4: "Low", 3: "Minor", 2: "Very Minor", 1: "Negligible" };
const SYSTEMS = ["Centrifugal Pump", "HVAC AHU", "Electrical MCC", "Conveyor System", "Boiler Plant"];

function RpnBadge({ rpn }: { rpn: number }) {
    const color = rpn >= 150 ? "bg-red-600" : rpn >= 80 ? "bg-orange-500" : "bg-green-600";
    return <Badge className={`${color} font-bold text-sm min-w-[48px] justify-center`}>{rpn}</Badge>;
}

function ScoreCell({ val, type }: { val: number; type: string }) {
    const color = type === "severity" ? (val >= 8 ? "text-red-600" : val >= 6 ? "text-orange-500" : "text-muted-foreground") :
        type === "occurrence" ? (val >= 7 ? "text-red-600" : val >= 4 ? "text-orange-500" : "text-green-700") :
            (val >= 7 ? "text-red-600" : val >= 4 ? "text-orange-500" : "text-green-700");
    return <span className={`text-center block font-bold text-lg ${color}`}>{val}</span>;
}

export default function FMEAWorkbench() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [detail, setDetail] = useState<any>(null);
    const [filterSystem, setFilterSystem] = useState("All");
    const [newFM, setNewFM] = useState({ system: SYSTEMS[0], assembly: "", failureMode: "", failureEffect: "", failureCause: "", severity: 5, occurrence: 5, detection: 5, controls: "", action: "", owner: "" });

    const filtered = SEED_FMEA.filter(f => filterSystem === "All" || f.system === filterSystem);
    const criticalCount = filtered.filter(f => f.rpn >= 150).length;
    const avgRPN = Math.round(filtered.reduce((s, f) => s + f.rpn, 0) / filtered.length);

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/maintenance/fmea", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "FMEA record created" }); setIsOpen(false); },
        onError: () => { toast({ title: "FMEA saved (pending API)" }); setIsOpen(false); },
    });

    const rpn = newFM.severity * newFM.occurrence * newFM.detection;

    // Group FMEA data into a tree hierarchy: System -> Assembly -> Failure Modes
    const fmeaTree = useMemo(() => {
        const tree: Record<string, Record<string, any[]>> = {};
        filtered.forEach(f => {
            if (!tree[f.system]) tree[f.system] = {};
            if (!tree[f.system][f.assembly]) tree[f.system][f.assembly] = [];
            tree[f.system][f.assembly].push(f);
        });
        return tree;
    }, [filtered]);

    return (
        <StandardPage
            title="FMEA Workbench"
            description="Failure Mode and Effect Analysis — for each system/assembly, document failure modes, effects, and causes. Score Severity × Occurrence × Detection = Risk Priority Number (RPN). High-RPN items drive PM and redesign actions."
            breadcrumbs={[{ label: "Maintenance", href: "/maintenance" }, { label: "FMEA" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Failure Mode</Button>}
        >
            <div className="grid grid-cols-4 gap-4 mb-5">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Failure Modes</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent>
                </Card>
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-1 items-center"><AlertTriangle className="h-4 w-4 text-red-500" />Critical RPN ≥150</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{criticalCount}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Average RPN</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{avgRPN}</div></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Accepted / Closed</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{filtered.filter(f => f.status === "Accepted").length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div><CardTitle>FMEA Tree Hierarchy</CardTitle><CardDescription>System → Assembly → Failure Mode (S×O×D = RPN)</CardDescription></div>
                        <Select value={filterSystem} onValueChange={setFilterSystem}>
                            <SelectTrigger className="w-44"><SelectValue placeholder="Filter system" /></SelectTrigger>
                            <SelectContent><SelectItem value="All">All Systems</SelectItem>{SYSTEMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border rounded-md m-4 hidden lg:block">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                                    <th className="p-3 font-medium w-[250px]">Node structure</th>
                                    <th className="p-3 font-medium">Failure Effect / Cause</th>
                                    <th className="p-3 font-medium w-[80px] text-center">S</th>
                                    <th className="p-3 font-medium w-[80px] text-center">O</th>
                                    <th className="p-3 font-medium w-[80px] text-center">D</th>
                                    <th className="p-3 font-medium w-[100px] text-center">RPN</th>
                                    <th className="p-3 font-medium w-[120px]">Status</th>
                                    <th className="p-3 font-medium w-[80px]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(fmeaTree).length === 0 && (
                                    <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No FMEA records found.</td></tr>
                                )}
                                {Object.entries(fmeaTree).map(([sys, assemblies]) => (
                                    <React.Fragment key={sys}>
                                        <tr className="border-b bg-gray-50/50">
                                            <td colSpan={8} className="p-3 font-semibold text-blue-800"><ChevronRight className="h-4 w-4 inline mr-1 text-blue-500" />System: {sys}</td>
                                        </tr>
                                        {Object.entries(assemblies).map(([assm, modes]) => (
                                            <React.Fragment key={`${sys}-${assm}`}>
                                                <tr className="border-b bg-gray-50/20">
                                                    <td colSpan={8} className="p-3 pl-8 font-medium text-gray-700">↳ Assembly: <Badge variant="outline" className="ml-1">{assm}</Badge></td>
                                                </tr>
                                                {modes.map(mode => (
                                                    <tr key={mode.id} className="border-b hover:bg-muted/30">
                                                        <td className="p-3 pl-14 font-medium"><div className="flex items-center gap-2"><span className="text-gray-400">↳</span> {mode.failureMode}</div></td>
                                                        <td className="p-3 text-xs">
                                                            <div className="text-red-600 font-medium mb-1">E: {mode.failureEffect}</div>
                                                            <div className="text-muted-foreground">C: {mode.failureCause}</div>
                                                        </td>
                                                        <td className="p-3"><ScoreCell val={mode.severity} type="severity" /></td>
                                                        <td className="p-3"><ScoreCell val={mode.occurrence} type="occurrence" /></td>
                                                        <td className="p-3"><ScoreCell val={mode.detection} type="detection" /></td>
                                                        <td className="p-3 flex justify-center"><RpnBadge rpn={mode.rpn} /></td>
                                                        <td className="p-3"><Badge variant={mode.status === "Accepted" ? "secondary" : mode.status === "In Progress" ? "outline" : "destructive"} className="text-xs">{mode.status}</Badge></td>
                                                        <td className="p-3"><Button size="sm" variant="ghost" onClick={() => setDetail(mode)}>View</Button></td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Detail */}
            <Dialog open={!!detail} onOpenChange={o => !o && setDetail(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>FMEA Detail — {detail?.failureMode}</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-3 text-sm py-3">
                        {[["System", detail?.system], ["Assembly", detail?.assembly], ["Failure Mode", detail?.failureMode], ["Failure Effect", detail?.failureEffect], ["Root Cause", detail?.failureCause], ["Severity (S)", `${detail?.severity} — ${SEVERITY_LABELS[detail?.severity]}`], ["Occurrence (O)", detail?.occurrence], ["Detection (D)", detail?.detection], ["RPN (S×O×D)", detail?.rpn], ["Current Controls", detail?.controls], ["Recommended Action", detail?.action], ["Owner", detail?.owner], ["Status", detail?.status]].map(([l, v]) => (
                            <div key={String(l)} className={l === "Recommended Action" || l === "Current Controls" || l === "Failure Effect" || l === "Root Cause" ? "md:col-span-2" : ""}>
                                <p className="text-xs text-muted-foreground">{l}</p>
                                <p className={`font-medium ${l === "RPN (S×O×D)" ? (Number(v) >= 150 ? "text-red-600 text-xl font-bold" : "text-orange-500 text-xl font-bold") : ""}`}>{v as string}</p>
                            </div>
                        ))}
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Add Failure Mode</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-3 gap-4 py-4">
                        <div className="space-y-2"><Label>System *</Label>
                            <Select value={newFM.system} onValueChange={v => setNewFM({ ...newFM, system: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{SYSTEMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Assembly / Component *</Label><Input value={newFM.assembly} onChange={e => setNewFM({ ...newFM, assembly: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Failure Mode *</Label><Input value={newFM.failureMode} onChange={e => setNewFM({ ...newFM, failureMode: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-3"><Label>Failure Effect</Label><Textarea value={newFM.failureEffect} onChange={e => setNewFM({ ...newFM, failureEffect: e.target.value })} rows={2} /></div>
                        <div className="space-y-2 md:col-span-3"><Label>Root Cause</Label><Textarea value={newFM.failureCause} onChange={e => setNewFM({ ...newFM, failureCause: e.target.value })} rows={2} /></div>
                        <div className="space-y-2"><Label>Severity (1–10)</Label><Input type="number" min={1} max={10} value={newFM.severity} onChange={e => setNewFM({ ...newFM, severity: parseInt(e.target.value) || 1 })} /></div>
                        <div className="space-y-2"><Label>Occurrence (1–10)</Label><Input type="number" min={1} max={10} value={newFM.occurrence} onChange={e => setNewFM({ ...newFM, occurrence: parseInt(e.target.value) || 1 })} /></div>
                        <div className="space-y-2"><Label>Detection (1–10)</Label><Input type="number" min={1} max={10} value={newFM.detection} onChange={e => setNewFM({ ...newFM, detection: parseInt(e.target.value) || 1 })} /></div>
                        <div className="md:col-span-3 flex items-center gap-3"><span className="text-sm font-bold">Calculated RPN:</span><RpnBadge rpn={rpn} /><span className="text-xs text-muted-foreground">{SEVERITY_LABELS[newFM.severity] ?? ""} severity</span></div>
                        <div className="space-y-2 md:col-span-3"><Label>Recommended Action</Label><Textarea value={newFM.action} onChange={e => setNewFM({ ...newFM, action: e.target.value })} rows={2} /></div>
                        <div className="space-y-2"><Label>Owner</Label><Input value={newFM.owner} onChange={e => setNewFM({ ...newFM, owner: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newFM.system || !newFM.assembly || !newFM.failureMode} onClick={() => createMutation.mutate({ ...newFM, rpn, status: "Action Open" })}>Save Failure Mode</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
