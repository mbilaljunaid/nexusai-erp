import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DollarSign,
    TrendingUp,
    AlertCircle,
    RefreshCw,
    Upload,
    PlayCircle,
    BarChart3
} from "lucide-react";
import { Link } from "wouter";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { StandardPage } from "@/components/layout/StandardPage";

interface CashPosition {
    totalCash: number;
    availableCash: number;
    unreconciledItems: number;
    pendingSweeps: number;
    currency: string;
}

interface CashFlowData {
    date: string;
    balance: number;
    forecast: number;
}

export default function CashManagementDashboard() {
    // Fetch cash position
    const { data: cashPosition, isLoading: positionLoading } = useQuery<CashPosition>({
        queryKey: ["/api/finance/cash/position"],
        queryFn: async () => {
            const res = await fetch("/api/finance/cash/position");
            if (!res.ok) throw new Error("Failed to fetch cash position");
            return res.json();
        }
    });

    // Fetch cash flow forecast
    const { data: cashFlow, isLoading: flowLoading } = useQuery<CashFlowData[]>({
        queryKey: ["/api/finance/cash/forecast"],
        queryFn: async () => {
            const res = await fetch("/api/finance/cash/forecast");
            if (!res.ok) throw new Error("Failed to fetch cash forecast");
            return res.json();
        }
    });

    // Fetch recent reconciliation activity
    const { data: recentActivity = [] } = useQuery({
        queryKey: ["/api/finance/cash/accounts"],
        queryFn: async () => {
            const res = await fetch("/api/finance/cash/accounts");
            if (!res.ok) throw new Error("Failed to fetch accounts");
            const accounts = await res.json();
            return accounts.slice(0, 5); // Show only 5 most recent
        }
    });

    const formatCurrency = (amount: number, currency: string = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    };

    const navigationCards = [
        {
            title: "Bank Reconciliation",
            description: "Import and reconcile statements",
            icon: Upload,
            href: "/finance/cash/reconciliation",
            color: "text-blue-600"
        },
        {
            title: "Currency Revaluation",
            description: "Run FX revaluation",
            icon: RefreshCw,
            href: "/finance/cash/revaluation",
            color: "text-purple-600"
        },
        {
            title: "ZBA Management",
            description: "Execute automated sweeps",
            icon: PlayCircle,
            href: "/finance/cash/zba",
            color: "text-green-600"
        },
        {
            title: "Cash Forecasting",
            description: "Analyze cash flow projections",
            icon: BarChart3,
            href: "/finance/cash/forecasting",
            color: "text-amber-600"
        }
    ];

    return (
        <StandardPage
            title="Cash Management"
            description="Treasury operations and cash position monitoring"
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Cash Management" }]}
            actions={
                <div className="flex gap-2">
                    <Link href="/finance/cash/reconciliation">
                        <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Import Statement
                        </Button>
                    </Link>
                    <Link href="/finance/cash/zba">
                        <Button variant="outline">
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Execute ZBA Sweeps
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Alert Banner for Unreconciled Items */}
                {cashPosition && cashPosition.unreconciledItems > 0 && (
                    <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-orange-900 dark:text-orange-100">
                                        {cashPosition.unreconciledItems} unreconciled items require attention
                                    </p>
                                    <p className="text-sm text-orange-700 dark:text-orange-300">
                                        Review and reconcile pending transactions to ensure accurate cash position
                                    </p>
                                </div>
                                <Link href="/finance/cash/reconciliation">
                                    <Button variant="outline" size="sm">
                                        Review Items
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Metric Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cash</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {positionLoading ? (
                                <div className="h-8 bg-muted animate-pulse rounded" />
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(cashPosition?.totalCash || 0, cashPosition?.currency)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Across all bank accounts
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            {positionLoading ? (
                                <div className="h-8 bg-muted animate-pulse rounded" />
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatCurrency(cashPosition?.availableCash || 0, cashPosition?.currency)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Available for operations
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unreconciled Items</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            {positionLoading ? (
                                <div className="h-8 bg-muted animate-pulse rounded" />
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {cashPosition?.unreconciledItems || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Requiring attention
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Sweeps</CardTitle>
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            {positionLoading ? (
                                <div className="h-8 bg-muted animate-pulse rounded" />
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {cashPosition?.pendingSweeps || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ZBA sweeps queued
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Cards */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {navigationCards.map((card) => (
                            <Link key={card.href} href={card.href}>
                                <Card className="cursor-pointer hover:shadow-md transition-shadow group h-full">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-opacity-10 group-hover:bg-opacity-20 transition-colors ${card.color.replace('text-', 'bg-')}`}>
                                                <card.icon className={`h-6 w-6 ${card.color}`} />
                                            </div>
                                            <CardTitle className="text-base">{card.title}</CardTitle>
                                        </div>
                                        <CardDescription className="mt-2">{card.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Cash Flow Trend Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Cash Flow Trend</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    30-day actual vs. forecast
                                </p>
                            </div>
                            <Link href="/finance/cash/forecasting">
                                <Button variant="outline" size="sm">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Forecasting
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {flowLoading ? (
                            <div className="h-64 bg-muted animate-pulse rounded" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={cashFlow || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        fontSize={12}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => formatCurrency(value, cashPosition?.currency)}
                                        fontSize={12}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value, cashPosition?.currency)}
                                        labelFormatter={formatDate}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        name="Actual Balance"
                                        dot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="forecast"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        name="Forecast"
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Reconciliation Activity */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Account Activity</CardTitle>
                            <Link href="/finance/cash/reconciliation">
                                <Button variant="ghost" size="sm">
                                    View All
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No recent activity
                                </p>
                            ) : (
                                recentActivity.map((account: any) => (
                                    <div
                                        key={account.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{account.accountName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {account.bankName} • {account.accountNumber}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {formatCurrency(account.balance || 0, account.currency)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Last reconciled: {account.lastReconciledDate
                                                    ? new Date(account.lastReconciledDate).toLocaleDateString()
                                                    : "Never"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
