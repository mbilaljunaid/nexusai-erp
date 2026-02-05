import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface ArAdjustmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string;
    currentBalance: number;
}

export function ArAdjustmentDialog({ isOpen, onClose, invoiceId, currentBalance }: ArAdjustmentDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("WriteOff");
    const [reason, setReason] = useState("");

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            // API expects positive amount for adjustment. 
            // Backend validation ensures WriteOffs reduce balance.
            // But typically WriteOff is a Credit (Negative impact).
            // Let's send negative amount for WriteOff if API expects signed?
            // My backend service does: `newTotal = outstanding + Number(data.amount)`.
            // So if I want to reduce balance, I must send NEGATIVE amount.
            const signedAmount = type === "WriteOff" ? -Math.abs(parseFloat(amount)) : parseFloat(amount);

            return await api.ar.invoices.createAdjustment({
                invoiceId,
                adjustmentType: type,
                amount: signedAmount,
                reason,
                status: "Approved" // Auto-approve for now
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
            queryClient.invalidateQueries({ queryKey: ["/api/ar/adjustments", invoiceId] });
            toast({ title: "Success", description: "Adjustment processed successfully" });
            onClose();
            setAmount("");
            setReason("");
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !reason) return;
        createMutation.mutate({});
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Process Adjustment / Write-off</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Adjustment Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WriteOff">Write-off (Reduce Balance)</SelectItem>
                                <SelectItem value="Adjustment">Manual Adjustment (Increase/Decrease)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                            <Input
                                type="number"
                                step="0.01"
                                className="pl-8"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                max={type === "WriteOff" ? currentBalance : undefined}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Current Balance: ${currentBalance.toFixed(2)}</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea value={reason} onChange={e => setReason(e.target.value)} required placeholder="e.g. Small balance write-off" />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Processing..." : "Process Adjustment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
