import { formatDateTime } from "@/lib/dateUtils";
import React from 'react';
import { Database, Download, Clock, CheckCircle, AlertTriangle, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';
import { StandardPage } from "@/components/layout/StandardPage";
import { Label } from "@/components/ui/label";

export default function DatabaseBackups() {
    const backups = [
        {
            id: '1',
            name: 'Daily Backup - 2024-02-12',
            type: 'automatic',
            size: '2.4 GB',
            status: 'completed',
            createdAt: '2024-02-12 03:00:00',
            duration: '15 min'
        },
        {
            id: '2',
            name: 'Daily Backup - 2024-02-11',
            type: 'automatic',
            size: '2.3 GB',
            status: 'completed',
            createdAt: '2024-02-11 03:00:00',
            duration: '14 min'
        },
        {
            id: '3',
            name: 'Pre-Deployment Backup',
            type: 'manual',
            size: '2.2 GB',
            status: 'completed',
            createdAt: '2024-02-10 14:30:00',
            duration: '12 min'
        },
    ];

    return (
        <AdminLayout>
            <StandardPage
                title="Database Backups"
                description="Manage database backups and restore points"
                actions={
                    <Button>
                        <Database className="w-4 h-4 mr-2" />
                        Create Backup
                    </Button>
                }
            >
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">24</div>
                                    <div className="text-sm text-muted-foreground">Total Backups</div>
                                </div>
                                <Database className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">56.8 GB</div>
                                    <div className="text-sm text-muted-foreground">Total Size</div>
                                </div>
                                <HardDrive className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">3:00 AM</div>
                                    <div className="text-sm text-muted-foreground">Next Backup</div>
                                </div>
                                <Clock className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">30 days</div>
                                    <div className="text-sm text-muted-foreground">Retention</div>
                                </div>
                                <CheckCircle className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Backup Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Backup Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Label className="text-sm font-medium">Backup Schedule</Label>
                                <div className="text-sm text-muted-foreground mt-1">Daily at 3:00 AM UTC</div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Retention Period</Label>
                                <div className="text-sm text-muted-foreground mt-1">30 days</div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Backup Location</Label>
                                <div className="text-sm text-muted-foreground mt-1">AWS S3: nexusai-backups</div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Compression</Label>
                                <div className="text-sm text-muted-foreground mt-1">Enabled (gzip)</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <Button variant="outline">Edit Configuration</Button>
                            <Button variant="outline">Test Backup</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Backup History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Backup History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {backups.map((backup) => (
                                <div key={backup.id} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Database className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{backup.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDateTime(backup.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={backup.type === 'automatic' ? 'default' : 'secondary'}>
                                                {backup.type}
                                            </Badge>
                                            {backup.status === 'completed' ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                        <div>
                                            <div className="text-muted-foreground">Size</div>
                                            <div className="font-medium">{backup.size}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Duration</div>
                                            <div className="font-medium">{backup.duration}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Status</div>
                                            <div className="font-medium capitalize">{backup.status}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-3 border-t">
                                        <Button variant="outline" size="sm">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Restore
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Point-in-Time Recovery */}
                <Card>
                    <CardHeader>
                        <CardTitle>Point-in-Time Recovery</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Restore database to any point in time within the last 7 days using transaction logs.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Recovery Point Objective (RPO)</Label>
                                    <div className="text-sm text-muted-foreground mt-1">5 minutes</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Recovery Time Objective (RTO)</Label>
                                    <div className="text-sm text-muted-foreground mt-1">30 minutes</div>
                                </div>
                            </div>
                            <Button variant="outline">Initiate Point-in-Time Restore</Button>
                        </div>
                    </CardContent>
                </Card>
            </StandardPage>
        </AdminLayout>
    );
}
