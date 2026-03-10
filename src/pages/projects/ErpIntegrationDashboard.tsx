import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cloud, RefreshCw, CheckCircle2, AlertCircle, Settings, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface ErpConnection {
    id: string;
    name: string;
    system: "SAP" | "ORACLE" | "NETSUITE";
    status: "CONNECTED" | "DISCONNECTED" | "ERROR";
    lastSync?: string;
    endpoint: string;
}

interface ImportJob {
    id: string;
    connectionId: string;
    startTime: string;
    endTime?: string;
    status: "RUNNING" | "SUCCESS" | "FAILED";
    recordsProcessed: number;
    recordsFailed: number;
    errorMessage?: string;
}

export default function ErpIntegrationDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [newConnection, setNewConnection] = useState({
        name: "",
        system: "SAP" as const,
        endpoint: "",
        username: "",
        apiKey: ""
    });

    // Fetch ERP connections
    const { data: connections = [] } = useQuery<ErpConnection[]>({
        queryKey: ["erp-connections"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/integrations/connections");
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((c: any) => ({
                id: c.id,
                name: c.name,
                system: c.config?.system || "SAP",
                endpoint: c.config?.endpoint || "",
                status: c.status,
                lastSync: c.createdAt // Simple fallback
            }));
        }
    });

    // Fetch import history
    const { data: importHistory = [] } = useQuery<ImportJob[]>({
        queryKey: ["import-history"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/integrations/history");
            return res.json();
        }
    });

    // Configure connection mutation
    const configureMutation = useMutation({
        mutationFn: async (connData: typeof newConnection) => {
            const res = await fetch("/api/ppm/integrations/configure", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(connData)
            });
            if (!res.ok) throw new Error("Failed to configure connection");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["erp-connections"] });
            setIsConfigDialogOpen(false);
            toast({
                title: "Connection Configured",
                description: "ERP connection configured successfully."
            });
        }
    });

    // Manual sync mutation
    const syncMutation = useMutation({
        mutationFn: async (connectionId: string) => {
            const res = await fetch("/api/ppm/integrations/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connectionId })
            });
            if (!res.ok) throw new Error("Sync failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["import-history"] });
            toast({
                title: "Sync Started",
                description: "ERP sync initiated successfully."
            });
        }
    });



    return (
        <StandardPage
            title="ERP Integration Dashboard"
            description="Configure and monitor batch cost imports from ERP systems."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "ERP Integration" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Connections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{connections.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                                {connections.filter(c => c.status === "CONNECTED").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Today's Syncs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                                {importHistory.filter(j => j.startTime.startsWith("2026-02-11")).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Records Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                                {importHistory
                                    .filter(j => j.startTime.startsWith("2026-02-11"))
                                    .reduce((sum, j) => sum + j.recordsProcessed, 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ERP Connections */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Cloud className="h-5 w-5" /> ERP Connections
                                </CardTitle>
                                <CardDescription>Configure and manage ERP system integrations</CardDescription>
                            </div>
                            <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Settings className="h-4 w-4 mr-2" /> Configure Connection
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Configure ERP Connection</DialogTitle>
                                        <DialogDescription>Set up integration with your ERP system</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="connName">Connection Name *</Label>
                                            <Input
                                                id="connName"
                                                value={newConnection.name}
                                                onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                                                placeholder="e.g., SAP Production"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="system">ERP System</Label>
                                            <Select
                                                value={newConnection.system}
                                                onValueChange={(v: any) => setNewConnection({ ...newConnection, system: v })}
                                            >
                                                <SelectTrigger id="system">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SAP">SAP</SelectItem>
                                                    <SelectItem value="ORACLE">Oracle ERP</SelectItem>
                                                    <SelectItem value="NETSUITE">NetSuite</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endpoint">API Endpoint</Label>
                                            <Input
                                                id="endpoint"
                                                value={newConnection.endpoint}
                                                onChange={(e) => setNewConnection({ ...newConnection, endpoint: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="apiKey">API Key</Label>
                                            <Input
                                                id="apiKey"
                                                type="password"
                                                value={newConnection.apiKey}
                                                onChange={(e) => setNewConnection({ ...newConnection, apiKey: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>Cancel</Button>
                                        <Button
                                            onClick={() => configureMutation.mutate(newConnection)}
                                            disabled={configureMutation.isPending || !newConnection.name}
                                        >
                                            {configureMutation.isPending ? "Configuring..." : "Save Configuration"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Connection Name</TableHead>
                                    <TableHead>System</TableHead>
                                    <TableHead>Endpoint</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Sync</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {connections.map((conn) => (
                                    <TableRow key={conn.id}>
                                        <TableCell className="font-medium">{conn.name}</TableCell>
                                        <TableCell><Badge variant="outline">{conn.system}</Badge></TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-48">
                                            {conn.endpoint}
                                        </TableCell>
                                        <TableCell><StatusBadge status={conn.status} /></TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {conn.lastSync ? format(new Date(conn.lastSync), "MMM dd, HH:mm") : "Never"}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => syncMutation.mutate(conn.id)}
                                                disabled={syncMutation.isPending || conn.status !== "CONNECTED"}
                                            >
                                                <RefreshCw className="h-4 w-4 mr-1" />
                                                {syncMutation.isPending ? "Syncing..." : "Sync Now"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Import History */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle>Import History</CardTitle>
                        <CardDescription>Recent batch import jobs from ERP systems</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {importHistory.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No import history yet. Trigger a sync to get started.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="text-right">Processed</TableHead>
                                        <TableHead className="text-right">Failed</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {importHistory.map((job) => (
                                        <TableRow key={job.id}>
                                            <TableCell className="text-xs">{format(new Date(job.startTime), "MMM dd, HH:mm:ss")}</TableCell>
                                            <TableCell className="text-xs">
                                                {job.endTime
                                                    ? `${Math.round((new Date(job.endTime).getTime() - new Date(job.startTime).getTime()) / 1000)}s`
                                                    : "In progress"}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{job.recordsProcessed}</TableCell>
                                            <TableCell className="text-right font-mono text-red-600">{job.recordsFailed}</TableCell>
                                            <TableCell><StatusBadge status={job.status} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
