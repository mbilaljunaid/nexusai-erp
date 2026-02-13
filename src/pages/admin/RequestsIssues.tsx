import React, { useState, useMemo } from 'react';
import { AlertCircle, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle, Loader2, Plus, User, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { useSupportRequests, useCloseSupportRequest } from '@/hooks/admin/useAdminData';
import CreateSupportRequestDialog from '@/components/admin/dialogs/CreateSupportRequestDialog';

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
    const [filter, setFilter] = useState<'all' | 'feature' | 'bug' | 'support'>('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const { data: allRequests = [], isLoading, error } = useSupportRequests();
    const closeMutation = useCloseSupportRequest();

    // Filter requests based on active tab
    const requests = useMemo(() => {
        if (filter === 'all') return allRequests;
        return allRequests.filter((req: Request) => req.type === filter);
    }, [allRequests, filter]);

    // Calculate stats
    const stats = useMemo(() => {
        const openCount = allRequests.filter((r: Request) => r.status === 'open').length;
        const inProgressCount = allRequests.filter((r: Request) => r.status === 'in-progress').length;
        const resolvedCount = allRequests.filter((r: Request) => r.status === 'resolved').length;
        return { openCount, inProgressCount, resolvedCount };
    }, [allRequests]);

    const handleClose = async (id: string) => {
        if (confirm('Are you sure you want to close this request?')) {
            await closeMutation.mutateAsync(id);
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
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Requests & Issues</h1>
                        <p className="text-muted-foreground">Manage support requests, feature requests, and bug reports</p>
                    </div>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New ticket
                    </Button>
                </div>

                {/* Dialog */}
                <CreateSupportRequestDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
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
                                {!isLoading && !error && requests.length > 0 && (
                                    <div className="space-y-3">
                                        {requests.map((request) => (
                                            <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                <div className="flex items-start justify-between gap- 4">
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
                                                        {request.status !== 'closed' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleClose(request.id)}
                                                                disabled={closeMutation.isPending}
                                                            >
                                                                {closeMutation.isPending ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    'Close'
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
            </div>
        </AdminLayout>
    );
}
