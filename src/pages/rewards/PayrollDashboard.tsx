
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { DollarSign, Play, CheckCircle, FileText, AlertCircle } from "lucide-react";
import PayrollRunDetails from "./PayrollRunDetails";

export default function PayrollDashboard() {
    const queryClient = useQueryClient();
    const [isRunModalOpen, setIsRunModalOpen] = useState(false);
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // New Run Form State
    const [newRunPeriod, setNewRunPeriod] = useState("");
    const [newRunStart, setNewRunStart] = useState("");
    const [newRunEnd, setNewRunEnd] = useState("");
    const [newRunPayDate, setNewRunPayDate] = useState("");

    // 1. Fetch Runs
    const { data: runs, isLoading } = useQuery({
        queryKey: ["payroll-runs"],
        queryFn: async () => {
            const res = await fetch("/api/rewards/payroll-runs");
            if (!res.ok) throw new Error("Failed to fetch runs");
            return res.json();
        },
    });

    // 2. Fetch Pay Groups (for Create Run)
    const { data: payGroups } = useQuery({
        queryKey: ["pay-groups"],
        queryFn: async () => {
            const res = await fetch("/api/rewards/pay-groups");
            if (!res.ok) throw new Error("Failed to fetch pay groups");
            return res.json();
        }
    });

    const [selectedPayGroup, setSelectedPayGroup] = useState<string>("");

    // Actions
    const createRunMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/rewards/payroll-runs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create run");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
            setIsRunModalOpen(false);
        },
    });

    const calculateMutation = useMutation({
        mutationFn: async (runId: string) => {
            const res = await fetch(`/api/rewards/payroll-runs/${runId}/calculate`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to calculate");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
        },
    });

    const approveMutation = useMutation({
        mutationFn: async (runId: string) => {
            const res = await fetch(`/api/rewards/payroll-runs/${runId}/approve`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to approve");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
        },
    });

    const handleCreateRun = () => {
        if (!selectedPayGroup || !newRunPeriod || !newRunStart || !newRunEnd) return;

        createRunMutation.mutate({
            payGroupId: selectedPayGroup,
            periodName: newRunPeriod,
            periodStartDate: newRunStart,
            periodEndDate: newRunEnd,
            paymentDate: newRunPayDate
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll Engine</h1>
                    <p className="text-muted-foreground mt-1">Manage cycles, calculate gross-to-net, and issue payments.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" /> Reports
                    </Button>
                    <Dialog open={isRunModalOpen} onOpenChange={setIsRunModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Play className="mr-2 h-4 w-4" /> Run Payroll
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Start New Payroll Cycle</DialogTitle>
                                <DialogDescription>
                                    Initialize a new run for a specific Pay Group and Period.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-sm font-medium">Pay Group</label>
                                    <Select onValueChange={setSelectedPayGroup} value={selectedPayGroup}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {payGroups?.map((g: any) => (
                                                <SelectItem key={g.id} value={g.id}>{g.name} ({g.frequency})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-sm font-medium">Period Name</label>
                                    <Input
                                        className="col-span-3"
                                        placeholder="e.g. 2026-03 Monthly"
                                        value={newRunPeriod}
                                        onChange={(e) => setNewRunPeriod(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-sm font-medium">Start Date</label>
                                    <Input
                                        type="date"
                                        className="col-span-3"
                                        value={newRunStart}
                                        onChange={(e) => setNewRunStart(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-sm font-medium">End Date</label>
                                    <Input
                                        type="date"
                                        className="col-span-3"
                                        value={newRunEnd}
                                        onChange={(e) => setNewRunEnd(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-sm font-medium">Pay Date</label>
                                    <Input
                                        type="date"
                                        className="col-span-3"
                                        value={newRunPayDate}
                                        onChange={(e) => setNewRunPayDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateRun} disabled={createRunMutation.isPending}>
                                    {createRunMutation.isPending ? "Creating..." : "Initialize Run"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Run Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {runs && runs.length > 0 ? `$${Number(runs[0].totalNet || 0).toLocaleString()}` : "$0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {runs && runs.length > 0 ? `${runs[0].periodName} (Paid)` : "No Date"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {runs ? runs.filter((r: any) => r.status === 'PENDING_APPROVAL').length : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Runs waiting for final sign-off</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142</div>
                        <p className="text-xs text-muted-foreground">Processed in current cycle</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Payroll Runs</CardTitle>
                    <CardDescription>History of open and completed payroll cycles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Pay Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Gross</TableHead>
                                <TableHead className="text-right">Total Net</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    </TableRow>
                                ))
                            ) : runs?.map((run: any) => (
                                <TableRow key={run.id}>
                                    <TableCell className="font-medium">{run.periodName}</TableCell>
                                    <TableCell>{format(new Date(run.periodStartDate), "MMM d, yyyy")}</TableCell>
                                    <TableCell>{run.paymentDate ? format(new Date(run.paymentDate), "MMM d, yyyy") : "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            run.status === "COMPLETED" ? "default" :
                                                run.status === "PENDING_APPROVAL" ? "secondary" :
                                                    run.status === "ERROR" ? "destructive" : "outline"
                                        }>
                                            {run.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {run.totalGross ? `$${Number(run.totalGross).toLocaleString()}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {run.totalNet ? `$${Number(run.totalNet).toLocaleString()}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {run.status === "OPEN" && (
                                            <Button
                                                size="sm"
                                                onClick={() => calculateMutation.mutate(run.id)}
                                                disabled={calculateMutation.isPending}
                                            >
                                                {calculateMutation.isPending ? "Calc..." : "Calculate"}
                                            </Button>
                                        )}
                                        {run.status === "PENDING_APPROVAL" && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => approveMutation.mutate(run.id)}
                                                disabled={approveMutation.isPending}
                                            >
                                                {approveMutation.isPending ? "Approving..." : "Approve"}
                                            </Button>
                                        )}
                                        {run.status === "COMPLETED" && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setSelectedRunId(run.id);
                                                    setIsDetailsOpen(true);
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <PayrollRunDetails
                runId={selectedRunId}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
            />

        </div>
    );
}
