import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from '@/components/ui/DatePicker';
import { formatNumber } from '@/lib/formatters';

interface AgreementWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const STEPS = ['Basics', 'Entities', 'Currency', 'Rules', 'Review'];

export function NettingAgreementWizard({ isOpen, onClose, onSuccess }: AgreementWizardProps) {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(0);

    // Form state
    const [name, setName] = useState('');
    const [agreementType, setAgreementType] = useState<'BILATERAL' | 'MULTILATERAL'>('BILATERAL');
    const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
    const [currency, setCurrency] = useState('USD');
    const [autoSettleThreshold, setAutoSettleThreshold] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('NET30');

    // Fetch organizations
    const { data: orgs = [] } = useQuery<any[]>({
        queryKey: ["/api/intercompany/orgs"],
    });

    const createAgreementMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/netting/agreements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    agreementType,
                    frequency,
                    effectiveDate,
                    entityIds: selectedEntities,
                    currency,
                    autoSettleThreshold: autoSettleThreshold ? parseFloat(autoSettleThreshold) : null,
                    paymentTerms
                })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to create agreement");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Agreement Created",
                description: `Netting agreement "${name}" created successfully`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/netting/agreements"] });
            onSuccess();
            handleClose();
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Failed to Create Agreement",
                description: error.message
            });
        }
    });

    const handleClose = () => {
        setCurrentStep(0);
        setName('');
        setSelectedEntities([]);
        setAutoSettleThreshold('');
        onClose();
    };

    const handleNext = () => {
        // Validation
        if (currentStep === 0 && !name) {
            toast({ variant: "destructive", title: "Validation Error", description: "Agreement name is required" });
            return;
        }
        if (currentStep === 1 && selectedEntities.length < 2) {
            toast({ variant: "destructive", title: "Validation Error", description: "Select at least 2 entities" });
            return;
        }

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            createAgreementMutation.mutate();
        }
    };

    const toggleEntity = (entityId: string) => {
        setSelectedEntities(prev =>
            prev.includes(entityId)
                ? prev.filter(id => id !== entityId)
                : [...prev, entityId]
        );
    };

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Netting Agreement</DialogTitle>
                    <DialogDescription>
                        Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            {STEPS.map((step, idx) => (
                                <span
                                    key={step}
                                    className={idx <= currentStep ? "font-medium text-primary" : ""}
                                >
                                    {step}
                                </span>
                            ))}
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            {/* Step 1: Basics */}
                            {currentStep === 0 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Agreement Name *</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g., EU Entities Monthly Netting"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Agreement Type</Label>
                                            <Select value={agreementType} onValueChange={(v: any) => setAgreementType(v)}>
                                                <SelectTrigger id="type">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BILATERAL">Bilateral (2 entities)</SelectItem>
                                                    <SelectItem value="MULTILATERAL">Multilateral (3+ entities)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="frequency">Netting Frequency</Label>
                                            <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                                                <SelectTrigger id="frequency">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DAILY">Daily</SelectItem>
                                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="effectiveDate">Effective Date</Label>
                                        <DatePicker value={effectiveDate} onChange={v => setEffectiveDate(v)} />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Entities */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <Label>Select Entities * (minimum 2)</Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Choose entities that will participate in this netting agreement
                                        </p>
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {orgs.map((org: any) => (
                                            <div role="button" tabIndex={0}
                                                key={org.id}
                                                className="flex items-center space-x-2 p-3 border rounded hover:bg-muted/50 cursor-pointer"
                                                onClick={() => toggleEntity(org.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                            >
                                                <Checkbox
                                                    checked={selectedEntities.includes(org.id)}
                                                    onCheckedChange={() => toggleEntity(org.id)}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium">{org.orgName}</p>
                                                    <p className="text-xs text-muted-foreground">{org.entityType}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">
                                            {selectedEntities.length} entities selected
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Currency */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Settlement Currency</Label>
                                        <Select value={currency} onValueChange={setCurrency}>
                                            <SelectTrigger id="currency">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                                <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">
                                            All netting settlements will be executed in this currency
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Rules */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="threshold">Auto-Settle Threshold (Optional)</Label>
                                        <Input
                                            id="threshold"
                                            type="number"
                                            value={autoSettleThreshold}
                                            onChange={(e) => setAutoSettleThreshold(e.target.value)}
                                            placeholder="e.g., 10000"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Settlements below this amount will execute automatically
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="terms">Payment Terms</Label>
                                        <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                                            <SelectTrigger id="terms">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                                                <SelectItem value="NET15">NET 15</SelectItem>
                                                <SelectItem value="NET30">NET 30</SelectItem>
                                                <SelectItem value="NET45">NET 45</SelectItem>
                                                <SelectItem value="NET60">NET 60</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Review */}
                            {currentStep === 4 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <h3 className="font-semibold">Review Agreement Details</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Agreement Name</p>
                                            <p className="font-medium">{name}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Type</p>
                                            <p className="font-medium">{agreementType}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Frequency</p>
                                            <p className="font-medium">{frequency}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Effective Date</p>
                                            <p className="font-medium">{formatDate(effectiveDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Entities</p>
                                            <p className="font-medium">{selectedEntities.length} selected</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Currency</p>
                                            <p className="font-medium">{currency}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Auto-Settle Threshold</p>
                                            <p className="font-medium">
                                                {autoSettleThreshold ? `${currency} ${formatNumber(parseFloat(autoSettleThreshold))}` : 'None'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Payment Terms</p>
                                            <p className="font-medium">{paymentTerms}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-500/10 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
                                        <p className="text-blue-900 dark:text-blue-400">
                                            This agreement will enable automatic netting between selected entities
                                            on a {frequency.toLowerCase()} basis.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={currentStep === 0 ? handleClose : () => setCurrentStep(currentStep - 1)}
                    >
                        {currentStep === 0 ? 'Cancel' : (
                            <>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </>
                        )}
                    </Button>
                    <Button onClick={handleNext} disabled={createAgreementMutation.isPending}>
                        {createAgreementMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : currentStep === STEPS.length - 1 ? (
                            'Create Agreement'
                        ) : (
                            <>
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
