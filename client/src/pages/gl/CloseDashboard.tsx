import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function CloseDashboard() {
    const [periodId, setPeriodId] = useState("");
    const [periods, setPeriods] = useState<any[]>([]);
    const [status, setStatus] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [exceptions, setExceptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Default Ledger
    const ledgerId = "primary-ledger-id";

    useEffect(() => {
        fetch(`/api/gl/periods?ledgerId=${ledgerId}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch periods");
                return res.json();
            })
            .then(data => {
                if (!Array.isArray(data)) throw new Error("Invalid response format");
                setPeriods(data);
                // Default to first open or latest period
                const open = data.find((p: any) => p.status === 'Open');
                if (open) setPeriodId(open.id);
                else if (data.length > 0) setPeriodId(data[0].id);
            })
            .catch(err => {
                console.error("Error loading periods:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!periodId) return;
        refreshDashboard();
    }, [periodId]);

    const refreshDashboard = () => {
        setLoading(true);
        Promise.all([
            fetch(`/api/gl/periods/${periodId}/close-status?ledgerId=${ledgerId}`).then(res => res.json()),
            fetch(`/api/gl/periods/${periodId}/tasks?ledgerId=${ledgerId}`).then(res => res.json()),
            fetch(`/api/gl/periods/${periodId}/close-exceptions?ledgerId=${ledgerId}`).then(res => res.json())
        ]).then(([statusData, tasksData, exceptionsData]) => {
            setStatus(statusData);
            setTasks(Array.isArray(tasksData) ? tasksData : []);
            setExceptions(Array.isArray(exceptionsData) ? exceptionsData : []);
            setLoading(false);
        }).catch(err => {
            console.error("Error refreshing dashboard:", err);
            setLoading(false);
        });
    };

    const handleTaskToggle = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

        // Optimistic Update
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            await fetch(`/api/gl/tasks/${taskId}/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            refreshDashboard();
        } catch (e) {
            console.error("Task update failed", e);
        }
    };

    if (loading && !status) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <StandardDashboard
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Period Close Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Manage the financial close process and ensure data integrity.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={periodId} onValueChange={setPeriodId}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select Period" />
                            </SelectTrigger>
                            <SelectContent>
                                {periods.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.periodName} ({p.status})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="default" disabled={!status?.canClose}>
                            <Lock className="w-4 h-4 mr-2" />
                            Close Period
                        </Button>
                    </div>
                </div>
            }
        >
            <DashboardWidget colSpan={1} title="Close Status" action={<div className="text-xs text-muted-foreground">Real-time</div>}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Tasks Completed</span>
                        <Badge variant={status?.completedTasks === status?.totalTasks ? "default" : "secondary"}>
                            {status?.completedTasks} / {status?.totalTasks}
                        </Badge>
                    </div>
                    <Progress
                        value={status?.totalTasks ? (status.completedTasks / status.totalTasks) * 100 : 0}
                        className="h-2"
                    />

                    <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm font-medium">Blocking Exceptions</span>
                        <Badge variant={status?.blockingExceptions > 0 ? "destructive" : "outline"}>
                            {status?.blockingExceptions}
                        </Badge>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={3} title="Exceptions" action={<AlertCircle className="w-5 h-5 text-destructive" />}>
                {exceptions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
                        <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
                        No exceptions found. Ready to proceed.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {exceptions.map((ex, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border rounded-md bg-destructive/5">
                                <div>
                                    <p className="font-medium text-destructive">{ex.type}</p>
                                    <p className="text-sm text-muted-foreground">{ex.reference} • {ex.source}</p>
                                </div>
                                <span className="font-mono font-bold">${Number(ex.amount).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Close Checklist">
                <div className="space-y-1">
                    {tasks.length === 0 && <p className="text-muted-foreground">No tasks defined.</p>}
                    {tasks.map(task => (
                        <div key={task.id} className="flex items-center space-x-4 p-4 hover:bg-muted/50 rounded-lg transition-colors border-b last:border-0 pointer-events-auto">
                            <Checkbox
                                id={task.id}
                                checked={task.status === "COMPLETED"}
                                onCheckedChange={() => handleTaskToggle(task.id, task.status)}
                            />
                            <div className="flex-1">
                                <label htmlFor={task.id} className={`font-medium cursor-pointer ${task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                                    {task.taskName}
                                </label>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>
                            {task.completedBy && (
                                <span className="text-xs text-muted-foreground">
                                    Done by {task.completedBy}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}
