
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import {
    Activity,
    AlertTriangle,
    TrendingDown,
    ArrowUpRight,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function ArAnalytics() {
    const [selectedCustomer, setSelectedCustomer] = useState("");

    const { data: predictions, isLoading: loadingPredictions } = useQuery({
        queryKey: ["/api/ar/ai/predictions"],
        // For demo, we might need an endpoint that returns predictions for top overdue invoices
        // Since we only implemented POST /predict-payment, let's mock the fetch or create a GET endpoint?
        // Let's assume there is a GET endpoint or we use the POST with known IDs for demo.
        // For MVP, we need a list of invoices first.
        queryFn: async () => {
            const invRes = await apiRequest("GET", "/api/ar/invoices");
            const invoices = await invRes.json();
            const openInvoices = invoices.filter((i: any) => i.status !== "Paid" && i.status !== "Cancelled").slice(0, 5);
            if (openInvoices.length === 0) return [];

            const predRes = await apiRequest("POST", "/api/ar/ai/predict-payment", {
                invoiceIds: openInvoices.map((i: any) => i.id)
            });
            return predRes.json();
        }
    });

    const { data: advice, isLoading: loadingAdvice } = useQuery({
        queryKey: ["/api/ar/ai/collection-advice", selectedCustomer],
        enabled: !!selectedCustomer,
        queryFn: async () => (await apiRequest("GET", `/api/ar/ai/collection-advice/${selectedCustomer}`)).json()
    });

    // Mock Data for DSO Trend
    const data = [
        { name: 'Jan', dso: 45, industry: 40 },
        { name: 'Feb', dso: 42, industry: 40 },
        { name: 'Mar', dso: 48, industry: 40 },
        { name: 'Apr', dso: 40, industry: 40 },
        { name: 'May', dso: 38, industry: 40 },
        { name: 'Jun', dso: 35, industry: 40 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">AR Analytics & AI Insights</h1>
                <Button>
                    <Activity className="mr-2 h-4 w-4" />
                    Run Forecasting
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <FeatureCard
                    title="DSO (Days Sales Outstanding)"
                    value="35 Days"
                    desc="Improved by 12% vs last month"
                    icon={TrendingDown}
                    color="text-emerald-500"
                />
                <FeatureCard
                    title="Collection Effectiveness"
                    value="92%"
                    desc="Percentage of debt collected"
                    icon={Activity}
                    color="text-blue-500"
                />
                <FeatureCard
                    title="At Risk Amount"
                    value="$45,200"
                    desc="Predicted high likelihood of default"
                    icon={AlertTriangle}
                    color="text-red-500"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* DSO Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>DSO Optimization Trend</CardTitle>
                        <CardDescription>Comparison vs Industry Benchmark</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="dso" fill="#10b981" name="Our DSO" />
                                <Bar dataKey="industry" fill="#94a3b8" name="Industry Avg" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* AI Predictions List */}
                <Card>
                    <CardHeader>
                        <CardTitle>AI Payment Predictions</CardTitle>
                        <CardDescription>Forecasted payment dates for open invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingPredictions ? <div>Loading AI Insights...</div> : (
                            <div className="space-y-4">
                                {predictions?.map((p: any) => (
                                    <div key={p.invoiceId} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">Invoice {p.invoiceId.split('-')[1] || "..."}</p>
                                            <p className="text-xs text-muted-foreground">{p.reasoning}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                {new Date(p.predictedDate).toLocaleDateString()}
                                            </Badge>
                                            <p className="text-xs text-slate-500 mt-1">{(p.confidence * 100).toFixed(0)}% Conf.</p>
                                        </div>
                                    </div>
                                ))}
                                {(!predictions || predictions.length === 0) && <p className="text-muted-foreground">No open invoices to predict.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Collection Strategy */}
            <Card>
                <CardHeader>
                    <CardTitle>Recommended Collection Strategy</CardTitle>
                    <CardDescription>AI-driven next best actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <Input
                            placeholder="Check Customer ID..."
                            value={selectedCustomer}
                            onChange={e => setSelectedCustomer(e.target.value)}
                            className="max-w-xs"
                        />
                        {/* In real app, this would be a Combobox for selecting customer */}
                    </div>

                    {selectedCustomer && !loadingAdvice && advice && (
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border">
                            <div className={`p-3 rounded-full ${advice.priority === "High" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                                }`}>
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg flex items-center gap-2">
                                    Recommended Action: {advice.action}
                                    <Badge variant={advice.priority === "High" ? "destructive" : "default"}>{advice.priority} Priority</Badge>
                                </h4>
                                <p className="text-slate-600 mt-1">{advice.reasoning}</p>
                            </div>
                        </div>
                    )}
                    {!selectedCustomer && (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <Search className="h-8 w-8 mb-2 opacity-50" />
                            <p>Select a customer to view specific collection recommendations</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function FeatureCard({ title, value, desc, icon: Icon, color }: any) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-2 py-1 rounded">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> +12%
                    </span>
                </div>
                <div>
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-sm font-medium text-muted-foreground">{title}</div>
                    <div className="text-xs text-slate-400 mt-1">{desc}</div>
                </div>
            </CardContent>
        </Card>
    );
}
