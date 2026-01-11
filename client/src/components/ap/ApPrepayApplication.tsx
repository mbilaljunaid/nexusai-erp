import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ApPrepayApplicationProps {
    invoiceId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ApPrepayApplication({ invoiceId, open, onOpenChange }: ApPrepayApplicationProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPrepay, setSelectedPrepay] = useState<any>(null);
    const [applyAmount, setApplyAmount] = useState("");

    const { data: availablePrepayments, isLoading } = useQuery<any[]>({
        queryKey: [`/api/ap/invoices/${invoiceId}/available-prepayments`],
        enabled: open
    });

    const applyMutation = useMutation({
        mutationFn: async () => {
            if (!selectedPrepay || !applyAmount) return;
            const res = await apiRequest("POST", `/api/ap/invoices/${invoiceId}/apply-prepayment`, {
                prepayId: selectedPrepay.id,
                amount: parseFloat(applyAmount)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to apply prepayment");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Prepayment Applied", description: "The advance has been linked to this invoice." });
            queryClient.invalidateQueries({ queryKey: [`/api/ap/invoices/${invoiceId}`] });
            queryClient.invalidateQueries({ queryKey: [`/api/ap/invoices/${invoiceId}/prepay-applications`] });
            onOpenChange(false);
            setSelectedPrepay(null);
            setApplyAmount("");
        },
        onError: (err: Error) => {
            toast({ title: "Application Failed", description: err.message, variant: "destructive" });
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Apply Prepayment</DialogTitle>
                    <DialogDescription>
                        Link an existing supplier advance to this standard invoice.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Number</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Available</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {availablePrepayments?.map((prepay) => (
                                        <TableRow
                                            key={prepay.id}
                                            className={selectedPrepay?.id === prepay.id ? "bg-primary/5 border-primary/20" : ""}
                                        >
                                            <TableCell className="font-mono text-xs">{prepay.invoiceNumber}</TableCell>
                                            <TableCell className="text-xs">{new Date(prepay.invoiceDate).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right text-xs font-semibold">
                                                ${parseFloat(prepay.prepayAmountRemaining).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant={selectedPrepay?.id === prepay.id ? "default" : "outline"}
                                                    className="h-7 text-[10px]"
                                                    onClick={() => {
                                                        setSelectedPrepay(prepay);
                                                        setApplyAmount(prepay.prepayAmountRemaining);
                                                    }}
                                                >
                                                    {selectedPrepay?.id === prepay.id ? "Selected" : "Select"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {availablePrepayments?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-xs">
                                                <div className="flex flex-col items-center gap-1">
                                                    <AlertCircle className="h-5 w-5 opacity-20" />
                                                    No available prepayments found for this supplier.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {selectedPrepay && (
                        <div className="p-4 bg-muted/40 rounded-lg space-y-3 border border-dashed">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Applying from:</span>
                                <span className="font-semibold">{selectedPrepay.invoiceNumber}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right text-xs">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={applyAmount}
                                    onChange={(e) => setApplyAmount(e.target.value)}
                                    className="col-span-3 h-8"
                                    max={selectedPrepay.prepayAmountRemaining}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={() => applyMutation.mutate()}
                        disabled={!selectedPrepay || !applyAmount || applyMutation.isPending}
                    >
                        {applyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        Apply Advance
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
