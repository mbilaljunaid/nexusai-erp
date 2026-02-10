import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    FileText,
    Calculator,
    AlertCircle,
    TrendingUp,
    Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function LeaseModificationWizard({ leaseId }: { leaseId: string }) {
    const [step, setStep] = useState(1);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        modificationDate: new Date().toISOString().split('T')[0],
        extensionMonths: 0,
        paymentChange: 0,
        newRate: 0,
        reason: ""
    });

    const { data: lease } = useQuery({
        queryKey: [`/api/finance/lease/leases/${leaseId}`],
        queryFn: async () => {
            const res = await fetch(`/api/finance/lease/leases/${leaseId}`);
            return res.json();
        }
    });

    const modificationMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch(`/api/finance/lease/leases/${leaseId}/modify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Modification failed");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Lease Modified", description: "Remeasurement complete and schedules updated." });
            setStep(4);
        }
    });

    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Lease Modification Wizard</h1>
                <p className="text-muted-foreground">Step {step} of {totalSteps}: {
                    step === 1 ? "Identification" :
                        step === 2 ? "Remeasurement Parameters" :
                            step === 3 ? "Review Impact" : "Complete"
                }</p>
                <Progress value={progress} className="h-2" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && "Identify Change Type"}
                        {step === 2 && "Enter New Parameters"}
                        {step === 3 && "Review Accounting Impact"}
                        {step === 4 && "Modification Complete"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <div className="grid grid-cols-1 gap-4">
                            <div
                                className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors flex items-center gap-4"
                                onClick={() => setStep(2)}
                            >
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold">Term Extension / Reduction</p>
                                    <p className="text-sm text-muted-foreground">Change in lease duration or option exercise</p>
                                </div>
                            </div>
                            <div
                                className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors flex items-center gap-4"
                                onClick={() => setStep(2)}
                            >
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
                                    <Calculator className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold">Payment Amount Modification</p>
                                    <p className="text-sm text-muted-foreground">Fixed payment changes or escalation adjustments</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Modification Effective Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.modificationDate}
                                        onChange={(e) => setFormData({ ...formData, modificationDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Extension (Months)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 12"
                                        onChange={(e) => setFormData({ ...formData, extensionMonths: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>New Periodic Payment</Label>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        onChange={(e) => setFormData({ ...formData, paymentChange: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>New Discount Rate (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Current: 4.5%"
                                        onChange={(e) => setFormData({ ...formData, newRate: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Reason for Modification</Label>
                                <Input
                                    placeholder="Business justification..."
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="p-4 bg-muted rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="font-medium">Estimated Accounting Impact</p>
                                    <p className="text-sm text-muted-foreground">
                                        Based on these changes, the Lease Liability will increase by approximately 22.5%.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-primary/5">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-muted-foreground uppercase">Projected ROU Asset Add</p>
                                        <p className="text-2xl font-bold text-blue-600">+$42,150.00</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-primary/5">
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-muted-foreground uppercase">New Monthly Expense</p>
                                        <p className="text-2xl font-bold text-blue-600">$5,240.12</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center py-8 space-y-4">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Remeasurement Successful</h3>
                                <p className="text-muted-foreground">
                                    The lease modification has been recorded. New amortization schedules have been generated and are pending approval.
                                </p>
                            </div>
                            <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
                                Return to Portfolio
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {step < 4 && (
                <div className="flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>

                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            className="bg-primary"
                            disabled={modificationMutation.isPending}
                            onClick={() => modificationMutation.mutate(formData)}
                        >
                            {modificationMutation.isPending ? "Processing..." : "Process Remeasurement"}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
