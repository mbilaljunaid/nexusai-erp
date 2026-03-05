
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Loader2, RefreshCw, Play, Layers, Settings, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { StandardPage } from "@/components/layout/StandardPage";
import { LedgerContextBadge } from "@/components/gl/LedgerContextBadge";
import { useLedger } from "@/context/LedgerContext";

interface PreflightCheck {
    type: "error" | "warning" | "success";
    message: string;
    details?: string;
}

export default function ConsolidationWorkbench() {
    const { toast } = useToast();
    const { currentLedgerId } = useLedger();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);

    // Form State
    const [selectedLedgerSet, setSelectedLedgerSet] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [preflightResults, setPreflightResults] = useState<PreflightCheck[]>([]);
    const [runProgress, setRunProgress] = useState(0);

    // Fetch History
    const { data: history = [], isLoading } = useQuery<any>({
        queryKey: ["consolidation-history"],
        queryFn: async () => {
            const res = await fetch("/api/gl/consolidation/history");
            if (!res.ok) throw new Error("Failed to fetch history");
            return await res.json();
        }
    });

    // Fetch ledger sets
    const { data: ledgerSets = [] } = useQuery<any>({
        queryKey: ["ledger-sets"],
        queryFn: async () => {
            return [
                { id: "GLOBAL_GRP", name: "Global Consolidation Group", entities: 5, currency: "USD" },
                { id: "NA_GRP", name: "North America Group", entities: 2, currency: "USD" },
                { id: "EMEA_GRP", name: "EMEA Group", entities: 3, currency: "EUR" }
            ];
        }
    });

    // Preflight check mutation
    const preflightMutation = useMutation({
        mutationFn: async () => {
            // Mock - replace with actual API
            return {
                checks: [
                    { type: "success" as const, message: "All FX rates available", details: "EUR-USD: 1.08, GBP-USD: 1.27" },
                    { type: "success" as const, message: "Period is open for transactions", details: "Jan-2026" },
                    { type: "warning" as const, message: "2 elimination rules enabled", details: "IC Payables, IC Receivables" },
                    { type: "success" as const, message: "All ledgers balanced" }
                ]
            };
        },
        onSuccess: (data) => {
            setPreflightResults(data.checks);
            setWizardStep(3);
        }
    });

    // Run Mutation
    const runMutation = useMutation({
        mutationFn: async () => {
            // Simulate progress
            setRunProgress(20);
            await new Promise(resolve => setTimeout(resolve, 500));
            setRunProgress(40);
            await new Promise(resolve => setTimeout(resolve, 500));
            setRunProgress(70);

            const res = await apiRequest("POST", "/api/gl/consolidation/run", {
                ledgerSetId: selectedLedgerSet,
                periodId: selectedPeriod
            });
            setRunProgress(100);
            return await res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Consolidation Complete",
                description: `Successfully eliminated $${data.totalEliminated || 0}`,
            });
            setIsOpen(false);
            setWizardStep(1);
            setRunProgress(0);
            queryClient.invalidateQueries({ queryKey: ["consolidation-history"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Run Failed",
                description: error.message,
                variant: "destructive"
            });
            setRunProgress(0);
        }
    });



    const selectedSet = ledgerSets.find(s => s.id === selectedLedgerSet);
    const hasErrors = preflightResults.some(r => r.type === "error");

    const resetWizard = () => {
        setWizardStep(1);
        setSelectedLedgerSet("");
        setSelectedPeriod("");
        setPreflightResults([]);
        setRunProgress(0);
    };

    return (
        <StandardPage
            title="Consolidation Workbench"
            description={
                <div className="flex items-center gap-2">
                    <span>Manage financial consolidation, translations, and intercompany eliminations.</span>
                    <LedgerContextBadge />
                </div>
            }
            breadcrumbs={[
                { label: "General Ledger", href: "/gl" },
                { label: "Consolidation" }
            ]}
        >
            <div className="space-y-6">
                {/* Action Bar */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Link href="/gl/consolidation/ledger-sets">
                            <Button variant="outline" size="sm">
                                <Layers className="h-4 w-4 mr-2" />
                                Ledger Sets
                            </Button>
                        </Link>
                        <Link href="/gl/consolidation/fx-rates">
                            <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                FX Rates
                            </Button>
                        </Link>
                        <Link href="/gl/consolidation/rules">
                            <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-2" />
                                Elimination Rules
                            </Button>
                        </Link>
                    </div>
                    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetWizard(); }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Play className="h-4 w-4" />
                                Run Consolidation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Run Consolidation - Step {wizardStep} of 4</DialogTitle>
                            </DialogHeader>

                            {/* Step 1: Ledger Set Selection */}
                            {wizardStep === 1 && (
                                <div className="space-y-4 py-4">
                                    <Label>Select Consolidation Group</Label>
                                    <div className="space-y-2">
                                        {ledgerSets.map((set) => (
                                            <Card
                                                key={set.id}
                                                className={`cursor-pointer transition-all ${selectedLedgerSet === set.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-muted'}`}
                                                onClick={() => setSelectedLedgerSet(set.id)}
                                            >
                                                <CardContent className="pt-4 pb-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium">{set.name}</h4>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {set.entities} entities • Reporting: {set.currency}
                                                            </p>
                                                        </div>
                                                        {selectedLedgerSet === set.id && (
                                                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <Button
                                        className="w-full mt-4"
                                        onClick={() => setWizardStep(2)}
                                        disabled={!selectedLedgerSet}
                                    >
                                        Next: Select Period <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            )}

                            {/* Step 2: Period Selection */}
                            {wizardStep === 2 && (
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Consolidation Period</Label>
                                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Jan-2026">Jan-2026</SelectItem>
                                                <SelectItem value="Feb-2026">Feb-2026</SelectItem>
                                                <SelectItem value="Dec-2025">Dec-2025</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Selected Configuration</AlertTitle>
                                        <AlertDescription>
                                            <div className="mt-2 space-y-1 text-sm">
                                                <div><strong>Group:</strong> {selectedSet?.name}</div>
                                                <div><strong>Entities:</strong> {selectedSet?.entities}</div>
                                                <div><strong>Currency:</strong> {selectedSet?.currency}</div>
                                                {selectedPeriod && <div><strong>Period:</strong> {selectedPeriod}</div>}
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setWizardStep(1)}>
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={() => preflightMutation.mutate()}
                                            disabled={!selectedPeriod || preflightMutation.isPending}
                                        >
                                            {preflightMutation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Validating...
                                                </>
                                            ) : (
                                                <>
                                                    Next: Preflight Check <ChevronRight className="h-4 w-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Preflight Results */}
                            {wizardStep === 3 && (
                                <div className="space-y-4 py-4">
                                    <Label>Preflight Validation Results</Label>
                                    <div className="space-y-2">
                                        {preflightResults.map((check, idx) => (
                                            <Alert key={idx} variant={check.type === "error" ? "destructive" : "default"}>
                                                {check.type === "success" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                                {check.type === "warning" && <AlertCircle className="h-4 w-4 text-orange-600" />}
                                                {check.type === "error" && <AlertCircle className="h-4 w-4" />}
                                                <AlertTitle className="text-sm">{check.message}</AlertTitle>
                                                {check.details && (
                                                    <AlertDescription className="text-xs">{check.details}</AlertDescription>
                                                )}
                                            </Alert>
                                        ))}
                                    </div>
                                    {hasErrors && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Cannot Proceed</AlertTitle>
                                            <AlertDescription>
                                                Please resolve the errors above before running consolidation.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setWizardStep(2)}>
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={() => setWizardStep(4)}
                                            disabled={hasErrors}
                                        >
                                            Next: Confirm <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirmation & Execute */}
                            {wizardStep === 4 && (
                                <div className="space-y-4 py-4">
                                    <Label>Ready to Run Consolidation</Label>
                                    <Card className="bg-muted">
                                        <CardContent className="pt-4">
                                            <h4 className="font-bold mb-3">Summary</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Ledger Set:</span>
                                                    <span className="font-medium">{selectedSet?.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Period:</span>
                                                    <span className="font-medium">{selectedPeriod}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Entities:</span>
                                                    <span className="font-medium">{selectedSet?.entities}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Currency:</span>
                                                    <Badge variant="outline">{selectedSet?.currency}</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {runMutation.isPending && (
                                        <div className="space-y-2">
                                            <Label className="text-sm">Progress</Label>
                                            <Progress value={runProgress} className="h-2" />
                                            <p className="text-xs text-muted-foreground">
                                                {runProgress < 30 && "Aggregating balances..."}
                                                {runProgress >= 30 && runProgress < 60 && "Applying FX translation..."}
                                                {runProgress >= 60 && runProgress < 90 && "Processing eliminations..."}
                                                {runProgress >= 90 && "Finalizing..."}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setWizardStep(3)} disabled={runMutation.isPending}>
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={() => runMutation.mutate()}
                                            disabled={runMutation.isPending}
                                        >
                                            {runMutation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Running...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Start Consolidation
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Last Run Status</CardTitle>
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {history[0]?.status || "No runs"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {history[0] ? format(new Date(history[0].runDate), "MMM dd, yyyy") : "—"}
                            </p>
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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Ledger Sets</CardTitle>
                            <Layers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ledgerSets.length}</div>
                            <p className="text-xs text-muted-foreground">Consolidation groups</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Run History */}
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
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
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
                                                <StatusBadge status={run.status} />
                                            </TableCell>
                                            <TableCell>${run.totalEliminations || 0}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/gl/consolidation/results/${run.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8">
                                                        View Results
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
        </StandardPage>
    );
}
