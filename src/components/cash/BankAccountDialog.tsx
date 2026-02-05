
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BankAccountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    account?: any; // If present, we are editing
}

export function BankAccountDialog({ isOpen, onClose, account }: BankAccountDialogProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: account?.name || "",
        bankName: account?.bankName || "",
        accountNumber: account?.accountNumber || "",
        currency: account?.currency || "USD",
        ledgerId: account?.ledgerId || "PRIMARY",
        secondaryLedgerId: account?.secondaryLedgerId || "",
        cashAccountCCID: account?.cashAccountCCID || "",
        cashClearingCCID: account?.cashClearingCCID || "",
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const method = account ? "PATCH" : "POST";
            const url = account ? `/api/cash/accounts/${account.id}` : "/api/cash/accounts";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to save account");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Bank account saved successfully." });
            queryClient.invalidateQueries({ queryKey: ["/api/cash/accounts"] });
            onClose();
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{account ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
                    <DialogDescription>
                        Configure bank account properties and accounting rules.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Account Display Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Main Operating"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank">Bank Name</Label>
                            <Input
                                id="bank"
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                placeholder="Chase / HSBC"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="accNo">Account Number</Label>
                            <Input
                                id="accNo"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="•••• 1234"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                                value={formData.currency}
                                onValueChange={(v) => setFormData({ ...formData, currency: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="my-2" />
                    <Label className="text-xs font-bold uppercase text-muted-foreground mr-1">Accounting Gaps Parity</Label>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primary">Primary Ledger ID</Label>
                            <Input
                                id="primary"
                                value={formData.ledgerId}
                                onChange={(e) => setFormData({ ...formData, ledgerId: e.target.value })}
                                placeholder="PRIMARY"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secondary">Secondary Ledger ID (Optional)</Label>
                            <Input
                                id="secondary"
                                value={formData.secondaryLedgerId}
                                onChange={(e) => setFormData({ ...formData, secondaryLedgerId: e.target.value })}
                                placeholder="IFRS / STAT"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cashCCID">Cash CCID</Label>
                            <Input
                                id="cashCCID"
                                type="number"
                                value={formData.cashAccountCCID}
                                onChange={(e) => setFormData({ ...formData, cashAccountCCID: e.target.value })}
                                placeholder="1010"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clearCCID">Clearing CCID</Label>
                            <Input
                                id="clearCCID"
                                type="number"
                                value={formData.cashClearingCCID}
                                onChange={(e) => setFormData({ ...formData, cashClearingCCID: e.target.value })}
                                placeholder="2010"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending}>
                        {mutation.isPending ? "Saving..." : "Save Account"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Separator({ className }: { className?: string }) {
    return <div className={`h-[1px] bg-muted ${className}`} />;
}
