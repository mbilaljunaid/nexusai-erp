import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CreditMemoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoiceId: string;
    invoiceNumber: string;
    maxAmount: number;
}

export function CreditMemoDialog({ open, onOpenChange, invoiceId, invoiceNumber, maxAmount }: CreditMemoDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/billing/credit-memo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceId, amount, reason })
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Credit Memo Created", description: `Successfully credited invoice ${invoiceNumber}` });
            queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
            onOpenChange(false);
            setAmount("");
            setReason("");
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Issue Credit Memo for {invoiceNumber}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Amount to Credit (Max: ${maxAmount})</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            max={maxAmount}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea
                            placeholder="Why are we issuing this credit?"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !amount || !reason || Number(amount) > maxAmount}
                    >
                        {mutation.isPending ? "Processing..." : "Issue Credit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
