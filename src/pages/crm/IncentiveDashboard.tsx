import { formatDate } from "@/lib/dateUtils";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Wallet, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

interface Commission {
    id: string;
    baseAmount: string;
    commissionAmount: string;
    status: string;
    generatedAt: string;
    opportunityId: string; // Ideally fetch Opportunity Name via join, but ID for now
}

export default function IncentiveDashboard() {
    // Mock User ID for now (Phase 1 Auth isn't fully context-aware in this draft)
    // In production, useAuth() -> user.id
    const userId = "current-user-id";

    const { data: commissions, isLoading } = useQuery<Commission[]>({
        queryKey: ["/api/crm/commissions", "user", userId],
        queryFn: async () => {
            // Fetch for "mock" user or just all for demo if endpoint allows
            // Actually, let's just fetch from the endpoint I created: /api/crm/commissions/user/:id
            // I'll need a real user ID or the endpoint will be empty.
            // For UI dev, I'll return empty list if no ID, or mock logic.
            // Let's assume the endpoint returns mock data if ID is 'demo'
            const res = await fetch(`/api/crm/commissions/user/${userId}`);
            if (!res.ok) return [];
            return res.json();
        }
    });

    // Calculate Metrics
    const totalEarned = commissions?.reduce((sum, c) => sum + Number(c.commissionAmount), 0) || 0;
    const pendingPayout = commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + Number(c.commissionAmount), 0) || 0;
    const closedDeals = commissions?.length || 0;

    return (
        <StandardPage
            title="Incentive Compensation"
            description="Track your commission earnings and payouts."
            actions={
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-base px-4 py-1">
                        Current Plan: Standard 10%
                    </Badge>
                </div>
            }
        >

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${formatNumber(totalEarned)}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">${formatNumber(pendingPayout)}</div>
                        <p className="text-xs text-muted-foreground">Next payout date: Feb 15</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commissionable Deals</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{closedDeals}</div>
                        <p className="text-xs text-muted-foreground">Year to Date</p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Transaction List */}
            <Card>
                <CardHeader>
                    <CardTitle>Commission History</CardTitle>
                    <CardDescription>Detailed breakdown of your earned commissions per deal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Opportunity ID</TableHead>
                                <TableHead>Deal Value</TableHead>
                                <TableHead>Commission</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">Loading metrics...</TableCell>
                                </TableRow>
                            ) : commissions?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No commissions found. Close some deals to get paid!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                commissions?.map((comm) => (
                                    <TableRow key={comm.id}>
                                        <TableCell>{formatDate(comm.generatedAt)}</TableCell>
                                        <TableCell className="font-mono text-xs">{comm.opportunityId.substring(0, 8)}...</TableCell>
                                        <TableCell>${formatNumber(Number(comm.baseAmount))}</TableCell>
                                        <TableCell className="font-bold text-green-600">+${formatNumber(Number(comm.commissionAmount))}</TableCell>
                                        <TableCell>
                                            <Badge variant={comm.status === 'paid' ? 'default' : 'secondary'}>
                                                {comm.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
