import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, FileText, BanknoteIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from '@/components/ui/DatePicker';
import { formatCurrency } from "@/lib/formatters";

interface SettlementExecutionModalProps {
    batchId: string;
    batch: {
        orgId1: string;
        orgId2: string;
        org1Name: string;
        org2Name: string;
        netAmount: number;
        currencyCode: string;
        totalPayables: number;
        totalReceivables: number;
    };
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function SettlementExecutionModal({
    batchId,
    batch,
    isOpen,
    onClose,
    onSuccess
}: SettlementExecutionModalProps) {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<'preview' | 'confirm'>('preview');
    const [settlementDate, setSettlementDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [settlementMethod, setSettlementMethod] = useState('WIRE');
    const [reference, setReference] = useState(`NETTING-${batchId.substring(0, 8)}`);

    const netPayer = batch.netAmount > 0 ? batch.org2Name : batch.org1Name;
    const netPayee = batch.netAmount > 0 ? batch.org1Name : batch.org2Name;
    const netAmountAbs = Math.abs(batch.netAmount);

    const settleMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/netting/ic/batches/${batchId}/settle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    settlementDate,
                    settlementMethod,
                    reference
                })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Settlement failed");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Settlement Completed",
                description: `Batch ${batchId.substring(0, 8)} settled successfully`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/netting/ic/batches"] });
            onSuccess();
            onClose();
            setStep('preview');
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Settlement Failed",
                description: error.message
            });
        }
    });

    const handleExecute = () => {
        if (step === 'preview') {
            setStep('confirm');
        } else {
            settleMutation.mutate();
        }
    };

    const formatCurrency = (amount: number) => {
        return formatCurrency(amount, batch.currencyCode);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {step === 'preview' ? (
                            <>
                                <FileText className="h-5 w-5" />
                                Settlement Preview
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Confirm Settlement
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'preview'
                            ? 'Review settlement details before execution'
                            : 'Final confirmation - this action will post GL journals and clear transactions'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Settlement Summary */}
                    <Card className="border-2 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-base">Net Settlement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Payer</p>
                                    <p className="font-bold text-lg">{netPayer}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="font-bold text-2xl text-primary">
                                        {formatCurrency(netAmountAbs)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payee</p>
                                    <p className="font-bold text-lg">{netPayee}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gross Positions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-xs text-muted-foreground uppercase">
                                    {batch.org1Name} owes {batch.org2Name}
                                </p>
                                <p className="text-xl font-bold text-blue-600">
                                    {formatCurrency(batch.totalPayables)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-xs text-muted-foreground uppercase">
                                    {batch.org2Name} owes {batch.org1Name}
                                </p>
                                <p className="text-xl font-bold text-green-600">
                                    {formatCurrency(batch.totalReceivables)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {step === 'preview' && (
                        <>
                            {/* Settlement Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Settlement Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Settlement Date</Label>
                                            <DatePicker value={settlementDate} onChange={v => setSettlementDate(v)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="method">Settlement Method</Label>
                                            <Select value={settlementMethod} onValueChange={setSettlementMethod}>
                                                <SelectTrigger id="method">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="WIRE">Wire Transfer</SelectItem>
                                                    <SelectItem value="ACH">ACH</SelectItem>
                                                    <SelectItem value="CHECK">Check</SelectItem>
                                                    <SelectItem value="JOURNAL">Journal Entry Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reference">Payment Reference</Label>
                                        <Input
                                            id="reference"
                                            value={reference}
                                            onChange={(e) => setReference(e.target.value)}
                                            placeholder="Reference number"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Instructions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <BanknoteIcon className="h-4 w-4" />
                                        Payment Instructions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="p-3 bg-muted rounded">
                                        <p className="font-medium">{netPayer} (Payer)</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Will transfer {formatCurrency(netAmountAbs)} to {netPayee}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted rounded">
                                        <p className="font-medium">GL Impact</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            • Clear {batch.totalPayables > 0 ? Math.round(batch.totalPayables / 1000) : 0} AR/AP transactions
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            • Post net settlement journal
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            • Update batch status to "Settled"
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {step === 'confirm' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-yellow-900 dark:text-yellow-400">
                                        Confirm Settlement Execution
                                    </p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                                        This will clear all transactions in this batch and post GL journals.
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Batch ID:</span>
                                    <span className="ml-2 font-mono">{batchId.substring(0, 16)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Settlement Date:</span>
                                    <span className="ml-2 font-medium">{formatDate(settlementDate)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Method:</span>
                                    <span className="ml-2 font-medium">{settlementMethod}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Reference:</span>
                                    <span className="ml-2 font-mono text-xs">{reference}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={settleMutation.isPending}>
                        Cancel
                    </Button>
                    {step === 'preview' && (
                        <Button onClick={() => setStep('confirm')}>
                            Continue to Confirmation
                        </Button>
                    )}
                    {step === 'confirm' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('preview')}>
                                Back
                            </Button>
                            <Button
                                onClick={handleExecute}
                                disabled={settleMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {settleMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Executing...
                                    </>
                                ) : (
                                    'Execute Settlement'
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
