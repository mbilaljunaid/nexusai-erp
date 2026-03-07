import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { DollarSign, PieChart, TrendingUp, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface CostAnalysisViewProps {
    workOrderId: string;
}

export default function CostAnalysisView({ workOrderId }: CostAnalysisViewProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // 1. Fetch Costs
    const { data: costs, isLoading } = useQuery({
        queryKey: ["/api/maintenance/work-orders", workOrderId, "costs"],
        queryFn: () => fetch(`/api/maintenance/work-orders/${workOrderId}/costs`).then(r => r.json())
    });

    // 2. Post Mutation
    const postMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/maintenance/work-orders/${workOrderId}/costs/post`, { method: "POST" });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders", workOrderId, "costs"] });
            toast({
                title: "Financial Posting Complete",
                description: `${data.count} cost lines posted to General Ledger.`
            });
        },
        onError: () => {
            toast({ title: "Posting Failed", variant: "destructive" });
        }
    });

    // Summary Calculations
    const totalCost = costs?.reduce((acc: number, c: any) => acc + Number(c.totalCost), 0) || 0;
    const materialCost = costs?.filter((c: any) => c.costType === 'MATERIAL').reduce((acc: number, c: any) => acc + Number(c.totalCost), 0) || 0;
    const laborCost = costs?.filter((c: any) => c.costType === 'LABOR').reduce((acc: number, c: any) => acc + Number(c.totalCost), 0) || 0;

    // Mock Budget
    const estimatedBudget = 500.00;
    const budgetUsage = Math.min((totalCost / estimatedBudget) * 100, 100);

    const pendingCount = costs?.filter((c: any) => c.glStatus === 'PENDING').length || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Actual Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {pendingCount > 0 ? `${pendingCount} lines pending posting` : "All costs posted"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Budget Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{budgetUsage.toFixed(1)}%</div>
                        <Progress value={budgetUsage} className={cn(`h-2 mt-2 ${budgetUsage > 90 ? "bg-red-100" : ""}`)} />
                        <p className="text-xs text-muted-foreground mt-1">
                            Est. Budget: ${estimatedBudget.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4 text-sm">
                        <div>
                            <span className="block font-bold">${materialCost.toFixed(2)}</span>
                            <span className="text-muted-foreground text-xs">Material</span>
                        </div>
                        <div>
                            <span className="block font-bold">${laborCost.toFixed(2)}</span>
                            <span className="text-muted-foreground text-xs">Labor</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Cost Lines</CardTitle>
                        <CardDescription>Detailed transactional history</CardDescription>
                    </div>
                    {pendingCount > 0 && (
                        <Button onClick={() => postMutation.mutate()} disabled={postMutation.isPending}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            {postMutation.isPending ? "Posting..." : "Post to Finance"}
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Ref</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {costs?.length > 0 ? costs.map((c: any) => (
                                <TableRow key={c.id}>
                                    <TableCell className="text-xs">{formatDate(c.date)}</TableCell>
                                    <TableCell><Badge variant="outline">{c.costType}</Badge></TableCell>
                                    <TableCell>{c.description}</TableCell>
                                    <TableCell className="font-mono text-xs">{c.sourceReference?.substring(0, 8)}</TableCell>
                                    <TableCell className="text-right font-medium">${Number(c.totalCost).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        {c.glStatus === 'POSTED' ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-500/15">Posted</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">Pending</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No costs recorded yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
