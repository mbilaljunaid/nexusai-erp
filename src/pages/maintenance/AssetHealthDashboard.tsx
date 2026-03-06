import { formatDate } from "@/lib/dateUtils";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { assetHealthService } from "@/services/maintenance.service";
import {
    Activity,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Search,
    Target,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Cell
} from "recharts";

interface Asset {
    id: string;
    name: string;
    type: string;
    healthScore: number;
    criticality: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    status: "GOOD" | "WATCH" | "ALERT" | "CRITICAL";
    lastMaintenance?: string;
    nextPM?: string;
    failureProbability: number; // 30-day probability %
    costImpact?: number;
    uptime: number; // percentage
}

interface HealthTrend {
    date: string;
    score: number;
}

interface PredictiveAlert {
    id: string;
    assetId: string;
    assetName: string;
    alertType: "FAILURE_RISK" | "DEGRADATION" | "THRESHOLD_BREACH";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
    probability: number;
    daysToFailure?: number;
    recommendedAction: string;
}

interface FleetMetrics {
    totalAssets: number;
    avgHealthScore: number;
    criticalAssets: number;
    alertsCount: number;
}

export function AssetHealthDashboard() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [fleetMetrics, setFleetMetrics] = useState<FleetMetrics | null>(null);
    const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        loadDashboard();
    }, []);

    useEffect(() => {
        if (selectedAsset) {
            loadAssetHistory(selectedAsset.id);
        }
    }, [selectedAsset]);

    const loadDashboard = async () => {
        try {
            // ✅ LIVE API CALLS - Get fleet assets and alerts
            const [assetsData, alertsData] = await Promise.all([
                assetHealthService.getAssetHealth(),
                assetHealthService.getPredictiveAlerts()
            ]);

            setAssets(assetsData as any); // Type mapper needed for full Asset interface
            setPredictiveAlerts(alertsData);

            // Calculate fleet metrics from assets data
            if (assetsData.length > 0) {
                const metrics = {
                    totalAssets: assetsData.length,
                    avgHealthScore: Math.round(assetsData.reduce((sum: number, a: any) => sum + a.healthScore, 0) / assetsData.length),
                    criticalAssets: assetsData.filter((a: any) => a.status === "CRITICAL" || a.status === "ALERT").length,
                    alertsCount: alertsData.length
                };
                setFleetMetrics(metrics);
            }
        } catch (error) {
            console.error("Failed to load dashboard:", error);
            setAssets([]);
            setFleetMetrics(null);
            setPredictiveAlerts([]);
        }
    };

    const loadAssetHistory = async (assetId: string) => {
        try {
            // ✅ LIVE API CALL - Get asset health trend history
            const trendsData = await assetHealthService.getHealthTrends(assetId);
            setHealthTrends(trendsData);
        } catch (error) {
            console.error("Failed to load asset history:", error);
            setHealthTrends([]);
        }
    };

    const getStatusConfig = (status: Asset["status"]) => {
        switch (status) {
            case "GOOD":
                return { color: "bg-green-100 text-green-800", icon: CheckCircle2, label: "Good" };
            case "WATCH":
                return { color: "bg-yellow-100 text-yellow-800", icon: Activity, label: "Watch" };
            case "ALERT":
                return { color: "bg-orange-100 text-orange-800", icon: AlertTriangle, label: "Alert" };
            case "CRITICAL":
                return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Critical" };
        }
    };

    const getCriticalityColor = (criticality: Asset["criticality"]) => {
        switch (criticality) {
            case "CRITICAL":
                return "#ef4444";
            case "HIGH":
                return "#f97316";
            case "MEDIUM":
                return "#eab308";
            default:
                return "#3b82f6";
        }
    };

    const getSeverityConfig = (severity: PredictiveAlert["severity"]) => {
        switch (severity) {
            case "CRITICAL":
                return { color: "bg-red-100 text-red-800 border-red-300", icon: XCircle };
            case "HIGH":
                return { color: "bg-orange-100 text-orange-800 border-orange-300", icon: AlertTriangle };
            case "MEDIUM":
                return { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: AlertTriangle };
            default:
                return { color: "bg-blue-100 text-blue-800 border-blue-300", icon: Activity };
        }
    };

    // Criticality matrix data
    const matrixData = assets.map(asset => ({
        name: asset.name,
        health: asset.healthScore,
        criticality: asset.criticality === "CRITICAL" ? 4 : asset.criticality === "HIGH" ? 3 : asset.criticality === "MEDIUM" ? 2 : 1,
        color: getCriticalityColor(asset.criticality),
        status: asset.status
    }));

    const filteredAssets = assets
        .filter(a => statusFilter === "all" || a.status === statusFilter)
        .filter(a =>
            searchTerm === "" ||
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.type.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Asset Health Dashboard</h1>
                <p className="text-muted-foreground">Monitor asset condition and predict maintenance needs</p>
            </div>

            {/* Fleet Metrics */}
            {fleetMetrics && (
                <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-muted-foreground">Total Assets</div>
                                <Target className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-3xl font-bold">{fleetMetrics.totalAssets}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-muted-foreground">Avg Health Score</div>
                                <Activity className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="text-3xl font-bold text-green-600">{fleetMetrics.avgHealthScore}</div>
                            <div className="text-xs text-muted-foreground mt-1">Fleet average</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-muted-foreground">At Risk</div>
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="text-3xl font-bold text-red-600">{fleetMetrics.criticalAssets}</div>
                            <div className="text-xs text-muted-foreground mt-1">Critical or alert status</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-muted-foreground">Active Alerts</div>
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="text-3xl font-bold text-orange-600">{fleetMetrics.alertsCount}</div>
                            <div className="text-xs text-muted-foreground mt-1">Predictive alerts</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Criticality Matrix */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Asset Health vs. Criticality Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="health"
                                name="Health Score"
                                domain={[0, 100]}
                                label={{ value: "Health Score →", position: "insideBottom", offset: -5 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="criticality"
                                name="Criticality"
                                domain={[0, 5]}
                                ticks={[1, 2, 3, 4]}
                                tickFormatter={(value) => {
                                    if (value === 4) return "Critical";
                                    if (value === 3) return "High";
                                    if (value === 2) return "Medium";
                                    return "Low";
                                }}
                                label={{ value: "Criticality →", angle: -90, position: "insideLeft" }}
                            />
                            <Tooltip
                                content={({ payload }) => {
                                    if (payload && payload.length > 0) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-3 border rounded shadow-lg">
                                                <div className="font-bold">{data.name}</div>
                                                <div className="text-sm">Health: {data.health}</div>
                                                <div className="text-sm">Status: {data.status}</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <ReferenceLine x={50} stroke="#999" strokeDasharray="3 3" />
                            <ReferenceLine y={2.5} stroke="#999" strokeDasharray="3 3" />
                            <Scatter name="Assets" data={matrixData} shape="circle">
                                {matrixData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-xs text-muted-foreground text-center">
                        Top-right quadrant: High criticality + low health = Highest priority
                    </div>
                </CardContent>
            </Card>

            {/* Predictive Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Predictive Failure Alerts ({predictiveAlerts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {predictiveAlerts.map(alert => {
                            const config = getSeverityConfig(alert.severity);
                            const Icon = config.icon;

                            return (
                                <div key={alert.id} className={cn("border-l-4 p-4 rounded", config.color.split(' ')[2])}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <Icon className="h-4 w-4" />
                                                <span className="font-bold">{alert.assetName}</span>
                                                <Badge variant="outline" className={config.color}>
                                                    {alert.severity}
                                                </Badge>
                                                <StatusBadge status="info" label={`${alert.probability}% probability`} />
                                            </div>
                                            <div className="text-sm mb-2">{alert.description}</div>
                                            {alert.daysToFailure && (
                                                <div className="text-xs text-muted-foreground mb-2">
                                                    Estimated failure: {alert.daysToFailure} days
                                                </div>
                                            )}
                                            <div className="text-sm bg-white/50 p-2 rounded">
                                                <span className="font-medium">Recommended:</span> {alert.recommendedAction}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Asset List with Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Asset Fleet</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search assets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                                <SelectItem value="ALERT">Alert</SelectItem>
                                <SelectItem value="WATCH">Watch</SelectItem>
                                <SelectItem value="GOOD">Good</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredAssets.map(asset => {
                            const statusConfig = getStatusConfig(asset.status);
                            const StatusIcon = statusConfig.icon;
                            const healthColor = asset.healthScore >= 70 ? "text-green-600" : asset.healthScore >= 50 ? "text-yellow-600" : "text-red-600";

                            return (
                                <Card
                                    key={asset.id}
                                    className={cn(
                                        "cursor-pointer hover:border-primary transition-all",
                                        selectedAsset?.id === asset.id && "border-2 border-primary"
                                    )}
                                    onClick={() => setSelectedAsset(asset)}
                                >
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="font-bold text-lg mb-1">{asset.name}</div>
                                                <div className="text-sm text-muted-foreground">{asset.type}</div>
                                            </div>
                                            <Badge variant="outline" className={statusConfig.color}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {statusConfig.label}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="text-muted-foreground">Health Score</span>
                                                    <span className={cn("font-bold text-2xl", healthColor)}>{asset.healthScore}</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full transition-all", asset.healthScore >= 70 ? "bg-green-600" : asset.healthScore >= 50 ? "bg-yellow-600" : "bg-red-600")}
                                                        style={{ width: `${asset.healthScore}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-muted-foreground">Failure Risk:</span>
                                                    <div className="font-medium">{asset.failureProbability}%</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Uptime:</span>
                                                    <div className="font-medium">{asset.uptime}%</div>
                                                </div>
                                            </div>

                                            {asset.nextPM && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                                                    <Calendar className="h-3 w-3" />
                                                    Next PM: {asset.nextPM}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Asset Health History */}
            {selectedAsset && healthTrends.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Health Score Trend: {selectedAsset.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={healthTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(date) => formatDate(date)} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip labelFormatter={(date) => formatDate(date)} />
                                <Legend />
                                <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="3 3" label="Good" />
                                <ReferenceLine y={50} stroke="#eab308" strokeDasharray="3 3" label="Watch" />
                                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Health Score" />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                            <div className="flex items-center gap-2">
                                {selectedAsset.healthScore < healthTrends[0].score ? (
                                    <>
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                        <span className="text-sm text-red-900">Declining trend detected - Recommend condition-based PM</span>
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-900">Improving trend - Current maintenance plan effective</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default AssetHealthDashboard;
