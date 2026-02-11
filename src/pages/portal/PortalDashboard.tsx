
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import {
    DollarSign,
    FileText,
    AlertCircle,
    CheckCircle,
    Download,
    CreditCard,
    ArrowRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function PortalDashboard() {
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ["/api/portal/me"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/portal/me");
            return res.json();
        }
    });

    const { data: recentPayments, isLoading: paymentsLoading } = useQuery({
        queryKey: ["/api/portal/payments", { limit: 5 }],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/portal/payments?limit=5");
            return res.json();
        }
    });

    if (profileLoading) return <DashboardSkeleton />;

    const stats = profile?.stats || {};
    const hasOverdue = stats.overdue > 0;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>

            {/* Overdue Alert Banner */}
            {hasOverdue && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-800">Payment Overdue</h3>
                            <p className="text-sm text-red-700 mt-1">
                                You have <span className="font-bold">${stats.overdue.toLocaleString()}</span> in overdue payments.
                                Please make a payment to avoid service interruption.
                            </p>
                            <Link href="/portal/invoices">
                                <Button size="sm" variant="outline" className="mt-3 border-red-300 text-red-700 hover:bg-red-100">
                                    View Overdue Invoices <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

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
                    color={hasOverdue ? "text-red-600" : "text-gray-400"}
                    bg={hasOverdue ? "bg-red-50" : "bg-gray-50"}
                />
                <StatCard
                    title="Open Invoices"
                    value={stats.openInvoiceCount || 0}
                    icon={FileText}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Payments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Recent Payments</span>
                            <Link href="/portal/payments">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {paymentsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                            </div>
                        ) : recentPayments && recentPayments.length > 0 ? (
                            <div className="space-y-3">
                                {recentPayments.map((payment: any) => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{payment.receiptNumber}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.invoiceNumber || "No invoice"} • {format(new Date(payment.receiptDate), "MMM dd, yyyy")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-600">${Number(payment.amount).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-8">No recent payments</p>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            <Link href="/portal/invoices">
                                <Button variant="outline" className="w-full justify-start h-auto py-4">
                                    <FileText className="mr-3 h-5 w-5 text-blue-600" />
                                    <div className="text-left">
                                        <div className="font-semibold">View Invoices</div>
                                        <div className="text-xs text-muted-foreground">See all your invoices and payments</div>
                                    </div>
                                </Button>
                            </Link>

                            <Link href="/portal/statements">
                                <Button variant="outline" className="w-full justify-start h-auto py-4">
                                    <Download className="mr-3 h-5 w-5 text-purple-600" />
                                    <div className="text-left">
                                        <div className="font-semibold">Download Statements</div>
                                        <div className="text-xs text-muted-foreground">Get monthly account statements</div>
                                    </div>
                                </Button>
                            </Link>

                            <Link href="/portal/disputes">
                                <Button variant="outline" className="w-full justify-start h-auto py-4">
                                    <AlertCircle className="mr-3 h-5 w-5 text-amber-600" />
                                    <div className="text-left">
                                        <div className="font-semibold">Report an Issue</div>
                                        <div className="text-xs text-muted-foreground">Dispute an invoice or report a problem</div>
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
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
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
            </div>
        </div>
    );
}
