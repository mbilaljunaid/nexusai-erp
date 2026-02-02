
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

export default function NettingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("create");

    // Form State
    const [orgId1, setOrgId1] = useState("");
    const [orgId2, setOrgId2] = useState("");
    const [currency, setCurrency] = useState("USD");

    // Fetch Orgs (reuse existing API)
    const { data: orgs } = useQuery<any[]>({
        queryKey: ["/api/intercompany/orgs"],
    });

    // Fetch Batches
    const { data: batches, isLoading: isLoadingBatches } = useQuery<any[]>({
        queryKey: ["/api/netting/ic/batches"],
    });

    // Create Batch Mutation
    const createBatchMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/netting/ic/batches", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Netting Batch Created" });
            queryClient.invalidateQueries({ queryKey: ["/api/netting/ic/batches"] });
            setActiveTab("batches");
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    // Settle Batch Mutation
    const settleBatchMutation = useMutation({
        mutationFn: async (batchId: string) => {
            const res = await apiRequest("POST", `/api/netting/ic/batches/${batchId}/settle`, {});
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Batch Settled Successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/netting/ic/batches"] });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const handleCreate = () => {
        if (!orgId1 || !orgId2) {
            toast({ title: "Validation Error", description: "Select both organizations", variant: "destructive" });
            return;
        }
        if (orgId1 === orgId2) {
            toast({ title: "Validation Error", description: "Organizations must be different", variant: "destructive" });
            return;
        }
        createBatchMutation.mutate({ orgId1, orgId2, currencyCode: currency });
    };

    return (
        <div className="space-y-6 container mx-auto p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Intercompany Settlement</h1>
                    <p className="text-muted-foreground">Manage Netting Agreements and Cashless Settlements.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="create">Create Proposal</TabsTrigger>
                    <TabsTrigger value="batches">Settlement Batches</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Settlement Run</CardTitle>
                            <CardDescription>Select two entities to identify open transactions and calculate net position.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Party A (Provider/Receiver)</label>
                                    <Select value={orgId1} onValueChange={setOrgId1}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Organization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgs?.map((org: any) => (
                                                <SelectItem key={org.id} value={org.id}>{org.orgName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Party B (Provider/Receiver)</label>
                                    <Select value={orgId2} onValueChange={setOrgId2}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Organization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgs?.map((org: any) => (
                                                <SelectItem key={org.id} value={org.id}>{org.orgName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Currency</label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleCreate} disabled={createBatchMutation.isPending}>
                                    {createBatchMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Calculate & Create Batch
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="batches">
                    <Card>
                        <CardHeader>
                            <CardTitle>Netting Batches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Batch ID</TableHead>
                                        <TableHead>Entities</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Currency</TableHead>
                                        <TableHead className="text-right">Total A owed B</TableHead>
                                        <TableHead className="text-right">Total B owed A</TableHead>
                                        <TableHead className="text-right">Net Settlement</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingBatches ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center">Loading...</TableCell>
                                        </TableRow>
                                    ) : batches?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center text-muted-foreground">No batches found</TableCell>
                                        </TableRow>
                                    ) : (
                                        batches?.map((batch: any) => (
                                            <TableRow key={batch.id}>
                                                <TableCell className="font-mono text-xs">{batch.id.substring(0, 8)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{orgs?.find((o: any) => o.id === batch.orgId1)?.orgName || batch.orgId1}</span>
                                                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">{orgs?.find((o: any) => o.id === batch.orgId2)?.orgName || batch.orgId2}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{format(new Date(batch.createdAt), "MMM d, yyyy")}</TableCell>
                                                <TableCell>{batch.currencyCode}</TableCell>
                                                <TableCell className="text-right">{parseFloat(batch.totalPayables).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">{parseFloat(batch.totalReceivables).toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {parseFloat(batch.netAmount) > 0
                                                        ? `${parseFloat(batch.netAmount).toFixed(2)} (B pays A)`
                                                        : `${Math.abs(parseFloat(batch.netAmount)).toFixed(2)} (A pays B)`}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${batch.status === 'Settled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {batch.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {batch.status === 'Draft' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => settleBatchMutation.mutate(batch.id)}
                                                            disabled={settleBatchMutation.isPending}
                                                        >
                                                            {settleBatchMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Settle"}
                                                        </Button>
                                                    )}
                                                    {batch.status === 'Settled' && (
                                                        <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
