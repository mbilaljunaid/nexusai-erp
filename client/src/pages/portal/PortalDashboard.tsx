
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import {
    DollarSign,
    FileText,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalDashboard() {
    const { data: profile, isLoading } = useQuery({
        queryKey: ["/api/portal/me"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/portal/me");
            return res.json();
        }
    });

    if (isLoading) return <DashboardSkeleton />;

    const stats = profile?.stats || {};

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Outstanding"
                    value={`$${stats.outstanding?.toLocaleString() || "0.00"}`}
                    icon={DollarSign}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Overdue Amount"
                    value={`$${stats.overdue?.toLocaleString() || "0.00"}`}
                    icon={AlertCircle}
                    color="text-red-600"
                    bg="bg-red-50"
                />
                <StatCard
                    title="Open Invoices"
                    value={stats.openInvoiceCount || 0}
                    icon={FileText}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
            </div>

            {/* Recent Activity Mock */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No recent payments or new invoices in the last 7 days.</p>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <div className="text-2xl font-bold mt-1">{value}</div>
                </div>
                <div className={`h-12 w-12 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </CardContent>
        </Card>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
        </div>
    );
}
