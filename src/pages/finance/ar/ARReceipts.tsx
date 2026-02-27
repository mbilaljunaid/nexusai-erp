import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Plus, Link, Unlink, RotateCcw } from "lucide-react";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";

export default function ARReceipts() {
    const { toast } = useToast();
    const [page, setPage] = useState(1);
    const [accountingModalOpen, setAccountingModalOpen] = useState(false);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

    const [newReceipt, setNewReceipt] = useState({ transactionId: "", amount: "", paymentMethod: "EFT", status: "Unapplied", customerId: "" });
    const [applyData, setApplyData] = useState({ invoiceId: "", amount: "" });
    const [chargebackData, setChargebackData] = useState({ invoiceId: "", amount: "" });

    const { data: receipts = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/ar/receipts"],
        queryFn: () => fetch("/api/ar/receipts").then(r => r.json()),
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => await apiRequest("POST", "/api/ar/receipts", { ...data, amount: data.amount.toString() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/receipts"] });
            setNewReceipt({ transactionId: "", amount: "", paymentMethod: "EFT", status: "Unapplied", customerId: "" });
            toast({ title: "Receipt created" });
        },
    });

    const applyMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => await apiRequest("POST", `/api/ar/receipts/${id}/apply`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/receipts"] });
            toast({ title: "Receipt Applied to Invoice" });
            setSelectedReceipt(null);
        },
        onError: (err: any) => {
            toast({ title: "Application Failed", description: err.message, variant: "destructive" });
        }
    });

    const chargebackMutation = useMutation({
        mutationFn: async (data: any) => await apiRequest("POST", "/api/ar/invoices/chargeback", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/receipts"] });
            toast({ title: "Chargeback Generated" });
            setSelectedReceipt(null);
        }
    });

    const columns: Column<any>[] = [
        { header: "Transaction Ref", accessorKey: "transactionId", className: "font-semibold" },
        { header: "Method", accessorKey: "paymentMethod" },
        { header: "Amount", cell: (r) => `$${Number(r.amount).toFixed(2)}` },
        { header: "Status", cell: (r) => <Badge variant={r.status === 'Applied' ? 'default' : 'secondary'}>{r.status}</Badge> },
        {
            header: "Accounting",
            cell: (r) => (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedEntityId(r.id); setAccountingModalOpen(true); }}>
                    View GL
                </Button>
            )
        },
        {
            header: "Actions",
            cell: (r) => (
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 shadow-sm" onClick={() => setSelectedReceipt(r)}>
                                <Link className="w-4 h-4 mr-1" /> Apply
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Apply Receipt to Invoice</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <Input placeholder="Invoice ID (UUID)" value={applyData.invoiceId} onChange={e => setApplyData({ ...applyData, invoiceId: e.target.value })} />
                                <Input placeholder="Amount to Apply" type="number" value={applyData.amount} onChange={e => setApplyData({ ...applyData, amount: e.target.value })} />
                                <Button className="w-full" onClick={() => applyMutation.mutate({ id: r.id, data: applyData })}>Apply Balance</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 shadow-sm text-orange-600" onClick={() => setSelectedReceipt(r)}>
                                <RotateCcw className="w-4 h-4 mr-1" /> Chargeback
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create Chargeback (Bounced Payment)</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <Input placeholder="Original Invoice ID (UUID)" value={chargebackData.invoiceId} onChange={e => setChargebackData({ ...chargebackData, invoiceId: e.target.value })} />
                                <Input placeholder="Chargeback Amount" type="number" value={chargebackData.amount} onChange={e => setChargebackData({ ...chargebackData, amount: e.target.value })} />
                                <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => chargebackMutation.mutate({ receiptId: r.id, ...chargebackData })}>Process Chargeback</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">AR Receipts Workbench</h1>
            </div>

            <Card>
                <CardHeader><CardTitle>Record New Receipt</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        <Input placeholder="Transaction Ref #" value={newReceipt.transactionId} onChange={e => setNewReceipt({ ...newReceipt, transactionId: e.target.value })} />
                        <Input placeholder="Customer ID" value={newReceipt.customerId} onChange={e => setNewReceipt({ ...newReceipt, customerId: e.target.value })} />
                        <Input placeholder="Amount" type="number" value={newReceipt.amount} onChange={e => setNewReceipt({ ...newReceipt, amount: e.target.value })} />
                        <Select value={newReceipt.paymentMethod} onValueChange={v => setNewReceipt({ ...newReceipt, paymentMethod: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EFT">Electronic (EFT)</SelectItem>
                                <SelectItem value="Check">Check</SelectItem>
                                <SelectItem value="Wire">Wire Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={() => createMutation.mutate(newReceipt)} disabled={createMutation.isPending || !newReceipt.transactionId}>
                        <Plus className="w-4 h-4 mr-2" /> Submit Receipt
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Receipt Inventory</CardTitle></CardHeader>
                <CardContent>
                    <StandardTable data={receipts} columns={columns} isLoading={isLoading} filterColumn="transactionId" filterPlaceholder="Search by Ref #..." />
                </CardContent>
            </Card>

            {selectedReceipt && (
                <Card className="mt-6 border-orange-200">
                    <CardHeader className="bg-orange-50"><CardTitle>Applications for {selectedReceipt.transactionId}</CardTitle></CardHeader>
                    <CardContent className="pt-4">
                        <ReceiptApplications receiptId={selectedReceipt.id} />
                    </CardContent>
                </Card>
            )}

            <ViewAccountingModal open={accountingModalOpen} onOpenChange={setAccountingModalOpen} entityId={selectedEntityId} />
        </div>
    );
}

function ReceiptApplications({ receiptId }: { receiptId: string }) {
    const { toast } = useToast();
    const { data: apps = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/ar/receipts", receiptId, "applications"],
        queryFn: () => fetch(`/api/ar/receipts/${receiptId}/applications`).then(r => r.json()),
    });

    const unapplyMutation = useMutation({
        mutationFn: async (id: string) => await apiRequest("POST", `/api/ar/applications/${id}/unapply`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/receipts"] });
            toast({ title: "Receipt Unapplied Successfully" });
        }
    });

    if (isLoading) return <div>Loading applications...</div>;
    if (!apps.length) return <div className="text-muted-foreground text-sm">No active applications.</div>;

    return (
        <div className="space-y-4">
            {apps.map((a: any) => (
                <div key={a.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                        <span className="font-semibold text-sm">Target Invoice:</span> <span className="text-sm font-mono">{a.invoiceId}</span>
                        <Badge variant="secondary" className="ml-3">${Number(a.amountApplied).toFixed(2)}</Badge>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => unapplyMutation.mutate(a.id)} disabled={unapplyMutation.isPending}><Unlink className="w-4 h-4 mr-1" /> Unapply</Button>
                </div>
            ))}
        </div>
    );
}
