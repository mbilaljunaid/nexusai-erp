
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ChargeVarianceSheet({ tradeOpId, isOpen, onClose }: { tradeOpId: string, isOpen: boolean, onClose: () => void }) {

    // Fetch Details including Charges
    const { data: op, isLoading } = useQuery({
        queryKey: ['lcmTradeOpDetails', tradeOpId],
        queryFn: async () => {
            if (!tradeOpId) return null;
            const res = await fetch(`/api/lcm/trade-operations/${tradeOpId}`);
            if (!res.ok) throw new Error("Failed to fetch details");
            return res.json();
        },
        enabled: !!tradeOpId && isOpen
    });

    // Group by Cost Component (Naively for now)
    const charges = op?.charges || [];
    const estimated = charges.filter((c: any) => !c.isActual);
    const actuals = charges.filter((c: any) => c.isActual);

    const totalEst = estimated.reduce((sum: number, c: any) => sum + Number(c.amount), 0);
    const totalAct = actuals.reduce((sum: number, c: any) => sum + Number(c.amount), 0);

    const variance = totalAct - totalEst;
    const variancePercent = totalEst > 0 ? (variance / totalEst) * 100 : 0;
    const isCostOverrun = variance > 0;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[600px] w-[600px]">
                <SheetHeader>
                    <SheetTitle>Charge Variance Analysis</SheetTitle>
                    <SheetDescription>Compare Estimated vs Actual Landed Costs.</SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Estimated Total</p>
                            <p className="text-xl font-bold">${totalEst.toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Actual Total</p>
                            <p className="text-xl font-bold">${totalAct.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Variance Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Variance</span>
                            <span className={isCostOverrun ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                {variance > 0 ? "+" : ""}{variance.toFixed(2)} ({variancePercent.toFixed(1)}%)
                            </span>
                        </div>
                        <Progress value={Math.min(Math.max((totalAct / totalEst) * 100, 0), 100)} className={isCostOverrun ? "bg-red-100" : "bg-green-100"} />
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow> :
                                    charges.length === 0 ? <TableRow><TableCell colSpan={3}>No charges recorded.</TableCell></TableRow> :
                                        charges.map((c: any) => (
                                            <TableRow key={c.id}>
                                                <TableCell>
                                                    <Badge variant={c.isActual ? "default" : "secondary"}>
                                                        {c.isActual ? "ACTUAL" : "ESTIMATE"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{c.vendorId || "Internal"}</div>
                                                    {c.referenceNumber && <div className="text-xs text-muted-foreground">{c.referenceNumber}</div>}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">${Number(c.amount).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                }
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
