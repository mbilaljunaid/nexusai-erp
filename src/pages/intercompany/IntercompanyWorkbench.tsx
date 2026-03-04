
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Check, X, Building2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import TransferPricingRules from "./TransferPricingRules";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function IntercompanyWorkbench() {
    const [activeTab, setActiveTab] = useState("outbound");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [leId, setLeId] = useState<string>();
    const scopeHeaders = buildScopeHeaders({ "legal-entity": leId });

    // Mock User Org (In real app, get from Context)
    const currentOrgId = leId || "ICO-101";

    // --- Outbound: My Batches ---
    const [page, setPage] = useState(1);
    const { data: batchData, isLoading: isLoadingBatches } = useQuery({
        queryKey: ["ic-batches-outbound", currentOrgId, page],
        queryFn: async () => {
            const res = await fetch(`/api/intercompany/batches?initiatorOrgId=${currentOrgId}&role=INITIATOR&page=${page}&limit=10`, { headers: scopeHeaders });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const outboundBatches = batchData?.data || [];
    const meta = batchData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

    const submitBatch = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/intercompany/batches/${id}/submit`, {
                method: "POST",
                headers: scopeHeaders
            });
            if (!res.ok) throw new Error("Failed to submit");
        },
        onSuccess: () => {
            toast({ title: "Batch Submitted", description: "Sent to receiver for approval." });
            queryClient.invalidateQueries({ queryKey: ["ic-batches-outbound"] });
        }
    });

    const resubmitTransaction = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/intercompany/transactions/${id}/resubmit`, {
                method: "POST",
                headers: scopeHeaders
            });
            if (!res.ok) throw new Error("Failed to resubmit");
        },
        onSuccess: () => {
            toast({ title: "Transaction Resubmitted", description: "Created new draft batch." });
            queryClient.invalidateQueries({ queryKey: ["ic-batches-outbound"] });
        }
    });

    // --- Inbound: Action Required ---
    const { data: inboundTransactions, isLoading: inboundLoading } = useQuery({
        queryKey: ["ic-inbound", currentOrgId],
        queryFn: async () => {
            const res = await fetch(`/api/intercompany/transactions/inbound?receiverOrgId=${currentOrgId}`, { headers: scopeHeaders });
            if (!res.ok) throw new Error("Failed to fetch inbound");
            return res.json();
        }
    });

    const respondTransaction = useMutation({
        mutationFn: async ({ id, action, rejectionReason }: { id: string, action: "APPROVE" | "REJECT", rejectionReason?: string }) => {
            const res = await fetch(`/api/intercompany/transactions/${id}/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...scopeHeaders },
                body: JSON.stringify({
                    action,
                    rejectionReason,
                    // Mocking receiver lines for simplicity in UI if Approved
                    receiverLines: action === "APPROVE" ? [{ codeCombinationId: "101-000-6000-000-000", enteredDr: 1000, description: "Auto-Expense" }] : undefined
                })
            });
            if (!res.ok) throw new Error("Failed to respond");
        },
        onSuccess: () => {
            toast({ title: "Transaction Processed", variant: "default" });
            queryClient.invalidateQueries({ queryKey: ["ic-inbound"] });
        }
    });

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'submitted': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const outboundColumns: SpreadsheetColumn<any>[] = [
        { id: "id", header: "Batch ID", width: "100px", cell: (item: any) => <span className="font-mono text-xs">{item.id}</span> },
        { id: "createdAt", header: "Date", width: "120px", cell: (item: any) => new Date(item.createdAt).toLocaleDateString() },
        { id: "receiverOrgId", header: "Counterparty", width: "150px", cell: (item: any) => item.receiverOrgId },
        { id: "totalAmount", header: "Amount", width: "120px", cell: (item: any) => <span className="font-mono text-right block w-full">{formatCurrency(item.totalAmount)}</span> },
        { id: "currency", header: "Currency", width: "100px", cell: (item: any) => item.currency || "USD" },
        { id: "status", header: "Status", width: "120px", cell: (item: any) => <Badge className={getStatusColor(item.status)}>{item.status}</Badge> }
    ];

    const inboundColumns: SpreadsheetColumn<any>[] = [
        { id: "id", header: "Transaction ID", width: "100px", cell: (item: any) => <span className="font-mono text-xs">{item.id.substring(0, 8)}...</span> },
        { id: "createdAt", header: "Date", width: "120px", cell: (item: any) => new Date(item.createdAt).toLocaleDateString() },
        { id: "providerOrgId", header: "From Entity", width: "150px", cell: (item: any) => item.providerOrgId },
        { id: "transactionTypeId", header: "Type", width: "150px", cell: (item: any) => item.transactionTypeId },
        { id: "amount", header: "Amount", width: "120px", cell: (item: any) => <span className="font-mono text-right block w-full">{formatCurrency(item.amount)}</span> },
        { id: "status", header: "Status", width: "120px", cell: (item: any) => <Badge className={getStatusColor(item.status)}>{item.status}</Badge> },
        {
            id: "actions", header: "Action", width: "150px", cell: (item: any) => (
                item.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-green-600 h-8 px-2"
                            onClick={() => respondTransaction.mutate({ id: item.id, action: "APPROVE" })}>
                            <Check className="w-4 h-4" />
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 h-8 px-2">
                                    <X className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Reject Transaction</DialogTitle></DialogHeader>
                                <div className="space-y-4">
                                    <Input id={`reason-${item.id}`} placeholder="Enter Rejection Reason..." />
                                    <Button onClick={() => {
                                        const el = document.getElementById(`reason-${item.id}`) as HTMLInputElement;
                                        respondTransaction.mutate({ id: item.id, action: "REJECT", rejectionReason: el?.value || "No reason" });
                                    }}>Confirm Rejection</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )
            )
        }
    ];

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Intercompany Workbench</h1>
                    <p className="text-muted-foreground">Manage outbound charges and inbound approvals.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <EnterpriseContextSwitcher type="legal-entity" value={leId} onChange={setLeId} className="mr-2" />
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Batch
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>

                <TabsList>
                    <TabsTrigger value="outbound">Outbound (My Charges)</TabsTrigger>
                    <TabsTrigger value="inbound">Inbound (Action Required)</TabsTrigger>
                    <TabsTrigger value="config">Transfer Pricing</TabsTrigger>
                </TabsList>

                <TabsContent value="outbound" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>My Outbound Batches</CardTitle></CardHeader>
                        <CardContent>
                            {isLoadingBatches ? (
                                <div className="text-center py-4 text-muted-foreground">Loading outbound charges...</div>
                            ) : (
                                <div style={{ height: '400px' }}>
                                    <InteractiveSpreadsheet
                                        columns={outboundColumns}
                                        data={outboundBatches}
                                        rowKey="id"
                                        containerHeight="400px"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inbound" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Inbound Transactions (Requiring Approval)</CardTitle></CardHeader>
                        <CardContent>
                            {inboundLoading ? (
                                <div className="text-center py-4 text-muted-foreground">Loading inbound...</div>
                            ) : (
                                <div style={{ height: '400px' }}>
                                    <InteractiveSpreadsheet
                                        columns={inboundColumns}
                                        data={inboundTransactions || []}
                                        onChange={() => { }}
                                        containerHeight="400px"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="config" className="mt-4">
                    <TransferPricingRules />
                </TabsContent>
            </Tabs>
        </div>
    );
}
