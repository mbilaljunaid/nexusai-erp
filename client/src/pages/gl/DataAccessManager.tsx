
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Plus, UserPlus, Lock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GlDataAccessSet, GlDataAccessSetAssignment, GlLedger, User } from "@shared/schema";
import { useLedger } from "@/context/LedgerContext";

export default function DataAccessManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { currentLedgerId, ledgers } = useLedger();
    const [isAddSetOpen, setIsAddSetOpen] = useState(false);
    const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);

    // Form States
    const [setData, setSetData] = useState<Partial<GlDataAccessSet>>({
        name: "",
        description: "",
        ledgerId: currentLedgerId || "",
        accessLevel: "Read/Write",
        segmentSecurity: {},
        isActive: true
    });

    const [assignmentData, setAssignmentData] = useState<Partial<GlDataAccessSetAssignment>>({
        userId: "",
        dataAccessSetId: ""
    });

    const activeLedger = ledgers.find(l => l.id === currentLedgerId);

    // Queries
    const { data: accessSets = [], isLoading: isLoadingSets } = useQuery<GlDataAccessSet[]>({
        queryKey: ["/api/finance/gl/access-sets"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/finance/gl/access-sets");
            return res.json();
        }
    });

    const { data: users = [] } = useQuery<User[]>({
        queryKey: ["/api/users"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/users");
            return res.json();
        }
    });

    // Mutations
    const createSetMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/finance/gl/access-sets", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/access-sets"] });
            setIsAddSetOpen(false);
            setSetData({
                name: "", description: "", ledgerId: currentLedgerId || "", accessLevel: "Read/Write", segmentSecurity: {}, isActive: true
            });
            toast({ title: "Access Set Created", description: "New Data Access Set added successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const createAssignmentMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/finance/gl/access-set-assignments", data);
        },
        onSuccess: () => {
            // Assignments might need their own list or we just toast
            toast({ title: "Assignment Created", description: "User assigned to Data Access Set." });
            setIsAddAssignmentOpen(false);
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleCreateSet = () => {
        if (!setData.name || !setData.ledgerId) {
            toast({ title: "Validation Error", description: "Name and Ledger are required.", variant: "destructive" });
            return;
        }
        createSetMutation.mutate(setData);
    };

    const handleCreateAssignment = () => {
        if (!assignmentData.userId || !assignmentData.dataAccessSetId) {
            toast({ title: "Validation Error", description: "User and Access Set are required.", variant: "destructive" });
            return;
        }
        createAssignmentMutation.mutate(assignmentData);
    };

    return (
        <div className="space-y-6 p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Lock className="h-8 w-8 text-primary" /> Data Access Sets
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage security privileges and segment restrictions for GL users.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsAddAssignmentOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Assign User
                    </Button>
                    <Button onClick={() => setIsAddSetOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Access Set
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="sets" className="w-full">
                <TabsList>
                    <TabsTrigger value="sets">Access Sets</TabsTrigger>
                    <TabsTrigger value="security">Segment Security Controls</TabsTrigger>
                </TabsList>

                <TabsContent value="sets" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Defined Access Sets</CardTitle>
                            <CardDescription>
                                These sets define what ledgers and segments a user can access.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Ledger</TableHead>
                                        <TableHead>Access Level</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Security Summary</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingSets ? (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
                                    ) : accessSets.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No access sets defined.</TableCell></TableRow>
                                    ) : (
                                        accessSets.map((set) => (
                                            <TableRow key={set.id}>
                                                <TableCell className="font-medium">{set.name}</TableCell>
                                                <TableCell>{ledgers.find(l => l.id === set.ledgerId)?.name || set.ledgerId}</TableCell>
                                                <TableCell>{set.accessLevel}</TableCell>
                                                <TableCell>
                                                    {set.isActive ?
                                                        <Badge className="bg-green-600">Active</Badge> :
                                                        <Badge variant="outline">Inactive</Badge>
                                                    }
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {Object.keys(set.segmentSecurity as object || {}).length > 0 ?
                                                        JSON.stringify(set.segmentSecurity) : "Full Access (All Segments)"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Segment Security</CardTitle>
                            <CardDescription>
                                Segment-level security (e.g. "Only allow Company 10") is defined within each Access Set.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-40 flex items-center justify-center text-muted-foreground italic">
                            Select an Access Set to edit detailed segment-level restrictions.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Set Dialog */}
            <Dialog open={isAddSetOpen} onOpenChange={setIsAddSetOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create Data Access Set</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Set Name</Label>
                            <Input
                                value={setData.name}
                                onChange={(e) => setSetData({ ...setData, name: e.target.value })}
                                placeholder="e.g. US_Ledger_Full_Access"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Ledger</Label>
                            <Select
                                value={setData.ledgerId || ""}
                                onValueChange={(v) => setSetData({ ...setData, ledgerId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Ledger" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ledgers.map(l => (
                                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Access Level</Label>
                            <Select
                                value={setData.accessLevel || ""}
                                onValueChange={(v) => setSetData({ ...setData, accessLevel: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Read Only">Read Only</SelectItem>
                                    <SelectItem value="Read/Write">Read/Write</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={setData.description || ""}
                                onChange={(e) => setSetData({ ...setData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={!!setData.isActive}
                                onCheckedChange={(c) => setSetData({ ...setData, isActive: c })}
                            />
                            <Label>Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddSetOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateSet} disabled={createSetMutation.isPending}>Create Set</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign User Dialog */}
            <Dialog open={isAddAssignmentOpen} onOpenChange={setIsAddAssignmentOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Assign Access Set to User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select User</Label>
                            <Select
                                value={assignmentData.userId || ""}
                                onValueChange={(v) => setAssignmentData({ ...assignmentData, userId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose User" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.email || u.id}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Data Access Set</Label>
                            <Select
                                value={assignmentData.dataAccessSetId || ""}
                                onValueChange={(v) => setAssignmentData({ ...assignmentData, dataAccessSetId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose Access Set" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accessSets.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddAssignmentOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateAssignment} disabled={createAssignmentMutation.isPending}>Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
