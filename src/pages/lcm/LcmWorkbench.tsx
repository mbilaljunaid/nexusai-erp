import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Ship, Calendar, DollarSign, ExternalLink, Filter, Search, MoreHorizontal, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";

export default function LcmWorkbench() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [inventoryOrgId, setInventoryOrgId] = useState<string>();

    const invOrgHeaders = buildScopeHeaders({ "inventory-org": inventoryOrgId });

    // Fetch Trade Operations
    const { data: operationsData, isLoading } = useQuery({
        queryKey: ["/api/lcm/trade-operations", page, inventoryOrgId],
        queryFn: async () => {
            const res = await fetch(`/api/lcm/trade-operations?page=${page}&limit=20`, { headers: invOrgHeaders });
            if (!res.ok) throw new Error("Failed to fetch trade operations");
            return res.json();
        }
    });

    const tradeOperations = operationsData?.data || [];
    const pagination = {
        total: operationsData?.total || 0,
        page: operationsData?.page || 1,
        totalPages: operationsData?.totalPages || 1
    };

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/lcm/trade-operations", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...invOrgHeaders },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create operation");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/lcm/trade-operations"] });
            toast({ title: "Trade Operation Created", description: `Operation ${data.operationNumber} has been initialized.` });
            // Navigate to details?
            setLocation(`/scm/lcm/operations/${data.id}`);
        }
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'OPEN': return 'default';
            case 'CLOSED': return 'secondary';
            case 'CANCELLED': return 'destructive';
            default: return 'outline';
        }
    };

    const getApprovalVariant = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING_APPROVAL': return 'warning';
            case 'REJECTED': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            {inventoryOrgId && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-sm">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span>LCM scoped to Inventory Org: <strong>{inventoryOrgId}</strong></span>
                </div>
            )}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Landed Cost Workbench</h1>
                    <p className="text-muted-foreground">Orchestrate global trade operations and monitor landed cost accruals.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <EnterpriseContextSwitcher type="inventory-org" value={inventoryOrgId} onChange={setInventoryOrgId} className="mr-2" />
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Operation
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Initialize Trade Operation</SheetTitle>
                                <SheetDescription>
                                    Create a new container or shipment tracking record.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Operation Name</label>
                                    <Input placeholder="e.g. Q1 Europe Electronics Import" id="new-op-name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Reference #</label>
                                    <Input placeholder="Internal Ref / BL #" id="new-op-ref" />
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        const name = (document.getElementById('new-op-name') as HTMLInputElement)?.value || "New Operation";
                                        const ref = (document.getElementById('new-op-ref') as HTMLInputElement)?.value;
                                        createMutation.mutate({ name, operationNumber: ref });
                                    }}
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? "Creating..." : "Initialize Operation"}
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Open Operations</CardTitle>
                        <Ship className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tradeOperations.filter((op: any) => op.status === 'OPEN').length}</div>
                        <p className="text-xs text-muted-foreground">Requiring cost allocation</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tradeOperations.filter((op: any) => op.approvalStatus === 'PENDING_APPROVAL').length}</div>
                        <p className="text-xs text-muted-foreground">Awaiting finance review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Estimated Accruals</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$124,500</div>
                        <p className="text-xs text-muted-foreground">Current month projections</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Trade Operations</CardTitle>
                            <CardDescription>Track shipments from departure to final landed cost closure.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search operations..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Operation #</TableHead>
                                    <TableHead>Name / Vessel</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Approval</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                <span className="text-sm text-muted-foreground font-medium italic">Syncing with logistics core...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : tradeOperations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                                            No trade operations found. Start by creating a new one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tradeOperations.map((op: any) => (
                                        <TableRow key={op.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setLocation(`/scm/lcm/operations/${op.id}`)}>
                                            <TableCell className="font-mono font-medium text-primary">
                                                {op.operationNumber}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{op.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{op.vessel || op.carrier || "Carrier Pending"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-[10px]">
                                                        <Badge variant="outline" className="px-1 py-0 h-4 min-w-[32px] justify-center">ETD</Badge>
                                                        <span className="text-muted-foreground">{op.departureDate ? format(new Date(op.departureDate), 'MMM d') : 'Pending'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px]">
                                                        <Badge variant="outline" className="px-1 py-0 h-4 min-w-[32px] justify-center">ETA</Badge>
                                                        <span className="text-muted-foreground font-medium">{op.arrivalDate ? format(new Date(op.arrivalDate), 'MMM d') : 'Pending'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(op.status)} className="text-[10px] uppercase">
                                                    {op.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getApprovalVariant(op.approvalStatus)} className="text-[10px] uppercase">
                                                    {op.approvalStatus?.replace('_', ' ') || 'DRAFT'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setLocation(`/scm/lcm/operations/${op.id}`)}>
                                                            <ExternalLink className="mr-2 h-4 w-4" /> View Console
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>Add Shipment Lines</DropdownMenuItem>
                                                        <DropdownMenuItem>Log Actual Charges</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <div className="text-sm font-medium">Page {page} of {pagination.totalPages}</div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
