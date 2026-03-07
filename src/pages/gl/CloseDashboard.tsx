import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Trash2, RefreshCw, FileText, Activity, AlertCircle, Settings } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CloseDependencyGraph } from "@/components/finance/CloseDependencyGraph";
import { StandardPage } from "@/components/layout/StandardPage";
import { Link } from "wouter";
import { useLedger } from "@/context/LedgerContext";
import { LedgerContextBadge } from "@/components/gl/LedgerContextBadge";
import { DatePicker } from '@/components/ui/DatePicker';


export default function CloseDashboard() {
    const { toast } = useToast();
    const { currentLedgerId: selectedLedger, activeLedger } = useLedger();
    const [selectedPeriod, setSelectedPeriod] = useState("Jan-2026"); // TODO: Dynamic
    const [newTask, setNewTask] = useState({ taskName: "", description: "", dueDate: "" });

    // 1. Fetch Dependency Statuses
    const { data: statuses = [], isLoading: loadingStatuses } = useQuery<any>({
        queryKey: ["/api/finance/gl/period-statuses", selectedLedger],
        queryFn: () => fetch(`/api/finance/gl/period-statuses?ledgerId=${selectedLedger}`).then(r => r.json()),
    });

    // 2. Fetch Tasks
    const { data: tasks = [], isLoading: loadingTasks } = useQuery<any>({
        queryKey: ["/api/finance/gl/close-tasks", selectedLedger],
        queryFn: () => fetch(`/api/finance/gl/close-tasks?ledgerId=${selectedLedger}`).then(r => r.json()),
    });

    // 3. Fetch AI Predictions
    const { data: prediction, isLoading: loadingPrediction } = useQuery<any>({
        queryKey: ["/api/gl/predict-close", selectedLedger, selectedPeriod],
        queryFn: () => fetch(`/api/gl/predict-close?ledgerId=${selectedLedger}&periodName=${selectedPeriod}`).then(r => r.json()),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/finance/gl/close-tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, ledgerId: selectedLedger, periodId: "TBD_PERIOD_ID" }) }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/close-tasks"] });
            setNewTask({ taskName: "", description: "", dueDate: "" });
            toast({ title: "Close task created" });
        },
        onError: (err) => {
            toast({ title: "Error creating task", variant: "destructive" });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            fetch(`/api/finance/gl/close-tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/close-tasks"] });
            toast({ title: "Task status updated" });
        },
    });

    const sweepMutation = useMutation({
        mutationFn: () => fetch("/api/finance/gl/periods/sweep", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ledgerId: selectedLedger, fromPeriodName: selectedPeriod, toPeriodName: "Feb-2026" }) // TODO: Next period logic
        }).then(r => r.json()),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/predict-close"] }); // Refresh prediction/counts
            toast({ title: "Sweep Complete", description: `Moved ${data.count} unaccounted events to next period.` });
        },
    });

    // Map API Status to Graph Format
    const graphStatuses = statuses.map((s: any) => ({
        id: s.applicationId,
        name: s.applicationId,
        status: s.status,
        message: `Last updated: ${formatDate(s.updatedAt)}`
    }));

    if (!graphStatuses.find((s: any) => s.id === 'GL')) {
        graphStatuses.push({ id: 'GL', name: 'General Ledger', status: 'Pending' });
    }

    const metrics = {
        total: Array.isArray(tasks) ? tasks.length : 0,
        completed: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "COMPLETED").length : 0,
        pending: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "PENDING").length : 0,
    };

    const navigationCards = [
        {
            title: "Manual Journals",
            description: "Create and post manual journal entries",
            icon: FileText,
            href: "/finance/gl/journals/new",
            color: "text-blue-600"
        },
        {
            title: "Journal Approvals",
            description: "Review and approve pending journals",
            icon: CheckSquare,
            href: "/finance/gl/journals/approvals",
            color: "text-amber-600"
        },
        {
            title: "Trial Balance",
            description: "View and report on account balances",
            icon: Activity,
            href: "/finance/gl/trial-balance",
            color: "text-emerald-600"
        },
        {
            title: "Revaluation",
            description: "Run foreign currency revaluation",
            icon: RefreshCw,
            href: "/finance/gl/revaluation",
            color: "text-indigo-600"
        },
        {
            title: "Consolidation",
            description: "Consolidation and elimination entries",
            icon: CheckSquare,
            href: "/finance/gl/consolidation",
            color: "text-purple-600"
        },
        {
            title: "Subledger Accounting",
            description: "SLA dashboard and manual entry",
            icon: FileText,
            href: "/finance/sla/dashboard",
            color: "text-pink-600"
        },
        {
            title: "Financial Reports",
            description: "FSG generation and reporting",
            icon: FileText,
            href: "/finance/gl/reports",
            color: "text-cyan-600"
        },
        {
            title: "Configuration",
            description: "Ledgers, COA, and value sets",
            icon: Settings,
            href: "/finance/gl/config",
            color: "text-muted-foreground"
        }
    ];

    return (
        <StandardPage
            title="General Ledger Command Center"
            description={
                <div className="flex items-center gap-2">
                    <span>Manage journals, reporting, and AI orchestration.</span>
                    <LedgerContextBadge />
                </div>
            }
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "General Ledger" }]}

            actions={
                <div className="flex gap-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-44 bg-background">
                            <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Jan-2026">Jan-2026</SelectItem>
                            <SelectItem value="Feb-2026">Feb-2026</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>
            }
        >
            <div className="space-y-6" data-testid="period-close">
                {/* Metric Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                            <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.total}</div>
                            <p className="text-xs text-muted-foreground">Checklist items for active period</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckSquare className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{metrics.completed}</div>
                            <p className="text-xs text-muted-foreground">Successfully closed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <CheckSquare className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{metrics.pending}</div>
                            <p className="text-xs text-muted-foreground">Awaiting action</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unaccounted Entries</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{prediction?.unaccountedJournalCount || 0}</div>
                            <p className="text-xs text-muted-foreground">Transactions pending transfer</p>
                        </CardContent>
                    </Card>
                </div>

                {/* AI Insights Panel */}
                {prediction && (
                    <Card className={cn(`border-l-4 ${prediction.riskLevel === 'High' ? 'border-l-red-500' : prediction.riskLevel === 'Medium' ? 'border-l-orange-500' : 'border-l-green-500'}`)}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between items-center">
                                <span>Smart Close Insights</span>
                                <Badge variant={prediction.riskLevel === 'High' ? "destructive" : prediction.riskLevel === 'Medium' ? "default" : "secondary"}>
                                    {prediction.riskLevel} Risk
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-foreground/80">{prediction.predictionMessage}</p>

                                {/* Actions based on insights */}
                                {prediction.unaccountedJournalCount > 0 && (
                                    <div className="flex gap-2 items-center">
                                        <span className="text-xs text-muted-foreground">Suggestion:</span>
                                        <Button size="sm" variant="secondary" onClick={() => sweepMutation.mutate()} disabled={sweepMutation.isPending}>
                                            {sweepMutation.isPending ? "Sweeping..." : "Auto-Sweep Unaccounted"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Cards */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {navigationCards.map((card) => (
                            <Link key={card.href} href={card.href}>
                                <Card className="cursor-pointer hover:shadow-md transition-shadow group h-full">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className={cn(`p-2 rounded-lg bg-opacity-10 group-hover:bg-opacity-20 transition-colors ${card.color.replace('text-', 'bg-')}`)}>
                                                <card.icon className={cn(`h-6 w-6 ${card.color}`)} />
                                            </div>
                                            <CardTitle className="text-base">{card.title}</CardTitle>
                                        </div>
                                        <CardDescription className="mt-2">{card.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Dependency Graph */}
                <div className="w-full">
                    <CloseDependencyGraph statuses={graphStatuses} periodName={selectedPeriod} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Create Task */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle className="text-base">Add Checklist Item</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input placeholder="Task Name" value={newTask.taskName} onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })} />
                            <Input placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                            <DatePicker value={newTask.dueDate} onChange={(v) => setNewTask({ ...newTask, dueDate: v })} />

                            <Button disabled={createMutation.isPending || !newTask.taskName} className="w-full" onClick={() => createMutation.mutate(newTask)}>
                                <Plus className="w-4 h-4 mr-2" /> Add Task
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Task List */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Close Checklist</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {loadingTasks ? (
                                <TableSkeleton rows={4} />
                            ) : !Array.isArray(tasks) || tasks.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">No tasks found for this period.</div>
                            ) : (
                                tasks.map((t: any) => (
                                    <div key={t.id} className="p-3 border rounded-lg flex justify-between items-center group">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className={cn(`font-semibold ${t.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`)}>{t.taskName}</h3>
                                                <Badge variant="outline">{t.status}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{t.description} • Due: {formatDate(t.dueDate)}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {t.status !== "COMPLETED" && (
                                                <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: t.id, status: "COMPLETED" })}>
                                                    Complete
                                                </Button>
                                            )}
                                            {t.status === "COMPLETED" && (
                                                <Button size="sm" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: t.id, status: "PENDING" })}>
                                                    Reopen
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
