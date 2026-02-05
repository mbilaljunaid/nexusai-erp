
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, ArrowRight, Check, X, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import TransferPricingRules from "./TransferPricingRules";

export default function IntercompanyWorkbench() {
    const [activeTab, setActiveTab] = useState("outbound");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Mock User Org (In real app, get from Context)
    const currentOrgId = "ICO-101";

    // --- Outbound: My Batches ---
    const [page, setPage] = useState(1);
    const { data: batchData, isLoading } = useQuery({
        queryKey: ["ic-batches-outbound", currentOrgId, page],
        queryFn: async () => {
            const res = await fetch(`/api/intercompany/batches?initiatorOrgId=${currentOrgId}&role=INITIATOR&page=${page}&limit=10`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const outboundBatches = batchData?.data || [];
    const meta = batchData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

    const submitBatch = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/intercompany/batches/${id}/submit`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to submit");
        },
        onSuccess: () => {
            toast({ title: "Batch Submitted", description: "Sent to receiver for approval." });
            queryClient.invalidateQueries({ queryKey: ["ic-batches-outbound"] });
        }
    });

    const resubmitTransaction = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/intercompany/transactions/${id}/resubmit`, { method: "POST" });
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
            const res = await fetch(`/api/intercompany/transactions/inbound?receiverOrgId=${currentOrgId}`);
            if (!res.ok) throw new Error("Failed to fetch inbound");
            return res.json();
        }
    });

    const respondTransaction = useMutation({
        mutationFn: async ({ id, action, rejectionReason }: { id: string, action: "APPROVE" | "REJECT", rejectionReason?: string }) => {
            const res = await fetch(`/api/intercompany/transactions/${id}/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Intercompany Workbench</h1>
                    <p className="text-muted-foreground">Manage outbound charges and inbound approvals.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Batch
                </Button>
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
                            {/* Simplified Table */}
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="p-3 text-left font-medium">Batch ID</th>
                                            <th className="p-3 text-left font-medium">Description</th>
                                            <th className="p-3 text-left font-medium">Status</th>
                                            <th className="p-3 text-right font-medium">Amount</th>
                                            <th className="p-3 text-center font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {outboundBatches?.map((b: any) => (
                                            <tr key={b.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-3">{b.id}</td>
                                                <td className="p-3">{b.description}</td>
                                                <td className="p-3">
                                                    <Badge variant={b.status === "SUBMITTED" ? "secondary" : b.status === "REJECTED" ? "destructive" : "outline"}>
                                                        {b.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-right">{formatCurrency(b.totalAmount)}</td>
                                                <td className="p-3 text-center">
                                                    {b.status === "DRAFT" && (
                                                        <Button variant="ghost" size="sm" onClick={() => submitBatch.mutate(b.id)}>
                                                            Submit <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {b.status === "REJECTED" && (
                                                        <Button variant="outline" size="sm" onClick={() => resubmitTransaction.mutate(b.id)}>
                                                            <RefreshCw className="mr-2 h-4 w-4" /> Resubmit
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Page {meta.page} of {meta.totalPages} (Total: {meta.total})
                                </div>
                                <div className="space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}>Next</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inbound" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Inbound Transactions (Requiring Approval)</CardTitle></CardHeader>
                        <CardContent>
                            {inboundLoading ? <div>Loading...</div> : (
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="p-3 text-left font-medium">Transaction ID</th>
                                                <th className="p-3 text-left font-medium">Provider</th>
                                                <th className="p-3 text-left font-medium">Type</th>
                                                <th className="p-3 text-right font-medium">Base Cost</th>
                                                <th className="p-3 text-right font-medium">Markup</th>
                                                <th className="p-3 text-right font-medium">Total</th>
                                                <th className="p-3 text-center font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inboundTransactions?.map((t: any) => {
                                                const total = Number(t.amount);
                                                const rate = Number(t.markupRate || 0);
                                                const base = total / (1 + rate);
                                                const markup = total - base;

                                                return (
                                                    <tr key={t.id} className="border-b transition-colors hover:bg-muted/50">
                                                        <td className="p-3 font-mono text-xs">{t.id.substring(0, 8)}...</td>
                                                        <td className="p-3">{t.providerOrgId}</td>
                                                        <td className="p-3">{t.transactionTypeId}</td>
                                                        <td className="p-3 text-right">{formatCurrency(base)}</td>
                                                        <td className="p-3 text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span>{formatCurrency(markup)}</span>
                                                                {rate > 0 && <span className="text-xs text-muted-foreground">{(rate * 100).toFixed(1)}%</span>}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-right font-bold">{formatCurrency(total)}</td>
                                                        <td className="p-3 text-center space-x-2">
                                                            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 h-8"
                                                                onClick={() => respondTransaction.mutate({ id: t.id, action: "APPROVE" })}>
                                                                <Check className="h-4 w-4 mr-1" /> Approve
                                                            </Button>

                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button size="sm" variant="destructive" className="h-8">
                                                                        <X className="h-4 w-4 mr-1" /> Reject
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader><DialogTitle>Reject Transaction</DialogTitle></DialogHeader>
                                                                    <div className="space-y-4">
                                                                        <Input id={`reason-${t.id}`} placeholder="Enter Rejection Reason..." />
                                                                        <Button onClick={() => {
                                                                            const el = document.getElementById(`reason-${t.id}`) as HTMLInputElement;
                                                                            respondTransaction.mutate({ id: t.id, action: "REJECT", rejectionReason: el?.value || "No reason" });
                                                                        }}>Confirm Rejection</Button>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {!inboundTransactions?.length && (
                                                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No pending transactions.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
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
