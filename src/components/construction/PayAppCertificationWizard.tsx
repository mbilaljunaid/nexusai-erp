import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, ArrowRight, ShieldCheck, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from '@/lib/formatters';

interface CertificationStep {
    id: string;
    label: string;
    status: "completed" | "current" | "pending";
    icon: typeof User;
    approver?: string;
    color: string;
}

interface PayAppCertificationWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payApp: {
        id: string;
        applicationNumber: number;
        status: string;
        totalCompleted: string;
        retentionAmount: string;
        currentPaymentDue: string;
        architectApprovedBy?: string;
        engineerApprovedBy?: string;
        certifiedBy?: string;
    };
    onCertify: (action: string) => Promise<void>;
}

export function PayAppCertificationWizard({ open, onOpenChange, payApp, onCertify }: PayAppCertificationWizardProps) {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const getSteps = (): CertificationStep[] => {
        const statusMap: Record<string, number> = {
            "DRAFT": 0,
            "SUBMITTED": 1,
            "ARCHITECT_APPROVED": 2,
            "ENGINEER_APPROVED": 3,
            "CERTIFIED": 4
        };

        const currentIndex = statusMap[payApp.status] || 0;

        return [
            {
                id: "submit",
                label: "Submit for Review",
                status: currentIndex > 0 ? "completed" : "current",
                icon: User,
                color: "text-gray-600"
            },
            {
                id: "architect",
                label: "Architect Approval",
                status: currentIndex > 1 ? "completed" : currentIndex === 1 ? "current" : "pending",
                icon: User,
                approver: payApp.architectApprovedBy,
                color: "text-blue-600"
            },
            {
                id: "engineer",
                label: "Engineer Approval",
                status: currentIndex > 2 ? "completed" : currentIndex === 2 ? "current" : "pending",
                icon: User,
                approver: payApp.engineerApprovedBy,
                color: "text-indigo-600"
            },
            {
                id: "certify",
                label: "GC Certification & Lock",
                status: currentIndex > 3 ? "completed" : currentIndex === 3 ? "current" : "pending",
                icon: ShieldCheck,
                approver: payApp.certifiedBy,
                color: "text-green-600"
            }
        ];
    };

    const steps = getSteps();
    const currentStep = steps.find(s => s.status === "current");

    const getNextAction = (): string | null => {
        switch (payApp.status) {
            case "DRAFT": return "submit";
            case "SUBMITTED": return "approve-architect";
            case "ARCHITECT_APPROVED": return "approve-engineer";
            case "ENGINEER_APPROVED": return "certify";
            default: return null;
        }
    };

    const handleNext = async () => {
        const action = getNextAction();
        if (!action) return;

        setIsProcessing(true);
        try {
            await onCertify(action);
            toast({ title: "Success", description: "Pay app advanced to next stage." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to process certification.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const isFinal = payApp.status === "CERTIFIED";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Pay Application #{payApp.applicationNumber} - Certification Workflow</DialogTitle>
                    <DialogDescription>
                        Track and manage the multi-party approval process for this payment application.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Financial Summary */}
                    <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Total Completed</div>
                                    <div className="text-xl font-bold">${formatNumber(Number(payApp.totalCompleted))}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Retention</div>
                                    <div className="text-xl font-bold text-red-600">(${formatNumber(Number(payApp.retentionAmount))})</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Payment Due</div>
                                    <div className="text-xl font-bold text-green-600">${formatNumber(Number(payApp.currentPaymentDue))}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workflow Steps */}
                    <div className="space-y-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = step.status === "completed";
                            const isCurrent = step.status === "current";
                            const isPending = step.status === "pending";

                            return (
                                <div key={step.id}>
                                    <div className={cn(
                                        "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                                        isCurrent && "border-primary bg-primary/5",
                                        isCompleted && "border-green-200 bg-green-500/10",
                                        isPending && "border-gray-200 bg-gray-500/10 opacity-60"
                                    )}>
                                        <div className={cn(
                                            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                            isCompleted && "bg-green-600 text-white",
                                            isCurrent && "bg-primary text-white",
                                            isPending && "bg-gray-300 text-gray-600"
                                        )}>
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-6 w-6" />
                                            ) : (
                                                <Icon className="h-5 w-5" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "font-semibold",
                                                    step.color
                                                )}>{step.label}</span>
                                                {isCompleted && <Badge variant="outline" className="text-green-600">✓ Complete</Badge>}
                                                {isCurrent && <Badge>In Progress</Badge>}
                                            </div>
                                            {step.approver && (
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    Approved by: {step.approver}
                                                </div>
                                            )}
                                        </div>

                                        {!isCompleted && index < steps.length - 1 && (
                                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    {!isFinal && currentStep && (
                        <Card className="border-primary">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-semibold mb-1">Ready for: {currentStep.label}</p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Click below to approve and advance to the next stage in the certification workflow.
                                        </p>
                                        <Button
                                            className="w-full"
                                            onClick={handleNext}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? "Processing..." : `Approve & Continue to Next Step`}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {isFinal && (
                        <Card className="border-green-600 bg-green-500/10">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 text-green-700">
                                    <ShieldCheck className="h-6 w-6" />
                                    <div>
                                        <p className="font-semibold">Fully Certified & Locked</p>
                                        <p className="text-sm">This pay application has been finalized and locked for audit compliance.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
