
import React, { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, ArrowRightLeft, Eye, Plus } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { NettingProposalCard } from "@/components/netting/NettingProposalCard";
import { SettlementExecutionModal } from "@/components/netting/SettlementExecutionModal";
import { NettingAgreementWizard } from "@/components/netting/NettingAgreementWizard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StandardPage } from "@/components/layout/StandardPage";


export default function NettingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("create");

    // Form State
    const [orgId1, setOrgId1] = useState("");
    const [orgId2, setOrgId2] = useState("");
    const [currency, setCurrency] = useState("USD");

    // Modal State
    const [selectedBatchForProposal, setSelectedBatchForProposal] = useState<any | null>(null);
    const [selectedBatchForSettlement, setSelectedBatchForSettlement] = useState<any | null>(null);
    const [showAgreementWizard, setShowAgreementWizard] = useState(false);

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
        <StandardPage title="Intercompany Settlement">
            <div className="flex items-center justify-between">
                <div>
                    
                    <p className="text-muted-foreground">Manage Netting Agreements and Cashless Settlements.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="create">Create Proposal</TabsTrigger>
                    <TabsTrigger value="batches">Settlement Batches</TabsTrigger>
                    <TabsTrigger value="agreements">Agreements</TabsTrigger>
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
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingBatches ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center"><TableSkeleton rows={4} /></TableCell>
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
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedBatchForProposal({
                                                                batchId: batch.id,
                                                                entityA: {
                                                                    id: batch.orgId1,
                                                                    name: orgs?.find((o: any) => o.id === batch.orgId1)?.orgName || batch.orgId1,
                                                                    owes: parseFloat(batch.totalPayables)
                                                                },
                                                                entityB: {
                                                                    id: batch.orgId2,
                                                                    name: orgs?.find((o: any) => o.id === batch.orgId2)?.orgName || batch.orgId2,
                                                                    owes: parseFloat(batch.totalReceivables)
                                                                },
                                                                netSettlement: {
                                                                    payer: parseFloat(batch.netAmount) > 0 ? orgs?.find((o: any) => o.id === batch.orgId2)?.orgName : orgs?.find((o: any) => o.id === batch.orgId1)?.orgName,
                                                                    payee: parseFloat(batch.netAmount) > 0 ? orgs?.find((o: any) => o.id === batch.orgId1)?.orgName : orgs?.find((o: any) => o.id === batch.orgId2)?.orgName,
                                                                    amount: Math.abs(parseFloat(batch.netAmount))
                                                                },
                                                                currency: batch.currencyCode,
                                                                transactions: []
                                                            })}
                                                        >
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            Proposal
                                                        </Button>
                                                        {batch.status === 'Draft' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedBatchForSettlement({
                                                                    ...batch,
                                                                    org1Name: orgs?.find((o: any) => o.id === batch.orgId1)?.orgName || batch.orgId1,
                                                                    org2Name: orgs?.find((o: any) => o.id === batch.orgId2)?.orgName || batch.orgId2
                                                                })}
                                                            >
                                                                Settle
                                                            </Button>
                                                        )}
                                                        {batch.status === 'Settled' && (
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="agreements">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Netting Agreements</CardTitle>
                                <Button onClick={() => setShowAgreementWizard(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Agreement
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No netting agreements configured yet.</p>
                                <p className="text-sm mt-2">Click "Create Agreement" to set up your first netting agreement.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Proposal Modal */}
            <Dialog open={!!selectedBatchForProposal} onOpenChange={() => setSelectedBatchForProposal(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Netting Proposal</DialogTitle>
                    </DialogHeader>
                    {selectedBatchForProposal && (
                        <NettingProposalCard proposal={selectedBatchForProposal} />
                    )}
                </DialogContent>
            </Dialog>

            {/* Settlement Execution Modal */}
            {selectedBatchForSettlement && (
                <SettlementExecutionModal
                    batchId={selectedBatchForSettlement.id}
                    batch={selectedBatchForSettlement}
                    isOpen={!!selectedBatchForSettlement}
                    onClose={() => setSelectedBatchForSettlement(null)}
                    onSuccess={() => setSelectedBatchForSettlement(null)}
                />
            )}

            {/* Agreement Wizard */}
            <NettingAgreementWizard
                isOpen={showAgreementWizard}
                onClose={() => setShowAgreementWizard(false)}
                onSuccess={() => setShowAgreementWizard(false)}
            />
        </StandardPage>
    );
}
