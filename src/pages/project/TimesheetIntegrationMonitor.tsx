import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Play, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_PENDING: any[] = [
    { id: "TS-PUSH-001", timesheetNum: "TS-2026-0812", employee: "Ahmed Al-Rashid", employeeId: "EMP-0041", weekEnding: "2026-03-02", approvedDate: "2026-03-04", project: "PROJ-2026-010", task: "TASK-010-04", totalHours: 32.5, billableHours: 28.0, expenditureType: "Labor — Direct", importStatus: "Pending", retryCount: 0, errorMessage: null },
    { id: "TS-PUSH-002", timesheetNum: "TS-2026-0811", employee: "Sara Kim", employeeId: "EMP-0028", weekEnding: "2026-03-02", approvedDate: "2026-03-03", project: "PROJ-2026-025", task: "TASK-025-02", totalHours: 40.0, billableHours: 40.0, expenditureType: "Labor — Direct", importStatus: "Pending", retryCount: 0, errorMessage: null },
    { id: "TS-PUSH-003", timesheetNum: "TS-2026-0805", employee: "James Osei", employeeId: "EMP-0033", weekEnding: "2026-02-23", approvedDate: "2026-02-25", project: "PROJ-2026-010", task: "TASK-010-01", totalHours: 38.0, billableHours: 38.0, expenditureType: "Labor — Direct", importStatus: "Error", retryCount: 2, errorMessage: "Project PROJ-2026-010 status: Closed — cannot accept costs" },
    { id: "TS-PUSH-004", timesheetNum: "TS-2026-0810", employee: "Maria Santos", employeeId: "EMP-0017", weekEnding: "2026-03-02", approvedDate: "2026-03-04", project: "PROJ-2026-033", task: "TASK-033-07", totalHours: 40.0, billableHours: 35.0, expenditureType: "Labor — Indirect", importStatus: "Processing", retryCount: 0, errorMessage: null },
];

const SEED_HISTORY: any[] = [
    { id: "TS-IMP-098", timesheetNum: "TS-2026-0795", employee: "Ahmed Al-Rashid", project: "PROJ-2026-010", task: "TASK-010-03", hours: 39.5, importedDate: "2026-03-02", expenditureId: "EXP-2026-9802", status: "Imported" },
    { id: "TS-IMP-097", timesheetNum: "TS-2026-0790", employee: "Sara Kim", project: "PROJ-2026-025", task: "TASK-025-01", hours: 40.0, importedDate: "2026-03-01", expenditureId: "EXP-2026-9745", status: "Imported" },
    { id: "TS-IMP-096", timesheetNum: "TS-2026-0783", employee: "James Osei", project: "PROJ-2026-018", task: "TASK-018-02", hours: 36.0, importedDate: "2026-02-28", expenditureId: "EXP-2026-9680", status: "Imported" },
];

const SCHEDULER_CONFIG = { frequency: "Daily", time: "02:00 AM", lastRun: "2026-03-08 02:00 AM", nextRun: "2026-03-09 02:00 AM", status: "Active" };

