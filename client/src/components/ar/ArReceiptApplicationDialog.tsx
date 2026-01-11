import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArReceipt, ArInvoice } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check } from "lucide-react";

interface ArReceiptApplicationDialogProps {
    receipt: ArReceipt | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ArReceiptApplicationDialog({ receipt, open, onOpenChange }: ArReceiptApplicationDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedInvoices, setSelectedInvoices] = useState<Record<string, number>>({});

    const { data: openInvoices, isLoading: loadingInvoices } = useQuery<ArInvoice[]>({
        queryKey: [`/api/ar/invoices`],
        enabled: !!receipt,
        select: (data) => data.filter(i => i.accountId === receipt?.accountId && i.status !== "Paid" && i.status !== "Cancelled")
    });

    const applyMutation = useMutation({
        mutationFn: async ({ invoiceId, amount }: { invoiceId: string, amount: number }) => {
            const res = await apiRequest("POST", `/api/ar/receipts/${receipt?.id}/apply`, { invoiceId, amount });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/ar/receipts`] });
            queryClient.invalidateQueries({ queryKey: [`/api/ar/invoices`] });
            toast({ title: "Receipt Applied", description: "The amount has been applied to the invoice." });
        },
        onError: (error: any) => {
            toast({ title: "Application Failed", description: error.message, variant: "destructive" });
        }
    });

    const totalApplying = useMemo(() => {
        return Object.values(selectedInvoices).reduce((sum, val) => sum + val, 0);
    }, [selectedInvoices]);

    const remainingToApply = (receipt ? Number(receipt.unappliedAmount) : 0) - totalApplying;

    const handleApply = async () => {
        for (const [invoiceId, amount] of Object.entries(selectedInvoices)) {
            if (amount > 0) {
                await applyMutation.mutateAsync({ invoiceId, amount });
            }
        }
        onOpenChange(false);
        setSelectedInvoices({});
    };

    if (!receipt) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Apply Receipt: {receipt.id.slice(0, 8)}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Receipt Amount</p>
                        <p className="text-xl font-bold">${receipt.amount}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Unapplied Balance</p>
                        <p className="text-xl font-bold text-primary">${receipt.unappliedAmount}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold px-1">Open Invoices</h3>
                    {loadingInvoices ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="border rounded-md max-h-[300px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[150px]">Apply Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {openInvoices?.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                                            <TableCell>${inv.totalAmount}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{inv.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={selectedInvoices[inv.id] || ""}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        setSelectedInvoices(prev => ({ ...prev, [inv.id]: val }));
                                                    }}
                                                    className="h-8"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {openInvoices?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No open invoices found for this account.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-between items-center p-2 border-t">
                    <div>
                        <p className="text-sm font-medium">Total Applying: <span className="text-primary">${totalApplying.toFixed(2)}</span></p>
                        <p className="text-xs text-muted-foreground">Remaining Receipt Balance: ${remainingToApply.toFixed(2)}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button
                            onClick={handleApply}
                            disabled={totalApplying === 0 || remainingToApply < 0 || applyMutation.isPending}
                        >
                            {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Apply Receipt
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
