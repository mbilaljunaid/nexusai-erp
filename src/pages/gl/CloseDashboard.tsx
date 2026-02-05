
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Trash2, RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CloseDependencyGraph } from "@/components/finance/CloseDependencyGraph";

export default function CloseDashboard() {
    const { toast } = useToast();
    const [selectedLedger, setSelectedLedger] = useState("PRIMARY");
    const [selectedPeriod, setSelectedPeriod] = useState("Jan-2026"); // TODO: Dynamic
    const [newTask, setNewTask] = useState({ taskName: "", description: "", dueDate: "" });

    // 1. Fetch Dependency Statuses
    const { data: statuses = [], isLoading: loadingStatuses } = useQuery({
        queryKey: ["/api/finance/gl/period-statuses", selectedLedger],
        queryFn: () => fetch(`/api/finance/gl/period-statuses?ledgerId=${selectedLedger}`).then(r => r.json()),
    });

    // 2. Fetch Tasks
    const { data: tasks = [], isLoading: loadingTasks } = useQuery({
        queryKey: ["/api/finance/gl/close-tasks", selectedLedger],
        queryFn: () => fetch(`/api/finance/gl/close-tasks?ledgerId=${selectedLedger}`).then(r => r.json()),
    });

    // 3. Fetch AI Predictions
    const { data: prediction, isLoading: loadingPrediction } = useQuery({
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
        message: `Last updated: ${new Date(s.updatedAt).toLocaleDateString()}`
    }));

    if (!graphStatuses.find((s: any) => s.id === 'GL')) {
        graphStatuses.push({ id: 'GL', name: 'General Ledger', status: 'Pending' });
    }

    const metrics = {
        total: Array.isArray(tasks) ? tasks.length : 0,
        completed: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "COMPLETED").length : 0,
        pending: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "PENDING").length : 0,
    };

    return (
        <div className="space-y-6 p-4" data-testid="period-close">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <CheckSquare className="h-8 w-8 text-indigo-600" />
                        Close Command Center
                    </h1>
                    <p className="text-muted-foreground mt-2">AI-Driven Financial Close Orchestration</p>
                </div>
                <div className="flex gap-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[180px]">
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
            </div>

            {/* AI Insights Panel */}
            {prediction && (
                <Card className={`border-l-4 ${prediction.riskLevel === 'High' ? 'border-l-red-500' : prediction.riskLevel === 'Medium' ? 'border-l-orange-500' : 'border-l-green-500'}`}>
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

            {/* Dependency Graph */}
            <div className="w-full">
                <CloseDependencyGraph statuses={graphStatuses} periodName={selectedPeriod} />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <Card className="p-3">
                    <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">Total Tasks</p>
                        <p className="text-2xl font-bold">{metrics.total}</p>
                    </CardContent>
                </Card>
                <Card className="p-3">
                    <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{metrics.completed}</p>
                    </CardContent>
                </Card>
                <Card className="p-3">
                    <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-orange-600">{metrics.pending}</p>
                    </CardContent>
                </Card>
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
                        <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />

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
                            <div className="text-center py-4">Loading...</div>
                        ) : !Array.isArray(tasks) || tasks.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">No tasks found for this period.</div>
                        ) : (
                            tasks.map((t: any) => (
                                <div key={t.id} className="p-3 border rounded-lg flex justify-between items-center group">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-semibold ${t.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>{t.taskName}</h3>
                                            <Badge variant="outline">{t.status}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{t.description} • Due: {new Date(t.dueDate).toLocaleDateString()}</p>
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
    );
}
