import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, TrendingDown, Settings, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";


export default function PredictiveMaintenance() {
    const [assetId, setAssetId] = useState("");

    const { data: assets } = useQuery<any>({
        queryKey: ["/api/maintenance/assets"],
        queryFn: () => apiRequest("GET", "/api/maintenance/assets").then(res => res.json()),
    });

    const { data: predictions } = useQuery<any>({
        queryKey: ["/api/maintenance/predictions", assetId],
        queryFn: () => apiRequest("GET", `/api/maintenance/predictions?assetId=${assetId}`).then(res => res.json()),
        enabled: !!assetId,
    });

    const getRiskBadge = (level: string) => {
        if (level === 'HIGH') return <Badge variant="destructive">High Risk</Badge>;
        if (level === 'MEDIUM') return <Badge className="bg-orange-100 text-orange-700">Medium Risk</Badge>;
        return <Badge variant="secondary">Low Risk</Badge>;
    };

    return (
        <StandardPage title="Predictive Maintenance Engine">
            <div>
                
                <p className="text-muted-foreground">AI-powered failure prediction and maintenance scheduling</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Select Asset</label>
                    <Select value={assetId} onValueChange={setAssetId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                            {assets?.map((asset: any) => (
                                <SelectItem key={asset.id} value={asset.id.toString()}>
                                    {asset.name} - {asset.serialNumber}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {predictions && (
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Failure Risk</div>
                            <div className="text-3xl font-bold mt-1">{predictions.failureRisk}%</div>
                            {getRiskBadge(predictions.riskLevel)}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Predicted TBF</div>
                            <div className="text-3xl font-bold mt-1">{predictions.timeBetweenFailures} days</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Health Score</div>
                            <div className="text-3xl font-bold mt-1">{predictions.healthScore}/100</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {predictions?.alerts && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                            Maintenance Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {predictions.alerts.map((alert: any) => (
                                <div key={alert.id} className="border rounded-lg p-4 bg-orange-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold">{alert.component}</div>
                                            <div className="text-sm text-muted-foreground mt-1">{alert.description}</div>
                                        </div>
                                        {getRiskBadge(alert.severity)}
                                    </div>
                                    <div className="mt-3 text-sm">
                                        <div>Recommended action: {alert.recommendation}</div>
                                        <div className="text-muted-foreground">Estimated time: {alert.estimatedDays} days</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </StandardPage>
    );
}
