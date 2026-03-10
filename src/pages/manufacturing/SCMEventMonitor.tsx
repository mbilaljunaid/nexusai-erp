import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Bell, Zap, CheckCircle, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";

const SEED_EVENTS: any[] = [
    { id: "SCE-001", eventType: "Lead Time Increase", severity: "Critical", source: "Supplier Alert", affectedPO: "PO-2026-1310", supplier: "CoatPro Services Ltd", plannedOrdersImpacted: 3, originalValue: "7 days", newValue: "21 days", detectedDate: "2026-03-08", assignedPlanner: "P001", status: "Open — Unresponsive", recommendation: "Expedite order or substitute supplier" },
    { id: "SCE-002", eventType: "Demand Surge", severity: "High", source: "Sales Order", affectedPO: "PLAN-2026-MRP-441", supplier: null, plannedOrdersImpacted: 2, originalValue: "100 units", newValue: "280 units", detectedDate: "2026-03-07", assignedPlanner: "P002", status: "In Review", recommendation: "Increase planned order quantity or split across two batches" },
    { id: "SCE-003", eventType: "Capacity Breach", severity: "High", source: "Capacity Planning", affectedPO: "WC-LATHE-01", supplier: null, plannedOrdersImpacted: 5, originalValue: "100% utilization", newValue: "138% utilization", detectedDate: "2026-03-06", assignedPlanner: "P001", status: "Action Taken", recommendation: "Offload 2 jobs to external subcontractor (OSP)" },
    { id: "SCE-004", eventType: "Quality Hold", severity: "Medium", source: "QC Inspection", affectedPO: "RCV-2026-0518", supplier: "HeatTech Ltd", plannedOrdersImpacted: 1, originalValue: "Pass", newValue: "Quarantined — Batch RM-2026-Q3", detectedDate: "2026-03-05", assignedPlanner: "P003", status: "Open — Unresponsive", recommendation: "Source replacement material from ASL backup supplier" },
    { id: "SCE-005", eventType: "MRP Exception — Past Due", severity: "Medium", source: "MRP Run 2026-03-08", affectedPO: "PLAN-2026-MRP-380", supplier: null, plannedOrdersImpacted: 1, originalValue: "Due 2026-03-01", newValue: "Not started", detectedDate: "2026-03-08", assignedPlanner: "P002", status: "Open — Unresponsive", recommendation: "Release work order immediately or update MRP plan dates" },
];

const SEVERITY_COLORS: Record<string, string> = {
    "Critical": "text-red-700 bg-red-100 dark:bg-red-950/30 border-red-300",
    "High": "text-amber-700 bg-amber-50 dark:bg-amber-950/20 border-amber-300",
    "Medium": "text-blue-700 bg-blue-50 dark:bg-blue-950/20 border-blue-300",
    "Low": "text-muted-foreground bg-muted/30 border-border",
};

