
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SupplierDashboard() {
    const token = localStorage.getItem("supplier_token");

    // Fetch Supplier Profile
    const { data: supplier, isLoading } = useQuery({
        queryKey: ["/api/portal/supplier/me"],
        queryFn: async () => {
            const res = await fetch("/api/portal/supplier/me", {
                headers: { "x-portal-token": token || "" }
            });
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
        }
    });

    // Fetch Orders (Mock/Real) - We'll just fetch orders to count stats for now
    const { data: orders } = useQuery({
        queryKey: ["/api/portal/supplier/orders"],
        queryFn: async () => {
            const res = await fetch("/api/portal/supplier/orders", {
                headers: { "x-portal-token": token || "" }
            });
            if (!res.ok) throw new Error("Failed to fetch orders");
            return res.json();
        }
    });

    // Fetch Scorecard
    const { data: scorecard } = useQuery({
        queryKey: ["/api/portal/supplier/scorecard"],
        queryFn: async () => {
            const res = await fetch("/api/portal/supplier/scorecard", {
                headers: { "x-portal-token": token || "" }
            });
            if (!res.ok) throw new Error("Failed to fetch scorecard");
            return res.json();
        }
    });

    const openOrders = orders?.filter((o: any) => o.status === 'SENT' || o.status === 'OPEN').length || 0;

    if (isLoading) {
        return <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-[300px]" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
            </div>
        </div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Welcome, {supplier?.name}</h1>
                <div className="flex gap-2">
                    <Link href="/portal/supplier/performance">
                        <Button variant="outline">View Performance</Button>
                    </Link>
                    <Link href="/portal/supplier/orders">
                        <Button>View All Orders</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openOrders}</div>
                        <p className="text-xs text-muted-foreground">Action Required</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${scorecard?.deliveryScore >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {scorecard?.deliveryScore ?? 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Current Period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${scorecard?.qualityScore >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {scorecard?.qualityScore ?? 0}/100
                        </div>
                        <p className="text-xs text-muted-foreground">Defect Rate Calculated</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">No active disputes</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for activity steam */}
                        <div className="text-sm text-muted-foreground">No recent activity to display.</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
