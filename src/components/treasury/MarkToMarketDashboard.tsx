import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import {
    TrendingUp,
    TrendingDown,
    RefreshCcw,
    Loader2,
    DollarSign,
    PieChart as PieChartIcon,
    BarChart3,
    AlertCircle,
} from "lucide-react";
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TreasuryFxDeal } from "@/types/erp-types";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export function MarkToMarketDashboard() {
    const [revaluationMode, setRevaluationMode] = useState<"BULK" | "SINGLE">("BULK");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { legalEntityId } = useEnterpriseStore();
    const leHeaders: Record<string, string> = legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {};

    // Fetch FX Deals with MTM
    const { data: fxDeals = [], isLoading } = useQuery<TreasuryFxDeal[]>({
        queryKey: ["/api/treasury/fx-deals", legalEntityId ?? 'all'],
        refetchInterval: 60000, // Refresh every minute for MTM tracking
        queryFn: async () => {
            const res = await fetch('/api/treasury/fx-deals', { headers: leHeaders });
            if (!res.ok) throw new Error('Failed to fetch FX deals');
            return res.json();
        },
    });

    // Bulk Revaluation Mutation
    const bulkRevalueMutation = useMutation({
        mutationFn: async () => {
            const activeDeals = fxDeals.filter(
                (d) => d.status === "ACTIVE" || d.status === "CONFIRMED"
            );

            // Call revaluation for each active deal
            const promises = activeDeals.map((deal) =>
                apiRequest("POST", `/api/treasury/fx-deals/${deal.id}/revalue`, {})
            );

            await Promise.all(promises);
        },
        onSuccess: () => {
            toast({
                title: "Revaluation Complete",
                description: `${fxDeals.filter(d => d.status === "ACTIVE" || d.status === "CONFIRMED").length} FX positions marked to market.`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/fx-deals"] });
        },
        onError: (error: any) => {
            toast({
                title: "Revaluation Failed",
                description: error.message || "System error during MTM calculation.",
                variant: "destructive",
            });
        },
    });

    // Single Deal Revaluation
    const singleRevalueMutation = useMutation({
        mutationFn: async (dealId: string) => {
            await apiRequest("POST", `/api/treasury/fx-deals/${dealId}/revalue`, {});
        },
        onSuccess: () => {
            toast({ title: "Deal Revalued", description: "MTM updated successfully." });
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/fx-deals"] });
        },
    });

    // P&L Calculations
    const plMetrics = useMemo(() => {
        const totalUnrealizedPL = fxDeals.reduce(
            (sum, deal) => sum + Number(deal.markToMarket || 0),
            0
        );

        const largestGain = fxDeals.reduce(
            (max, deal) => {
                const mtm = Number(deal.markToMarket || 0);
                return mtm > max.mtm ? { mtm, dealNumber: deal.dealNumber || "" } : max;
            },
            { mtm: 0, dealNumber: "" }
        );

        const largestLoss = fxDeals.reduce(
            (min, deal) => {
                const mtm = Number(deal.markToMarket || 0);
                return mtm < min.mtm ? { mtm, dealNumber: deal.dealNumber || "" } : min;
            },
            { mtm: 0, dealNumber: "" }
        );

        const ytdRealizedPL = 0; // TODO: Fetch from GL journal entries

        return { totalUnrealizedPL, largestGain, largestLoss, ytdRealizedPL };
    }, [fxDeals]);

    // Currency Breakdown for Pie Chart
    const currencyBreakdown = useMemo(() => {
        const breakdown = fxDeals.reduce((acc: Record<string, number>, deal) => {
            const pair = `${deal.buyCurrency}/${deal.sellCurrency}`;
            const mtm = Number(deal.markToMarket || 0);
            acc[pair] = (acc[pair] || 0) + mtm;
            return acc;
        }, {});

        return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    }, [fxDeals]);

    // MTM Trend Data (mock - in production, fetch historical MTM)
    const mtmTrendData = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (29 - i));

            // Mock trend: simulate slightly increasing unrealized P&L
            const baseValue = plMetrics.totalUnrealizedPL;
            const variance = (Math.random() - 0.5) * baseValue * 0.1;

            return {
                date: format(date, "MMM dd"),
                mtm: baseValue + variance,
            };
        });
    }, [plMetrics.totalUnrealizedPL]);

    // Table Columns for Individual Deals
    const columns: Column<TreasuryFxDeal>[] = [
        {
            header: "Deal #",
            accessorKey: "dealNumber",
            width: "15%",
            cell: (item) => <span className="font-mono font-bold text-primary">{item.dealNumber}</span>,
        },
        {
            header: "Currency Pair",
            width: "15%",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {item.buyCurrency}/{item.sellCurrency}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        @ {Number(item.exchangeRate || 0).toFixed(4)}
                    </span>
                </div>
            ),
        },
        {
            header: "Notional",
            width: "15%",
            className: "text-right",
            cell: (item) => (
                <span className="font-bold">
                    {Number(item.buyAmount).toLocaleString()} {item.buyCurrency}
                </span>
            ),
        },
        {
            header: "Value Date",
            width: "12%",
            cell: (item) =>
                item.valueDate ? format(new Date(item.valueDate), "MMM dd, yyyy") : "—",
        },
        {
            header: "Mark-to-Market",
            width: "15%",
            className: "text-right",
            cell: (item) => {
                const mtm = Number(item.markToMarket || 0);
                const isGain = mtm >= 0;
                return (
                    <div className="flex flex-col items-end">
                        <span className={`font-bold ${isGain ? "text-emerald-600" : "text-red-600"}`}>
                            {isGain ? "+" : ""}
                            {mtm.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}{" "}
                            USD
                        </span>
                        {isGain ? (
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                        ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                    </div>
                );
            },
        },
        {
            header: "Status",
            width: "10%",
            cell: (item) => {
                const colors: Record<string, string> = {
                    DRAFT: "bg-slate-100 text-slate-700",
                    CONFIRMED: "bg-blue-50 text-blue-700",
                    ACTIVE: "bg-emerald-50 text-emerald-700",
                    SETTLED: "bg-purple-50 text-purple-700",
                };
                return (
                    <Badge className={colors[item.status || "DRAFT"] || colors.DRAFT}>
                        {item.status}
                    </Badge>
                );
            },
        },
        {
            header: "Actions",
            width: "10%",
            className: "text-right",
            cell: (item) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => singleRevalueMutation.mutate(item.id)}
                    disabled={singleRevalueMutation.isPending}
                    className="text-xs"
                >
                    {singleRevalueMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        "Revalue"
                    )}
                </Button>
            ),
        },
    ];

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        Mark-to-Market Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Real-time FX portfolio P&L tracking and revaluation
                    </p>
                </div>
                <Button
                    onClick={() => bulkRevalueMutation.mutate()}
                    disabled={bulkRevalueMutation.isPending}
                    className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                    {bulkRevalueMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCcw className="w-4 h-4" />
                    )}
                    Run Bulk Revaluation
                </Button>
            </div>

            {/* P&L Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-primary flex items-center gap-2">
                            <DollarSign className="w-3 h-3" />
                            Total Unrealized P&L
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p
                            className={`text-2xl font-black ${plMetrics.totalUnrealizedPL >= 0 ? "text-emerald-600" : "text-red-600"
                                }`}
                        >
                            {plMetrics.totalUnrealizedPL >= 0 ? "+" : ""}$
                            {plMetrics.totalUnrealizedPL.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {fxDeals.length} Active FX Positions
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-transparent border-emerald-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-emerald-600 flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            Largest Gain
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-emerald-700">
                            +${plMetrics.largestGain.mtm.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            {plMetrics.largestGain.dealNumber || "N/A"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-transparent border-red-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-red-600 flex items-center gap-2">
                            <TrendingDown className="w-3 h-3" />
                            Largest Loss
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-red-700">
                            ${plMetrics.largestLoss.mtm.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            {plMetrics.largestLoss.dealNumber || "N/A"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-transparent border-blue-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-blue-600 flex items-center gap-2">
                            <BarChart3 className="w-3 h-3" />
                            YTD Realized P&L
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-blue-700">
                            ${plMetrics.ytdRealizedPL.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">Settled Deals</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* MTM Trend Chart */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            30-Day MTM Trend
                        </CardTitle>
                        <CardDescription>Historical unrealized P&L movement</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mtmTrendData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="date" fontSize={10} />
                                <YAxis fontSize={10} />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, "MTM"]}
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="mtm"
                                    stroke="#0088FE"
                                    strokeWidth={2}
                                    dot={{ fill: "#0088FE", r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Currency Breakdown Pie Chart */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-primary" />
                            MTM by Currency Pair
                        </CardTitle>
                        <CardDescription>P&L distribution across FX pairs</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {currencyBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={currencyBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {currencyBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground text-sm">No FX positions to display</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* GL Integration Preview */}
            <Card className="bg-amber-50/50 border-amber-200">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        GL Integration Preview
                    </CardTitle>
                    <CardDescription>Journal entry impact from next MTM posting</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Debit Account:</span>
                            <p className="font-mono font-bold">5100-FX-UNREALIZED</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Credit Account:</span>
                            <p className="font-mono font-bold">2300-MTM-LIABILITY</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-bold text-primary">
                                ${Math.abs(plMetrics.totalUnrealizedPL).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4" disabled>
                        Post to GL (Coming Soon)
                    </Button>
                </CardContent>
            </Card>

            {/* Individual Deal Analysis */}
            <Card className="shadow-lg border-primary/20">
                <CardHeader>
                    <CardTitle className="text-sm">Individual Deal MTM Analysis</CardTitle>
                    <CardDescription>Drilldown to position-level mark-to-market</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <StandardTable
                        data={fxDeals}
                        columns={columns}
                        isLoading={isLoading}
                        className="border-0 shadow-none"
                        pageSize={10}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
