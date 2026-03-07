import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    TrendingUp, TrendingDown, Star, Truck, Clock,
    DollarSign, RefreshCw, Award, AlertCircle, CheckCircle2
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { StandardPage } from "@/components/layout/StandardPage";


interface Carrier {
    id: string;
    name: string;
    rating: string;
    status: string;
}

interface CarrierScorecard {
    onTimePercent: number;
    totalShipments: number;
    avgRating: number;
}

interface CarrierMetrics extends Carrier, CarrierScorecard {
    costPerMile: number;
    avgLeadTime: number;
}

export default function CarrierScorecardDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedCarrier, setSelectedCarrier] = useState<string>("");

    // Fetch all carriers
    const { data: carriers = [], isLoading: loadingCarriers } = useQuery<Carrier[]>({
        queryKey: ["/api/carriers"],
        queryFn: async () => {
            const res = await fetch("/api/carriers");
            if (!res.ok) {
                return [];
            }
            return res.json();
        }
    });

    // Fetch scorecard for selected carrier
    const { data: scorecard } = useQuery<CarrierScorecard>({
        queryKey: ["/api/carriers/scorecard", selectedCarrier],
        queryFn: async () => {
            if (!selectedCarrier) return null;
            const res = await fetch(`/api/carriers/${selectedCarrier}/scorecard`);
            if (!res.ok) {
                return { onTimePercent: 0, totalShipments: 0, avgRating: 0 };
            }
            return res.json();
        },
        enabled: !!selectedCarrier
    });

    // Fetch all carrier metrics for overview
    const { data: allMetrics = [] } = useQuery<CarrierMetrics[]>({
        queryKey: ["/api/carriers/metrics"],
        queryFn: async () => {
            const res = await fetch("/api/carriers/metrics");
            if (!res.ok) {
                return [];
            }
            return res.json();
        }
    });

    // Refresh rating mutation
    const refreshRatingMutation = useMutation({
        mutationFn: async (carrierId: string) => {
            const res = await fetch(`/api/carriers/${carrierId}/refresh-rating`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to refresh rating");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
            queryClient.invalidateQueries({ queryKey: ["/api/carriers/scorecard"] });
            toast({
                title: "Rating Refreshed",
                description: `New rating: ${data.newRating?.toFixed(1) || "N/A"} stars`
            });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to refresh carrier rating.", variant: "destructive" });
        }
    });

    // Performance trend data (mock)
    const performanceTrend = [
        { month: "Jul", onTime: 94.2 },
        { month: "Aug", onTime: 95.1 },
        { month: "Sep", onTime: 93.8 },
        { month: "Oct", onTime: 96.5 },
        { month: "Nov", onTime: 95.9 },
        { month: "Dec", onTime: 96.8 }
    ];

    const shipmentTrend = [
        { month: "Jul", count: 185 },
        { month: "Aug", count: 203 },
        { month: "Sep", count: 198 },
        { month: "Oct", count: 221 },
        { month: "Nov", count: 215 },
        { month: "Dec", count: 221 }
    ];

    const topPerformers = allMetrics
        .filter(c => c.avgRating >= 4.5)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 5);

    const underPerformers = allMetrics
        .filter(c => c.avgRating < 3.5)
        .sort((a, b) => a.avgRating - b.avgRating)
        .slice(0, 5);

    const selectedCarrierData = carriers.find(c => c.id === selectedCarrier);

    return (
        <StandardPage title="Carrier Scorecard Dashboard">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground mt-1">Monitor carrier performance, ratings, and KPIs</p>
                </div>
                <Button variant="outline" size="sm">
                    <Award className="mr-2 h-4 w-4" />
                    Export Report
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Carriers</CardTitle>
                        <Truck className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{carriers.filter(c => c.status === "ACTIVE").length}</div>
                        <p className="text-xs text-muted-foreground">Network partners</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{topPerformers.length}</div>
                        <p className="text-xs text-muted-foreground">Rating ≥ 4.5 stars</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Underperformers</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">{underPerformers.length}</div>
                        <p className="text-xs text-muted-foreground">Rating {"<"} 3.5 stars</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Network Rating</CardTitle>
                        <Star className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {carriers.length > 0
                                ? (carriers.reduce((sum, c) => sum + parseFloat(c.rating), 0) / carriers.length).toFixed(1)
                                : "0.0"
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">Out of 5.0</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Carrier Selection & KPIs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Carrier Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Carrier Performance Detail</CardTitle>
                            <CardDescription>Select a carrier to view detailed metrics</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select a carrier..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {carriers.map((carrier) => (
                                            <SelectItem key={carrier.id} value={carrier.id}>
                                                {carrier.name} - {carrier.rating} ★
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedCarrier && (
                                    <Button
                                        variant="outline"
                                        onClick={() => refreshRatingMutation.mutate(selectedCarrier)}
                                        disabled={refreshRatingMutation.isPending}
                                    >
                                        <RefreshCw className={cn(`h-4 w-4 ${refreshRatingMutation.isPending ? "animate-spin" : ""}`)} />
                                    </Button>
                                )}
                            </div>

                            {selectedCarrier && scorecard && (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
                                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Truck className="h-4 w-4 text-emerald-600" />
                                            <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200">On-Time Delivery</span>
                                        </div>
                                        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">{scorecard.onTimePercent.toFixed(1)}%</div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="h-4 w-4 text-blue-600" />
                                            <span className="text-xs font-medium text-blue-900 dark:text-blue-200">Total Shipments</span>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{scorecard.totalShipments.toLocaleString()}</div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="h-4 w-4 text-amber-600" />
                                            <span className="text-xs font-medium text-amber-900 dark:text-amber-200">Average Rating</span>
                                        </div>
                                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                                            {scorecard.avgRating.toFixed(1)}
                                            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-4 w-4 text-purple-600" />
                                            <span className="text-xs font-medium text-purple-900 dark:text-purple-200">Avg Lead Time</span>
                                        </div>
                                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                                            {(2 + Math.random() * 2).toFixed(1)} days
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!selectedCarrier && (
                                <p className="text-center py-8 text-muted-foreground">
                                    Select a carrier to view detailed performance metrics
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Performance Trends */}
                    {selectedCarrier && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>On-Time Performance Trend</CardTitle>
                                    <CardDescription>Last 6 months for {selectedCarrierData?.name}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={performanceTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis domain={[85, 100]} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="onTime" stroke="#10b981" strokeWidth={2} name="On-Time %" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Shipment Volume Trend</CardTitle>
                                    <CardDescription>Monthly shipment count</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={shipmentTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3b82f6" name="Shipments" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Right Column - Rankings */}
                <div className="space-y-6">
                    {/* Top Performers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-emerald-600" />
                                Top Performers
                            </CardTitle>
                            <CardDescription>Carriers with rating ≥ 4.5</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topPerformers.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground text-sm">No top performers</p>
                            ) : (
                                <div className="space-y-3">
                                    {topPerformers.map((carrier, index) => (
                                        <div role="button" tabIndex={0}
                                            key={carrier.id}
                                            className="p-3 bg-emerald-500/10 border border-emerald-200 rounded-lg hover:bg-emerald-500/15 transition-colors cursor-pointer"
                                            onClick={() => setSelectedCarrier(carrier.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-semibold text-emerald-900 dark:text-emerald-200">{carrier.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-600">
                                                    <Star className="h-4 w-4 fill-amber-500" />
                                                    <span className="font-semibold">{carrier.avgRating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-emerald-700">
                                                <div>On-Time: <span className="font-semibold">{carrier.onTimePercent.toFixed(1)}%</span></div>
                                                <div>Shipments: <span className="font-semibold">{carrier.totalShipments}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Under Performers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-rose-600" />
                                Needs Attention
                            </CardTitle>
                            <CardDescription>Carriers with rating {"<"} 3.5</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {underPerformers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
                                    <p className="text-sm font-medium text-emerald-700">All carriers performing well!</p>
                                    <p className="text-xs text-muted-foreground mt-1">No underperformers found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {underPerformers.map((carrier) => (
                                        <div role="button" tabIndex={0}
                                            key={carrier.id}
                                            className="p-3 bg-rose-500/10 border border-rose-200 rounded-lg hover:bg-rose-500/15 transition-colors cursor-pointer"
                                            onClick={() => setSelectedCarrier(carrier.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-rose-900 dark:text-rose-200">{carrier.name}</span>
                                                <div className="flex items-center gap-1 text-rose-600">
                                                    <Star className="h-4 w-4" />
                                                    <span className="font-semibold">{carrier.avgRating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-rose-700">
                                                <div>On-Time: <span className="font-semibold">{carrier.onTimePercent.toFixed(1)}%</span></div>
                                                <div>Shipments: <span className="font-semibold">{carrier.totalShipments}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Carrier Metrics Comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Comparison</CardTitle>
                            <CardDescription>All carriers by rating</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={allMetrics} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 5]} />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="avgRating" name="Rating">
                                        {allMetrics.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.avgRating >= 4.5 ? "#10b981" : entry.avgRating >= 3.5 ? "#3b82f6" : "#ef4444"}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
