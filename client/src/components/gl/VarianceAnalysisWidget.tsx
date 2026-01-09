
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface VarianceItem {
    account: string;
    variance: number;
    variancePercent: number;
    explanation: string;
}

interface VarianceAnalysisWidgetProps {
    currentPeriodId?: string;
    onClose?: () => void;
}

export function VarianceAnalysisWidget({ currentPeriodId, onClose }: VarianceAnalysisWidgetProps) {
    const [benchmarkPeriodId, setBenchmarkPeriodId] = useState<string>("Jan-2025"); // Default or dynamic

    const { data: analysis, isLoading, refetch } = useQuery<VarianceItem[]>({
        queryKey: ["gl-variance-analysis", currentPeriodId, benchmarkPeriodId],
        queryFn: async () => {
            if (!currentPeriodId) return [];
            const res = await fetch(`/api/gl/variance-analysis?periodId=${currentPeriodId}&benchmarkPeriodId=${benchmarkPeriodId}`);
            if (!res.ok) throw new Error("Failed to fetch variance analysis");
            return res.json();
        },
        enabled: !!currentPeriodId && !!benchmarkPeriodId,
    });

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        AI Variance Analysis
                    </h2>
                    <p className="text-sm text-muted-foreground">Comparing against benchmark period</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">Benchmark:</span>
                <Select value={benchmarkPeriodId} onValueChange={setBenchmarkPeriodId}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Jan-2025">Jan-2025</SelectItem>
                        <SelectItem value="Dec-2024">Dec-2024</SelectItem>
                        <SelectItem value="Nov-2024">Nov-2024</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => refetch()}>Analyze</Button>
            </div>

            <div className="flex-1 overflow-auto space-y-3">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))
                ) : analysis?.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No significant variances detected.
                    </div>
                ) : (
                    analysis?.map((item, idx) => (
                        <Card key={idx} className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold">{item.account}</h4>
                                    <div className={`flex items-center gap-1 text-sm font-bold ${item.variance > 0 ? "text-green-600" : "text-red-500"}`}>
                                        {item.variance > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {Math.abs(item.variancePercent)}%
                                        <span className="text-xs font-normal text-muted-foreground ml-1">
                                            (${Math.abs(item.variance).toLocaleString()})
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                    <span className="font-semibold text-blue-600">AI Insight: </span>
                                    {item.explanation}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {onClose && (
                <Button variant="outline" className="w-full mt-auto" onClick={onClose}>
                    Close Analysis
                </Button>
            )}
        </div>
    );
}
