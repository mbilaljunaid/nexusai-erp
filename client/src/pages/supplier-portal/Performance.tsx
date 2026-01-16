import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SupplierPerformance() {
    const token = localStorage.getItem("supplier_token");

    const { data: scorecard, isLoading } = useQuery({
        queryKey: ["/api/portal/supplier/scorecard"],
        queryFn: async () => {
            const res = await fetch("/api/portal/supplier/scorecard", {
                headers: { "x-portal-token": token || "" }
            });
            if (!res.ok) throw new Error("Failed to fetch scorecard");
            return res.json();
        }
    });

    if (isLoading) {
        return <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-[300px]" />
            <Skeleton className="h-[200px] w-full" />
        </div>;
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-600";
        if (score >= 80) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance Scorecard</h1>
                    <p className="text-muted-foreground">Detailed breakdown of your performance metrics for the current period.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                    <div className={`text-4xl font-bold ${getScoreColor(scorecard?.overallScore)}`}>
                        {scorecard?.overallScore ?? 0}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Score (40%)</CardTitle>
                        <CardDescription>Based on On-Time ASNs and Receipts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${getScoreColor(scorecard?.deliveryScore)}`}>
                            {scorecard?.deliveryScore ?? 0}%
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quality Score (40%)</CardTitle>
                        <CardDescription>Based on Inspection Rejections</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${getScoreColor(scorecard?.qualityScore)}`}>
                            {scorecard?.qualityScore ?? 0}/100
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Responsiveness (20%)</CardTitle>
                        <CardDescription>PO Acknowledgment Time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${getScoreColor(scorecard?.responsivenessScore)}`}>
                            {scorecard?.responsivenessScore ?? 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quality Events Log</CardTitle>
                    <CardDescription>Recent defects, delays, or non-compliance events affecting your score.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    No quality events recorded for this period. Keep up the good work!
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
