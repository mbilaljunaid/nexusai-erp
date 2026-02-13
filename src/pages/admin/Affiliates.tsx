import React, { useMemo, useState } from 'react';
import { Users, DollarSign, TrendingUp, Link2, Award, BarChart3, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAffiliates, useUpdateAffiliateStatus } from '@/hooks/admin/useAdminData';
import CreateAffiliateDialog from '@/components/admin/dialogs/CreateAffiliateDialog';

export default function Affiliates() {
    const { data: affiliates = [], isLoading, error } = useAffiliates();
    const updateStatusMutation = useUpdateAffiliateStatus();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Calculate real-time stats
    const stats = useMemo(() => {
        const activeCount = affiliates.filter((a: any) => a.status === 'active').length;
        const totalReferrals = affiliates.reduce((sum: number, a: any) => sum + (a.totalReferrals || 0), 0);
        const totalCommission = affiliates.reduce((sum: number, a: any) => sum + (a.totalCommission || 0), 0);
        const conversions = affiliates.reduce((sum: number, a: any) => sum + (a.conversions || 0), 0);
        const conversionRate = totalReferrals > 0 ? (conversions / totalReferrals) * 100 : 0;

        return {
            activeCount,
            totalReferrals,
            totalCommission,
            conversionRate,
        };
    }, [affiliates]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        await updateStatusMutation.mutateAsync({ id, status: newStatus });
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Affiliates</h1>
                        <p className="text-muted-foreground">Manage affiliate partners and commission tracking</p>
                    </div>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Users className="w-4 h-4 mr-2" />
                        Add Affiliate
                    </Button>
                </div>

                {/* Dialog */}
                <CreateAffiliateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

                {/* Stats */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold">{stats.activeCount}</div>
                                        <div className="text-sm text-muted-foreground">Active Affiliates</div>
                                    </div>
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold">{stats.totalReferrals}</div>
                                        <div className="text-sm text-muted-foreground">Total Referrals</div>
                                    </div>
                                    <Link2 className="w-8 h-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold">${(stats.totalCommission / 1000).toFixed(1)}k</div>
                                        <div className="text-sm text-muted-foreground">Total Commission</div>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
                                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabs */}
                <Tabs defaultValue="affiliates">
                    <TabsList>
                        <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
                        <TabsTrigger value="commissions">Commissions</TabsTrigger>
                        <TabsTrigger value="tiers">Tiers & Rewards</TabsTrigger>
                    </TabsList>

                    {/* Affiliates List */}
                    <TabsContent value="affiliates" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Affiliate Partners</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Loading State */}
                                {isLoading && (
                                    <div className="flex items-center justify-center p-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="p-6 text-center text-red-600">
                                        Failed to load affiliates. Please try again.
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !error && affiliates.length === 0 && (
                                    <div className="p-12 text-center">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-muted-foreground">No affiliates yet</p>
                                    </div>
                                )}

                                {/* Affiliates List */}
                                {!isLoading && !error && affiliates.length > 0 && (
                                    <div className="space-y-3">
                                        {affiliates.map((affiliate: any) => (
                                            <div key={affiliate.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <Users className="w-5 h-5 text-muted-foreground" />
                                                        <div>
                                                            <div className="font-medium">{affiliate.name || 'Unnamed Affiliate'}</div>
                                                            <div className="text-sm text-muted-foreground">{affiliate.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={affiliate.status === 'active' ? 'default' : 'secondary'}>
                                                            {affiliate.status}
                                                        </Badge>
                                                        {affiliate.tier && (
                                                            <Badge variant="outline">
                                                                <Award className="w-3 h-3 mr-1" />
                                                                {affiliate.tier}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <div className="text-muted-foreground">Referrals</div>
                                                        <div className="font-medium">{affiliate.totalReferrals || 0}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Conversions</div>
                                                        <div className="font-medium">
                                                            {affiliate.conversions || 0}
                                                            {affiliate.totalReferrals > 0 && ` (${((affiliate.conversions / affiliate.totalReferrals) * 100).toFixed(1)}%)`}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Commission</div>
                                                        <div className="font-medium">${(affiliate.totalCommission || 0).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                                    {affiliate.status === 'pending' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleStatusChange(affiliate.id, 'active')}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            Approve
                                                        </Button>
                                                    )}
                                                    {affiliate.status === 'active' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleStatusChange(affiliate.id, 'suspended')}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            Suspend
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm">View Details</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Commissions */}
                    <TabsContent value="commissions">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Commission Payments</CardTitle>
                                    <Button size="sm">Process Payouts</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { affiliate: 'TechPartners LLC', amount: 1200, status: 'pending', date: '2024-02-15' },
                                        { affiliate: 'Digital Consulting', amount: 840, status: 'paid', date: '2024-02-01' },
                                        { affiliate: 'SaaS Promoters', amount: 315, status: 'paid', date: '2024-01-15' },
                                    ].map((payment, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <DollarSign className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{payment.affiliate}</div>
                                                    <div className="text-sm text-muted-foreground">Due: {new Date(payment.date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="font-medium">${payment.amount.toLocaleString()}</div>
                                                    <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                                                        {payment.status}
                                                    </Badge>
                                                </div>
                                                {payment.status === 'pending' && (
                                                    <Button size="sm">Pay Now</Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tiers */}
                    <TabsContent value="tiers">
                        <Card>
                            <CardHeader>
                                <CardTitle>Commission Tiers & Rewards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { tier: 'Bronze', commission: '10%', threshold: '0-10 conversions', affiliates: 45 },
                                        { tier: 'Silver', commission: '15%', threshold: '11-25 conversions', affiliates: 28 },
                                        { tier: 'Gold', commission: '20%', threshold: '26+ conversions', affiliates: 12 },
                                    ].map((tier) => (
                                        <Card key={tier.tier}>
                                            <CardContent className="pt-6 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Award className="w-6 h-6 text-blue-600" />
                                                    <h3 className="text-lg font-semibold">{tier.tier}</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Commission</span>
                                                        <span className="font-medium">{tier.commission}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Threshold</span>
                                                        <span className="font-medium">{tier.threshold}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Affiliates</span>
                                                        <span className="font-medium">{tier.affiliates}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
