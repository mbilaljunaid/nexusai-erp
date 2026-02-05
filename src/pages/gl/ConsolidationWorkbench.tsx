
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Loader2, RefreshCw, Play, Layers, Settings } from "lucide-react";
import { format } from "date-fns";

export default function ConsolidationWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [selectedLedgerSet, setSelectedLedgerSet] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("");

    // Fetch History
    const { data: history = [], isLoading } = useQuery({
        queryKey: ["consolidation-history"],
        queryFn: async () => {
            const res = await fetch("/api/gl/consolidation/history");
            if (!res.ok) throw new Error("Failed to fetch history");
            return await res.json();
        }
    });

    // Run Mutation
    const runMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/gl/consolidation/run", {
                ledgerSetId: selectedLedgerSet,
                periodId: selectedPeriod
            });
            return await res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Consolidation Complete",
                description: `Successfully eliminated $${data.totalEliminated}`,
            });
            setIsOpen(false);
            queryClient.invalidateQueries({ queryKey: ["consolidation-history"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Run Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-800";
            case "Running": return "bg-blue-100 text-blue-800";
            case "Error": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Consolidation Workbench</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage financial consolidation, translations, and intercompany eliminations.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/gl/consolidation/rules">
                        <Button variant="outline" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Manage Rules
                        </Button>
                    </Link>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Play className="h-4 w-4" />
                                Run Consolidation
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Run Consolidation Process</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Ledger Set (Consolidation Group)</Label>
                                    <Select value={selectedLedgerSet} onValueChange={setSelectedLedgerSet}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Ledger Set" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GLOBAL_GRP">Global Consolidation Group</SelectItem>
                                            <SelectItem value="NA_GRP">North America Group</SelectItem>
                                            <SelectItem value="EMEA_GRP">EMEA Group</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Period</Label>
                                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Jan-2026">Jan-2026</SelectItem>
                                            <SelectItem value="Feb-2026">Feb-2026</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => runMutation.mutate()}
                                    disabled={runMutation.isPending || !selectedLedgerSet || !selectedPeriod}
                                >
                                    {runMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        "Start Process"
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Run Status</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Success</div>
                        <p className="text-xs text-muted-foreground">Jan-2026 Closed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Eliminations YTD</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12.5M</div>
                        <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Run History</CardTitle>
                    <CardDescription>
                        Audit log of all consolidation jobs and their results.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Run Date</TableHead>
                                <TableHead>Ledger Set</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Eliminated Amount</TableHead>
                                <TableHead text-right>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                        No consolidation runs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((run: any) => (
                                    <TableRow key={run.id}>
                                        <TableCell>{format(new Date(run.runDate), "PPP p")}</TableCell>
                                        <TableCell>{run.ledgerSetId}</TableCell>
                                        <TableCell>{run.periodId}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={getStatusColor(run.status)}>
                                                {run.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${run.totalEliminations}</TableCell>
                                        <TableCell>
                                            <Link href={`/gl/journals?search=${run.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8">
                                                    View Journals
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
