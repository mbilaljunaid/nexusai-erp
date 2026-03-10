import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DatePicker } from '@/components/ui/DatePicker';

interface LeaseModificationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    leaseId: string;
    currentTerms: {
        discountRate: string;
        termMonths: number;
        paymentAmount: number;
    };
}

type ModificationType = "RENEWAL" | "TERMINATION" | "IMPAIRMENT" | "TERMS_CHANGE";

export function LeaseModificationDialog({ isOpen, onClose, leaseId, currentTerms }: LeaseModificationDialogProps) {
    const [step, setStep] = useState(1);
    const [modType, setModType] = useState<ModificationType>("TERMS_CHANGE");
    const [effectiveDate, setEffectiveDate] = useState("");
    const [reason, setReason] = useState("");

    // New Terms
    const [newRate, setNewRate] = useState(currentTerms.discountRate);
    const [newTerm, setNewTerm] = useState(currentTerms.termMonths.toString());
    const [newPayment, setNewPayment] = useState(currentTerms.paymentAmount.toString());

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const modificationMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/lease/leases/${leaseId}/modify`, {
                modificationType: modType,
                effectiveDate,
                changeReason: reason,
                newTerms: {
                    discountRate: parseFloat(newRate),
                    termMonths: parseInt(newTerm),
                    paymentAmount: parseFloat(newPayment)
                }
            });
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Lease Modified",
                description: "Amendment recorded and schedules recalculated.",
            });
            queryClient.invalidateQueries({ queryKey: [`/api/leases/${leaseId}`] });
            onClose();
            setStep(1); // Reset
        },
        onError: (error) => {
            toast({
                title: "Modification Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Lease Modification Wizard - Step {step} of 3</DialogTitle>
                </DialogHeader>

                {/* Step 1: Type & Reason */}
                {step === 1 && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Modification Type</Label>
                            <Select value={modType} onValueChange={(v: any) => setModType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TERMS_CHANGE">Change in Terms (Rate/Payment)</SelectItem>
                                    <SelectItem value="RENEWAL">Renewal / Extension</SelectItem>
                                    <SelectItem value="TERMINATION">Early Termination</SelectItem>
                                    <SelectItem value="IMPAIRMENT">Impairment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Effective Date</Label>
                            <DatePicker value={effectiveDate} onChange={v => setEffectiveDate(v)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Reason for Change</Label>
                            <Input
                                placeholder="e.g. Market rent adjustment"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: New Terms */}
                {step === 2 && (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Current Rate</Label>
                                <Input disabled value={`${(parseFloat(currentTerms.discountRate) * 100).toFixed(2)}%`} />
                            </div>
                            <div className="space-y-2">
                                <Label>New Rate (%)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={(parseFloat(newRate) * 100).toFixed(2)}
                                    onChange={e => setNewRate((parseFloat(e.target.value) / 100).toString())}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Current Term (Months)</Label>
                                <Input disabled value={currentTerms.termMonths} />
                            </div>
                            <div className="space-y-2">
                                <Label>New Term (Months)</Label>
                                <Input type="number" value={newTerm} onChange={e => setNewTerm(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Current Payment</Label>
                                <Input disabled value={currentTerms.paymentAmount} />
                            </div>
                            <div className="space-y-2">
                                <Label>New Payment</Label>
                                <Input type="number" value={newPayment} onChange={e => setNewPayment(e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <div className="space-y-4 py-4">
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Ready to Remeasure</AlertTitle>
                            <AlertDescription>
                                This action will create an amendment record and regenerate future amortization schedules based on the new terms.
                            </AlertDescription>
                        </Alert>
                        <Card>
                            <CardContent className="pt-6 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type:</span>
                                    <span className="font-medium">{modType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Effective Date:</span>
                                    <span className="font-medium">{effectiveDate}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">New Discount Rate:</span>
                                    <span className="font-medium text-blue-600">{(parseFloat(newRate) * 100).toFixed(2)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">New Payment:</span>
                                    <span className="font-medium text-blue-600">${newPayment}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <DialogFooter>
                    {step > 1 && (
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                    )}
                    {step < 3 ? (
                        <Button onClick={handleNext} disabled={!effectiveDate}>Next</Button>
                    ) : (
                        <Button onClick={() => modificationMutation.mutate()} disabled={modificationMutation.isPending}>
                            {modificationMutation.isPending ? "Processing..." : "Confirm Modification"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
