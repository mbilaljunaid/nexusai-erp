import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Activity, AlertTriangle, TrendingUp, RefreshCw, FileText } from "lucide-react";
import { Link } from "wouter";

import { useQuery } from "@tanstack/react-query";
import { CreateBillingEventSheet } from "./components/CreateBillingEventSheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function BillingDashboard() {
    const { businessUnitId } = useEnterpriseStore();
    const { data: metrics, isLoading } = useQuery<any>({
        queryKey: ["billing-metrics", businessUnitId],
        queryFn: async () => {
            const res = await fetch("/api/billing/metrics", {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) throw new Error("Failed to fetch metrics");
            return res.json();
        }
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const navigationCards = [
        {
            title: "Subscription Lifecycle",
            description: "Manage contract renewals, cancellations, and amendments",
            icon: RefreshCw,
            href: "/finance/billing/subscriptions",
            color: "text-blue-600"
        },
        {
            title: "Usage Metering",
            description: "Track consumption, configure meters, and monitor thresholds",
            icon: TrendingUp,
            href: "/finance/billing/usage-metering",
            color: "text-purple-600"
        },
        {
            title: "Dunning & Collections",
            description: "Configure automated payment reminders and escalations",
            icon: AlertTriangle,
            href: "/finance/billing/dunning",
            color: "text-amber-600"
        },
        {
            title: "Revenue Waterfall",
            description: "ASC 606 revenue recognition and deferred tracking",
            icon: DollarSign,
            href: "/finance/billing/revenue-waterfall",
            color: "text-green-600"
        },
        {
            title: "Credit Memos",
            description: "Create and approve customer credits with workflow controls",
            icon: FileText,
            href: "/finance/billing/credit-memos",
            color: "text-red-600"
        },
        {
            title: "Billing Workbench",
            description: "Process events, run auto-invoice, and manage profiles",
            icon: Activity,
            href: "/finance/billing/workbench",
            color: "text-indigo-600"
        }
    ];

    return (
        <StandardPage
            title="Billing Command Center"
            description="Real-time overview of billing performance and exceptions."
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Billing Command Center" }]}
            actions={
                <div className="flex gap-2">
                    <Link href="/finance/billing/workbench">
                        <Button variant="outline" className="gap-2">
                            Go to Workbench <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <CreateBillingEventSheet />
                </div>
            }
        >
            <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unbilled Revenue</CardTitle>
                            <Activity className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? "..." : formatCurrency(metrics?.unbilledRevenue || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Pending Events</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Invoiced (MTD)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? "..." : formatCurrency(metrics?.invoicedMTD || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Current Month</p>
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
                            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
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
                            <p className="text-xs text-muted-foreground mt-1">Last 30 Batches</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Cards */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {navigationCards.map((card) => (
                            <Link key={card.href} href={card.href}>
                                <Card className={cn(`cursor-pointer hover:shadow-md transition-shadow group h-full border-${card.color.split('-')[1]}-500/20 bg-${card.color.split('-')[1]}-500/5`)}>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className={cn(`p-2 rounded-lg bg-opacity-20 group-hover:bg-opacity-30 transition-colors ${card.color.replace('text-', 'bg-')}`)}>
                                                <card.icon className={cn(`h-6 w-6 ${card.color}`)} />
                                            </div>
                                            <CardTitle className="text-base">{card.title}</CardTitle>
                                        </div>
                                        <CardDescription className="mt-2">{card.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                                            <span>
                                                {card.title === "Subscription Lifecycle" && (isLoading ? "..." : `${metrics?.activeSubscriptions || 0} active`)}
                                                {card.title === "Usage Metering" && (isLoading ? "..." : `${metrics?.usageEvents || 0} events`)}
                                                {card.title === "Dunning & Collections" && (isLoading ? "..." : `${metrics?.dunningTemplates || 0} templates`)}
                                                {card.title === "Revenue Waterfall" && (isLoading ? "..." : `$${((metrics?.deferredRevenue || 0) / 1000).toFixed(0)}K deferred`)}
                                                {card.title === "Credit Memos" && (isLoading ? "..." : `${metrics?.pendingCredits || 0} pending`)}
                                                {card.title === "Billing Workbench" && (isLoading ? "..." : `${metrics?.unbilledEvents || 0} events`)}
                                            </span>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                View <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </StandardPage>
    );
}
