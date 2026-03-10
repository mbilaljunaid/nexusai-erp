import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const PERIODS = ["Mar 2026 (Current)", "Feb 2026", "Jan 2026", "Q4 2025"];
const SEED_DATA: any[] = [
    { wo: "WO-0081234", item: "PUMP-ASSY-001", desc: "Centrifugal Pump Assembly", scheduledQty: 20, completedQty: 18, scheduledDate: "2026-02-28", completedDate: "2026-02-28", adherence: 90, scheduleVar: 0, status: "Completed On-Time" },
    { wo: "WO-0081235", item: "MOTOR-CTRL-005", desc: "Motor Controller Unit", scheduledQty: 50, completedQty: 50, scheduledDate: "2026-03-01", completedDate: "2026-03-02", adherence: 100, scheduleVar: 1, status: "Completed Late" },
    { wo: "WO-0081238", item: "VALVE-GATE-12", desc: "Gate Valve 12\" Flanged", scheduledQty: 30, completedQty: 22, scheduledDate: "2026-03-05", completedDate: "2026-03-05", adherence: 73, scheduleVar: 0, status: "Under-completed" },
    { wo: "WO-0081241", item: "HVAC-UNIT-AHU", desc: "Air Handling Unit", scheduledQty: 5, completedQty: 5, scheduledDate: "2026-03-06", completedDate: "2026-03-06", adherence: 100, scheduleVar: 0, status: "Completed On-Time" },
    { wo: "WO-0081244", item: "IMPELLER-SS-01", desc: "SS Impeller 6-Blade", scheduledQty: 40, completedQty: 38, scheduledDate: "2026-03-07", completedDate: "2026-03-08", adherence: 95, scheduleVar: 1, status: "Completed Late" },
    { wo: "WO-0081250", item: "PUMP-BODY-001", desc: "Pump Body Cast Iron", scheduledQty: 12, completedQty: 0, scheduledDate: "2026-03-07", completedDate: "", adherence: 0, scheduleVar: 2, status: "Overdue" },
];

const WORKCENTER_DATA = [
    { wc: "WC-ASSEMBLY", name: "Assembly Line 1", scheduledHrs: 160, actualHrs: 148, adherence: 92, efficiency: 95, utilisation: 88 },
    { wc: "WC-MACHINING", name: "CNC Machining", scheduledHrs: 200, actualHrs: 214, adherence: 82, efficiency: 91, utilisation: 95 },
    { wc: "WC-WELDING", name: "Welding Bay", scheduledHrs: 120, actualHrs: 118, adherence: 97, efficiency: 98, utilisation: 79 },
    { wc: "WC-TESTING", name: "Quality Testing", scheduledHrs: 80, actualHrs: 85, adherence: 88, efficiency: 93, utilisation: 85 },
];

function AdherenceBar({ val }: { val: number }) {
    const color = val >= 95 ? "[&>div]:bg-green-600" : val >= 80 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500";
    return <div className="flex items-center gap-2"><Progress value={val} className={`flex-1 h-2 ${color}`} /><span className="text-xs font-bold w-8">{val}%</span></div>;
}

export default function ProductionAdherenceReport() {
    const { toast } = useToast();
    const [period, setPeriod] = useState(PERIODS[0]);

    const overallAdherence = Math.round(SEED_DATA.filter(r => r.completedQty > 0).reduce((s, r) => s + r.adherence, 0) / SEED_DATA.filter(r => r.completedQty > 0).length);
    const onTime = SEED_DATA.filter(r => r.status === "Completed On-Time").length;
    const overdue = SEED_DATA.filter(r => r.status === "Overdue").length;

    const paPlanCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "wo", header: "Work Order", width: "130px", cell: r => <span className="font-mono text-xs text-blue-600">{r.wo}</span> },
        { id: "item", header: "Item", width: "150px", cell: r => <span className="font-mono text-xs">{r.item}</span> },
        { id: "desc", header: "Description", width: "220px", cell: r => <span className="text-sm">{r.desc}</span> },
        { id: "scheduledQty", header: "Sched Qty", width: "100px", cell: r => <span className="text-center block">{r.scheduledQty}</span> },
        { id: "completedQty", header: "Completed", width: "100px", cell: r => <span className={`text-center block font-bold ${r.completedQty < r.scheduledQty ? "text-amber-700" : "text-green-700"}`}>{r.completedQty}</span> },
        { id: "scheduleVar", header: "Day Var", width: "80px", cell: r => <span className={`text-center block text-sm font-bold ${r.scheduleVar > 0 ? "text-red-600" : "text-green-700"}`}>{r.scheduleVar > 0 ? `+${r.scheduleVar}d` : "0"}</span> },
        { id: "adherence", header: "Adherence", width: "180px", cell: r => <AdherenceBar val={r.adherence} /> },
        { id: "status", header: "Status", width: "160px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    const wcCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "wc", header: "Work Center", width: "130px", cell: r => <span className="font-mono text-xs text-blue-600">{r.wc}</span> },
        { id: "name", header: "Name", width: "180px", cell: r => <span className="font-semibold">{r.name}</span> },
        { id: "scheduledHrs", header: "Sched Hrs", width: "100px", cell: r => <span className="text-center block">{r.scheduledHrs}</span> },
        { id: "actualHrs", header: "Actual Hrs", width: "100px", cell: r => <span className={`text-center block font-bold ${r.actualHrs > r.scheduledHrs ? "text-red-600" : "text-green-700"}`}>{r.actualHrs}</span> },
        { id: "adherence", header: "Schedule Adherence", width: "200px", cell: r => <AdherenceBar val={r.adherence} /> },
        { id: "efficiency", header: "Efficiency %", width: "170px", cell: r => <AdherenceBar val={r.efficiency} /> },
        { id: "utilisation", header: "Utilisation %", width: "170px", cell: r => <AdherenceBar val={r.utilisation} /> },
    ], []);

    return (
        <StandardPage
            title="Production Schedule Adherence Report"
            description="Oracle Fusion Manufacturing production adherence KPIs. Tracks scheduled vs actual quantities and dates per Work Order and Work Center. Calculates schedule adherence %, day variance, efficiency, and utilisation. Identifies overdue and under-completed work orders."
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing/dashboard" }, { label: "Adherence Report" }]}
            actions={
                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>{PERIODS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => toast({ title: "Report exported" })}><Download className="h-4 w-4 mr-2" />Export</Button>
                </div>
            }
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className={overallAdherence >= 90 ? "border-green-200" : "border-amber-200"}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Overall Adherence</CardTitle></CardHeader>
                    <CardContent><div className={`text-2xl font-bold ${overallAdherence >= 90 ? "text-green-700" : "text-amber-600"}`}>{overallAdherence}%</div></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">On-Time WOs</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{onTime}</div></CardContent>
                </Card>
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Overdue WOs</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{overdue}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Period</CardTitle></CardHeader>
                    <CardContent><div className="text-sm font-semibold mt-1">{period}</div></CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Work Order Schedule Adherence — {period}</CardTitle><CardDescription>Scheduled vs actual completion quantities and dates. Flags overdue and under-completed orders.</CardDescription></CardHeader>
                    <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_DATA} columns={paPlanCols} onChange={() => { }} containerHeight="360px" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Work Center Performance</CardTitle><CardDescription>Plan adherence, efficiency, and utilisation per production work center.</CardDescription></CardHeader>
                    <CardContent className="p-0"><InteractiveSpreadsheet data={WORKCENTER_DATA} columns={wcCols} onChange={() => { }} containerHeight="280px" /></CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
