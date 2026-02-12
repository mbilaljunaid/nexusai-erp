import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, TrendingDown, AlertTriangle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

export default function BudgetVariance() {
    const [period, setPeriod] = useState("2026-02");
    const [dimension, setDimension] = useState("DEPARTMENT");

    const { data: variance } = useQuery({
        queryKey: ["/api/epm/budget-variance", period, dimension],
        queryFn: () => apiRequest(`/api/epm/budget-variance?period=${period}&dimension=${dimension}`),
    });

    const getVarianceBadge = (variance: number) => {
        if (variance > 10) return <Badge variant="destructive">Unfavorable</Badge>;
        if (variance < -10) return <Badge className="bg-green-100 text-green-700">Favorable</Badge>;
        return <Badge variant="secondary">Within Target</Badge>;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Budget Variance Analysis</h1>
                    <p className="text-muted-foreground">Budget vs. Actual performance tracking</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Period</label>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026-01">January 2026</SelectItem>
                            <SelectItem value="2026-02">February 2026</SelectItem>
                            <SelectItem value="2026-Q1">Q1 2026</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium">Dimension</label>
                    <Select value={dimension} onValueChange={setDimension}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DEPARTMENT">Department</SelectItem>
                            <SelectItem value="COST_CENTER">Cost Center</SelectItem>
                            <SelectItem value="PROJECT">Project</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Total Budget</div>
                        <div className="text-3xl font-bold mt-1">${variance?.totalBudget?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Actual Spend</div>
                        <div className="text-3xl font-bold mt-1">${variance?.actualSpend?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Variance</div>
                        <div className={`text-3xl font-bold mt-1 ${variance?.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${Math.abs(variance?.variance || 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Variance %</div>
                        <div className={`text-3xl font-bold mt-1 ${variance?.variancePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {variance?.variancePercent}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Variance by {dimension}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {variance?.items?.map((item: any) => (
                            <div key={item.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-semibold">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">{item.description}</div>
                                    </div>
                                    {getVarianceBadge(item.variancePercent)}
                                </div>
                                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                                    <div>
                                        <div className="text-muted-foreground">Budget</div>
                                        <div className="font-medium">${item.budget?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Actual</div>
                                        <div className="font-medium">${item.actual?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Variance</div>
                                        <div className={`font-medium ${item.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ${Math.abs(item.variance).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">% Variance</div>
                                        <div className={`font-medium ${item.variancePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {item.variancePercent}%
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Budget Utilization</span>
                                        <span>{item.utilization}%</span>
                                    </div>
                                    <Progress value={item.utilization} className="h-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
