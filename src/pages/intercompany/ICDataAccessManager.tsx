import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Search, Shield } from "lucide-react";

export default function ICDataAccessManager() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const [selectedAccessLevel, setSelectedAccessLevel] = useState("FULL");

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch IC Organizations
    const { data: icOrgs = [] } = useQuery({
        queryKey: ["ic-orgs"],
        queryFn: async () => {
            const res = await fetch("/api/intercompany/orgs");
            if (!res.ok) throw new Error("Failed to fetch IC organizations");
            return res.json();
        }
    });

    // Fetch Data Access Sets
    const { data: accessSets = [], isLoading } = useQuery({
        queryKey: ["ic-data-access"],
        queryFn: async () => {
            const res = await fetch("/api/intercompany/data-access");
            if (!res.ok) throw new Error("Failed to fetch data access sets");
            return res.json();
        }
    });

    // Fetch Users (simplified - in production would search from user service)
    const { data: users = [] } = useQuery({
        queryKey: ["users-search", searchTerm],
        queryFn: async () => {
            if (!searchTerm) return [];
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
            if (!res.ok) return [];
            return res.json();
        },
        enabled: searchTerm.length > 2
    });

    // Create Access Set
    const createMutation = useMutation({
        mutationFn: async (payload: { userId: string, icOrgId: string, accessLevel: string }) => {
            const res = await fetch("/api/intercompany/data-access", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create access set");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ic-data-access"] });
            toast({ title: "Success", description: "User access granted successfully" });
            setIsDialogOpen(false);
            setSelectedUserId("");
            setSelectedOrgId("");
            setSelectedAccessLevel("FULL");
            setSearchTerm("");
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    // Delete Access Set
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/intercompany/data-access/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete access set");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ic-data-access"] });
            toast({ title: "Success", description: "User access revoked successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const handleCreate = () => {
        if (!selectedUserId || !selectedOrgId) {
            toast({ title: "Validation Error", description: "Please select both user and organization", variant: "destructive" });
            return;
        }
        createMutation.mutate({
            userId: selectedUserId,
            icOrgId: selectedOrgId,
            accessLevel: selectedAccessLevel
        });
    };

    const getOrgName = (orgId: string) => {
        const org = icOrgs.find((o: any) => o.id === orgId);
        return org ? org.orgName : orgId;
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8 text-indigo-600" />
                        IC Data Access Management
                    </h1>
                    <p className="text-muted-foreground">Manage user access to Intercompany organizations</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Grant Access
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Grant IC Organization Access</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {/* User Search */}
                            <div className="space-y-2">
                                <Label htmlFor="user-search">Search User</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="user-search"
                                        placeholder="Type to search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                {users.length > 0 && (
                                    <div className="border rounded-md max-h-40 overflow-y-auto">
                                        {users.map((user: any) => (
                                            <div
                                                key={user.id}
                                                className={`p-2 hover:bg-muted cursor-pointer ${selectedUserId === user.id ? "bg-muted" : ""}`}
                                                onClick={() => {
                                                    setSelectedUserId(user.id);
                                                    setSearchTerm(user.name || user.email);
                                                }}
                                            >
                                                <div className="font-medium">{user.name || user.email}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* IC Organization */}
                            <div className="space-y-2">
                                <Label htmlFor="ic-org">IC Organization</Label>
                                <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                                    <SelectTrigger id="ic-org">
                                        <SelectValue placeholder="Select organization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {icOrgs.map((org: any) => (
                                            <SelectItem key={org.id} value={org.id}>
                                                {org.orgName} ({org.companySegment})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Access Level */}
                            <div className="space-y-2">
                                <Label htmlFor="access-level">Access Level</Label>
                                <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                                    <SelectTrigger id="access-level">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FULL">Full Access</SelectItem>
                                        <SelectItem value="READ_ONLY">Read Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Granting..." : "Grant Access"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Access Sets Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Access Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading access sets...</div>
                    ) : accessSets.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No access assignments yet. Click "Grant Access" to add users.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>IC Organization</TableHead>
                                        <TableHead>Access Level</TableHead>
                                        <TableHead>Granted At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accessSets.map((set: any) => (
                                        <TableRow key={set.id}>
                                            <TableCell className="font-mono text-xs">{set.userId}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{getOrgName(set.icOrgId)}</div>
                                                <div className="text-xs text-muted-foreground">{set.icOrgId}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={set.accessLevel === "FULL" ? "default" : "secondary"}>
                                                    {set.accessLevel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(set.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteMutation.mutate(set.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
