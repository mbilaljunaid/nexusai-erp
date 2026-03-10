import { formatDate } from "@/lib/dateUtils";
import React, { useMemo, useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Link2, Award, BarChart3, Loader2, Plus, Target, Edit, Search, X, ArrowUp, ArrowDown, ArrowUpDown, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import { useAffiliates, useUpdateAffiliateStatus } from '@/hooks/admin/useAdminData';
import CreateAffiliateDialog from '@/components/admin/dialogs/CreateAffiliateDialog';
import EditAffiliateDialog from '@/components/admin/dialogs/EditAffiliateDialog';
import { exportToCSV } from '@/utils/exportUtils';
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

export default function Affiliates() {
    const { data: allAffiliates = [], isLoading, error } = useAffiliates();
    const updateStatusMutation = useUpdateAffiliateStatus();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        tier: 'all',
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc';
    }>({ key: '', direction: 'asc' });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({ status: 'all', tier: 'all' });
        setSearchQuery('');
    };

    // Sorting handler
    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.status !== 'all') count++;
        if (filters.tier !== 'all') count++;
        if (debouncedSearch) count++;
        return count;
    }, [filters, debouncedSearch]);

    // Filtered affiliates
    const affiliates = useMemo(() => {
        return allAffiliates.filter((affiliate: any) => {
            // Search filter
            const matchesSearch = !debouncedSearch ||
                affiliate.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                affiliate.companyName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                affiliate.email?.toLowerCase().includes(debouncedSearch.toLowerCase());

            // Status filter
            const matchesStatus = filters.status === 'all' || affiliate.status === filters.status;

            // Tier filter
            const matchesTier = filters.tier === 'all' || affiliate.tier === filters.tier;

            return matchesSearch && matchesStatus && matchesTier;
        });
    }, [allAffiliates, debouncedSearch, filters]);

    // Sorted data
    const sortedAffiliates = useMemo(() => {
        if (!sortConfig.key) return affiliates;

        return [...affiliates].sort((a: any, b: any) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [affiliates, sortConfig]);

    // Paginated data
    const paginatedAffiliates = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedAffiliates.slice(startIndex, startIndex + pageSize);
    }, [sortedAffiliates, currentPage, pageSize]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filters]);

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

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
            <StandardPage
                title="Affiliate Program"
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => exportToCSV(affiliates, 'affiliates')}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Affiliate
                        </Button>
                    </div>
                }
            >
                {/* Dialog */}
                <CreateAffiliateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
                <EditAffiliateDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    affiliate={selectedAffiliate}
                />

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, company, email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                                {searchQuery && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filters.tier} onValueChange={(v) => handleFilterChange('tier', v)}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tiers</SelectItem>
                                        <SelectItem value="bronze">Bronze</SelectItem>
                                        <SelectItem value="silver">Silver</SelectItem>
                                        <SelectItem value="gold">Gold</SelectItem>
                                        <SelectItem value="platinum">Platinum</SelectItem>
                                    </SelectContent>
                                </Select>

                                {activeFilterCount > 0 && (
                                    <Button variant="outline" size="sm" onClick={clearFilters}>
                                        Clear Filters ({activeFilterCount})
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Empty State for Filtered Results */}
                {!isLoading && !error && allAffiliates.length > 0 && affiliates.length === 0 && (
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No results found for your search criteria</p>
                            <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>
                )}


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
                                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/70" />
                                        <p className="text-muted-foreground">No affiliates yet</p>
                                    </div>
                                )}

                                {/* Affiliates List */}
                                {!isLoading && !error && paginatedAffiliates.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {paginatedAffiliates.map((affiliate: any) => (
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
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedAffiliate(affiliate);
                                                            setEditDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={affiliate.status === 'active' ? 'outline' : 'default'}
                                                        onClick={() => updateStatusMutation.mutate({
                                                            id: affiliate.id,
                                                            status: affiliate.status === 'active' ? 'suspended' : 'active'
                                                        })}
                                                    >
                                                        {affiliate.status === 'active' ? 'Suspend' : 'Activate'}
                                                    </Button>
                                                    <Button variant="outline" size="sm">View Details</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {!isLoading && !error && affiliates.length > 0 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalItems={affiliates.length}
                                        pageSize={pageSize}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                    />
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
                                                    <div className="text-sm text-muted-foreground">Due: {formatDate(payment.date)}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="font-medium">${formatNumber(payment.amount)}</div>
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
            </StandardPage>
        </AdminLayout>
    );
}
