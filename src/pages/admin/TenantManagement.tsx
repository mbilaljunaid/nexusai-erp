import React, { useState } from 'react';
import { Search, Plus, Building2, Settings, Trash2, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { useTenants, useCreateTenant, useDeleteTenant, useUpdateTenantStatus } from '@/hooks/admin/useAdminData';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function TenantManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [newTenant, setNewTenant] = useState({ name: '', slug: '', status: 'active' });

    const { data: tenants = [], isLoading, isError } = useTenants();
    const createTenant = useCreateTenant();
    const deleteTenant = useDeleteTenant();
    const updateStatus = useUpdateTenantStatus();

    const filteredTenants = (tenants as any[]).filter((t: any) =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async () => {
        await createTenant.mutateAsync(newTenant);
        setCreateOpen(false);
        setNewTenant({ name: '', slug: '', status: 'active' });
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Delete tenant "${name}"? This cannot be undone.`)) {
            deleteTenant.mutate(id);
        }
    };

    const tenantColumns: SpreadsheetColumn<any>[] = [
        {
            id: "tenant",
            header: "Tenant",
            width: "300px",
            cell: (tenant: any) => (
                <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-sm text-muted-foreground">{tenant.slug}</div>
                    </div>
                </div>
            )
        },
        {
            id: "plan",
            header: "Plan",
            width: "150px",
            cell: (tenant: any) => (
                <Badge variant={tenant.plan === 'enterprise' ? 'default' : 'secondary'}>
                    {tenant.plan ?? 'Starter'}
                </Badge>
            )
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (tenant: any) => (
                <div className="flex items-center gap-2">
                    {tenant.status === 'active' ? (
                        <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">Active</span>
                        </>
                    ) : tenant.status === 'trial' ? (
                        <Badge variant="outline">Trial</Badge>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-600">Inactive</span>
                        </>
                    )}
                </div>
            )
        },
        {
            id: "created",
            header: "Created",
            width: "150px",
            cell: (tenant: any) => (
                <span className="text-sm text-muted-foreground">
                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '—'}
                </span>
            )
        },
        {
            id: "actions",
            header: "Actions",
            width: "120px",
            cell: (tenant: any) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            updateStatus.mutate({
                                id: tenant.id,
                                status: tenant.status === 'active' ? 'inactive' : 'active',
                            })
                        }
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(tenant.id, tenant.name)}
                        disabled={deleteTenant.isPending}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Tenant Management</h1>
                        <p className="text-muted-foreground">Manage all tenant organizations and their configurations</p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Tenant
                    </Button>
                </div>

                {isError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                        <AlertCircle className="w-4 h-4" />
                        Failed to load tenants. Please refresh the page.
                    </div>
                )}

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search tenants by name or slug..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tenants Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {isLoading ? 'Loading...' : `All Tenants (${filteredTenants.length})`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : filteredTenants.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Building2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No tenants found</p>
                                <Button variant="outline" size="sm" className="mt-3" onClick={() => setCreateOpen(true)}>
                                    Create your first tenant
                                </Button>
                            </div>
                        ) : (
                            <div style={{ height: '400px' }}>
                                <InteractiveSpreadsheet
                                    columns={tenantColumns}
                                    data={filteredTenants}
                                    onChange={() => { }}
                                    containerHeight="400px"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Tenant Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Tenant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="tenant-name">Organization Name</Label>
                            <Input
                                id="tenant-name"
                                placeholder="Acme Corporation"
                                value={newTenant.name}
                                onChange={(e) => setNewTenant(p => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tenant-slug">Slug</Label>
                            <Input
                                id="tenant-slug"
                                placeholder="acme-corp"
                                value={newTenant.slug}
                                onChange={(e) => setNewTenant(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tenant-status">Initial Status</Label>
                            <Select value={newTenant.status} onValueChange={(v) => setNewTenant(p => ({ ...p, status: v }))}>
                                <SelectTrigger id="tenant-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="trial">Trial</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!newTenant.name || !newTenant.slug || createTenant.isPending}
                        >
                            {createTenant.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Create Tenant
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
