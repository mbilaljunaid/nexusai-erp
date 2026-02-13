import React, { useState } from 'react';
import { Users, Shield, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';

export default function UsersAccess() {
    const [searchTerm, setSearchTerm] = useState('');

    const adminUsers = [
        { id: '1', name: 'John Admin', email: 'john@nexusai.com', role: 'super_admin', lastActive: '2024-02-12' },
        { id: '2', name: 'Sarah Support', email: 'sarah@nexusai.com', role: 'admin', lastActive: '2024-02-12' },
        { id: '3', name: 'Mike Manager', email: 'mike@nexusai.com', role: 'support', lastActive: '2024-02-11' },
    ];

    const roles = [
        { name: 'Super Admin', count: 2, permissions: ['All permissions', 'User management', 'System config'] },
        { name: 'Admin', count: 5, permissions: ['Tenant management', 'Module config', 'Billing'] },
        { name: 'Support', count: 12, permissions: ['View only', 'Impersonate users', 'View logs'] },
    ];

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Users & Access</h1>
                        <p className="text-muted-foreground">Manage admin users and role permissions</p>
                    </div>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Admin User
                    </Button>
                </div>

                {/* Admin Users */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Admin Users</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">User</th>
                                        <th className="text-left py-3 px-4 font-medium">Role</th>
                                        <th className="text-left py-3 px-4 font-medium">Last Active</th>
                                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminUsers.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Users className="w-5 h-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                                                    {user.role.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {new Date(user.lastActive).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600">
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

                {/* Roles & Permissions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Roles & Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {roles.map((role) => (
                                <Card key={role.name}>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-blue-600" />
                                                <h3 className="font-semibold">{role.name}</h3>
                                            </div>
                                            <Badge variant="outline">{role.count} users</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            {role.permissions.map((perm) => (
                                                <div key={perm} className="flex items-center gap-2 text-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                                    <span>{perm}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="outline" className="w-full">Edit Permissions</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
