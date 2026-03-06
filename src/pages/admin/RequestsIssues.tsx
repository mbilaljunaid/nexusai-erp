import { formatDate } from "@/lib/dateUtils";
import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle, Loader2, Plus, User, Tag, Edit, Search, X, RefreshCw, ArrowUp, ArrowDown, ArrowUpDown, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { StandardPage } from '@/components/layout/StandardPage';
import { Pagination } from '@/components/admin/Pagination';
import { ViewModeToggle } from '@/components/admin/ViewModeToggle';
import { InteractiveSpreadsheet, SpreadsheetColumn } from '@/components/ui/InteractiveSpreadsheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { useSupportRequests, useCloseSupportRequest } from '@/hooks/admin/useAdminData';
import CreateSupportRequestDialog from '@/components/admin/dialogs/CreateSupportRequestDialog';
import EditSupportRequestDialog from '@/components/admin/dialogs/EditSupportRequestDialog';
import { exportToCSV } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface Request {
    id: string;
    type: 'feature' | 'bug' | 'support' | 'question';
    title: string;
    description?: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    submittedBy?: string;
    tenant?: string;
    tenantId?: string;
    createdAt: string;
    updatedAt: string;
}

export default function RequestsIssues() {
    const { toast } = useToast();
    const [filter, setFilter] = useState<'all' | 'feature' | 'bug' | 'support'>('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const { data: allRequests = [], isLoading, error } = useSupportRequests();
    const closeMutation = useCloseSupportRequest();

    const [showBulkCloseConfirm, setShowBulkCloseConfirm] = useState(false);
    const [bulkPriorityParams, setBulkPriorityParams] = useState<string | null>(null);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [closeRequestId, setCloseRequestId] = useState<string | null>(null);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({
        priority: 'all',
        status: 'all',
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Sorting State  
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc';
    }>({ key: '', direction: 'asc' });

    // View Mode State
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Load view mode preference
    useEffect(() => {
        const saved = localStorage.getItem('admin-requests-view-mode');
        if (saved === 'grid' || saved === 'table') {
            setViewMode(saved);
        }
    }, []);

    // Save view mode preference
    useEffect(() => {
        localStorage.setItem('admin-requests-view-mode', viewMode);
    }, [viewMode]);

    // Clear selection when filters change
    useEffect(() => {
        setSelectedIds(new Set());
    }, [filters.status, filters.priority, filter, searchQuery]);

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
        setFilters({ priority: 'all', status: 'all' });
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
        if (filters.priority !== 'all') count++;
        if (filters.status !== 'all') count++;
        if (debouncedSearch) count++;
        return count;
    }, [filters, debouncedSearch]);

    // Filter requests based on active tab
    const requests = useMemo(() => {
        let filtered = allRequests;

        // Tab filter
        if (filter !== 'all') {
            filtered = filtered.filter((req: Request) => req.type === filter);
        }

        // Search filter
        if (debouncedSearch) {
            filtered = filtered.filter((req: Request) =>
                req.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                req.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                req.submittedBy?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                req.tenant?.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
        }

        // Priority filter
        if (filters.priority !== 'all') {
            filtered = filtered.filter((req: Request) => req.priority === filters.priority);
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter((req: Request) => req.status === filters.status);
        }

        return filtered;
    }, [allRequests, filter, debouncedSearch, filters]);

    // Sorted data
    const sortedRequests = useMemo(() => {
        if (!sortConfig.key) return requests;

        return [...requests].sort((a: any, b: any) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [requests, sortConfig]);

    // Paginated data
    const paginatedRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedRequests.slice(startIndex, startIndex + pageSize);
    }, [sortedRequests, currentPage, pageSize]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filters, filter]);

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    // Selection handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(paginatedRequests.map(req => req.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleClearSelection = () => {
        setSelectedIds(new Set());
    };

    // Bulk action handlers
    const handleBulkClose = () => {
        setShowBulkCloseConfirm(true);
    };

    const performBulkClose = () => {
        // Implementation would go here
        toast({ title: 'Requests Closed', description: `Closed ${selectedIds.size} requests` });
        setSelectedIds(new Set());
        setShowBulkCloseConfirm(false);
    };

    const handleBulkPriority = (priority: string) => {
        setBulkPriorityParams(priority);
    };

    const performBulkPriority = () => {
        if (bulkPriorityParams) {
            toast({ title: 'Priority Updated', description: `Updated ${selectedIds.size} requests` });
            setSelectedIds(new Set());
            setBulkPriorityParams(null);
        }
    };

    const handleBulkDelete = () => {
        setShowBulkDeleteConfirm(true);
    };

    const performBulkDelete = () => {
        toast({ title: 'Requests Deleted', description: `Deleted ${selectedIds.size} requests` });
        setSelectedIds(new Set());
        setShowBulkDeleteConfirm(false);
    };

    // Table columns
    const tableColumns: SpreadsheetColumn<any>[] = [
        {
            id: 'select',
            header: <Checkbox checked={paginatedRequests.length > 0 && selectedIds.size === paginatedRequests.length} onCheckedChange={(checked) => handleSelectAll(checked as boolean)} />,
            width: '50px',
            cell: (req) => <Checkbox checked={selectedIds.has(req.id)} onCheckedChange={() => handleToggleSelect(req.id)} />
        },
        {
            id: 'title',
            header: 'Title',
            width: '300px',
            cell: (req) => (
                <div>
                    <div className="font-medium">{req.title}</div>
                    <div className="text-sm text-muted-foreground">{req.submittedBy}</div>
                </div>
            ),
        },
        {
            id: 'priority',
            header: 'Priority',
            width: '120px',
            cell: (req) => (
                <Badge variant={
                    req.priority === 'high' ? 'destructive' :
                        req.priority === 'medium' ? 'default' : 'secondary'
                }>
                    {req.priority}
                </Badge>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            width: '120px',
            cell: (req) => (
                <Badge variant={req.status === 'closed' ? 'secondary' : 'default'}>
                    {req.status}
                </Badge>
            ),
        },
        {
            id: 'createdAt',
            header: 'Date',
            width: '120px',
            cell: (req) => <span>{formatDate(req.createdAt)}</span>,
        },
        {
            id: 'type',
            header: 'Type',
            width: '120px',
            cell: (req) => (
                <Badge variant="outline">
                    {req.type === 'feature' ? 'Feature' : 'Bug'}
                </Badge>
            ),
        },
    ];

    const getRowId = (req: any) => req.id;

    const bulkActions = [
        { label: 'Close Selected', onClick: handleBulkClose },
        { label: 'Set High Priority', onClick: () => handleBulkPriority('high') },
        { label: 'Set Medium Priority', onClick: () => handleBulkPriority('medium') },
        { label: 'Set Low Priority', onClick: () => handleBulkPriority('low') },
        { label: 'Delete Selected', onClick: handleBulkDelete, variant: 'destructive' as const },
    ];

    // Calculate stats
    const stats = useMemo(() => {
        const openCount = allRequests.filter((r: Request) => r.status === 'open').length;
        const inProgressCount = allRequests.filter((r: Request) => r.status === 'in-progress').length;
        const resolvedCount = allRequests.filter((r: Request) => r.status === 'resolved').length;
        return { openCount, inProgressCount, resolvedCount };
    }, [allRequests]);

    const handleClose = async (id: string) => {
        setCloseRequestId(id);
    };

    const performClose = async () => {
        if (closeRequestId) {
            await closeMutation.mutateAsync(closeRequestId);
            setCloseRequestId(null);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'feature': return 'bg-blue-100 text-blue-800';
            case 'bug': return 'bg-red-100 text-red-800';
            case 'support': return 'bg-green-100 text-green-800';
            case 'question': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-600 text-white';
            case 'high': return 'bg-orange-600 text-white';
            case 'medium': return 'bg-yellow-600 text-white';
            case 'low': return 'bg-gray-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <AlertCircle className="w-4 h-4 text-orange-600" />;
            case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
            case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'closed': return <CheckCircle className="w-4 h-4 text-gray-600" />;
            default: return null;
        }
    };

    return (
        <AdminLayout>
            <StandardPage
                title="Requests & Issues"
                actions={
                    <div className="flex items-center gap-2">
                        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                        <Button variant="outline" onClick={() => exportToCSV(requests, 'requests')}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            Create Request
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">

                    {/* Dialog */}
                    <CreateSupportRequestDialog
                        open={createDialogOpen}
                        onOpenChange={setCreateDialogOpen}
                    />
                    <EditSupportRequestDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        request={selectedRequest as any}
                    />
                    {/* Stats */}
                    {!isLoading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold">{stats.openCount}</div>
                                            <div className="text-sm text-muted-foreground">Open Issues</div>
                                        </div>
                                        <AlertCircle className="w-8 h-8 text-orange-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold">{stats.inProgressCount}</div>
                                            <div className="text-sm text-muted-foreground">In Progress</div>
                                        </div>
                                        <Clock className="w-8 h-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold">{stats.resolvedCount}</div>
                                            <div className="text-sm text-muted-foreground">Resolved</div>
                                        </div>
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold">{allRequests.length}</div>
                                            <div className="text-sm text-muted-foreground">Total Requests</div>
                                        </div>
                                        <MessageSquare className="w-8 h-8 text-purple-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tabs */}
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="feature">Feature Requests</TabsTrigger>
                            <TabsTrigger value="bug">Bugs</TabsTrigger>
                            <TabsTrigger value="support">Support</TabsTrigger>
                        </TabsList>

                        {/* Search and Filters */}
                        <Card className="mt-4">
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by title, description, user, tenant..."
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
                                        <Select value={filters.priority} onValueChange={(v) => handleFilterChange('priority', v)}>
                                            <SelectTrigger className="w-[160px]">
                                                <SelectValue placeholder="Priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Priorities</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                                            <SelectTrigger className="w-[160px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
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
                        {!isLoading && !error && allRequests.length > 0 && requests.length === 0 && (
                            <Card className="mt-4">
                                <CardContent className="pt-6 text-center">
                                    <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No results found for your search criteria</p>
                                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                </CardContent>
                            </Card>
                        )}


                        <TabsContent value="all" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>All Requests & Issues</CardTitle>
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
                                            Failed to load requests. Please try again.
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {!isLoading && !error && requests.length === 0 && (
                                        <div className="p-12 text-center">
                                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-muted-foreground">No requests found</p>
                                        </div>
                                    )}

                                    {/* Requests List */}
                                    {!isLoading && !error && paginatedRequests.length > 0 && (
                                        viewMode === 'table' ? (
                                            <div className="h-[500px]">
                                                <InteractiveSpreadsheet
                                                    columns={tableColumns}
                                                    data={paginatedRequests}
                                                    onChange={() => { }}
                                                    containerHeight="100%"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {paginatedRequests.map((request) => (
                                                    <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusIcon(request.status)}
                                                                    <h3 className="font-semibold">{request.title}</h3>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">{request.description}</p>
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <Badge className={getTypeColor(request.type)}>
                                                                        {request.type}
                                                                    </Badge>
                                                                    <Badge className={getPriorityColor(request.priority)}>
                                                                        {request.priority}
                                                                    </Badge>
                                                                    {request.submittedBy && (
                                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                            <User className="w-4 h-4" />
                                                                            {request.submittedBy}
                                                                        </div>
                                                                    )}
                                                                    {request.tenant && (
                                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                            <Tag className="w-4 h-4" />
                                                                            {request.tenant}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setSelectedRequest(request);
                                                                        setEditDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Edit className="w-4 h-4 mr-1" />
                                                                    Edit
                                                                </Button>
                                                                {request.status !== 'closed' && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleClose(request.id)}
                                                                        disabled={closeMutation.isPending}
                                                                    >
                                                                        {closeMutation.isPending ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                                                Close
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    )}

                                    {/* Bulk Action Bar */}
                                    <BulkActionBar
                                        selectedCount={selectedIds.size}
                                        onClear={handleClearSelection}
                                        actions={bulkActions}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="feature">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Feature Requests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Feature requests will appear here...</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="bug">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bug Reports</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Bug reports will appear here...</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="support">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Support Tickets</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Support tickets will appear here...</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Pagination */}
                    {!isLoading && !error && requests.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={requests.length}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    )}

                </div>

                <AlertDialog open={showBulkCloseConfirm} onOpenChange={setShowBulkCloseConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Close Requests</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to close {selectedIds.size} requests?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={performBulkClose}>Close Requests</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={!!bulkPriorityParams} onOpenChange={(open) => !open && setBulkPriorityParams(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Change Priority</AlertDialogTitle>
                            <AlertDialogDescription>
                                Change priority for {selectedIds.size} requests to {bulkPriorityParams}?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={performBulkPriority}>Change Priority</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Requests</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete {selectedIds.size} requests? This cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={performBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={!!closeRequestId} onOpenChange={(open) => !open && setCloseRequestId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Close Request</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to close this request?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={performClose}>Close Request</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </StandardPage>
        </AdminLayout >
    );
}
