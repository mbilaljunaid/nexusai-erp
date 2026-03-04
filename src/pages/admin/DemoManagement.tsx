import React, { useState, useEffect, useMemo } from 'react';
import { TestTube, Plus, RefreshCw, Trash2, Play, Copy, Loader2, Edit, ExternalLink, Search, X, ArrowUp, ArrowDown, ArrowUpDown, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import { StandardPage } from '@/components/layout/StandardPage';
import { ViewModeToggle } from '@/components/admin/ViewModeToggle';
import { InteractiveSpreadsheet, SpreadsheetColumn } from '@/components/ui/InteractiveSpreadsheet';
import { useDemoEnvironments, useDeleteDemoEnvironment, useUpdateDemoStatus } from '@/hooks/admin/useAdminData';
import { exportToCSV } from '@/utils/exportUtils';
import { toast } from 'sonner';
import CreateDemoDialog from '@/components/admin/dialogs/CreateDemoDialog';
import EditDemoDialog from '@/components/admin/dialogs/EditDemoDialog';

interface Demo {
    id: string;
    name: string;
    slug: string;
    industry: string;
    status: 'active' | 'expired' | 'provisioning';
    createdAt: string;
    expiresAt: string;
    accessUrl: string;
    credentials?: {
        email: string;
        password: string;
    };
}

export default function DemoManagement() {
    // Fetch real data from API
    const { data: demos = [], isLoading, error } = useDemoEnvironments();
    const deleteMutation = useDeleteDemoEnvironment();
    const updateStatusMutation = useUpdateDemoStatus();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        industry: 'all',
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Demo | '';
        direction: 'asc' | 'desc';
    }>({ key: '', direction: 'asc' });

    // View Mode State
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Load view mode preference
    useEffect(() => {
        const saved = localStorage.getItem('admin-demo-view-mode');
        if (saved === 'grid' || saved === 'table') {
            setViewMode(saved);
        }
    }, []);

    // Save view mode preference
    useEffect(() => {
        localStorage.setItem('admin-demo-view-mode', viewMode);
    }, [viewMode]);

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
        setFilters({ status: 'all', industry: 'all' });
        setSearchQuery('');
    };

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.status !== 'all') count++;
        if (filters.industry !== 'all') count++;
        if (debouncedSearch) count++;
        return count;
    }, [filters, debouncedSearch]);

    // Get unique industries for filter dropdown
    const uniqueIndustries = useMemo(() => {
        const industries = demos.map((d: Demo) => d.industry).filter(Boolean);
        return Array.from(new Set(industries));
    }, [demos]);

    // Sorting handler
    const handleSort = (key: keyof Demo) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Filtered data with useMemo for performance
    const filteredDemos = useMemo(() => {
        return demos.filter((demo: Demo) => {
            // Search filter
            const matchesSearch = !debouncedSearch ||
                demo.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                demo.slug?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                demo.industry?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                demo.credentials?.email?.toLowerCase().includes(debouncedSearch.toLowerCase());

            // Status filter
            const matchesStatus = filters.status === 'all' || demo.status === filters.status;

            // Industry filter
            const matchesIndustry = filters.industry === 'all' || demo.industry === filters.industry;

            return matchesSearch && matchesStatus && matchesIndustry;
        });
    }, [demos, debouncedSearch, filters]);

    // Sorted data
    const sortedDemos = useMemo(() => {
        if (!sortConfig.key) return filteredDemos;

        return [...filteredDemos].sort((a, b) => {
            const aVal = a[sortConfig.key as keyof Demo];
            const bVal = b[sortConfig.key as keyof Demo];

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredDemos, sortConfig]);

    // Paginated data
    const paginatedDemos = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return sortedDemos.slice(startIndex, endIndex);
    }, [sortedDemos, currentPage, pageSize]);

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

    // Table columns configuration
    const tableColumns: SpreadsheetColumn<Demo>[] = [
        {
            id: 'name',
            header: 'Name',
            width: '250px',
            cell: (demo) => (
                <div>
                    <div className="font-medium">{demo.name || demo.slug}</div>
                    <div className="text-sm text-muted-foreground">{demo.industry}</div>
                </div>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            width: '120px',
            cell: (demo) => (
                <Badge variant={
                    demo.status === 'active' ? 'default' :
                        demo.status === 'expired' ? 'destructive' : 'secondary'
                }>
                    {demo.status}
                </Badge>
            ),
        },
        {
            id: 'createdAt',
            header: 'Created',
            width: '120px',
            cell: (demo) => <span>{new Date(demo.createdAt).toLocaleDateString()}</span>,
        },
        {
            id: 'expiresAt',
            header: 'Expires',
            width: '120px',
            cell: (demo) => <span>{demo.expiresAt ? new Date(demo.expiresAt).toLocaleDateString() : 'Never'}</span>,
        },
        {
            id: 'actions',
            header: 'Actions',
            width: '150px',
            cell: (demo) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedDemo(demo);
                        setEditDialogOpen(true);
                    }}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    {demo.accessUrl && (
                        <Button variant="ghost" size="sm" asChild>
                            <a href={demo.accessUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(demo.id)}
                    >
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    const getRowId = (demo: Demo) => demo.id;


    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this demo environment?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <AdminLayout>
            <StandardPage
                title="Demo Environments"
                actions={
                    <div className="flex items-center gap-2">
                        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                        <Button variant="outline" onClick={() => exportToCSV(filteredDemos, 'demos')}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Demo
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">

                    {/* Sort Controls */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-muted-foreground mr-2">Sort by:</span>
                                <Button
                                    variant={sortConfig.key === 'name' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleSort('name')}
                                >
                                    Name
                                    {sortConfig.key === 'name' && (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                                    )}
                                    {sortConfig.key !== 'name' && <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />}
                                </Button>
                                <Button
                                    variant={sortConfig.key === 'industry' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleSort('industry')}
                                >
                                    Industry
                                    {sortConfig.key === 'industry' && (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                                    )}
                                    {sortConfig.key !== 'industry' && <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />}
                                </Button>
                                <Button
                                    variant={sortConfig.key === 'status' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleSort('status')}
                                >
                                    Status
                                    {sortConfig.key === 'status' && (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                                    )}
                                    {sortConfig.key !== 'status' && <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />}
                                </Button>
                                <Button
                                    variant={sortConfig.key === 'createdAt' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    Created
                                    {sortConfig.key === 'createdAt' && (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                                    )}
                                    {sortConfig.key !== 'createdAt' && <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />}
                                </Button>
                                <Button
                                    variant={sortConfig.key === 'expiresAt' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleSort('expiresAt')}
                                >
                                    Expires
                                    {sortConfig.key === 'expiresAt' && (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                                    )}
                                    {sortConfig.key !== 'expiresAt' && <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search and Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4">
                                {/* Search Bar */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, industry, email..."
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

                                {/* Filters */}
                                <div className="flex items-center gap-2">
                                    <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                            <SelectItem value="provisioning">Provisioning</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={filters.industry} onValueChange={(v) => handleFilterChange('industry', v)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Industries</SelectItem>
                                            {uniqueIndustries.map((industry: string) => (
                                                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                            ))}
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

                    {/* Dialog */}
                    <CreateDemoDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
                    <EditDemoDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        demo={selectedDemo as any}
                    />

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <p className="text-red-600">Failed to load demo environments. Please try again.</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Demo Cards */}
                    {!isLoading && !error && demos.length === 0 && (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <TestTube className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No demo environments yet. Create one to get started.</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State for Filtered Results */}
                    {!isLoading && !error && demos.length > 0 && filteredDemos.length === 0 && (
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

                    {!isLoading && !error && paginatedDemos.length > 0 && (
                        viewMode === 'table' ? (
                            <div className="h-[500px]">
                                <InteractiveSpreadsheet
                                    columns={tableColumns}
                                    data={paginatedDemos}
                                    onChange={() => { }}
                                    containerHeight="100%"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedDemos.map((demo: Demo) => (
                                    <Card key={demo.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{demo.name || demo.slug}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">{demo.industry}</p>
                                                </div>
                                                <Badge variant={
                                                    demo.status === 'active' ? 'default' :
                                                        demo.status === 'expired' ? 'destructive' : 'secondary'
                                                }>
                                                    {demo.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Created</span>
                                                    <span>{new Date(demo.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Expires</span>
                                                    <span>{demo.expiresAt ? new Date(demo.expiresAt).toLocaleDateString() : 'Never'}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedDemo(demo);
                                                        setEditDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                                {demo.accessUrl && (
                                                    <Button size="sm" variant="outline" asChild>
                                                        <a href={demo.accessUrl} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="w-4 h-4 mr-1" />
                                                            Access
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDelete(demo.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    {deleteMutation.isPending ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )
                    )}

                    {/* Pagination */}
                    {!isLoading && !error && filteredDemos.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredDemos.length}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    )}


                    {/* Quick Templates */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Templates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <Button variant="outline" className="h-20">
                                    <div className="text-center">
                                        <div className="font-medium">Retail</div>
                                        <div className="text-xs text-muted-foreground">POS, Inventory</div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="h-20">
                                    <div className="text-center">
                                        <div className="font-medium">Manufacturing</div>
                                        <div className="text-xs text-muted-foreground">BOM, Production</div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="h-20">
                                    <div className="text-center">
                                        <div className="font-medium">Services</div>
                                        <div className="text-xs text-muted-foreground">Projects, Time</div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="h-20">
                                    <div className="text-center">
                                        <div className="font-medium">E-commerce</div>
                                        <div className="text-xs text-muted-foreground">Orders, Fulfillment</div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="h-20">
                                    <div className="text-center">
                                        <div className="font-medium">Custom</div>
                                        <div className="text-xs text-muted-foreground">Choose modules</div>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </StandardPage>
        </AdminLayout >
    );
}
