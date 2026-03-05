import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { TrendingUp, Users, DollarSign, CheckCircle, Target, Clock, TrendingDown, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function CrmAnalyticsDashboard() {
    const { data, isLoading } = useQuery<any>({
        queryKey: ["/api/crm/analytics/metrics"],
        queryFn: () => fetch("/api/crm/analytics/metrics").then(r => r.json())
    });

    const { data: pipelineVelocity = [] } = useQuery<any>({
        queryKey: ["/api/crm/analytics/pipeline-velocity"],
        queryFn: () => fetch("/api/crm/analytics/pipeline-velocity").then(r => r.json())
    });

    const { data: revenueWaterfall = [] } = useQuery<any>({
        queryKey: ["/api/crm/analytics/revenue-waterfall"],
        queryFn: () => fetch("/api/crm/analytics/revenue-waterfall").then(r => r.json())
    });

    const { data: repPerformance = [] } = useQuery<any>({
        queryKey: ["/api/crm/analytics/rep-performance"],
        queryFn: () => fetch("/api/crm/analytics/rep-performance").then(r => r.json())
    });

    const { data: forecastAccuracy } = useQuery<any>({
        queryKey: ["/api/crm/forecast/accuracy"],
        queryFn: () => fetch("/api/crm/forecast/accuracy").then(r => r.json())
    });

    const { data: productPerformance = [] } = useQuery<any>({
        queryKey: ["/api/crm/analytics/product-performance"],
        queryFn: () => fetch("/api/crm/analytics/product-performance").then(r => r.json())
    });

    if (isLoading) return <div className="p-8">Loading Analytics...</div>;

    const { pipeline = [], winRate, service, leaderboard = [] } = data || {};
    const totalPipelineValue = pipeline.reduce((acc: number, curr: any) => acc + curr.totalValue, 0);

    return (
        <StandardPage
            title="CRM Analytics"
            description="Executive dashboard with pipeline velocity, revenue insights, and performance metrics"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Analytics" }
            ]}
        >
            <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Total Pipeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">${(totalPipelineValue / 1000000).toFixed(1)}M</div>
                            <p className="text-xs text-green-700">+12% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Win Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{winRate?.rate || 0}%</div>
                            <p className="text-xs text-blue-700">Based on {winRate?.totalClosed || 0} deals</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Avg Sales Cycle
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">42 days</div>
                            <p className="text-xs text-purple-700">5 days faster than Q3</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Forecast Accuracy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{forecastAccuracy?.accuracy || 0}%</div>
                            <p className="text-xs text-amber-700">{forecastAccuracy?.variance || "N/A"} variance</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="pipeline" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                    </TabsList>

                    {/* Pipeline Tab */}
                    <TabsContent value="pipeline" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Pipeline by Stage */}
                            <Card className="border-t-4 border-t-blue-500">
                                <CardHeader>
                                    <CardTitle>Pipeline by Stage</CardTitle>
                                    <CardDescription>Value distribution across sales stages</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={pipeline}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="stage" fontSize={12} />
                                            <YAxis fontSize={12} tickFormatter={(value) => `$${value}`} />
                                            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]} />
                                            <Bar dataKey="totalValue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Pipeline Velocity */}
                            <Card className="border-t-4 border-t-purple-500">
                                <CardHeader>
                                    <CardTitle>Pipeline Velocity</CardTitle>
                                    <CardDescription>Average days spent in each stage</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={pipelineVelocity} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" fontSize={12} />
                                            <YAxis dataKey="stage" type="category" fontSize={12} width={100} />
                                            <Tooltip formatter={(value: number) => [`${value} days`, "Avg Duration"]} />
                                            <Bar dataKey="avgDays" fill="#a855f7" radius={[0, 8, 8, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Revenue Tab */}
                    <TabsContent value="revenue" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue Waterfall */}
                            <Card className="border-t-4 border-t-green-500">
                                <CardHeader>
                                    <CardTitle>Revenue Waterfall</CardTitle>
                                    <CardDescription>Monthly revenue components</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={revenueWaterfall}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="category" fontSize={12} />
                                            <YAxis fontSize={12} tickFormatter={(value) => `$${value}K`} />
                                            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}K`, "Revenue"]} />
                                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                                {revenueWaterfall.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Forecast vs Actuals */}
                            <Card className="border-t-4 border-t-amber-500">
                                <CardHeader>
                                    <CardTitle>Forecast vs. Actuals</CardTitle>
                                    <CardDescription>Quarterly forecast accuracy</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={forecastAccuracy?.monthly || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" fontSize={12} />
                                            <YAxis fontSize={12} tickFormatter={(value) => `$${value}K`} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} name="Forecast" />
                                            <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} name="Actual" />
                                            <Legend />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Sales Rep Leaderboard */}
                            <Card className="border-t-4 border-t-blue-500">
                                <CardHeader>
                                    <CardTitle>Sales Rep Leaderboard</CardTitle>
                                    <CardDescription>Top performers by quota attainment</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Rank</TableHead>
                                                <TableHead>Rep</TableHead>
                                                <TableHead className="text-right">Quota %</TableHead>
                                                <TableHead className="text-right">Revenue</TableHead>
                                                <TableHead className="text-right">Win Rate</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {repPerformance.map((rep: any, index: number) => (
                                                <TableRow key={rep.id}>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 font-bold text-xs">
                                                            {index + 1}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{rep.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Progress value={rep.quotaAttainment} className="w-16" />
                                                            <span className="font-bold">{rep.quotaAttainment}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">${(rep.revenue / 1000).toFixed(0)}K</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant={rep.winRate >= 70 ? "default" : "outline"}>
                                                            {rep.winRate}%
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Regional Performance */}
                            <Card className="border-t-4 border-t-purple-500">
                                <CardHeader>
                                    <CardTitle>Regional Performance</CardTitle>
                                    <CardDescription>Revenue by territory</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            { region: "North America", revenue: 2400000, growth: 15, color: "bg-blue-500" },
                                            { region: "Europe", revenue: 1800000, growth: 22, color: "bg-green-500" },
                                            { region: "Asia Pacific", revenue: 1200000, growth: 35, color: "bg-purple-500" },
                                            { region: "Latin America", revenue: 600000, growth: 8, color: "bg-amber-500" }
                                        ].map((region) => (
                                            <div key={region.region} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{region.region}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm">${(region.revenue / 1000000).toFixed(1)}M</span>
                                                        <Badge variant="outline" className="text-green-700">
                                                            <TrendingUp className="h-3 w-3 mr-1" />
                                                            +{region.growth}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Progress value={(region.revenue / 2400000) * 100} className="h-2" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Products Tab */}
                    <TabsContent value="products" className="space-y-6">
                        <Card className="border-t-4 border-t-green-500">
                            <CardHeader>
                                <CardTitle>Product Performance Matrix</CardTitle>
                                <CardDescription>Revenue, deals, and average deal size by product</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Line</TableHead>
                                            <TableHead className="text-right">Revenue</TableHead>
                                            <TableHead className="text-right">Deals</TableHead>
                                            <TableHead className="text-right">Avg Deal Size</TableHead>
                                            <TableHead className="text-right">Growth</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {productPerformance.map((product: any) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell className="text-right font-mono">${(product.revenue / 1000).toFixed(0)}K</TableCell>
                                                <TableCell className="text-right">{product.dealCount}</TableCell>
                                                <TableCell className="text-right font-mono">${(product.avgDealSize / 1000).toFixed(0)}K</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={product.growth >= 0 ? "default" : "destructive"}>
                                                        {product.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                                        {product.growth >= 0 ? "+" : ""}{product.growth}%
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
