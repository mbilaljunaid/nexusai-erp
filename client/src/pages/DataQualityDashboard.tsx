
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, AlertTriangle, CheckCircle, Database, Package } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface DQStats {
    totalParties: number;
    totalItems: number;
    openDuplicateSets: number;
    resolvedDuplicateSets: number;
    dataHealthScore: number;
}

export default function DataQualityDashboard() {
    const [, setLocation] = useLocation();

    const { data: stats, isLoading } = useQuery<DQStats>({
        queryKey: ["/api/mdm/dq-dashboard/stats"],
    });

    if (isLoading) {
        return (
            <StandardPage title="Data Quality Dashboard">
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </StandardPage>
        );
    }

    const chartData = [
        { name: "Duplicate Sets", Open: stats?.openDuplicateSets || 0, Resolved: stats?.resolvedDuplicateSets || 0 }
    ];

    return (
        <StandardPage
            title="Data Quality Dashboard"
            description="Monitor the health of your master data."
            breadcrumbs={[{ label: "MDM", href: "/mdm/governance" }, { label: "DQ Dashboard" }]}
            actions={
                <Button variant="outline" onClick={() => setLocation("/mdm/duplicates")}>
                    Go to Merge Console
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Data Health Score</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.dataHealthScore || 100}%</div>
                        <p className="text-xs text-muted-foreground">Overall system health</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Parties</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalParties || 0}</div>
                        <p className="text-xs text-muted-foreground">Organizations & Persons</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
                        <p className="text-xs text-muted-foreground">Products & Services</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Duplicates</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.openDuplicateSets || 0}</div>
                        <p className="text-xs text-muted-foreground">Sets waiting for review</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Duplicate Resolution Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Open" fill="#f59e0b" />
                                <Bar dataKey="Resolved" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
