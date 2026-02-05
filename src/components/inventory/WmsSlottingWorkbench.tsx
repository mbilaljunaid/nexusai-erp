
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRightLeft } from 'lucide-react';

export default function WmsSlottingWorkbench() {
    const warehouseId = "SLOTTING-TEST-ORG";
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['wmsSlotting', page],
        queryFn: async () => {
            const res = await fetch(`/api/wms/optimization/slotting?warehouseId=${warehouseId}`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    // Mock Pagination Handling since the backend might return all at once (as per current service)
    // In a real scenario, we'd pass page/limit to API.
    // Here we just display what we get.

    return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-6 w-6 text-orange-600" />
                    Slotting Analysis Workbench
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Velocity Class</TableHead>
                                <TableHead>Current Loc</TableHead>
                                <TableHead>Suggested Loc</TableHead>
                                <TableHead>Benefit</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan={6}>Analyzing Movement...</TableCell></TableRow> :
                                data?.map((move: any, idx: number) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{move.itemId}</TableCell>
                                        <TableCell>{move.velocityClass}</TableCell>
                                        <TableCell>{move.currentLocation}</TableCell>
                                        <TableCell className="text-green-600 font-bold">{move.suggestedLocation}</TableCell>
                                        <TableCell>{move.reason}</TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline">Create Move Task</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                    <Button variant="outline" onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
            </CardContent>
        </Card>
    );
}
