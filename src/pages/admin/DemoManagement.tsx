import React, { useState } from 'react';
import { TestTube, Plus, RefreshCw, Trash2, Play, Copy, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';
import { useDemoEnvironments, useDeleteDemoEnvironment } from '@/hooks/admin/useAdminData';
import { toast } from 'sonner';
import CreateDemoDialog from '@/components/admin/dialogs/CreateDemoDialog';

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
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this demo environment?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Demo Management</h1>
                        <p className="text-muted-foreground">Manage demo environments for prospects</p>
                    </div>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Demo
                    </Button>
                </div>

                {/* Dialog */}
                <CreateDemoDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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

                {/* Empty State */}
                {!isLoading && !error && demos.length === 0 && (
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <TestTube className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-muted-foreground">No demo environments yet. Create one to get started!</p>
                        </CardContent>
                    </Card>
                )}

                {/* Demo Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {!isLoading && demos.map((demo) => (
                        <Card key={demo.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <TestTube className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <CardTitle className="text-lg">{demo.name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{demo.slug}</p>
                                        </div>
                                    </div>
                                    <Badge variant={demo.status === 'active' ? 'default' : 'secondary'}>
                                        {demo.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">Industry</div>
                                        <div className="font-medium">{demo.industry}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Expires</div>
                                        <div className="font-medium">
                                            {new Date(demo.expiresAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Access URL */}
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Access URL</div>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded">
                                            {demo.accessUrl}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopyUrl(demo.accessUrl)}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Credentials */}
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Credentials</div>
                                    <div className="text-xs bg-gray-100 px-3 py-2 rounded space-y-1">
                                        <div><span className="font-medium">Email:</span> {demo.credentials.email}</div>
                                        <div><span className="font-medium">Password:</span> {demo.credentials.password}</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Reset Data
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Play className="w-4 h-4 mr-2" />
                                        Extend
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
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

                {/* Create Demo Wizard */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Create Demo</CardTitle>
                        <p className="text-sm text-muted-foreground">Provision a new demo environment</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-20">
                                <div className="text-center">
                                    <div className="font-medium">Manufacturing</div>
                                    <div className="text-xs text-muted-foreground">Full ERP demo</div>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-20">
                                <div className="text-center">
                                    <div className="font-medium">SaaS</div>
                                    <div className="text-xs text-muted-foreground">Finance + CRM</div>
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
        </AdminLayout>
    );
}
