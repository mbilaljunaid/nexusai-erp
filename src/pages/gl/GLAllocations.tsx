import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLedger } from "@/context/LedgerContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, PlayCircle, Plus, Search, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { LedgerContextBadge } from "@/components/gl/LedgerContextBadge";
import { format } from "date-fns";

export default function GLAllocations() {
    const { currentLedgerId } = useLedger();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [isRunDialogOpen, setIsRunDialogOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<any>(null);
    const [runPeriod, setRunPeriod] = useState("");

    const { data: allocations, isLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/allocations", { ledgerId: currentLedgerId }],
        enabled: !!currentLedgerId,
    });

    const { data: periods } = useQuery<any[]>({
        queryKey: ["/api/gl/periods", { ledgerId: currentLedgerId }],
        enabled: !!currentLedgerId,
    });

    const runMutation = useMutation({
        mutationFn: async (payload: { allocationId: string, periodName: string }) => {
            const res = await fetch("/api/gl/allocations/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to run allocation");
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Allocation Initiated",
                description: `Batch ${data.journalBatchName || ''} is processing.`
            });
            setIsRunDialogOpen(false);
        },
        onError: (err: any) => {
            toast({ title: "Run Failed", description: err.message, variant: "destructive" });
        }
    });

    const handleRunClick = (rule: any) => {
        setSelectedRule(rule);
        setRunPeriod("");
        setIsRunDialogOpen(true);
    };

    const handleConfirmRun = () => {
        if (!selectedRule || !runPeriod) return;
        runMutation.mutate({ allocationId: selectedRule.id, periodName: runPeriod });
    };

    const filteredAllocations = allocations?.filter(a =>
        a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <StandardPage
            title="Mass Allocations"
            breadcrumbs={[
                { label: "General Ledger", href: "/gl/journals" },
                { label: "Allocations" },
            ]}
            description={<LedgerContextBadge />}
            className="animate-in fade-in duration-500"
            actions={
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Create Rule
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="shadow-sm border-l-4 border-l-orange-500 bg-orange-50/30">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Active Rules</p>
                                <h3 className="text-3xl font-bold text-slate-900">{allocations?.filter((a) => a.active)?.length || 0}</h3>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <PieChart className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-lg border-none">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Allocation Rules</CardTitle>
                            <CardDescription>Rules to distribute costs or revenues across accounts automatically.</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search rules..."
                                className="pl-9 w-64 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-6">Rule Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Last Run</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading rules...
                                    </TableCell>
                                </TableRow>
                            ) : filteredAllocations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        No allocation rules found in this ledger.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAllocations.map((rule) => (
                                    <TableRow key={rule.id} className="hover:bg-muted/30 group">
                                        <TableCell className="pl-6 font-semibold">{rule.name}</TableCell>
                                        <TableCell className="text-sm max-w-sm truncate">{rule.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal text-xs">{rule.type || 'Standard'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm font-mono text-muted-foreground">
                                            {rule.lastRunDate ? format(new Date(rule.lastRunDate), "MMM dd, yyyy HH:mm") : "Never"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={rule.active ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-slate-100 text-slate-800 hover:bg-slate-100"}>
                                                {rule.active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-orange-600 hover:bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRunClick(rule)}
                                                disabled={!rule.active}
                                            >
                                                <PlayCircle className="w-4 h-4 mr-2" /> Run
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Run Allocation Rule</DialogTitle>
                        <DialogDescription>
                            Execute <span className="font-bold text-slate-900">{selectedRule?.name}</span> for a specific accounting period.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Accounting Period</Label>
                            <Select value={runPeriod} onValueChange={setRunPeriod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select target period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods?.map((p) => (
                                        <SelectItem key={p.id} value={p.periodName || p.id}>
                                            {p.periodName || p.id}
                                        </SelectItem>
                                    ))}
                                    {(!periods || periods.length === 0) && (
                                        <SelectItem value="Jan-2026">Jan-2026</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-4 bg-muted/40 rounded-lg text-sm text-slate-600 border border-slate-200">
                            <span className="font-semibold block mb-1">Impact Warning</span>
                            Running this rule will generate journal entries in the selected period. These entries will be set to Draft or Posted depending on your Ledger setup.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRunDialogOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={handleConfirmRun}
                            disabled={!runPeriod || runMutation.isPending}
                        >
                            {runMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Generate Journals
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
