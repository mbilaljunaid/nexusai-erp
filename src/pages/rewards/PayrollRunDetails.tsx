
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Eye, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, BrainCircuit } from "lucide-react";
import PayslipView from "./PayslipView";

interface PayrollRunDetailsProps {
    runId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PayrollRunDetails({ runId, isOpen, onClose }: PayrollRunDetailsProps) {
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

    const { data: results, isLoading } = useQuery({
        queryKey: ["payroll-run-results", runId],
        queryFn: async () => {
            if (!runId) return [];
            const res = await fetch(`/api/rewards/payroll-runs/${runId}/results`);
            if (!res.ok) throw new Error("Failed to fetch results");
            return res.json();
        },
        enabled: !!runId,
    });

    const { data: anomalies } = useQuery({
        queryKey: ["payroll-run-anomalies", runId],
        queryFn: async () => {
            if (!runId) return [];
            const res = await fetch(`/api/rewards/payroll-runs/${runId}/anomalies`);
            if (!res.ok) {
                return [];
            }
            return res.json();
        },
        enabled: !!runId
    });

    // Group by Assignment to show 1 row per employee
    const employeeRows = React.useMemo(() => {
        if (!results) return [];

        const groups: Record<string, any> = {};
        results.forEach((r: any) => {
            if (!groups[r.assignmentId]) {
                groups[r.assignmentId] = {
                    assignmentId: r.assignmentId,
                    name: r.assignmentId, // In real app, join with Person Name
                    gross: 0,
                    net: 0,
                    items: []
                };
            }
            groups[r.assignmentId].items.push(r);
            if (r.classification === "EARNINGS") {
                groups[r.assignmentId].gross += Number(r.amount);
                groups[r.assignmentId].net += Number(r.amount);
            } else {
                groups[r.assignmentId].net += Number(r.amount); // Deductions are negative usually? Or positive and subtracted?
                // In Service: "amount: (-monthlyTax).toFixed(2)" -> So we simply ADD it.
            }
        });
        return Object.values(groups);
    }, [results]);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Payroll Run Details</DialogTitle>
                        <DialogDescription>
                            Review generated payslips for Run ID: {runId}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="payslips" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="payslips">Payslips</TabsTrigger>
                            <TabsTrigger value="anomalies" className="group">
                                <BrainCircuit className="w-4 h-4 mr-2 group-data-[state=active]:text-indigo-600" />
                                AI Anomalies
                                {anomalies && anomalies.length > 0 && (
                                    <Badge variant="destructive" className="ml-2 h-5 px-1.5 rounded-full">{anomalies.length}</Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="payslips" className="mt-4 border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee (Assg ID)</TableHead>
                                        <TableHead className="text-right">Gross Pay</TableHead>
                                        <TableHead className="text-right">Net Pay</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                                        </TableRow>
                                    ) : employeeRows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No results found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        employeeRows.map((row: any) => (
                                            <TableRow key={row.assignmentId}>
                                                <TableCell>{row.assignmentId}</TableCell>
                                                <TableCell className="text-right">${row.gross.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold">${row.net.toFixed(2)}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button size="sm" variant="outline" onClick={() => setSelectedAssignmentId(row.assignmentId)}>
                                                        <Eye className="w-4 h-4 mr-1" /> View
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="anomalies" className="mt-4 space-y-4">
                            {!anomalies || anomalies.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md border-dashed">
                                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                                    <h3 className="font-semibold text-lg">No Anomalies Detected</h3>
                                    <p className="text-muted-foreground">The AI engine found no significant variances in this payroll run.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {anomalies.map((a: any, i: number) => (
                                        <div key={i} className="flex items-start gap-4 p-4 border rounded-lg bg-white/50 dark:bg-zinc-900/50 hover:bg-slate-50 transition-colors">
                                            <div className="mt-1 p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full text-amber-600">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-amber-900 dark:text-amber-100">{a.type}</h4>
                                                        <p className="text-sm text-muted-foreground">{a.description}</p>
                                                    </div>
                                                    {a.variancePercent && (
                                                        <Badge variant="outline" className="border-amber-200 text-amber-700">
                                                            {a.variancePercent > 0 ? '+' : ''}{a.variancePercent.toFixed(1)}% Variance
                                                        </Badge>
                                                    )}
                                                </div>
                                                {a.previousNet && a.currentNet && (
                                                    <div className="mt-2 text-sm bg-amber-50 dark:bg-amber-900/10 p-2 rounded flex items-center gap-2">
                                                        <span className="text-muted-foreground">Previous: </span>
                                                        <span className="font-medium">${Number(a.previousNet).toFixed(2)}</span>
                                                        <span className="text-muted-foreground text-xs">→</span>
                                                        <span className="text-muted-foreground">Current: </span>
                                                        <span className="font-bold text-amber-700">${Number(a.currentNet).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Button variant="ghost" size="sm">Ignore</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Drill Down to Payslip */}
            {selectedAssignmentId && runId && (
                <PayslipView
                    isOpen={!!selectedAssignmentId}
                    onClose={() => setSelectedAssignmentId(null)}
                    runId={runId}
                    assignmentId={selectedAssignmentId}
                    data={results.filter((r: any) => r.assignmentId === selectedAssignmentId)}
                />
            )}
        </>
    );
}
