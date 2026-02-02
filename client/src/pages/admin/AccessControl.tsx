
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Shield, AlertTriangle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ROLES } from "@shared/schema";

export default function AccessControl() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Users
    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ["/api/users"],
        queryFn: async () => {
            // Mocking fetch as we don't have a direct /api/users endpoint exposed for this yet in provided context, 
            // but we will assume it exists or use a placeholder.
            // Actually, usually admin/users exists. 
            // If not, we might need to add it. Let's assume /api/admin/users exists based on `admin` module.
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        }
    });

    // Fetch Audit Logs
    const { data: auditLogs, isLoading: logsLoading } = useQuery({
        queryKey: ["/api/audit-logs"],
        queryFn: async () => {
            const res = await fetch("/api/admin/audit-logs");
            if (!res.ok) throw new Error("Failed to fetch logs");
            return res.json();
        }
    });

    // Update Role Mutation
    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role })
            });
            if (!res.ok) throw new Error("Failed to update role");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            toast({ title: "Role Updated", description: "User role has been successfully updated." });
        },
        onError: (err) => {
            toast({ title: "Update Failed", description: err.message, variant: "destructive" });
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Shield className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security & Compliance</h1>
                    <p className="text-muted-foreground">Manage user access and review audit trails.</p>
                </div>
            </div>

            <Tabs defaultValue="access">
                <TabsList>
                    <TabsTrigger value="access">Access Control (RBAC)</TabsTrigger>
                    <TabsTrigger value="audit">Audit Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="access">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Role Assignment</CardTitle>
                            <CardDescription>Assign roles to control access levels.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {usersLoading ? <Loader2 className="animate-spin" /> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Current Role</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users?.map((user: any) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === ROLES.ADMIN ? "default" : "secondary"}>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        defaultValue={user.role}
                                                        onValueChange={(val) => updateRoleMutation.mutate({ userId: user.id, role: val })}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                                                            <SelectItem value={ROLES.GL_MANAGER}>GL Manager</SelectItem>
                                                            <SelectItem value={ROLES.GL_USER}>GL User</SelectItem>
                                                            <SelectItem value={ROLES.GL_VIEWER}>GL Viewer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audit">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Audit Logs</CardTitle>
                            <CardDescription>Track all critical system actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {logsLoading ? <Loader2 className="animate-spin" /> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Entity</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {auditLogs?.map((log: any) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                                                <TableCell>{log.userId}</TableCell>
                                                <TableCell className="font-mono text-xs">{log.action}</TableCell>
                                                <TableCell>{log.entityType} ({log.entityId})</TableCell>
                                                <TableCell>
                                                    <Badge variant={log.status === "SUCCESS" || log.status === "Approved" ? "outline" : "destructive"}>
                                                        {log.status || "INFO"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
