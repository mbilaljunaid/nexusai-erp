import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText, Upload, CreditCard, Users, AlertCircle,
    CheckCircle, Clock, DollarSign, TrendingUp, Settings, Calendar, Building2
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";

interface APMetrics {
    openInvoices: number;
    overdueAmount: number;
    pendingPayments: number;
    suppliersOnHold: number;
    invoicesNeedingValidation: number;
    avgProcessingTime: number;
}

export default function APDashboard() {
    const [, setLocation] = useLocation();
    const [buId, setBuId] = useState<string>();
    const scopeHeaders = buildScopeHeaders({ "business-unit": buId });

    const { data: metrics, isLoading } = useQuery<APMetrics>({
        queryKey: ["/api/ap/dashboard-metrics", buId],
        queryFn: async () => {
            // Fetch metrics from multiple endpoints
            const [invoices, aging, batches] = await Promise.all([
                fetch("/api/ap/invoices?limit=1000", { headers: scopeHeaders }).then(r => r.json()),
                fetch("/api/ap/reports/aging", { headers: scopeHeaders }).then(r => r.json()),
                fetch("/api/ap/payment-batches", { headers: scopeHeaders }).then(r => r.json())
            ]);

            const openInvoices = invoices.data?.filter((i: any) =>
                i.invoiceStatus !== "Paid" && i.invoiceStatus !== "Cancelled"
            ).length || 0;

            const overdueAmount = aging.reduce((sum: number, item: any) =>
                sum + (item.over90 || 0), 0
            );

            const pendingPayments = batches.filter((b: any) =>
                b.status === "Draft" || b.status === "Selected"
            ).length || 0;

            return {
                openInvoices,
                overdueAmount,
                pendingPayments,
                suppliersOnHold: 0,
                invoicesNeedingValidation: invoices.data?.filter((i: any) =>
                    i.validationStatus === "Pending"
                ).length || 0,
                avgProcessingTime: 2.3
            };
        }
    });

    const { data: recentInvoices } = useQuery<any>({
        queryKey: ["/api/ap/invoices", 1, 10, buId],
        queryFn: () => fetch("/api/ap/invoices?limit=10&offset=0", { headers: scopeHeaders }).then(r => r.json())
    });

    const navigationCards = [
        {
            title: "Invoice Workbench",
            description: "Manage invoices, validation, and matching",
            icon: FileText,
            href: "/finance/ap/invoices",
            color: "text-blue-600"
        },
        {
            title: "Suppliers",
            description: "Manage supplier master data and credit holds",
            icon: Users,
            href: "/finance/ap/suppliers",
            color: "text-green-600"
        },
        {
            title: "Payment Batches",
            description: "Process payment runs and generate files",
            icon: CreditCard,
            href: "/finance/ap/payments",
            color: "text-purple-600"
        },
        {
            title: "Prepayments",
            description: "Manage and apply supplier prepayments",
            icon: DollarSign,
            href: "/finance/ap/prepayments",
            color: "text-emerald-600"
        },
        {
            title: "AI Invoice Capture",
            description: "Upload and extract invoice data with AI",
            icon: Upload,
            href: "/finance/ap/ai-capture",
            color: "text-orange-600"
        },
        {
            title: "Reports",
            description: "Aging, audit trail, and analytics",
            icon: TrendingUp,
            href: "/finance/ap/reports",
            color: "text-indigo-600"
        },
        {
            title: "Period Close",
            description: "Manage AP periods and readiness checks",
            icon: Calendar,
            href: "/finance/ap/period-close",
            color: "text-teal-600"
        },
        {
            title: "Configuration",
            description: "System parameters and distribution sets",
            icon: Settings,
            href: "/finance/ap/config",
            color: "text-gray-600"
        }
    ];


    return (
        <StandardPage
            title="Accounts Payable"
            description="Comprehensive AP management and automation"
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "AP" }]}
            actions={
                <EnterpriseContextSwitcher type="business-unit" value={buId} onChange={setBuId} />
            }
        >
            <div className="space-y-6">
                {/* Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open Invoices</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics?.openInvoices || 0}</div>
                            <p className="text-xs text-muted-foreground">Awaiting payment</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                ${(metrics?.overdueAmount || 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">90+ days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics?.pendingPayments || 0}</div>
                            <p className="text-xs text-muted-foreground">Batches to process</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Needs Validation</CardTitle>
                            <CheckCircle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics?.invoicesNeedingValidation || 0}</div>
                            <p className="text-xs text-muted-foreground">Invoices pending match</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Cards */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {navigationCards.map((card) => (
                            <Card
                                key={card.href}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setLocation(card.href)}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <card.icon className={`h-6 w-6 ${card.color}`} />
                                        <CardTitle className="text-base">{card.title}</CardTitle>
                                    </div>
                                    <CardDescription>{card.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Invoices</CardTitle>
                        <CardDescription>Last 10 invoices processed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentInvoices?.data?.slice(0, 10).map((invoice: any) => (
                                <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                    key={invoice.id}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                                    onClick={() => setLocation(`/finance/ap/invoices/${invoice.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium font-mono text-sm">{invoice.invoiceNumber}</p>
                                            <p className="text-sm text-muted-foreground">{invoice.supplier?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold">${parseFloat(invoice.invoiceAmount).toFixed(2)}</p>
                                        <Badge>{invoice.invoiceStatus}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
