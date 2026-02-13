import React, { useState } from 'react';
import { Activity, Filter, Download, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AuditLogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const logs = [
        {
            id: '1',
            timestamp: '2024-02-12 23:10:00',
            actor: 'john@nexusai.com',
            action: 'tenant.created',
            resource: 'Acme Corp',
            type: 'tenant',
            details: 'Created new tenant with Enterprise plan'
        },
        {
            id: '2',
            timestamp: '2024-02-12 23:05:00',
            actor: 'sarah@nexusai.com',
            action: 'module.enabled',
            resource: 'CRM Module',
            type: 'module',
            details: 'Enabled CRM module for tenant Global Trade Ltd'
        },
        {
            id: '3',
            timestamp: '2024-02-12 22:55:00',
            actor: 'admin@nexusai.com',
            action: 'demo.created',
            resource: 'Manufacturing Demo',
            type: 'demo',
            details: 'Provisioned new demo environment'
        },
        {
            id: '4',
            timestamp: '2024-02-12 22:45:00',
            actor: 'john@nexusai.com',
            action: 'subscription.upgraded',
            resource: 'TechStart Inc',
            type: 'billing',
            details: 'Upgraded subscription from Professional to Enterprise'
        },
    ];

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

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Audit & Logs</h1>
                        <p className="text-muted-foreground">Track all admin actions and system events</p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Logs
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs by actor, action, or resource..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={filterType} onValueChange={setFilterType}>
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
                        <CardTitle>Audit Trail</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getActionColor(log.type)}>
                                                        {log.action}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">{log.actor}</span>
                                                    <span className="text-muted-foreground"> performed action on </span>
                                                    <span className="font-medium">{log.resource}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">{log.details}</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">View Details</Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 pt-6 border-t">
                            <div className="text-sm text-muted-foreground">
                                Showing 1-10 of 247 logs
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">Previous</Button>
                                <Button variant="outline" size="sm">Next</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
