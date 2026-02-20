import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
    Plus, Play, Clock, DollarSign, Activity, CheckCircle2, XCircle
} from "lucide-react";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { useToast } from "@/hooks/use-toast";

const TENANT_ID = "default-tenant"; // TODO: inject from auth context

interface TimeRule {
    id: string;
    name: string;
    code: string;
    ruleType: string;
    startTime?: string;
    endTime?: string;
    daysOfWeek?: string;
    multiplier?: string;
    flatRateAdd?: string;
    status: string;
}

interface SimulationResult {
    applicableRules: Array<{
        ruleId: string;
        name: string;
        ruleType: string;
        effectiveMultiplier: number;
        flatRateAdd: number;
        effectivePay: number;
    }>;
    totalHours: number;
    grossPay: number;
    effectiveHourlyRate: number;
}

export default function TimeRuleBuilder() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [sheetOpen, setSheetOpen] = useState(false);
    const [editRule, setEditRule] = useState<Partial<TimeRule> | null>(null);

    // Simulation state
    const [simStart, setSimStart] = useState("09:00");
    const [simEnd, setSimEnd] = useState("17:00");
    const [simDay, setSimDay] = useState("Mon");
    const [simRate, setSimRate] = useState("25");
    const [simResult, setSimResult] = useState<SimulationResult | null>(null);
    const [simLoading, setSimLoading] = useState(false);

    const { data: rules = [], isLoading } = useQuery<TimeRule[]>({
        queryKey: ["/api/hr/time-rules", TENANT_ID],
        queryFn: async () => {
            const res = await fetch(`/api/hr/time-rules?tenantId=${TENANT_ID}`);
            if (!res.ok) throw new Error("Failed to fetch time rules");
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/hr/time-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, tenantId: TENANT_ID }),
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/time-rules"] });
            setSheetOpen(false);
            toast({ title: "Rule created successfully" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await fetch(`/api/hr/time-rules/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/time-rules"] });
            setSheetOpen(false);
            toast({ title: "Rule updated successfully" });
        },
    });

    const toggleMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/hr/time-rules/${id}/toggle`, { method: "PATCH" });
            if (!res.ok) throw new Error("Failed to toggle rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/time-rules"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/hr/time-rules/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/time-rules"] });
            toast({ title: "Rule deleted" });
        },
    });

    const handleSave = () => {
        if (!editRule?.name || !editRule?.code || !editRule?.ruleType) {
            toast({ title: "Name, Code, and Type are required", variant: "destructive" });
            return;
        }
        if (editRule.id) {
            updateMutation.mutate({ id: editRule.id, data: editRule });
        } else {
            createMutation.mutate(editRule);
        }
    };

    const handleSimulate = async () => {
        setSimLoading(true);
        setSimResult(null);
        try {
            const res = await fetch(`/api/hr/time-rules/simulate?tenantId=${TENANT_ID}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startTime: simStart,
                    endTime: simEnd,
                    dayOfWeek: simDay,
                    baseHourlyRate: parseFloat(simRate),
                }),
            });
            if (!res.ok) throw new Error("Simulation failed");
            const result = await res.json();
            setSimResult(result);
        } catch (e: any) {
            toast({ title: "Simulation error", description: e.message, variant: "destructive" });
        } finally {
            setSimLoading(false);
        }
    };

    const columns: Column<TimeRule>[] = [
        { header: "Name", accessorKey: "name" },
        { header: "Code", accessorKey: "code" },
        {
            header: "Type",
            accessorKey: "ruleType",
            cell: (row) => <Badge variant="outline">{row.ruleType}</Badge>
        },
        {
            header: "Condition",
            accessorKey: "startTime",
            cell: (row) => (
                <span className="text-sm text-muted-foreground">
                    {row.daysOfWeek
                        ? `Days: ${row.daysOfWeek}`
                        : row.startTime
                            ? `${row.startTime}–${row.endTime}`
                            : "—"}
                </span>
            )
        },
        {
            header: "Multiplier",
            accessorKey: "multiplier",
            cell: (row) => <span className="font-mono">{row.multiplier ?? "—"}×</span>
        },
        {
            header: "Flat Add",
            accessorKey: "flatRateAdd",
            cell: (row) => <span className="font-mono">{row.flatRateAdd ? `+$${row.flatRateAdd}/hr` : "—"}</span>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={row.status === "ACTIVE"}
                        onCheckedChange={() => toggleMutation.mutate(row.id)}
                    />
                    <span className="text-xs">{row.status}</span>
                </div>
            )
        },
        {
            header: "Actions",
            accessorKey: "id",
            cell: (row) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditRule(row); setSheetOpen(true); }}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => deleteMutation.mutate(row.id)}
                    >
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Time Rule Builder"
            breadcrumbs={[
                { label: "HR", href: "/hr" },
                { label: "Time & Labor" },
                { label: "Rule Builder" }
            ]}
            actions={
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setEditRule({})}>
                            <Plus className="mr-2 h-4 w-4" /> New Rule
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[480px]">
                        <SheetHeader>
                            <SheetTitle>{editRule?.id ? "Edit Rule" : "Create Time Rule"}</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 mt-6">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="rule-name">Name *</Label>
                                    <Input
                                        id="rule-name"
                                        placeholder="Night Shift Premium"
                                        value={editRule?.name ?? ""}
                                        onChange={(e) => setEditRule((p) => ({ ...p, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="rule-code">Code *</Label>
                                    <Input
                                        id="rule-code"
                                        placeholder="NIGHT_PREM"
                                        value={editRule?.code ?? ""}
                                        onChange={(e) => setEditRule((p) => ({ ...p, code: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="rule-type">Rule Type *</Label>
                                <Select
                                    value={editRule?.ruleType ?? ""}
                                    onValueChange={(v) => setEditRule((p) => ({ ...p, ruleType: v }))}
                                >
                                    <SelectTrigger id="rule-type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DIFFERENTIAL">Differential</SelectItem>
                                        <SelectItem value="OVERTIME">Overtime</SelectItem>
                                        <SelectItem value="PREMIUM">Premium</SelectItem>
                                        <SelectItem value="HOLIDAY">Holiday</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Condition (Time Window)</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="start-time">Start Time</Label>
                                    <Input
                                        id="start-time"
                                        type="time"
                                        value={editRule?.startTime ?? ""}
                                        onChange={(e) => setEditRule((p) => ({ ...p, startTime: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="end-time">End Time</Label>
                                    <Input
                                        id="end-time"
                                        type="time"
                                        value={editRule?.endTime ?? ""}
                                        onChange={(e) => setEditRule((p) => ({ ...p, endTime: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="days">Days of Week (CSV)</Label>
                                <Input
                                    id="days"
                                    placeholder="Sat,Sun"
                                    value={editRule?.daysOfWeek ?? ""}
                                    onChange={(e) => setEditRule((p) => ({ ...p, daysOfWeek: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">Use comma-separated day abbreviations: Mon, Tue, Wed, Thu, Fri, Sat, Sun</p>
                            </div>

                            <Separator />
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Calculation</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="multiplier">Multiplier</Label>
                                    <Input
                                        id="multiplier"
                                        type="number"
                                        step="0.25"
                                        placeholder="1.5"
                                        value={editRule?.multiplier ?? ""}
                                        onChange={(e) => setEditRule((p) => ({ ...p, multiplier: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="flat-add">Flat Rate Add ($/hr)</Label>
                                    <Input
                                        id="flat-add"
                                        type="number"
                                        step="0.01"
                                        placeholder="2.00"
                                        value={editRule?.flatRateAdd ?? ""}
                                        onChange={(e) => setEditRule((p) => ({ ...p, flatRateAdd: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <Button className="w-full mt-4" onClick={handleSave}>
                                {editRule?.id ? "Update Rule" : "Create Rule"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            }
        >
            {/* Rules Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Rules</CardTitle>
                    <CardDescription>
                        Configure overtime, shift differential, premium pay, and holiday rules. Rules are evaluated at payroll processing time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StandardTable
                        columns={columns}
                        data={rules}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Rule Simulation */}
            <Card className="mt-6 border-blue-200 bg-blue-50/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-blue-900">Rule Simulation</CardTitle>
                    </div>
                    <CardDescription>
                        Preview which rules apply to a given shift scenario before activating them in production.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="space-y-1">
                            <Label htmlFor="sim-start">Shift Start</Label>
                            <Input id="sim-start" type="time" value={simStart} onChange={(e) => setSimStart(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="sim-end">Shift End</Label>
                            <Input id="sim-end" type="time" value={simEnd} onChange={(e) => setSimEnd(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="sim-day">Day of Week</Label>
                            <Select value={simDay} onValueChange={setSimDay}>
                                <SelectTrigger id="sim-day">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="sim-rate">Base Rate ($/hr)</Label>
                            <Input id="sim-rate" type="number" step="0.01" value={simRate} onChange={(e) => setSimRate(e.target.value)} />
                        </div>
                    </div>

                    <Button onClick={handleSimulate} disabled={simLoading} className="mb-4">
                        <Play className="mr-2 h-4 w-4" />
                        {simLoading ? "Simulating..." : "Run Simulation"}
                    </Button>

                    {simResult && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg border p-4 space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-xs uppercase tracking-wide">Total Hours</span>
                                    </div>
                                    <p className="text-2xl font-bold">{simResult.totalHours}h</p>
                                </div>
                                <div className="bg-white rounded-lg border p-4 space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Activity className="h-4 w-4" />
                                        <span className="text-xs uppercase tracking-wide">Effective Rate</span>
                                    </div>
                                    <p className="text-2xl font-bold">${simResult.effectiveHourlyRate}/hr</p>
                                </div>
                                <div className="bg-white rounded-lg border p-4 space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-xs uppercase tracking-wide">Gross Pay</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">${simResult.grossPay}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">
                                    Rules Triggered ({simResult.applicableRules.length})
                                </p>
                                {simResult.applicableRules.length === 0 ? (
                                    <div className="flex items-center gap-2 text-muted-foreground p-3 bg-white rounded-lg border">
                                        <XCircle className="h-4 w-4" />
                                        <span className="text-sm">No rules apply — standard base rate used.</span>
                                    </div>
                                ) : (
                                    simResult.applicableRules.map((r) => (
                                        <div key={r.ruleId} className="flex items-center justify-between bg-white rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium">{r.name}</p>
                                                    <p className="text-xs text-muted-foreground">{r.ruleType} · ×{r.effectiveMultiplier}{r.flatRateAdd ? ` + $${r.flatRateAdd}/hr` : ""}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-green-700">${r.effectivePay.toFixed(2)}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
