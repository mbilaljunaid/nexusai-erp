import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, DollarSign, Target, BarChart3, Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { StandardPage } from "@/components/layout/StandardPage";

export default function RevenueIntelligence() {
    const { data: analytics } = useQuery<any>({
        queryKey: ["/api/crm/revenue-intelligence"],
        queryFn: () => apiRequest("GET", "/api/crm/revenue-intelligence").then(res => res.json()),
    });

    return (
        <StandardPage
            title="Revenue Intelligence"
            description="AI-powered revenue forecasting and insights"
            actions={
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            }
        >

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Forecasted Revenue</div>
                        <div className="text-3xl font-bold mt-1">${analytics?.forecastedRevenue?.toLocaleString()}</div>
                        <div className="text-sm text-green-600 mt-1">+12% vs last quarter</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Pipeline Value</div>
                        <div className="text-3xl font-bold mt-1">${analytics?.pipelineValue?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Win Rate</div>
                        <div className="text-3xl font-bold mt-1">{analytics?.winRate}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Avg Deal Size</div>
                        <div className="text-3xl font-bold mt-1">${analytics?.avgDealSize?.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Forecast (Next 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics?.forecast || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="actual" stroke="#8884d8" strokeWidth={2} />
                                <Line type="monotone" dataKey="forecast" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pipeline by Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics?.pipelineByStage || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="stage" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
