import React, { useState, useEffect } from 'react';
import { Database, Play, CheckCircle, Download, AlertTriangle, Clock } from 'lucide-react';
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface RestorePoint {
    id: string;
    type: string;
    timestamp: string;
    dataSize: string;
    itemCount: number;
    status: 'verified' | 'pending' | 'failed';
    lastVerified?: string;
}

export default function BackupRestoreManager() {
    const { toast } = useToast();
    const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showBackupConfirm, setShowBackupConfirm] = useState(false);

    const fetchRestorePoints = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/production/restore-points');
            const data = await response.json();
            setRestorePoints(data);
        } catch (error) {
            console.error('Failed to fetch restore points:', error);
            setRestorePoints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestorePoints();
    }, []);

    const createBackup = async () => {
        setShowBackupConfirm(true);
    };

    const performCreateBackup = async () => {
        setShowBackupConfirm(false);

        setCreating(true);
        try {
            const response = await fetch('/api/production/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'manual',
                    dataSize: 'unknown',
                    itemCount: 0,
                }),
            });

            if (response.ok) {
                const newBackup = await response.json();
                setRestorePoints([newBackup, ...restorePoints]);
                toast({ title: 'Success', description: 'Backup created successfully!' });
            } else {
                toast({ variant: 'destructive', description: 'Failed to create backup' });
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            toast({ variant: 'destructive', description: 'Failed to create backup' });
        } finally {
            setCreating(false);
        }
    };

    const verifyBackup = async (pointId: string) => {
        try {
            const response = await fetch(`/api/production/restore-points/${pointId}/verify`, {
                method: 'POST',
            });

            if (response.ok) {
                const result = await response.json();
                setRestorePoints(
                    restorePoints.map((point) =>
                        point.id === pointId
                            ? { ...point, status: result.valid ? 'verified' : 'failed', lastVerified: new Date().toISOString() }
                            : point
                    )
                );
                toast({
                    title: result.valid ? 'Success' : 'Error',
                    description: result.valid ? 'Backup verified successfully!' : 'Backup verification failed!',
                    variant: result.valid ? 'default' : 'destructive'
                });
            } else {
                toast({ variant: 'destructive', description: 'Failed to verify backup' });
            }
        } catch (error) {
            console.error('Error verifying backup:', error);
            toast({ variant: 'destructive', description: 'Failed to verify backup' });
        }
    };



    const restorePointColumns: SpreadsheetColumn[] = [
        { id: "timestamp", header: "Timestamp", width: 200, cell: (item) => <span className="text-sm text-gray-900">{new Date(item.timestamp).toLocaleString()}</span> },
        { id: "type", header: "Type", width: 150, cell: (item) => <span className="text-sm capitalize">{item.type}</span> },
        { id: "dataSize", header: "Size", width: 120, cell: (item) => <span className="text-sm text-gray-900">{item.dataSize}</span> },
        { id: "itemCount", header: "Items", width: 120, cell: (item) => <span className="text-sm text-gray-900">{item.itemCount.toLocaleString()}</span> },
        { id: "status", header: "Status", width: 150, cell: (item) => <StatusBadge status={item.status} /> },
        { id: "lastVerified", header: "Last Verified", width: 200, cell: (item) => <span className="text-sm text-gray-500">{item.lastVerified ? new Date(item.lastVerified).toLocaleString() : 'Never'}</span> },
        {
            id: "actions", header: "Actions", width: 150, cell: (item) => (
                <div className="flex items-center justify-end gap-2 pr-4 w-full">
                    <button
                        onClick={() => verifyBackup(item.id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm font-medium"
                        title="Verify Backup"
                    >
                        <Play className="w-4 h-4" />
                        Verify
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Backup & Restore Manager</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Create, verify, and manage database backups
                    </p>
                </div>
                <button
                    onClick={createBackup}
                    disabled={creating}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {creating ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Creating...
                        </>
                    ) : (
                        <>
                            <Database className="w-4 h-4" />
                            Create Manual Backup
                        </>
                    )}
                </button>
            </div>

            {/* Warning Banner */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-800">Critical Operation</p>
                        <p className="text-sm text-red-700 mt-1">
                            Restore operations will overwrite existing data. Always verify backups before restoring.
                        </p>
                    </div>
                </div>
            </div>

            {/* Storage Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Database className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Backups</p>
                            <p className="text-2xl font-bold text-gray-900">{restorePoints.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Verified</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {restorePoints.filter(p => p.status === 'verified').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Latest Backup</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {restorePoints.length > 0
                                    ? new Date(restorePoints[0].timestamp).toLocaleDateString()
                                    : 'None'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Restore Points Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900">Restore Points</h3>
                </div>

                <div style={{ height: '400px' }}>
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : restorePoints.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No backup restore points found. Create your first backup above.
                        </div>
                    ) : (
                        <InteractiveSpreadsheet
                            columns={restorePointColumns}
                            data={restorePoints}
                            onChange={() => { }}
                            containerHeight="400px"
                        />
                    )}
                </div>
            </div>

            {/* Backup Schedule (Placeholder) */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Automated Backup Schedule</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Configure automated backup schedules to ensure regular data protection.
                </p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200">
                    Configure Schedule
                </button>
            </div>

            <AlertDialog open={showBackupConfirm} onOpenChange={setShowBackupConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Create Backup</AlertDialogTitle>
                        <AlertDialogDescription>
                            Create a new backup? This may take several minutes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={performCreateBackup}>
                            Create
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
