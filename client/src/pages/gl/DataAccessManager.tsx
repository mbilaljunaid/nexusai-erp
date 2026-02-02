
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
import { Lock, UserCheck, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DataAccessManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSet, setNewSet] = useState({
        name: "",
        description: "",
        accessLevel: "Read", // Read, Write
        ledgerId: "PRIMARY"
    });

    const { data: sets = [], isLoading } = useQuery({
        queryKey: ["/api/gl/access-sets"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/gl/access-sets");
            return res.json();
        }
    });

    const { data: ledgers = [] } = useQuery({
        queryKey: ["/api/finance/gl/ledgers"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/finance/gl/ledgers");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/gl/access-sets", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/access-sets"] });
            setIsCreateOpen(false);
            setNewSet({ name: "", description: "", accessLevel: "Read", ledgerId: "PRIMARY" });
            toast({ title: "Access Set Created", description: "Security definition saved." });
        }
    });

    const handleCreate = () => {
        if (!newSet.name) return;
        createMutation.mutate(newSet);
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Lock className="h-8 w-8 text-emerald-600" />
                        Data Access Sets
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Define security policies to restrict user access to specific Ledgers or Segment Values.
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Shield className="mr-2 h-4 w-4" /> Create Access Set
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Security Definitions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Set Name</TableHead>
                                    <TableHead>Access Level</TableHead>
                                    <TableHead>Ledger</TableHead>
                                    <TableHead>Segment Security</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
                                ) : sets.length === 0 ? (
                                    <TableRow><TableCell colSpan={5}>No Access Sets defined.</TableCell></TableRow>
                                ) : (
                                    sets.map((set: any) => (
                                        <TableRow key={set.id}>
                                            <TableCell className="font-medium">{set.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={set.accessLevel === "Write" ? "default" : "secondary"}>
                                                    {set.accessLevel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{ledgers.find((l: any) => l.id === set.ledgerId)?.name || set.ledgerId}</TableCell>
                                            <TableCell className="text-muted-foreground italic">None (All Values)</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Assign Users</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Data Access Set</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Set Name</Label>
                            <Input value={newSet.name} onChange={e => setNewSet({ ...newSet, name: e.target.value })} placeholder="US Ops Read-Only" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Access Level</Label>
                                <Select value={newSet.accessLevel} onValueChange={val => setNewSet({ ...newSet, accessLevel: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Read">Read Only</SelectItem>
                                        <SelectItem value="Write">Read & Write</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Target Ledger</Label>
                                <Select value={newSet.ledgerId} onValueChange={val => setNewSet({ ...newSet, ledgerId: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ledgers.map((l: any) => (
                                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>Create Policy</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
