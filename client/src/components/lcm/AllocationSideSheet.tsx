
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function AllocationSideSheet({ tradeOpId, isOpen, onClose }: { tradeOpId: string, isOpen: boolean, onClose: () => void }) {

    // Fetch Allocations
    const { data: allocations, isLoading } = useQuery({
        queryKey: ['lcmAllocations', tradeOpId],
        queryFn: async () => {
            if (!tradeOpId) return [];
            const res = await fetch(`/api/lcm/trade-operations/${tradeOpId}/allocations`);
            if (!res.ok) throw new Error("Failed to fetch allocations");
            return res.json();
        },
        enabled: !!tradeOpId && isOpen
    });

    const totalAllocated = allocations?.reduce((sum: number, a: any) => sum + Number(a.allocatedAmount), 0) || 0;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[600px] w-[600px]">
                <SheetHeader>
                    <SheetTitle>Allocation Breakdown</SheetTitle>
                    <SheetDescription>Detailed cost distribution per line item.</SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Allocated Cost</p>
                            <p className="text-2xl font-bold">${totalAllocated.toFixed(2)}</p>
                        </div>
                        <Badge variant="outline">USD</Badge>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Charge Type</TableHead>
                                    <TableHead>Basis Value</TableHead>
                                    <TableHead className="text-right">Allocated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? <TableRow><TableCell colSpan={3}>Calculating...</TableCell></TableRow> :
                                    allocations?.length === 0 ? <TableRow><TableCell colSpan={3}>No allocations run yet.</TableCell></TableRow> :
                                        allocations?.map((alloc: any) => (
                                            <TableRow key={alloc.allocationId}>
                                                <TableCell>
                                                    <div className="font-medium">{alloc.componentName}</div>
                                                    <div className="text-xs text-muted-foreground">Charge: ${Number(alloc.chargeAmount).toFixed(2)}</div>
                                                </TableCell>
                                                <TableCell>{alloc.basisValue} <span className="text-xs text-muted-foreground">(Qty/Wt)</span></TableCell>
                                                <TableCell className="text-right font-medium">${Number(alloc.allocatedAmount).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
