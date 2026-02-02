
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

                    <div className="border rounded-md">
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
                    </div>
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
