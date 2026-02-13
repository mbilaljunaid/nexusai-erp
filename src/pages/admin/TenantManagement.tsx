import React, { useState } from 'react';
import { Search, Plus, Building2, Settings, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    industry: string;
    plan: string;
    status: 'active' | 'inactive' | 'trial';
    users: number;
    createdAt: string;
    modules: string[];
}

export default function TenantManagement() {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data - replace with API call
    const tenants: Tenant[] = [
        {
            id: '1',
            name: 'Acme Corporation',
            slug: 'acme-corp',
            industry: 'Manufacturing',
            plan: 'Enterprise',
            status: 'active',
            users: 250,
            createdAt: '2024-01-15',
            modules: ['Finance', 'HR', 'SCM', 'Manufacturing']
        },
        {
            id: '2',
            name: 'TechStart Inc',
            slug: 'techstart',
            industry: 'SaaS',
            plan: 'Professional',
            status: 'active',
            users: 45,
            createdAt: '2024-02-01',
            modules: ['Finance', 'HR', 'CRM']
        },
        {
            id: '3',
            name: 'Global Trade Ltd',
            slug: 'global-trade',
            industry: 'Wholesale',
            plan: 'Enterprise',
            status: 'trial',
            users: 120,
            createdAt: '2024-02-10',
            modules: ['Finance', 'SCM', 'CRM']
        },
    ];

    const filteredTenants = tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Tenant Management</h1>
                        <p className="text-muted-foreground">Manage all tenant organizations and their configurations</p>
                    </div>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Tenant
                    </Button>
                </div>

                {/* Search & Filters */}
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
                        <CardTitle>All Tenants ({filteredTenants.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">Tenant</th>
                                        <th className="text-left py-3 px-4 font-medium">Industry</th>
                                        <th className="text-left py-3 px-4 font-medium">Plan</th>
                                        <th className="text-left py-3 px-4 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 font-medium">Users</th>
                                        <th className="text-left py-3 px-4 font-medium">Modules</th>
                                        <th className="text-left py-3 px-4 font-medium">Created</th>
                                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTenants.map((tenant) => (
                                        <tr key={tenant.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Building2 className="w-5 h-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{tenant.name}</div>
                                                        <div className="text-sm text-muted-foreground">{tenant.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">{tenant.industry}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={tenant.plan === 'Enterprise' ? 'default' : 'secondary'}>
                                                    {tenant.plan}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {tenant.status === 'active' ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm text-green-600">Active</span>
                                                        </>
                                                    ) : tenant.status === 'trial' ? (
                                                        <>
                                                            <Badge variant="outline">Trial</Badge>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-4 h-4 text-red-600" />
                                                            <span className="text-sm text-red-600">Inactive</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">{tenant.users}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {tenant.modules.slice(0, 2).map((module) => (
                                                        <Badge key={module} variant="outline" className="text-xs">
                                                            {module}
                                                        </Badge>
                                                    ))}
                                                    {tenant.modules.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{tenant.modules.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {new Date(tenant.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
