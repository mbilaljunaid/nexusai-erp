
import React from "react";
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
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatters";

interface PayslipViewProps {
    isOpen: boolean;
    onClose: () => void;
    runId: string;
    assignmentId: string;
    data: any[];
}

export default function PayslipView({ isOpen, onClose, runId, assignmentId, data }: PayslipViewProps) {

    const earnings = data.filter((r) => Number(r.amount) > 0);
    const deductions = data.filter((r) => Number(r.amount) < 0);

    const totalEarnings = earnings.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalDeductions = deductions.reduce((sum, r) => sum + Number(r.amount), 0); // Sum of negatives
    const netPay = totalEarnings + totalDeductions;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Payslip View</DialogTitle>
                    <DialogDescription>
                        Assignment: {assignmentId} | Run: {runId}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Earnings Section */}
                    <div>
                        <h3 className="text-sm font-semibold mb-2 text-foreground">Earnings</h3>
                        <div className="border rounded-md">
                            <Table>
                                <TableBody>
                                    {earnings.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.elementName}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/50 font-medium">
                                        <TableCell>Total Earnings</TableCell>
                                        <TableCell className="text-right">{formatCurrency(totalEarnings)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Deductions Section */}
                    <div>
                        <h3 className="text-sm font-semibold mb-2 text-foreground">Deductions</h3>
                        <div className="border rounded-md">
                            <Table>
                                <TableBody>
                                    {deductions.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.elementName}</TableCell>
                                            <TableCell className="text-right text-red-600">{formatCurrency(Math.abs(Number(item.amount)))}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/50 font-medium">
                                        <TableCell>Total Deductions</TableCell>
                                        <TableCell className="text-right text-red-600">{formatCurrency(Math.abs(totalDeductions))}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <Separator />

                    {/* Net Pay */}
                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-md border border-primary/20">
                        <span className="text-lg font-bold">Net Pay</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(netPay)}</span>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
