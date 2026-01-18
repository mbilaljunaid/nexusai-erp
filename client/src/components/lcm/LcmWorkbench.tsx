
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ship, Plus, DollarSign, PieChart, Sparkles, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import AllocationSideSheet from "./AllocationSideSheet";
import ChargeVarianceSheet from "./ChargeVarianceSheet";

export default function LcmWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newOpName, setNewOpName] = useState("");

    // Allocation Side Sheet State
    const [selectedOpId, setSelectedOpId] = useState<string | null>(null);
    const [isAllocationSheetOpen, setIsAllocationSheetOpen] = useState(false);
    const [isVarianceSheetOpen, setIsVarianceSheetOpen] = useState(false);

    const [page, setPage] = useState(1);

    // Fetch Trade Ops
    const { data: opData, isLoading } = useQuery({
        queryKey: ['lcmTradeOps', page],
        queryFn: async () => {
            const res = await fetch(`/api/lcm/trade-operations?page=${page}&limit=10`);
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        }
    });

    const tradeOps = opData?.data || [];
    const totalPages = opData?.totalPages || 1;

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/lcm/trade-operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newOpName, status: 'OPEN' })
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lcmTradeOps'] });
            setIsCreateOpen(false);
            setNewOpName("");
            toast({ title: "Trade Operation Created" });
        }
    });

    // Allocate Mutation
    const allocateMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/lcm/trade-operations/${id}/allocate`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({ title: `Allocated ${data.allocated} records` });
            if (selectedOpId) {
                queryClient.invalidateQueries({ queryKey: ['lcmAllocations', selectedOpId] });
            }
        }
    });

    // Predict Mutation
    const predictMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/lcm/trade-operations/${id}/predict`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({ title: `AI Predicted ${data.predictions.length} charges`, description: "Based on historical averages." });
            queryClient.invalidateQueries({ queryKey: ['lcmTradeOpDetails'] }); // Refresh details if viewing
        }
    });

}
    });

// Accounting Mutation
const accountingMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await fetch(`/api/lcm/trade-operations/${id}/accounting`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error("Failed");
        return res.json();
    },
    onSuccess: (data) => {
        toast({ title: "Accounting Created", description: `Journal ID: ${data.journalId}` });
    }
});

const handleViewAllocations = (id: string) => {
    setSelectedOpId(id);
    setIsAllocationSheetOpen(true);
};

const handleViewVariance = (id: string) => {
    setSelectedOpId(id);
    setIsVarianceSheetOpen(true);
};

return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Ship className="h-8 w-8 text-blue-600" />
                    Landed Cost Workbench
                </h1>
                <p className="text-muted-foreground">Manage Trade Operations, Charges, and Cost Allocations.</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Trade Operation
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Trade Operation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Operation Name (Voyage / Shipment)</label>
                            <Input
                                placeholder="e.g. Inbound Shipment #1001"
                                value={newOpName}
                                onChange={(e) => setNewOpName(e.target.value)}
                            />
                        </div>
                        <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                            Create
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Operations</CardTitle>
                    <Ship className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{opData?.total || 0}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Allocations</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Charges not yet distributed</p>
                </CardContent>
            </Card>
        </div>

        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Operation #</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> :
                        tradeOps?.length === 0 ? <TableRow><TableCell colSpan={5}>No Trade Operations found.</TableCell></TableRow> :
                            tradeOps?.map((op: any) => (
                                <TableRow key={op.id}>
                                    <TableCell className="font-medium">{op.operationNumber}</TableCell>
                                    <TableCell>{op.name}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                            {op.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{new Date(op.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => allocateMutation.mutate(op.id)}>
                                            Run Allocations
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleViewAllocations(op.id)}>
                                            <PieChart className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleViewVariance(op.id)}>
                                            <DollarSign className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => predictMutation.mutate(op.id)} title="AI Predict Costs">
                                            <Sparkles className="h-4 w-4 text-purple-500" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => accountingMutation.mutate(op.id)} title="Create Accounting">
                                            <BookOpen className="h-4 w-4 text-green-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 p-4">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="text-sm font-medium">Page {page} of {totalPages}</div>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>

        {selectedOpId && (
            <AllocationSideSheet
                tradeOpId={selectedOpId}
                isOpen={isAllocationSheetOpen}
                onClose={() => { setIsAllocationSheetOpen(false); setSelectedOpId(null); }}
            />
        )}

        {selectedOpId && (
            <ChargeVarianceSheet
                tradeOpId={selectedOpId}
                isOpen={isVarianceSheetOpen}
                onClose={() => { setIsVarianceSheetOpen(false); setSelectedOpId(null); }}
            />
        )}
    </div>
);
}
