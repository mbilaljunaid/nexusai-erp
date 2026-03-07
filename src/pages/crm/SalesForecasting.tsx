
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Target, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

export default function SalesForecasting() {
    // Mock User ID for now (Phase 1 Auth)
    const userId = "current-user-id";
    const [period, setPeriod] = useState("Q1-2026");

    const { data: forecast, isLoading } = useQuery<any>({
        queryKey: ["/api/crm/forecast/summary", userId, period],
        queryFn: async () => {
            const res = await fetch(`/api/crm/forecast/summary?userId=${userId}&period=${period}`);
            if (!res.ok) throw new Error("Failed to fetch forecast");
            return res.json();
        }
    });

    if (isLoading) return <div className="p-8">Loading forecast data...</div>;

    const attainmentColor = (forecast?.attainment || 0) >= 100 ? "bg-green-500" : (forecast?.attainment || 0) >= 70 ? "bg-blue-500" : "bg-amber-500";

    return (
        <StandardPage
            title="Sales Forecasting"
            description="Pipeline analysis and quota attainment."
            actions={
                <div className="w-44">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Q1-2026">Q1 2026</SelectItem>
                            <SelectItem value="Q2-2026">Q2 2026</SelectItem>
                            <SelectItem value="Q3-2026">Q3 2026</SelectItem>
                            <SelectItem value="Q4-2026">Q4 2026</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            }
        >

            {/* Quota Progress */}
            <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                    <div className="flex justify-between">
                        <CardTitle className="text-lg">Quota Attainment</CardTitle>
                        <span className="font-bold text-lg">{forecast?.attainment?.toFixed(1)}%</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <Progress value={forecast?.attainment || 0} className="h-4" indicatorClassName={attainmentColor} />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>$0</span>
                        <span>Target: ${formatNumber(Number(forecast?.quota))}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${formatNumber(Number(forecast?.closedWon))}</div>
                        <p className="text-xs text-muted-foreground">Booked Revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commit</CardTitle>
                        <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${formatNumber(Number(forecast?.commitForecast))}</div>
                        <p className="text-xs text-muted-foreground">High Confidence</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Best Case</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${formatNumber(Number(forecast?.bestCaseForecast))}</div>
                        <p className="text-xs text-muted-foreground">Potential Upside</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weighted Pipeline</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${formatNumber(Number(forecast?.weightedForecast))}</div>
                        <p className="text-xs text-muted-foreground">Risk Adjusted</p>
                    </CardContent>
                </Card>
            </div>

            {/* Note: In a full implementation, detailed Drill-down tables would go here */}
            <div className="text-center text-muted-foreground p-8 bg-muted/20 rounded-lg border border-dashed">
                Detailed forecast breakdown by Opportunity available in "Deep Dive" view (Coming Soon).
            </div>
        </StandardPage>
    );
}
