
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { DollarSign, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    workOrderId: string;
}

export function CostAnalysisSection({ workOrderId }: Props) {
    const { data: costs, isLoading } = useQuery({
        queryKey: ["/api/maintenance/work-orders", workOrderId, "costs"],
        queryFn: () => fetch(`/api/maintenance/work-orders/${workOrderId}/costs`).then(r => r.json())
    });

    if (isLoading) return <Skeleton className="h-40 w-full" />;

    // Calculate Totals
    const totalMat = costs?.filter((c: any) => c.costType === "MATERIAL")
        .reduce((acc: number, c: any) => acc + Number(c.totalCost), 0) || 0;

    const totalLab = costs?.filter((c: any) => c.costType === "LABOR")
        .reduce((acc: number, c: any) => acc + Number(c.totalCost), 0) || 0;

    const totalOverhead = costs?.filter((c: any) => c.costType === "OVERHEAD")
        .reduce((acc: number, c: any) => acc + Number(c.totalCost), 0) || 0;

    const grandTotal = totalMat + totalLab + totalOverhead;

    return (
        <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${grandTotal.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Material</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold">${totalMat.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Labor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold">${totalLab.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead className="text-right">Unit Cost</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {costs?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No costs recorded yet. Issue materials or log labor to generate costs.
                                </TableCell>
                            </TableRow>
                        ) : (
                            costs?.map((cost: any) => (
                                <TableRow key={cost.id}>
                                    <TableCell className="text-xs">{new Date(cost.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-xs font-medium">{cost.costType}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{cost.description}</TableCell>
                                    <TableCell className="text-xs">{Number(cost.quantity)}</TableCell>
                                    <TableCell className="text-right text-xs">${Number(cost.unitCost).toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-xs font-bold">${Number(cost.totalCost).toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
