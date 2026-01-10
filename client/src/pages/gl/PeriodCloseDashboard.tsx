import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
    RefreshCcw,
    Lock,
    Unlock,
    ChevronRight,
    ShieldCheck,
    CheckSquare,
    Square
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import { format } from "date-fns";
import type { GlPeriod } from "@shared/schema";

interface PeriodExceptions {
    unpostedJournalsCount: number;
    readyToClose: boolean;
}

export default function PeriodCloseDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

    const { data: periods, isLoading: isLoadingPeriods } = useQuery<GlPeriod[]>({
        queryKey: ["/api/finance/gl/periods"],
    });

    const { data: exceptions, isLoading: isLoadingExceptions } = useQuery<PeriodExceptions>({
        queryKey: ["/api/gl/stats", selectedPeriod, "exceptions"], // Fixed endpoint path
        queryFn: async () => {
            const res = await fetch(`/api/gl/stats?periodId=${selectedPeriod}`);
            if (!res.ok) return { unpostedJournalsCount: 0, readyToClose: false };
            const stats = await res.json();
            return {
                unpostedJournalsCount: stats.unpostedJournals || 0,
                readyToClose: stats.unpostedJournals === 0
            };
        },
        enabled: !!selectedPeriod,
    });

    const { data: tasks, isLoading: isLoadingTasks } = useQuery<any[]>({
        queryKey: ["/api/gl/periods", selectedPeriod, "tasks"],
        queryFn: async () => {
            const res = await fetch(`/api/gl/periods/${selectedPeriod}/tasks`);
            if (!res.ok) throw new Error("Failed to fetch close tasks");
            return res.json();
        },
        enabled: !!selectedPeriod,
    });

    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string, status: string }) => {
            const res = await fetch(`/api/gl/periods/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("Failed to update task");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/periods", selectedPeriod, "tasks"] });
        }
    });


    const closeMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/finance/gl/periods/${id}/close`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to close period");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/periods"] });
            toast({ title: "Success", description: "Period closed successfully" });
        },
    });

    const reopenMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/finance/gl/periods/${id}/reopen`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to reopen period");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/periods"] });
            toast({ title: "Success", description: "Period reopened successfully" });
        },
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Open":
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><Clock className="mr-1 h-3 w-3" /> Open</Badge>;
            case "Closed":
                return <Badge variant="secondary" className="bg-slate-100 text-slate-500"><Lock className="mr-1 h-3 w-3" /> Closed</Badge>;
            case "Future-Entry":
                return <Badge variant="outline" className="text-blue-500"><Calendar className="mr-1 h-3 w-3" /> Future</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-indigo-600" />
                        Period Close Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1 text-slate-500">
                        Monitor period status and perform closing activities for General Ledger.
                    </p>
                </div>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/periods"] })}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            Accounting Periods
                        </CardTitle>
                        <CardDescription>Select a period to view validation details and close actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-slate-100 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead>Period Name</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingPeriods ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10">Loading periods...</TableCell>
                                        </TableRow>
                                    ) : periods?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">No periods found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        periods?.map((period) => (
                                            <TableRow
                                                key={period.id}
                                                className={`cursor-pointer transition-colors ${selectedPeriod === period.id ? "bg-indigo-50/50" : "hover:bg-slate-50/80"}`}
                                                onClick={() => setSelectedPeriod(period.id)}
                                            >
                                                <TableCell className="font-semibold text-slate-700">{period.periodName}</TableCell>
                                                <TableCell className="text-slate-500">{format(new Date(period.startDate), "MMM d, yyyy")}</TableCell>
                                                <TableCell className="text-slate-500">{format(new Date(period.endDate), "MMM d, yyyy")}</TableCell>
                                                <TableCell>{getStatusBadge(period.status || "")}</TableCell>
                                                <TableCell className="text-right">
                                                    <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${selectedPeriod === period.id ? "rotate-90 text-indigo-500" : "text-slate-300"}`} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm flex flex-col h-full bg-slate-50/30">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            Period Details
                        </CardTitle>
                        <CardDescription>Validation results for the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        {!selectedPeriod ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400 space-y-3">
                                <AlertTriangle className="h-10 w-10 opacity-20" />
                                <p className="text-sm italic">Select a period to start validation</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg">
                                                <Clock className="h-5 w-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unposted Journals</p>
                                                <p className="text-2xl font-bold text-slate-900">{isLoadingExceptions ? "..." : exceptions?.unpostedJournalsCount}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {!isLoadingExceptions && (exceptions?.unpostedJournalsCount === 0 ? (
                                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                            ) : (
                                                <XCircle className="h-6 w-6 text-red-500" />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-700">Detailed Close Checklist</h4>
                                        <div className="space-y-3">
                                            {isLoadingTasks ? (
                                                <p className="text-xs text-muted-foreground">Loading tasks...</p>
                                            ) : tasks?.map((task) => (
                                                <div key={task.id} className="flex items-start gap-3 group">
                                                    <Checkbox
                                                        checked={task.status === "COMPLETED"}
                                                        onCheckedChange={(checked) => {
                                                            updateTaskMutation.mutate({
                                                                taskId: task.id,
                                                                status: checked ? "COMPLETED" : "PENDING"
                                                            });
                                                        }}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <p className={`text-xs font-medium ${task.status === "COMPLETED" ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                                            {task.taskName}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 leading-tight">
                                                            {task.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Legacy Exception Check as fallback/header */}
                                            <div className="pt-2 border-t mt-2">
                                                <div className="flex items-center gap-2 text-[10px]">
                                                    {exceptions?.unpostedJournalsCount === 0 ? (
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className="h-3 w-3 text-red-500" />
                                                    )}
                                                    <span className={exceptions?.unpostedJournalsCount === 0 ? "text-slate-600" : "text-red-600 font-medium"}>
                                                        Validation: All journals posted ({exceptions?.unpostedJournalsCount} remaining)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    {periods?.find(p => p.id === selectedPeriod)?.status === "Open" ? (
                                        <div className="space-y-3">
                                            <Button
                                                className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md font-semibold h-12"
                                                disabled={!exceptions?.readyToClose || closeMutation.isPending}
                                                onClick={() => closeMutation.mutate(selectedPeriod)}
                                            >
                                                <Lock className="mr-2 h-4 w-4" /> Close Period
                                            </Button>
                                            {!exceptions?.readyToClose && !isLoadingExceptions && (
                                                <p className="text-[10px] text-center text-red-500 font-medium flex items-center justify-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" /> All journals must be posted before closing
                                                </p>
                                            )}
                                        </div>
                                    ) : periods?.find(p => p.id === selectedPeriod)?.status === "Closed" ? (
                                        <Button
                                            variant="outline"
                                            className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 h-12 font-medium"
                                            disabled={reopenMutation.isPending}
                                            onClick={() => reopenMutation.mutate(selectedPeriod)}
                                        >
                                            <Unlock className="mr-2 h-4 w-4" /> Re-open Period
                                        </Button>
                                    ) : (
                                        <p className="text-center text-sm text-slate-500 italic">No actions available for future periods.</p>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                <Card className="bg-slate-900 border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                            <RefreshCcw className="h-4 w-4 text-indigo-400" />
                            Year-End Processing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[10px] text-slate-400">
                        Automated roll-forward of retained earnings and closing of income statement accounts. (Available in Phase 5)
                    </CardContent>
                </Card>
                <Card className="bg-indigo-900 border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                            < ShieldCheck className="h-4 w-4 text-emerald-400" />
                            Close Protection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[10px] text-indigo-200/60">
                        Prevents any manual journal entry once the period is closed. Only privileged users can reopen for adjustments.
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
