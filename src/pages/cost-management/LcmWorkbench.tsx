import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Link as LinkIcon, Ship, Calendar, DollarSign, ExternalLink } from 'lucide-react';
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
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";
import { ContextualSearch } from "@/components/ContextualSearch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber } from '@/lib/formatters';


export default function LcmWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [newOpName, setNewOpName] = useState("");
    const [newOpNum, setNewOpNum] = useState("");

    // Fetch Trade Operations
    const { data: operationsData, isLoading } = useQuery<any>({
        queryKey: ["/api/lcm/trade-operations", page],
        queryFn: async () => {
            const res = await fetch(`/api/lcm/trade-operations?page=${page}&limit=20`);
            if (!res.ok) throw new Error("Failed to fetch trade operations");
            return res.json();
        }
    });

    const tradeOperations = operationsData?.items || operationsData || [];

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/lcm/trade-operations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create operation");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/lcm/trade-operations"] });
            setNewOpName("");
            setNewOpNum("");
            toast({ title: "Trade Operation Created" });
        }
    });

    return (
        <StandardPage title="Landed Cost Workbench">
            <div className="flex justify-between items-center">
                <div>

                    <p className="text-muted-foreground">Manage Trade Operations, shipments, and cost allocations.</p>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Trade Operation
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create Trade Operation</SheetTitle>
                            <SheetDescription>
                                Start a new shipment lifecycle to track landed costs.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="opName">Operation Name</Label>
                                <Input
                                    id="opName"
                                    placeholder="e.g. Shanghai to LA Shipment"
                                    value={newOpName}
                                    onChange={(e) => setNewOpName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="opNum">Operation Number</Label>
                                <Input
                                    id="opNum"
                                    placeholder="e.g. TO-2026-X"
                                    value={newOpNum}
                                    onChange={(e) => setNewOpNum(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full mt-4"
                                onClick={() => createMutation.mutate({ name: newOpName, operationNumber: newOpNum })}
                                disabled={!newOpName || !newOpNum || createMutation.isPending}
                            >
                                {createMutation.isPending ? "Creating..." : "Create Trade Operation"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid gap-6 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Trade Operations</CardTitle>
                        <CardDescription>Shipments pending allocation or implementation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="max-w-sm">
                                <ContextualSearch
                                    placeholder="Search by Operation # or Vessel..."
                                    fields={[{ key: "query", label: "Search", type: "text" }]}
                                    onSearch={() => { }}
                                />
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Operation #</TableHead>
                                            <TableHead>Reference / Vessel</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Departure</TableHead>
                                            <TableHead>Arrival</TableHead>
                                            <TableHead className="text-right">Est. Charges</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-6">Loading Operations...</TableCell>
                                            </TableRow>
                                        ) : tradeOperations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                                    No active trade operations found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            tradeOperations.map((op: any) => (
                                                <TableRow key={op.id}>
                                                    <TableCell className="font-medium">{op.operationNumber}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span>{op.name || "N/A"}</span>
                                                            <span className="text-xs text-muted-foreground">{op.vessel ? `Vessel: ${op.vessel}` : ""}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={op.status === 'CLOSED' ? 'secondary' : 'default'} className="uppercase text-[10px]">
                                                            {op.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{op.departureDate ? format(new Date(op.departureDate), 'MMM d, yyyy') : '-'}</TableCell>
                                                    <TableCell>{op.arrivalDate ? format(new Date(op.arrivalDate), 'MMM d, yyyy') : '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        {op.totalEstimatedCost ? `$${formatNumber(Number(op.totalEstimatedCost))}` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" aria-label="Open link">
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>View Details</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
