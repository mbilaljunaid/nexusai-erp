
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function ManufacturingDashboard() {
    // Hardcoded tenant for demo
    const tenantId = "tenant1";

    // Fetch real metrics from the Manufacturing Service 
    const { data: metrics, isLoading, error } = useQuery({
        queryKey: ["manufacturing", "dashboard", tenantId],
        queryFn: async () => {
            const res = await fetch(`/api/manufacturing/${tenantId}/dashboard`);
            if (!res.ok) throw new Error("Failed to fetch manufacturing metrics");
            return res.json();
        }
    });

    if (isLoading) {
        return <div className="p-8">Loading Manufacturing Insights...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-red-500">
                Error loading dashboard. Ensure Manufacturing Service (Port 5006) is running.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manufacturing Operations Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Active Production Orders"
                    value={metrics?.active_orders || 0}
                    icon={<Clock className="h-4 w-4 text-blue-500" />}
                    desc="Current WIP"
                />
                <MetricCard
                    title="Efficiency Rate (OEE)"
                    value={`${metrics?.efficiency_rate || 0}%`}
                    icon={<Activity className="h-4 w-4 text-green-500" />}
                    desc="Overall Equipment Effectiveness"
                />
                <MetricCard
                    title="Quality Score"
                    value={`${metrics?.quality_score || 0}%`}
                    icon={<CheckCircle className="h-4 w-4 text-purple-500" />}
                    desc="First Pass Yield"
                />
                <MetricCard
                    title="Pending Issues"
                    value={3}
                    icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    desc="Requires Attention"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Production efficienty Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full bg-secondary/20 rounded flex items-center justify-center">
                            (Chart Placeholder - Recharts Integration)
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Work Center Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Assembly Line Alpha</span>
                            <span className="text-green-500 font-bold">RUNNING</span>
                        </div>
                        <Progress value={85} className="h-2" />

                        <div className="flex items-center justify-between mt-4">
                            <span>Painting Station</span>
                            <span className="text-yellow-500 font-bold">MAINTENANCE</span>
                        </div>
                        <Progress value={0} className="h-2" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, desc }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </CardContent>
        </Card>
    );
}
