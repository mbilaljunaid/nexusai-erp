import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock Data until API is connected
const MOCK_TENANTS = [
    { id: '1', name: 'Acme Corp', slug: 'acme', plan: 'ENTERPRISE', users: 150 },
    { id: '2', name: 'StartUp Inc', slug: 'startup', plan: 'FREE', users: 5 },
];

export const TenantList = () => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tenant Management</h1>
                <Button>Create Tenant</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {MOCK_TENANTS.map((tenant) => (
                        <TableRow key={tenant.id}>
                            <TableCell className="font-medium">{tenant.name}</TableCell>
                            <TableCell>{tenant.slug}</TableCell>
                            <TableCell><Badge variant="outline">{tenant.plan}</Badge></TableCell>
                            <TableCell>{tenant.users}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="sm">Manage</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
