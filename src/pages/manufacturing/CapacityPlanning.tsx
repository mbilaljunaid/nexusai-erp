import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, Download, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CapacityPlanning() {
    const [workCenterId, setWorkCenterId] = useState("");
    const [periodType, setPeriodType] = useState<'WEEK' | 'MONTH' | 'QUARTER'>('MONTH');
    const [scenarioId, setScenarioId] = useState<string | null>(null);

    const { data: workCenters } = useQuery({
        queryKey: ["/api/manufacturing/work-centers"],
        queryFn: () => apiRequest("/api/manufacturing/work-centers"),
    });

    const { data: capacityData } = useQuery({
        queryKey: ["/api/manufacturing/capacity-analysis", workCenterId, periodType],
        queryFn: () => apiRequest(`/api/manufacturing/capacity-analysis?workCenterId=${workCenterId}&periodType=${periodType}`),
        enabled: !!workCenterId,
    });

    const { data: bottlenecks } = useQuery({
        queryKey: ["/api/manufacturing/bottlenecks", workCenterId],
        queryFn: () => apiRequest(`/api/manufacturing/bottlenecks?workCenterId=${workCenterId}`),
        enabled: !!workCenterId,
    });

    const utilizationColor = (utilization: number) => {
        if (utilization >= 100) return "text-red-600 bg-red-50";
        if (utilization >= 90) return "text-orange-600 bg-orange-50";
        if (utilization >= 70) return "text-green-600 bg-green-50";
        return "text-blue-600 bg-blue-50";
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Capacity Planning Dashboard</h1>
                    <p className="text-muted-foreground">Resource capacity analysis and bottleneck identification</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Scenarios
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium">Work Center</label>
                    <Select value={workCenterId} onValueChange={setWorkCenterId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select work center" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Work Centers</SelectItem>
                            {workCenters?.map((wc: any) => (
                                <SelectItem key={wc.id} value={wc.id.toString()}>
                                    {wc.code} - {wc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium">Time Horizon</label>
                    <Select value={periodType} onValueChange={(v: any) => setPeriodType(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="WEEK">Weekly</SelectItem>
                            <SelectItem value="MONTH">Monthly</SelectItem>
                            <SelectItem value="QUARTER">Quarterly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {capacityData && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Available Capacity</div>
                                <div className="text-2xl font-bold mt-2">{capacityData.availableHours?.toLocaleString()} hrs</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Planned Load</div>
                                <div className="text-2xl font-bold mt-2">{capacityData.plannedHours?.toLocaleString()} hrs</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Utilization</div>
                                <div className={`text-2xl font-bold mt-2 ${utilizationColor(capacityData.utilization)}`}>
                                    {capacityData.utilization?.toFixed(1)}%
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Over/Under Capacity</div>
                                <div className={`text-2xl font-bold mt-2 ${capacityData.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {capacityData.variance >= 0 ? '+' : ''}{capacityData.variance?.toLocaleString()} hrs
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Capacity Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {capacityData.periods?.map((period: any, i: number) => (
                                    <div key={i} className="border-b pb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-medium">{period.name}</div>
                                            <Badge variant={period.status === 'OVERLOADED' ? 'destructive' : 'default'}>
                                                {period.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                                            <div>Available: {period.available} hrs</div>
                                            <div>Planned: {period.planned} hrs</div>
                                            <div>Utilization: {period.utilization}%</div>
                                            <div className={period.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {period.variance >= 0 ? 'Under' : 'Over'}: {Math.abs(period.variance)} hrs
                                            </div>
                                        </div>
                                        <Progress value={period.utilization} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                                Identified Bottlenecks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {bottlenecks?.map((bn: any) => (
                                    <div key={bn.id} className="border rounded-lg p-4 bg-orange-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold">{bn.workCenterName}</div>
                                                <div className="text-sm text-muted-foreground mt-1">{bn.description}</div>
                                            </div>
                                            <Badge variant="destructive">Critical</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                            <div>Impact: {bn.impactedOrders} orders</div>
                                            <div>Delay: {bn.avgDelay} hours</div>
                                            <div>Recommendation: {bn.recommendation}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
