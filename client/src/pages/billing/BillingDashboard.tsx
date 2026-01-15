import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "wouter";

import { useQuery } from "@tanstack/react-query";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateBillingEventSheet } from "./components/CreateBillingEventSheet";

export default function BillingDashboard() {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ["billing-metrics"],
        queryFn: async () => {
            const res = await fetch("/api/billing/metrics");
            if (!res.ok) throw new Error("Failed to fetch metrics");
            return res.json();
        }
    });

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/finance">Finance</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Billing Command Center</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing Command Center</h1>
                    <p className="text-muted-foreground">Real-time overview of billing performance and exceptions.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/finance/billing/workbench">
                        <Button variant="outline" className="gap-2">
                            Go to Workbench <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <CreateBillingEventSheet />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unbilled Revenue</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : `$${(metrics?.unbilledRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </div>
                        <p className="text-xs text-muted-foreground">Pending Events</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invoiced (MTD)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : `$${(metrics?.invoicedMTD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </div>
                        <p className="text-xs text-muted-foreground">Current Month</p>
                    </CardContent>
                </Card>
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-destructive">Billing Suspense</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {isLoading ? "..." : (metrics?.suspenseItems || 0)} Items
                        </div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auto-Invoice Success</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {isLoading ? "..." : `${metrics?.autoInvoiceSuccessRate || 100}%`}
                        </div>
                        <p className="text-xs text-muted-foreground">Last 30 Batches</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Billing Trend</CardTitle>
                        <CardDescription>30-day billing volume vs. target</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-dashed border-2 rounded-md m-4">
                        <span className="text-muted-foreground">Chart Component Placeholder</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/finance/billing/workbench">
                            <Button variant="outline" className="w-full justify-start">Run Auto-Invoice</Button>
                        </Link>
                        <div className="w-full">
                            <style>{`.w-full > button { width: 100%; justify-content: flex-start; }`}</style>
                            <CreateBillingEventSheet />
                        </div>
                        <Button variant="outline" className="w-full justify-start">Manage Rules</Button>
                        <Button variant="outline" className="w-full justify-start">View Batches</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
