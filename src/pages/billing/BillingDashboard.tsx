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

            {/* Enterprise Billing Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Subscription Lifecycle */}
                <Link href="/finance/billing/subscriptions">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-500/20 bg-blue-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Subscription Lifecycle
                            </CardTitle>
                            <CardDescription>
                                Manage contract renewals, cancellations, and amendments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-blue-600">
                                    {isLoading ? "..." : (metrics?.activeSubscriptions || 0)}
                                </span>
                                <Button variant="ghost" size="sm">
                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Active Subscriptions</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Usage Metering */}
                <Link href="/finance/billing/usage-metering">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-500/20 bg-purple-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                Usage Metering
                            </CardTitle>
                            <CardDescription>
                                Track consumption, configure meters, and monitor thresholds
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-purple-600">
                                    {isLoading ? "..." : (metrics?.usageEvents || 0)}
                                </span>
                                <Button variant="ghost" size="sm">
                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Events This Month</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Dunning Configuration */}
                <Link href="/finance/billing/dunning">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-amber-500/20 bg-amber-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                Dunning & Collections
                            </CardTitle>
                            <CardDescription>
                                Configure automated payment reminders and escalations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-amber-600">
                                    {isLoading ? "..." : (metrics?.dunningTemplates || 0)}
                                </span>
                                <Button variant="ghost" size="sm">
                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Active Templates</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Revenue Waterfall */}
                <Link href="/finance/billing/revenue-waterfall">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-500/20 bg-green-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                Revenue Waterfall
                            </CardTitle>
                            <CardDescription>
                                ASC 606 revenue recognition and deferred tracking
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-green-600">
                                    {isLoading ? "..." : `$${((metrics?.deferredRevenue || 0) / 1000).toFixed(0)}K`}
                                </span>
                                <Button variant="ghost" size="sm">
                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Deferred Revenue</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Credit Memos */}
                <Link href="/finance/billing/credit-memos">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-500/20 bg-red-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-red-600" />
                                Credit Memos
                            </CardTitle>
                            <CardDescription>
                                Create and approve customer credits with workflow controls
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-red-600">
                                    {isLoading ? "..." : (metrics?.pendingCredits || 0)}
                                </span>
                                <Button variant="ghost" size="sm">
                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Pending Approval</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Billing Workbench */}
                <Link href="/finance/billing/workbench">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Billing Workbench
                            </CardTitle>
                            <CardDescription>
                                Process events, run auto-invoice, and manage profiles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold">
                                    {isLoading ? "..." : (metrics?.unbilledEvents || 0)}
                                </span>
                                <Button variant="ghost" size="sm">
                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Pending Events</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
