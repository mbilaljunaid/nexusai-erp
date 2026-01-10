
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    batchId: number | null;
}

export function ApPprSideSheet({ isOpen, onClose, batchId }: Props) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [batchName, setBatchName] = useState("");
    const [checkDate, setCheckDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const { data: batch, isLoading: isBatchLoading } = useQuery({
        queryKey: [`/api/ap/payment-batches/${batchId}`],
        queryFn: () => batchId ? api.ap.paymentBatches.list().then((list: any[]) => list.find(b => b.id === batchId)) : null,
        enabled: !!batchId
    });

    const { data: selectedInvoices, isLoading: isSelectionLoading, refetch: refetchSelection } = useQuery({
        queryKey: [`/api/ap/payment-batches/${batchId}/selection`],
        queryFn: () => batchId ? api.ap.paymentBatches.select(batchId) : null,
        enabled: !!batchId && batch?.status === "NEW" || batch?.status === "SELECTED"
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.ap.paymentBatches.create(data),
        onSuccess: (newBatch) => {
            queryClient.invalidateQueries({ queryKey: ['/api/ap/payment-batches'] });
            toast({ title: "Batch Created", description: "Payment request initialized." });
            // Automatically select invoices for the new batch
            selectMutation.mutate(newBatch.id);
        }
    });

    const selectMutation = useMutation({
        mutationFn: (id: number) => api.ap.paymentBatches.select(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/ap/payment-batches'] });
            refetchSelection();
            toast({ title: "Invoices Selected", description: "Matched invoices have been attached to the batch." });
        }
    });

    const confirmMutation = useMutation({
        mutationFn: (id: number) => api.ap.paymentBatches.confirm(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/ap/payment-batches'] });
            queryClient.invalidateQueries({ queryKey: ['/api/ap/invoices'] });
            toast({ title: "Payments Confirmed", description: "Payments have been issued and invoices marked PAID." });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            batchName,
            checkDate: new Date(checkDate),
            paymentMethodCode: "CHECK"
        });
    };

    const isNew = !batchId;
    const isSelected = batch?.status === "SELECTED";
    const isConfirmed = batch?.status === "CONFIRMED";

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        {isNew ? "New Payment Process Request" : "Payment Batch Details"}
                    </SheetTitle>
                    <SheetDescription>
                        {isNew
                            ? "Configure requirements to batch select invoices for payment."
                            : `Batch ${batch?.batchName} - ${batch?.status}`
                        }
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {isNew ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="batchName">Request Name</Label>
                                <Input
                                    id="batchName"
                                    placeholder="e.g. Weekly Vendor Run - Jan"
                                    value={batchName}
                                    onChange={(e) => setBatchName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="checkDate">Scheduled Pay Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="checkDate"
                                        type="date"
                                        className="pl-9"
                                        value={checkDate}
                                        onChange={(e) => setCheckDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button className="w-full" disabled={createMutation.isPending}>
                                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Initiate Selection"}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4 bg-muted/20 border-none shadow-none">
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Total Amount</p>
                                    <p className="text-xl font-bold">${Number(batch?.totalAmount).toLocaleString()}</p>
                                </Card>
                                <Card className="p-4 bg-muted/20 border-none shadow-none">
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Invoices</p>
                                    <p className="text-xl font-bold">{batch?.paymentCount}</p>
                                </Card>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center justify-between">
                                    Selected Invoices
                                    <Badge variant="outline" className="text-[10px]">{selectedInvoices?.length || 0} Items</Badge>
                                </h4>

                                {isSelectionLoading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                                ) : selectedInvoices?.length > 0 ? (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                        {selectedInvoices.map((inv: any) => (
                                            <div key={inv.id} className="flex items-center justify-between p-2 border rounded text-xs bg-background/50">
                                                <div>
                                                    <p className="font-medium">{inv.invoiceNumber}</p>
                                                    <p className="text-muted-foreground opacity-70">Due: {format(new Date(inv.dueDate), "MMM dd")}</p>
                                                </div>
                                                <p className="font-bold">${Number(inv.invoiceAmount).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border rounded-lg bg-muted/5 border-dashed">
                                        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-20 mb-2" />
                                        <p className="text-xs text-muted-foreground">No invoices matched the criteria.</p>
                                    </div>
                                )}
                            </div>

                            {!isConfirmed && (
                                <div className="pt-4 space-y-3">
                                    <AlertCircle className="h-4 w-4 text-amber-500 inline mr-2" />
                                    <span className="text-xs text-muted-foreground">Confirming will generate individual payments and mark invoices as PAID.</span>
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 mt-2"
                                        disabled={confirmMutation.isPending || (selectedInvoices?.length || 0) === 0}
                                        onClick={() => confirmMutation.mutate(batchId!)}
                                    >
                                        {confirmMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm & Pay Selected"}
                                    </Button>
                                </div>
                            )}

                            {isConfirmed && (
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <p className="text-sm text-green-700 font-medium">Batch confirmed and payments issued.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <SheetFooter className="mt-auto">
                    <Button variant="outline" onClick={onClose} className="w-full">
                        {isConfirmed ? "Close" : "Cancel"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