export default function TimesheetIntegrationMonitor() {
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState("All");

    const pendingCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "timesheetNum", header: "Timesheet #", width: "140px", cell: r => <span className="font-mono text-xs text-blue-600">{r.timesheetNum}</span> },
        { id: "employee", header: "Employee", width: "180px", cell: r => <div><div className="font-medium text-sm">{r.employee}</div><div className="text-xs text-muted-foreground">{r.employeeId}</div></div> },
        { id: "weekEnding", header: "Week Ending", width: "120px", cell: r => formatDate(r.weekEnding) },
        { id: "approvedDate", header: "Approved", width: "110px", cell: r => formatDate(r.approvedDate) },
        { id: "project", header: "Project", width: "140px", cell: r => <span className="font-mono text-xs">{r.project}</span> },
        { id: "task", header: "Task", width: "120px", cell: r => <span className="text-xs">{r.task}</span> },
        { id: "billableHours", header: "Billable hrs", width: "110px", cell: r => <span className="text-right block font-bold">{r.billableHours}h</span> },
        { id: "importStatus", header: "Status", width: "130px", cell: r => <StatusBadge status={r.importStatus} /> },
        { id: "errorMessage", header: "Error", width: "260px", cell: r => r.errorMessage ? <span className="text-xs text-red-600 flex items-start gap-1"><AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />{r.errorMessage}</span> : <span className="text-xs text-muted-foreground">—</span> },
        { id: "actions", header: "", width: "90px", cell: r => r.importStatus === "Error" ? <Button size="sm" variant="outline" className="h-7 text-xs text-amber-600" onClick={() => toast({ title: `Retry queued for ${r.timesheetNum}` })}><RefreshCw className="h-3 w-3 mr-1" />Retry</Button> : null },
    ], [toast]);

    const historyCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "timesheetNum", header: "Timesheet #", width: "140px", cell: r => <span className="font-mono text-xs">{r.timesheetNum}</span> },
        { id: "employee", header: "Employee", width: "180px", cell: r => <span className="font-medium">{r.employee}</span> },
        { id: "project", header: "Project", width: "140px", cell: r => <span className="font-mono text-xs">{r.project}</span> },
        { id: "task", header: "Task", width: "120px", cell: r => <span className="text-xs">{r.task}</span> },
        { id: "hours", header: "Hours", width: "80px", cell: r => <span className="text-right block font-bold">{r.hours}h</span> },
        { id: "importedDate", header: "Imported", width: "120px", cell: r => formatDate(r.importedDate) },
        { id: "expenditureId", header: "PPM Expenditure ID", width: "160px", cell: r => <span className="font-mono text-xs text-indigo-600">{r.expenditureId}</span> },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    const filteredPending = SEED_PENDING.filter(t => statusFilter === "All" || t.importStatus === statusFilter);
    const totalPendingHours = SEED_PENDING.filter(t => t.importStatus !== "Error").reduce((s, t) => s + t.billableHours, 0);
    const errorsCount = SEED_PENDING.filter(t => t.importStatus === "Error").length;

    return (
        <StandardPage
            title="Timesheet → PPM Integration Monitor"
            description="Monitors and controls the automatic push of approved timesheets into the PPM Expenditure Cost Processor. Approved timesheets become PPM Expenditure transactions that drive project costs, billing, and revenue recognition."
            breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Timesheet Integration" }]}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Clock className="h-4 w-4 text-amber-500" />Pending Import</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{SEED_PENDING.filter(t => t.importStatus === "Pending").length}</div><p className="text-xs text-muted-foreground">{totalPendingHours}h billable hours</p></CardContent>
                </Card>
                <Card className="border-blue-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><RefreshCw className="h-4 w-4 text-blue-500" />Processing</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{SEED_PENDING.filter(t => t.importStatus === "Processing").length}</div></CardContent>
                </Card>
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><XCircle className="h-4 w-4 text-red-500" />Import Errors</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{errorsCount}</div><p className="text-xs text-muted-foreground">require attention</p></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><CheckCircle className="h-4 w-4 text-green-500" />Imported (7 Days)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{SEED_HISTORY.length}</div></CardContent>
                </Card>
            </div>

            {/* Scheduler status */}
            <Card className="mb-6 bg-muted/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Integration Scheduler</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex gap-8 text-sm">
                        <div><p className="text-xs text-muted-foreground">Frequency</p><p className="font-medium">{SCHEDULER_CONFIG.frequency} at {SCHEDULER_CONFIG.time}</p></div>
                        <div><p className="text-xs text-muted-foreground">Last Run</p><p className="font-medium">{SCHEDULER_CONFIG.lastRun}</p></div>
                        <div><p className="text-xs text-muted-foreground">Next Run</p><p className="font-medium">{SCHEDULER_CONFIG.nextRun}</p></div>
                        <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="default" className="bg-green-600">{SCHEDULER_CONFIG.status}</Badge></div>
                        <div className="ml-auto flex items-center gap-2">
                            <Button size="sm" variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Run Now</Button>
                            <Button size="sm" variant="outline">Configure</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending Queue ({SEED_PENDING.length})</TabsTrigger>
                    <TabsTrigger value="history">Import History ({SEED_HISTORY.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div><CardTitle>Pending Timesheet Imports</CardTitle><CardDescription>Approved timesheets waiting to be pushed into the PPM Expenditure Processor.</CardDescription></div>
                                <div className="flex gap-3 items-center">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Processing">Processing</SelectItem><SelectItem value="Error">Error</SelectItem></SelectContent></Select>
                                    <Button size="sm"><Play className="h-4 w-4 mr-2" />Process Selected</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={filteredPending} columns={pendingCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader><CardTitle>Import History (Last 7 Days)</CardTitle><CardDescription>Successfully imported timesheets become PPM Expenditure transactions linked to project/task.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_HISTORY} columns={historyCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
