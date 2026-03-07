import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import {
    AlertCircle,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Plus,
    Shield,
    Download,
    Bell,
    Loader2,
    BarChart3,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TreasuryFxDeal, TreasuryCounterparty } from "@/types/erp-types";

interface RiskLimit {
    id: string;
    counterpartyId: string;
    limitType: string;
    maxAmount: string;
    currency: string;
    status: string;
}

export function RiskDashboard() {
    const [isCreateLimitOpen, setIsCreateLimitOpen] = useState(false);
    const [limitForm, setLimitForm] = useState({
        counterpartyId: "",
        limitType: "FX_EXPOSURE",
        maxAmount: "",
        currency: "USD",
    });
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Data fetching
    const { data: limits = [], isLoading: isLoadingLimits } = useQuery<RiskLimit[]>({
        queryKey: ["/api/treasury/risk-limits"],
        refetchInterval: 30000, // Real-time updates every 30s
    });

    const { data: fxDeals = [] } = useQuery<TreasuryFxDeal[]>({
        queryKey: ["/api/treasury/fx-deals"],
        refetchInterval: 30000,
    });

    const { data: counterparties = [] } = useQuery<TreasuryCounterparty[]>({
        queryKey: ["/api/treasury/counterparties"],
    });

    const { data: riskMetrics } = useQuery<any>({
        queryKey: ["/api/treasury/risk-metrics"],
    });

    // Create Limit Mutation
    const createLimitMutation = useMutation({
        mutationFn: async (data: typeof limitForm) => {
            const res = await apiRequest("POST", "/api/treasury/risk-limits", {
                ...data,
                status: "ACTIVE",
            });
            return await res.json();
        },
        onSuccess: () => {
            toast({
                title: "Risk Limit Created",
                description: "New counterparty limit configured successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/risk-limits"] });
            setIsCreateLimitOpen(false);
            setLimitForm({
                counterpartyId: "",
                limitType: "FX_EXPOSURE",
                maxAmount: "",
                currency: "USD",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Limit Creation Failed",
                description: error.message || "System error.",
                variant: "destructive",
            });
        },
    });

    // Bulk Revaluation
    const revalueMutation = useMutation({
        mutationFn: async () => {
            const activeDeals = fxDeals.filter((d) => d.status === "ACTIVE" || d.status === "CONFIRMED");
            const promises = activeDeals.map((d) =>
                apiRequest("POST", `/api/treasury/fx-deals/${d.id}/revalue`, {})
            );
            await Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/fx-deals"] });
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/risk-metrics"] });
            toast({ title: "Portfolio Revalued", description: "All active positions marked to market." });
        },
    });

    // Calculate Utilization with Breach Detection
    const utilizationData = useMemo(() => {
        return limits.map((limit) => {
            const counterparty = counterparties.find((c) => c.id === limit.counterpartyId);
            const cpDeals = fxDeals.filter(
                (d) =>
                    d.counterpartyId === limit.counterpartyId &&
                    (d.status === "ACTIVE" || d.status === "CONFIRMED")
            );

            const exposure = cpDeals.reduce((sum, d) => sum + Number(d.buyAmount || 0), 0);
            const limitAmount = Number(limit.maxAmount);
            const percentage = limitAmount > 0 ? (exposure / limitAmount) * 100 : 0;

            // Breach detection
            const isBreach = percentage >= 100;
            const isWarning = percentage >= 90 && percentage < 100;

            return {
                id: limit.id,
                counterpartyId: limit.counterpartyId,
                counterpartyName: counterparty?.name || "Unknown",
                limitType: limit.limitType,
                limit: limitAmount,
                exposure,
                percentage,
                isBreach,
                isWarning,
                dealCount: cpDeals.length,
            };
        });
    }, [limits, fxDeals, counterparties]);

    // Summary metrics
    const metrics = useMemo(() => {
        const totalMtM = fxDeals.reduce((sum, d) => sum + Number(d.markToMarket || 0), 0);
        const breaches = utilizationData.filter((u) => u.isBreach).length;
        const warnings = utilizationData.filter((u) => u.isWarning).length;
        const totalExposure = utilizationData.reduce((sum, u) => sum + u.exposure, 0);

        return { totalMtM, breaches, warnings, totalExposure };
    }, [fxDeals, utilizationData]);

    // Heatmap data for visualization
    const heatmapData = utilizationData.map((u) => ({
        name: u.counterpartyName.slice(0, 15),
        utilization: u.percentage,
        exposure: u.exposure,
    }));

    // VaR Breakdown (mock historical simulation)
    const varBreakdown = useMemo(() => {
        const baseVaR = Number(riskMetrics?.valueAtRisk95 || 0);
        return [
            { component: "FX Risk", value: baseVaR * 0.65, color: "#ef4444" },
            { component: "Interest Rate", value: baseVaR * 0.25, color: "#f59e0b" },
            { component: "Credit Risk", value: baseVaR * 0.1, color: "#3b82f6" },
        ];
    }, [riskMetrics]);

    // Table columns for limit management
    const columns: Column<typeof utilizationData[0]>[] = [
        {
            header: "Counterparty",
            width: "25%",
            cell: (item) => <span className="font-medium">{item.counterpartyName}</span>,
        },
        {
            header: "Limit Type",
            width: "15%",
            cell: (item) => (
                <Badge variant="outline" className="text-xs">
                    {item.limitType.replace(/_/g, " ")}
                </Badge>
            ),
        },
        {
            header: "Exposure",
            width: "15%",
            className: "text-right",
            cell: (item) => (
                <span className="font-mono">${item.exposure.toLocaleString()}</span>
            ),
        },
        {
            header: "Limit",
            width: "15%",
            className: "text-right",
            cell: (item) => (
                <span className="font-mono text-muted-foreground">
                    ${item.limit.toLocaleString()}
                </span>
            ),
        },
        {
            header: "Utilization",
            width: "20%",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <Progress
                        value={item.percentage}
                        className={cn(`flex-1 ${item.isBreach
                                ? "bg-red-100 [&>div]:bg-red-500"
                                : item.isWarning
                                    ? "bg-amber-100 [&>div]:bg-amber-500"
                                    : ""
                            }`)}
                    />
                    <span
                        className={cn(`text-xs font-bold ${item.isBreach
                                ? "text-red-600"
                                : item.isWarning
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                            }`)}
                    >
                        {item.percentage.toFixed(0)}%
                    </span>
                </div>
            ),
        },
        {
            header: "Status",
            width: "10%",
            cell: (item) => {
                if (item.isBreach) {
                    return (
                        <Badge className="bg-red-100 text-red-700 border-red-300">
                            BREACH
                        </Badge>
                    );
                }
                if (item.isWarning) {
                    return (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                            WARNING
                        </Badge>
                    );
                }
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                        OK
                    </Badge>
                );
            },
        },
    ];

    const COLORS = ["#ef4444", "#f59e0b", "#3b82f6"];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        Enhanced Risk Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Real-time risk limit monitoring, VaR analysis, and breach alerts
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revalueMutation.mutate()}
                        disabled={revalueMutation.isPending}
                        className="gap-2"
                    >
                        {revalueMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        Revalue
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>

                    <Dialog open={isCreateLimitOpen} onOpenChange={setIsCreateLimitOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                New Limit
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Risk Limit</DialogTitle>
                                <DialogDescription>Define exposure limit for counterparty</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="counterparty">Counterparty</Label>
                                    <Select
                                        value={limitForm.counterpartyId}
                                        onValueChange={(value) =>
                                            setLimitForm({ ...limitForm, counterpartyId: value })
                                        }
                                    >
                                        <SelectTrigger id="counterparty">
                                            <SelectValue placeholder="Select counterparty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {counterparties.map((cp) => (
                                                <SelectItem key={cp.id} value={cp.id}>
                                                    {cp.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="limitType">Limit Type</Label>
                                    <Select
                                        value={limitForm.limitType}
                                        onValueChange={(value) => setLimitForm({ ...limitForm, limitType: value })}
                                    >
                                        <SelectTrigger id="limitType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FX_EXPOSURE">FX Exposure</SelectItem>
                                            <SelectItem value="CREDIT">Credit Risk</SelectItem>
                                            <SelectItem value="SETTLEMENT">Settlement Risk</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxAmount">Maximum Amount</Label>
                                    <Input
                                        id="maxAmount"
                                        type="number"
                                        placeholder="5000000"
                                        value={limitForm.maxAmount}
                                        onChange={(e) => setLimitForm({ ...limitForm, maxAmount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select
                                        value={limitForm.currency}
                                        onValueChange={(value) => setLimitForm({ ...limitForm, currency: value })}
                                    >
                                        <SelectTrigger id="currency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateLimitOpen(false)}
                                    disabled={createLimitMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => createLimitMutation.mutate(limitForm)}
                                    disabled={
                                        createLimitMutation.isPending ||
                                        !limitForm.counterpartyId ||
                                        !limitForm.maxAmount
                                    }
                                >
                                    {createLimitMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : null}
                                    Create Limit
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Real-Time Breach Alerts */}
            {metrics.breaches > 0 && (
                <Card className="bg-red-500/10 border-red-200">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                            <Bell className="w-4 h-4 animate-pulse" />
                            CRITICAL: {metrics.breaches} Risk Limit Breach{metrics.breaches > 1 ? "es" : ""}{" "}
                            Detected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {utilizationData
                                .filter((u) => u.isBreach)
                                .map((u) => (
                                    <div
                                        key={u.id}
                                        className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-200"
                                    >
                                        <div>
                                            <span className="font-bold text-red-700">{u.counterpartyName}</span>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                ({u.limitType.replace(/_/g, " ")})
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm">
                                                ${u.exposure.toLocaleString()} / ${u.limit.toLocaleString()}
                                            </span>
                                            <Badge className="bg-red-600 text-white">{u.percentage.toFixed(0)}%</Badge>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-primary flex items-center gap-2">
                            <BarChart3 className="w-3 h-3" />
                            Portfolio MTM
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p
                            className={cn(`text-2xl font-black ${metrics.totalMtM >= 0 ? "text-emerald-600" : "text-red-600"
                                }`)}
                        >
                            {metrics.totalMtM >= 0 ? "+" : ""}$
                            {metrics.totalMtM.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">Unrealized P&L</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-transparent border-red-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Limit Breaches
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-red-700">{metrics.breaches}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Critical Alerts</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-transparent border-amber-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-amber-600 flex items-center gap-2">
                            <Bell className="w-3 h-3" />
                            Warning Zones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-amber-700">{metrics.warnings}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">90-100% Utilized</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-slate-300 flex items-center gap-2">
                            <TrendingDown className="w-3 h-3" />
                            VaR (95%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-red-400">
                            ${Number(riskMetrics?.valueAtRisk95 || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">1-Day Potential Loss</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Counterparty Exposure Heatmap */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-sm">Counterparty Exposure Heatmap</CardTitle>
                        <CardDescription>Limit utilization by counterparty</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        {heatmapData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={heatmapData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis type="number" domain={[0, 100]} fontSize={10} />
                                    <YAxis dataKey="name" type="category" width={120} fontSize={10} />
                                    <Tooltip
                                        formatter={(value: number, name: string) => {
                                            if (name === "utilization") return [`${value.toFixed(1)}%`, "Utilization"];
                                            return [`$${(value as number).toLocaleString()}`, "Exposure"];
                                        }}
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                    />
                                    <Bar dataKey="utilization" radius={[0, 4, 4, 0]}>
                                        {heatmapData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    entry.utilization >= 100
                                                        ? "#ef4444"
                                                        : entry.utilization >= 90
                                                            ? "#f59e0b"
                                                            : "#10b981"
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground text-sm">No risk limits configured</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* VaR Breakdown */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-sm">VaR Breakdown by Risk Factor</CardTitle>
                        <CardDescription>95% confidence level, 1-day holding period</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={varBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="component" fontSize={10} />
                                <YAxis fontSize={10} />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, "VaR"]}
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {varBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Risk Limits Table */}
            <Card className="shadow-lg border-primary/20">
                <CardHeader>
                    <CardTitle className="text-sm">Risk Limits & Real-Time Monitoring</CardTitle>
                    <CardDescription>Counterparty exposure limits with automatic breach detection</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <StandardTable
                        data={utilizationData}
                        columns={columns}
                        isLoading={isLoadingLimits}
                        className="border-0 shadow-none"
                        pageSize={10}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
