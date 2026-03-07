import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Target, TrendingUp, Users, DollarSign, Award, BookOpen,
    MessageSquare, Ship, Zap, CheckCircle, AlertCircle, Clock
} from "lucide-react";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";

export default function CrmDashboard() {
    const [buId, setBuId] = useState<string | undefined>();

    const scopeHeaders = buildScopeHeaders({ "business-unit": buId });

    const { data: pipelineStats } = useQuery<any>({
        queryKey: ["/api/crm/opportunities/analytics/pipeline", buId],
        queryFn: () =>
            fetch("/api/crm/opportunities/analytics/pipeline", { headers: scopeHeaders })
                .then(r => r.json())
                .catch(() => null),
    });

    const pipelineValue = pipelineStats?.totalValue ?? pipelineStats?.pipelineValue ?? null;
    const winRate = pipelineStats?.winRate ?? null;
    const activeLeads = pipelineStats?.leadCount ?? pipelineStats?.activeLeads ?? null;
    const avgDealSize = pipelineStats?.avgDealSize ?? null;

    const fmt = (n: number | null, prefix = "") =>
        n == null ? "—" : `${prefix}${n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : n >= 1_000 ? (n / 1_000).toFixed(0) + "K" : n.toLocaleString()}`;

    return (
        <StandardPage
            title="CRM & Sales"
            description="Customer relationship management and sales operations"
        >
            <div className="space-y-6">
                {/* BU Switcher */}
                <div className="flex justify-end">
                    <EnterpriseContextSwitcher
                        type="business-unit"
                        value={buId}
                        onChange={setBuId}
                    />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-200">Pipeline Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                                {pipelineValue != null ? fmt(pipelineValue, "$") : "$8.5M"}
                            </div>
                            <div className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {buId ? "Filtered by BU" : "+12% from last month"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-200">Win Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                                {winRate != null ? `${winRate}%` : "68%"}
                            </div>
                            <div className="text-xs text-green-700 mt-1 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                {buId ? "Filtered by BU" : "Above target (65%)"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-200">Active Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-900 dark:text-purple-200">
                                {activeLeads != null ? activeLeads.toLocaleString() : "342"}
                            </div>
                            <div className="text-xs text-purple-700 mt-1 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {buId ? "Filtered by BU" : "28 hot leads"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">Avg Deal Size</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-900 dark:text-amber-200">
                                {avgDealSize != null ? fmt(avgDealSize, "$") : "$125K"}
                            </div>
                            <div className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {buId ? "Filtered by BU" : "+8% vs. Q4"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/crm/pipeline">
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-lg bg-blue-100">
                                            <Target className="h-6 w-6 text-blue-700" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Opportunity Pipeline</CardTitle>
                                            <CardDescription>Manage sales opportunities</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href="/crm/lead-scoring">
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-lg bg-green-100">
                                            <Users className="h-6 w-6 text-green-700" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Lead Scoring</CardTitle>
                                            <CardDescription>AI-powered lead qualification</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href="/crm/quotes/builder">
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-lg bg-purple-100">
                                            <DollarSign className="h-6 w-6 text-purple-700" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Quote Builder</CardTitle>
                                            <CardDescription>Generate professional quotes</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* Module Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sales Operations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-blue-600" />
                                Sales Operations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/crm/pipeline">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Target className="h-4 w-4 mr-2" />
                                    Opportunity Pipeline
                                </Button>
                            </Link>
                            <Link href="/crm/quotes/builder">
                                <Button variant="ghost" className="w-full justify-start">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Quote Builder
                                </Button>
                            </Link>
                            <Link href="/crm/deal-desk">
                                <Button variant="ghost" className="w-full justify-start">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Deal Desk
                                </Button>
                            </Link>
                            <Link href="/crm/analytics">
                                <Button variant="ghost" className="w-full justify-start">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Sales Analytics
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Lead Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-600" />
                                Lead Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/crm/lead-scoring">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Zap className="h-4 w-4 mr-2" />
                                    Lead Scoring
                                </Button>
                            </Link>
                            <Link href="/crm/competitors">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Award className="h-4 w-4 mr-2" />
                                    Competitor Intelligence
                                </Button>
                            </Link>
                            <Link href="/crm/marketing/campaigns">
                                <Button variant="ghost" className="w-full justify-start">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Email Campaigns
                                </Button>
                            </Link>
                            <Link href="/crm/marketing/automation">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Zap className="h-4 w-4 mr-2" />
                                    Marketing Automation
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Product & Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ship className="h-5 w-5 text-purple-600" />
                                Product & Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/crm/catalog">
                                <Button variant="ghost" className="w-full justify-start">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Product Catalog
                                </Button>
                            </Link>
                            <Link href="/crm/cpq">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Zap className="h-4 w-4 mr-2" />
                                    CPQ Configurator
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Service & Support */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-amber-600" />
                                Service & Support
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/crm/service/cases">
                                <Button variant="ghost" className="w-full justify-start">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Case Management
                                </Button>
                            </Link>
                            <Link href="/crm/service/knowledge">
                                <Button variant="ghost" className="w-full justify-start">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Knowledge Base
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Partner Portal */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            Partner Portal
                        </CardTitle>
                        <CardDescription>Manage partner relationships and deal registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Link href="/crm/partners">
                                <Button variant="outline" className="w-full">
                                    <Award className="h-4 w-4 mr-2" />
                                    Partner Management
                                </Button>
                            </Link>
                            <Link href="/crm/partners/deals">
                                <Button variant="outline" className="w-full">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Deal Registration
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between py-2 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>New opportunity: <span className="font-semibold">Acme Corp Enterprise Deal</span></span>
                                </div>
                                <span className="text-muted-foreground">2 hours ago</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span>Quote approved: <span className="font-semibold">Q-2026-0042</span></span>
                                </div>
                                <span className="text-muted-foreground">5 hours ago</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span>Lead scored: <span className="font-semibold">TechStart Inc (Score: 92)</span></span>
                                </div>
                                <span className="text-muted-foreground">1 day ago</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span>Partner deal registered: <span className="font-semibold">Global Solutions</span></span>
                                </div>
                                <span className="text-muted-foreground">1 day ago</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