export default function SCMEventMonitor() {
    const [filter, setFilter] = useState("All");
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [search, setSearch] = useState("");

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/manufacturing/scm-events"], queryFn: () => fetch("/api/manufacturing/scm-events").then(r => r.json()).catch(() => []) });
    const events = (apiData && apiData.length > 0) ? apiData : SEED_EVENTS;

    const filtered = events.filter(e => {
        const matchFilter = filter === "All" || e.severity === filter || e.status.includes(filter);
        const matchSearch = search === "" || e.eventType.toLowerCase().includes(search.toLowerCase()) || (e.supplier || "").toLowerCase().includes(search.toLowerCase()) || e.affectedPO.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const critical = events.filter(e => e.severity === "Critical").length;
    const unresponded = events.filter(e => e.status.includes("Unresponsive")).length;

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "severity", header: "Severity", width: "100px", cell: r => <Badge variant={r.severity === "Critical" || r.severity === "High" ? "destructive" : "secondary"} className="text-xs">{r.severity}</Badge> },
        { id: "eventType", header: "Event Type", width: "180px", cell: r => <span className="font-medium">{r.eventType}</span> },
        { id: "affectedPO", header: "Affected Ref", width: "160px", cell: r => <span className="font-mono text-xs text-blue-600">{r.affectedPO}</span> },
        { id: "source", header: "Source", width: "160px", cell: r => <Badge variant="outline" className="text-xs">{r.source}</Badge> },
        { id: "plannedOrdersImpacted", header: "Orders at Risk", width: "120px", cell: r => <span className={`text-center block font-bold ${r.plannedOrdersImpacted >= 3 ? "text-red-600" : "text-amber-600"}`}>{r.plannedOrdersImpacted}</span> },
        { id: "originalValue", header: "Was", width: "150px", cell: r => <span className="text-xs text-muted-foreground">{r.originalValue}</span> },
        { id: "newValue", header: "Now", width: "180px", cell: r => <span className="text-xs font-medium text-red-600">{r.newValue}</span> },
        { id: "detectedDate", header: "Detected", width: "110px", cell: r => <span className="text-xs">{formatDate(r.detectedDate)}</span> },
        { id: "assignedPlanner", header: "Planner", width: "90px", cell: r => <Badge variant="outline" className="text-xs">{r.assignedPlanner}</Badge> },
        { id: "status", header: "Status", width: "180px", cell: r => <StatusBadge status={r.status} /> },
        { id: "action", header: "", width: "100px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedEvent(r)}>Review</Button> },
    ], []);

    return (
        <StandardPage
            title="Supply Chain Event Monitor"
            description="Real-time alerts when demand changes, supplier delays, capacity breaches, or MRP exceptions threaten planned orders. Planners are assigned for resolution."
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "SCM Events" }]}
            actions={<Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><AlertTriangle className="h-4 w-4 text-red-500" />Critical Events</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{critical}</div></CardContent>
                </Card>
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Bell className="h-4 w-4 text-amber-500" />Unresponded</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{unresponded}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Events</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{events.length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><CheckCircle className="h-4 w-4 text-green-600" />Action Taken</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{events.filter(e => e.status === "Action Taken").length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Event Register</CardTitle>
                    <div className="flex gap-3 mt-3">
                        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search event type, PO, supplier..." className="max-w-xs" />
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="All">All</SelectItem><SelectItem value="Critical">Critical</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Unresponsive">Unresponded</SelectItem></SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={filtered} columns={columns} onChange={() => { }} containerHeight="480px" /></CardContent>
            </Card>

            <Dialog open={!!selectedEvent} onOpenChange={o => !o && setSelectedEvent(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>{selectedEvent?.eventType}</DialogTitle></DialogHeader>
                    <div className={`p-4 rounded-lg border ${SEVERITY_COLORS[selectedEvent?.severity]} mb-4`}>
                        <p className="font-semibold text-sm mb-1">{selectedEvent?.severity} Priority</p>
                        <p className="text-sm">{selectedEvent?.plannedOrdersImpacted} planned orders at risk</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div><p className="text-xs text-muted-foreground">Affected Reference</p><p className="font-mono font-medium">{selectedEvent?.affectedPO}</p></div>
                        <div><p className="text-xs text-muted-foreground">Source</p><p className="font-medium">{selectedEvent?.source}</p></div>
                        <div><p className="text-xs text-muted-foreground">Original Value</p><p>{selectedEvent?.originalValue}</p></div>
                        <div><p className="text-xs text-muted-foreground">Current Value</p><p className="text-red-600 font-medium">{selectedEvent?.newValue}</p></div>
                        <div className="md:col-span-2"><p className="text-xs text-muted-foreground">System Recommendation</p><p className="mt-1 p-2 rounded bg-muted/40 text-sm">{selectedEvent?.recommendation}</p></div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
                        <Button onClick={() => setSelectedEvent(null)}>Mark Action Taken</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
