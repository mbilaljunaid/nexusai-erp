
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
import { Badge } from "@/components/ui/badge"; // Fixed import
import { Plus, Library, Layers, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function LedgerSetSetup() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedSet, setSelectedSet] = useState<any>(null);

    // Form State
    const [newSet, setNewSet] = useState({ name: "", description: "" });
    const [assignment, setAssignment] = useState({ ledgerSetId: "", ledgerId: "" });

    // Fetch Ledger Sets
    const { data: ledgerSets = [], isLoading: setsLoading } = useQuery({
        queryKey: ["/api/gl/ledger-sets"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/gl/ledger-sets");
            return res.json();
        }
    });

    // Fetch Ledgers for Assignment
    const { data: ledgers = [] } = useQuery({
        queryKey: ["/api/finance/gl/ledgers"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/finance/gl/ledgers");
            return res.json();
        }
    });

    // Create Set Mutation
    const createSetMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/gl/ledger-sets", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/ledger-sets"] });
            setIsCreateOpen(false);
            setNewSet({ name: "", description: "" });
            toast({ title: "Success", description: "Ledger Set created." });
        }
    });

    // Assign Ledger Mutation
    const assignLedgerMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/gl/ledger-sets/assignments", data);
        },
        onSuccess: () => {
            // In a real app we'd fetch assignments separately or nested. 
            // For now just success toast.
            setIsAssignOpen(false);
            toast({ title: "Success", description: "Ledger assigned to set." });
        }
    });

    const handleCreate = () => {
        if (!newSet.name) return;
        createSetMutation.mutate(newSet);
    };

    const handleAssign = () => {
        if (!selectedSet || !assignment.ledgerId) return;
        assignLedgerMutation.mutate({
            ledgerSetId: selectedSet.id,
            ledgerId: assignment.ledgerId
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Ledger Sets</h1>
                    <p className="text-muted-foreground mt-2">
                        Group multiple ledgers for consolidated reporting and simultaneous period open/close.
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-[#0f172a]">
                    <Plus className="mr-2 h-4 w-4" /> Create Ledger Set
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items(ledgerSets, setsLoading)}
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Ledger Set</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={newSet.name} onChange={e => setNewSet({ ...newSet, name: e.target.value })} placeholder="Global Consolidation Set" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={newSet.description} onChange={e => setNewSet({ ...newSet, description: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreate} disabled={createSetMutation.isPending}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Dialog */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Ledger to {selectedSet?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Ledger</Label>
                            <Select onValueChange={(val) => setAssignment({ ...assignment, ledgerId: val })}>
                                <SelectTrigger><SelectValue placeholder="Choose Ledger" /></SelectTrigger>
                                <SelectContent>
                                    {ledgers.map((l: any) => (
                                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAssign} disabled={assignLedgerMutation.isPending}>Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );

    function items(sets: any[], loading: boolean) {
        if (loading) return <div>Loading...</div>;
        if (sets.length === 0) return <div className="text-muted-foreground col-span-3">No Ledger Sets defined.</div>;
        return sets.map(set => (
            <Card key={set.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">{set.name}</CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{set.description || "No description"}</p>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedSet(set); setIsAssignOpen(true); }}>
                        Manage Assignments
                    </Button>
                </CardContent>
            </Card>
        ));
    }
}
