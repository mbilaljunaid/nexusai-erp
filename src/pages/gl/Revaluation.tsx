
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Play, RefreshCw, BarChart3 } from "lucide-react";
import { CodeCombinationPicker } from "@/components/gl/CodeCombinationPicker";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useLedger } from "@/context/LedgerContext";
import { LedgerContextBadge } from "@/components/gl/LedgerContextBadge";


type RevaluationRun = {
    id: string;
    ledgerId: string;
    periodName: string;
    currencyCode: string;
    rateType: string;
    unrealizedGainLossAccountId: string;
    status: string;
    journalBatchId: string;
    createdAt: string;
};

type GlPeriod = {
    id: string;
    periodName: string;
    status: string;
};

export default function Revaluation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { currentLedgerId: ledgerId, activeLedger } = useLedger();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form State
    const [periodName, setPeriodName] = useState("");
    const [currencyCode, setCurrencyCode] = useState("");
    const [rateType, setRateType] = useState("Spot");
    const [unrealizedAccountId, setUnrealizedAccountId] = useState("");

    // Queries
    const { data: ledgers } = useQuery<any[]>({
        queryKey: ["/api/gl/ledgers"],
    });

    const { data: runs, isLoading: isRunsLoading } = useQuery<RevaluationRun[]>({
        queryKey: ["/api/gl/revaluations", ledgerId],
        enabled: !!ledgerId
    });

    const { data: periods } = useQuery<GlPeriod[]>({
        queryKey: ["/api/gl/periods"],
    });

    const { data: currencies } = useQuery<any[]>({
        queryKey: ["/api/finance/currencies"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/finance/currencies");
            return res.json();
        }
    });

    const runMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/gl/revaluation", data);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/revaluations"] });
            setIsCreateOpen(false);

            if (data.success) {
                toast({
                    title: "Revaluation Complete",
                    description: `Journal ${data.journalId} created with variance ${data.totalVariance}.`,
                });
            } else {
                toast({
                    title: "No Impact",
                    description: data.message,
                });
            }
        },
        onError: (err: any) => {
            toast({
                title: "Error",
                description: err.message || "Failed to run revaluation.",
                variant: "destructive"
            });
        }
    });

    const handleSubmit = () => {
        if (!periodName || !currencyCode || !unrealizedAccountId) {
            toast({
                title: "Validation Error",
                description: "Period, Currency, and Account are required.",
                variant: "destructive"
            });
            return;
        }

        runMutation.mutate({
            ledgerId,
            periodName,
            currencyCode,
            rateType,
            unrealizedGainLossAccountId: unrealizedAccountId
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Revaluation</h2>
                    <div className="text-muted-foreground mt-2 flex items-center gap-2">
                        <span>Manage foreign currency revaluation runs and unrealized gain/loss.</span>
                        <LedgerContextBadge />
                    </div>
                </div>

                <Button onClick={() => setIsCreateOpen(true)}>
                    <Play className="mr-2 h-4 w-4" /> Run Revaluation
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg">
                <div className="flex-1 max-w-sm">
                    <Label htmlFor="ledger-select">Active Ledger</Label>
                    <div className="mt-1 px-3 py-2 border rounded-md bg-muted text-sm font-medium">
                        {activeLedger?.name || ledgerId}
                    </div>
                </div>
                <div className="flex-1 max-w-sm">
                    <p className="text-xs text-muted-foreground mt-6">
                        Showing history for selected ledger. All revaluation journals will be posted to this ledger.
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead>Currency</TableHead>
                                <TableHead>Rate Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Journal</TableHead>
                                <TableHead>Run Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isRunsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : runs?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No history found. Run a new revaluation to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                runs?.map((run) => (
                                    <TableRow key={run.id}>
                                        <TableCell className="font-medium">{run.periodName}</TableCell>
                                        <TableCell>{run.currencyCode}</TableCell>
                                        <TableCell>{run.rateType}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                {run.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {run.journalBatchId}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {new Date(run.createdAt).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Run Revaluation</DialogTitle>
                        <CardDescription>
                            Calculate unrealized gain/loss for foreign currency balances.
                        </CardDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <Label>Ledger</Label>
                            <div className="px-3 py-2 border rounded-md bg-muted text-sm font-medium">
                                {activeLedger?.name || ledgerId}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Period</Label>
                            <Select value={periodName} onValueChange={setPeriodName}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods?.filter(p => p.status === 'Open').map(p => (
                                        <SelectItem key={p.id} value={p.periodName}>{p.periodName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select value={currencyCode} onValueChange={setCurrencyCode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies?.map((c: any) => (
                                        <SelectItem key={c.code} value={c.code}>
                                            {c.name} ({c.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Rate Type</Label>
                            <Select value={rateType} onValueChange={setRateType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Rate Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Spot">Spot</SelectItem>
                                    <SelectItem value="Corporate">Corporate</SelectItem>
                                    <SelectItem value="User">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-2 border-t pt-4">
                            <Label>Unrealized Gain/Loss Account</Label>
                            <div className="border rounded-md p-2 bg-muted/50">
                                <CodeCombinationPicker
                                    ledgerId={ledgerId}
                                    value={unrealizedAccountId}
                                    onChange={setUnrealizedAccountId}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">The offset account where gains or losses will be booked.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={runMutation.isPending}>
                            {runMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Run Revaluation
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
