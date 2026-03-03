import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { DollarSign, TrendingUp, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";

export default function CompensationBenchmarking() {
    const { data: benchmark } = useQuery({
        queryKey: ["/api/hr/compensation-benchmark"],
        queryFn: () => apiRequest("/api/hr/compensation-benchmark"),
    });

    return (
        <StandardPage
            title="Compensation Benchmarking"
            description="Market data and pay equity analysis"
            actions={
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            }
        >

            <Card>
                <CardHeader>
                    <CardTitle>Position Benchmarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {benchmark?.positions?.map((pos: any) => (
                        <div key={pos.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="font-semibold">{pos.title}</div>
                                <Badge
                                    variant={
                                        pos.variance > 10
                                            ? "destructive"
                                            : pos.variance < -10
                                                ? "default"
                                                : "secondary"
                                    }
                                >
                                    {pos.variance > 0 ? "+" : ""}
                                    {pos.variance}% vs Market
                                </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Current Avg</div>
                                    <div className="font-medium">${pos.currentAvg?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Market 50th %</div>
                                    <div className="font-medium">${pos.market50?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Market 75th %</div>
                                    <div className="font-medium">${pos.market75?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Headcount</div>
                                    <div className="font-medium">{pos.headcount}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
