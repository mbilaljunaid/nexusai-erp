import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen, CheckSquare, Layers, FileText,
    Calendar, ArrowRightLeft, Settings, AlertCircle, TrendingUp, CheckCircle, Calculator
} from "lucide-react";
import { useLocation } from "wouter";

interface GLMetrics {
    unpostedJournals: number;
    pendingApprovals: number;
    outOfBalance: number;
    daysInPeriodClose: number;
}

export default function GLDashboard() {
    const [, setLocation] = useLocation();

    const { data: metrics, isLoading } = useQuery<GLMetrics>({
        queryKey: ["/api/gl/dashboard-metrics"],
        queryFn: async () => {
            // Fetch relevant GL metrics.
            const [journals] = await Promise.all([
                fetch("/api/gl/journals?limit=1000").then(r => r.json()).catch(() => ({ data: [] }))
            ]);

            const unpostedJournals = journals.data?.filter((j: any) =>
                j.status === "Draft" || j.status === "Unposted"
            ).length || 0;

            const pendingApprovals = journals.data?.filter((j: any) =>
                j.status === "Pending Approval" || j.status === "In Approval"
            ).length || 0;

            return {
                unpostedJournals,
                pendingApprovals,
                outOfBalance: 0, // Mock for now
                daysInPeriodClose: 3 // Mock for now
            };
        }
    });

    const { data: recentJournals } = useQuery<any>({
        queryKey: ["/api/gl/journals", 1, 10],
        queryFn: () => fetch("/api/gl/journals?limit=10&offset=0").then(r => r.json())
    });

    const navigationCards = [
        {
            title: "Journals",
            description: "Create, review, and post journal entries",
            icon: BookOpen,
            href: "/finance/gl/journals",
            color: "text-blue-600"
        },
        {
            title: "Approvals",
            description: "Review and approve pending journals",
            icon: CheckSquare,
            href: "/finance/gl/approvals",
            color: "text-green-600"
        },
        {
            title: "Revaluation",
            description: "Foreign currency revaluation processing",
            icon: ArrowRightLeft,
            href: "/finance/gl/revaluation",
            color: "text-emerald-600"
        },
        {
            title: "Consolidation",
            description: "Cross-ledger and multi-entity consolidation",
            icon: Layers,
            href: "/finance/gl/consolidation",
            color: "text-purple-600"
        },
        {
            title: "Allocations",
            description: "Mass allocations and recurring journals",
            icon: Calculator,
            href: "/finance/gl/allocations",
            color: "text-orange-600"
        },
        {
            title: "Reports",
            description: "Trial balance and financial reporting",
            icon: FileText,
            href: "/finance/gl/reports",
            color: "text-indigo-600"
        },
        {
            title: "Period Close",
            description: "Manage GL periods and close processes",
            icon: Calendar,
            href: "/finance/gl/period-close",
            color: "text-red-600"
        },
        {
            title: "Configuration",
            description: "Ledgers, charts of accounts, and rules",
            icon: Settings,
            href: "/finance/gl/setup",
            color: "text-gray-600"
        }
    ];

    return (
        <StandardPage
            title="General Ledger"
            description="Comprehensive financial record keeping and period management"
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "General Ledger" }]}
        >
            <div className="space-y-6">
                {/* Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unposted Journals</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics?.unpostedJournals || 0}</div>
                            <p className="text-xs text-muted-foreground">Draft or requiring posting</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                            <CheckCircle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics?.pendingApprovals || 0}</div>
                            <p className="text-xs text-muted-foreground">Awaiting manager review</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Out of Balance</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{metrics?.outOfBalance || 0}</div>
                            <p className="text-xs text-muted-foreground">Journals with unbalanced lines</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Days in Period Close</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics?.daysInPeriodClose || 0}</div>
                            <p className="text-xs text-muted-foreground">Current close duration</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Cards */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <CardTitle>Recent Journals</CardTitle>
                        <CardDescription>Last 10 journals processed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentJournals?.data?.slice(0, 10).map((journal: any) => (
                                <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                    key={journal.id}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                                    onClick={() => setLocation(`/finance/gl/journals/${journal.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium font-mono text-sm">{journal.name}</p>
                                            <p className="text-sm text-muted-foreground">{journal.description || 'No description'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold">{journal.ledgerId ? `Ledger: ${journal.ledgerId}` : 'Ledger Not Set'}</p>
                                        <Badge>{journal.status}</Badge>
                                    </div>
                                </div>
                            ))}
                            {(!recentJournals?.data || recentJournals.data.length === 0) && !isLoading && (
                                <div className="text-center py-4 text-muted-foreground">No recent journals found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
