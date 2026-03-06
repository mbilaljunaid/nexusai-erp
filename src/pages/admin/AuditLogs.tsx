import { formatDateTime } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { Activity, Filter, Download, Search, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuditLogs } from '@/hooks/admin/useAdminData';
import { StandardPage } from "@/components/layout/StandardPage";
import { ExportButton } from "@/components/ExportButton";

const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'tenant', label: 'Tenant Actions' },
    { value: 'module', label: 'Module Actions' },
    { value: 'demo', label: 'Demo Actions' },
    { value: 'billing', label: 'Billing Actions' },
    { value: 'user', label: 'User Actions' },
];

const getActionColor = (type: string) => {
    switch (type) {
        case 'tenant': return 'bg-blue-100 text-blue-800';
        case 'module': return 'bg-purple-100 text-purple-800';
        case 'demo': return 'bg-green-100 text-green-800';
        case 'billing': return 'bg-orange-100 text-orange-800';
        case 'user': return 'bg-pink-100 text-pink-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function AuditLogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [page, setPage] = useState(1);

    const filters = {
        page,
        limit: 25,
        actor: searchTerm || undefined,
        type: filterType !== 'all' ? filterType : undefined,
    };

    const { data, isLoading, isError } = useAuditLogs(filters);
    const logs: any[] = data?.data ?? [];
    const meta = data?.meta ?? { total: 0, totalPages: 1 };

    const exportData = logs.map((l: any) => ({
        "Timestamp": l.created_at ?? l.createdAt ?? '',
        "Actor": l.actor_email ?? l.actorEmail ?? '',
        "Action": l.action ?? '',
        "Resource": l.resource_type ?? l.resourceType ?? '',
        "Details": l.details ?? ''
    }));

    return (
        <AdminLayout>
            <StandardPage
                title="Audit & Logs"
                description="Track all admin actions and system events"
                actions={
                    <ExportButton
                        data={exportData}
                        filename={`audit-logs-${new Date().toISOString().split('T')[0]}`}
                    />
                }
            >
                {isError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                        <AlertCircle className="w-4 h-4" />
                        Failed to load audit logs. Please try again.
                    </div>
                )}

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs by actor email..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1); }}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {actionTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Log Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Audit Trail
                            {!isLoading && meta.total > 0 && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    ({meta.total} total)
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No audit logs found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {logs.map((log: any) => (
                                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getActionColor(log.resource_type ?? log.resourceType ?? '')}>
                                                            {log.action}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            {log.created_at ? formatDateTime(log.created_at) : log.createdAt}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-medium">{log.actor_email ?? log.actorEmail ?? log.actor ?? 'System'}</span>
                                                        <span className="text-muted-foreground"> performed action on </span>
                                                        <span className="font-medium">{log.resource_type ?? log.resourceType ?? '—'}</span>
                                                    </div>
                                                    {log.details && (
                                                        <div className="text-sm text-muted-foreground">{log.details}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!isLoading && meta.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Page {page} of {meta.totalPages} ({meta.total} logs)
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= meta.totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </StandardPage>
        </AdminLayout>
    );
}
