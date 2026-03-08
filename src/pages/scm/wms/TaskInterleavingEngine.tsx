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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpDown, Settings, Zap, TrendingDown } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const SEED_RULES: any[] = [
    { id: "TI-001", ruleName: "Every 3 Picks → Putaway", trigger: "After 3 picks", condition: "Putaway tasks available", priority: 1, zoneScope: "Zone A + Zone B", laborCode: "GEN", active: true },
    { id: "TI-002", ruleName: "Zone Proximity Interleave", trigger: "Same zone", condition: "Adjacent locator within 10 aisles", priority: 2, zoneScope: "All", laborCode: "GEN", active: true },
    { id: "TI-003", ruleName: "Empty Travel Return", trigger: "Operator returns empty", condition: "Any putaway pending origin zone", priority: 3, zoneScope: "All", laborCode: "FORKLIFT", active: false },
];

const SEED_QUEUE: any[] = [
    { id: "Q-001", seqNum: 1, taskType: "Pick", taskRef: "PICK-2026-4401-001", operator: "OP-John", zone: "A", locator: "A3-04-C", item: "Laptop 15\" Pro", qty: 5, estMinutes: 4, status: "In Progress" },
    { id: "Q-002", seqNum: 2, taskType: "Putaway", taskRef: "PUT-2026-0522-001", operator: "OP-John", zone: "A", locator: "A5-02-A", item: "USB-C Hub", qty: 20, estMinutes: 6, status: "Queued" },
    { id: "Q-003", seqNum: 3, taskType: "Pick", taskRef: "PICK-2026-4402-001", operator: "OP-John", zone: "B", locator: "B1-03-D", item: "Carry Bag", qty: 10, estMinutes: 3, status: "Queued" },
    { id: "Q-004", seqNum: 4, taskType: "Putaway", taskRef: "PUT-2026-0521-001", operator: "OP-John", zone: "B", locator: "B2-01-A", item: "Dell Monitor", qty: 8, estMinutes: 8, status: "Queued" },
    { id: "Q-005", seqNum: 5, taskType: "Pick", taskRef: "PICK-2026-4403-001", operator: "OP-Maria", zone: "A", locator: "A1-02-B", item: "SSD 512GB", qty: 15, estMinutes: 3, status: "In Progress" },
];

const METRICS = { travelReduction: 32, tasksInterleaved: 48, avgOperatorUtilization: 89, wastedTripsToday: 3 };

export default function TaskInterleavingEngine() {
    const { toast } = useToast();
    const [activeOperator, setActiveOperator] = useState("OP-John");

    const ruleCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "priority", header: "Priority", width: "80px", cell: r => <span className="text-center block font-bold text-indigo-600">{r.priority}</span> },
        { id: "ruleName", header: "Rule Name", width: "230px", cell: r => <span className="font-medium">{r.ruleName}</span> },
        { id: "trigger", header: "Trigger", width: "180px", cell: r => <Badge variant="secondary" className="text-xs">{r.trigger}</Badge> },
        { id: "condition", header: "Condition", width: "220px", cell: r => <span className="text-xs text-muted-foreground">{r.condition}</span> },
        { id: "zoneScope", header: "Zone Scope", width: "150px" },
        { id: "laborCode", header: "Labor Code", width: "110px", cell: r => <Badge variant="outline" className="text-xs">{r.laborCode}</Badge> },
        { id: "active", header: "Active", width: "90px", cell: r => <span className={`text-center block font-semibold text-xs ${r.active ? "text-green-600" : "text-muted-foreground"}`}>{r.active ? "✓ On" : "Off"}</span> },
        { id: "actions", header: "", width: "90px", cell: () => <Button size="sm" variant="outline" className="h-7 text-xs"><Settings className="h-3 w-3 mr-1" />Edit</Button> },
    ], []);

    const queueCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "seqNum", header: "#", width: "50px", cell: r => <span className="text-center block font-bold text-lg text-indigo-700">{r.seqNum}</span> },
        { id: "taskType", header: "Task Type", width: "110px", cell: r => <Badge variant={r.taskType === "Pick" ? "default" : "secondary"} className="text-xs">{r.taskType === "Pick" ? "⬇ Pick" : "⬆ Putaway"}</Badge> },
        { id: "taskRef", header: "Task Ref", width: "170px", cell: r => <span className="font-mono text-xs text-blue-600">{r.taskRef}</span> },
        { id: "zone", header: "Zone", width: "70px", cell: r => <Badge variant="outline" className="text-xs font-bold">{r.zone}</Badge> },
        { id: "locator", header: "Locator", width: "120px", cell: r => <span className="font-mono text-xs">{r.locator}</span> },
        { id: "item", header: "Item", width: "180px", cell: r => <span className="font-medium">{r.item}</span> },
        { id: "qty", header: "Qty", width: "70px", cell: r => <span className="text-center block">{r.qty}</span> },
        { id: "estMinutes", header: "Est. Time", width: "90px", cell: r => <span className="text-center block text-xs">{r.estMinutes} min</span> },
        { id: "status", header: "Status", width: "130px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    const operatorQueue = SEED_QUEUE.filter(q => q.operator === activeOperator || activeOperator === "All");

    return (
        <StandardPage
            title="Task Interleaving Engine"
            description="Automatically alternates putaway and pick tasks for each operator to eliminate wasted empty-travel legs and maximize warehouse labor productivity."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "WMS", href: "/scm/wms" }, { label: "Task Interleaving" }]}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><TrendingDown className="h-4 w-4 text-green-600" />Travel Reduction</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{METRICS.travelReduction}%</div><p className="text-xs text-muted-foreground">vs. sequential task mode</p></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><ArrowUpDown className="h-4 w-4" />Tasks Interleaved</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{METRICS.tasksInterleaved}</div><p className="text-xs text-muted-foreground">today</p></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Zap className="h-4 w-4 text-amber-500" />Operator Utilization</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{METRICS.avgOperatorUtilization}%</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Wasted Trips (Today)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{METRICS.wastedTripsToday}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="queue">
                <TabsList className="mb-4"><TabsTrigger value="queue">Live Task Queue</TabsTrigger><TabsTrigger value="rules">Interleaving Rules ({SEED_RULES.length})</TabsTrigger></TabsList>

                <TabsContent value="queue">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div><CardTitle>Interleaved Task Queue</CardTitle><CardDescription>System has automatically sequenced Pick and Putaway tasks to minimise wasted travel for each operator.</CardDescription></div>
                                <div className="flex gap-3 items-center">
                                    <Label className="text-sm">Operator:</Label>
                                    <Select value={activeOperator} onValueChange={setActiveOperator}>
                                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="OP-John">OP-John</SelectItem><SelectItem value="OP-Maria">OP-Maria</SelectItem><SelectItem value="All">All Operators</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={operatorQueue} columns={queueCols} onChange={() => { }} containerHeight="440px" /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rules">
                    <Card>
                        <CardHeader><CardTitle>Interleaving Rules</CardTitle><CardDescription>Rules are evaluated in priority order. First matching rule is applied to determine the next task assigned to an operator after completing the current task.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_RULES} columns={ruleCols} onChange={() => { }} containerHeight="360px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
