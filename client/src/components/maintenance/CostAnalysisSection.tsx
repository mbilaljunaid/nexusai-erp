
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";


interface Props {
    workOrderId: string;
}

export function CostAnalysisSection({ workOrderId }: Props) {
    const queryClient = useQueryClient();
    const { data: costs, isLoading } = useQuery({

        queryKey: ["/api/maintenance/work-orders", workOrderId, "costs"],
        queryFn: () => fetch(`/api/maintenance/work-orders/${workOrderId}/costs`).then(r => r.json())
    });

    const unpostedCount = costs?.filter((c: any) => !c.glJournalId).length || 0;

    const postMutation = useMutation({
        mutationFn: () => fetch(`/api/maintenance/work-orders/${workOrderId}/costs/post`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders", workOrderId, "costs"] });
        }
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

                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accounting</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {unpostedCount > 0 ? (
                            <div className="flex flex-col gap-2">
                                <div className="text-xl font-bold text-orange-600">{unpostedCount} Pending</div>
                                <Button size="sm" onClick={() => postMutation.mutate()} disabled={postMutation.isPending} className="w-full">
                                    {postMutation.isPending ? "Posting..." : "Post to GL"} <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="text-xl font-bold text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-5 w-5" /> Synced
                                </div>
                                <p className="text-xs text-muted-foreground">All costs posted</p>
                            </div>
                        )}
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
                            <TableHead>Status</TableHead>
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
                                    <TableCell className="text-xs">{new Date(cost.costDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-xs font-medium">{cost.costType}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{cost.description}</TableCell>
                                    <TableCell>
                                        {cost.glJournalId ?
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Posted</span> :
                                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Unposted</span>
                                        }
                                    </TableCell>
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
