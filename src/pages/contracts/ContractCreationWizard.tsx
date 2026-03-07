import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileText, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";
import { DatePicker } from '@/components/ui/DatePicker';


export default function ContractCreationWizard() {
    const [, setLocation] = useLocation();
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const [formData, setFormData] = useState({
        title: "",
        contractType: "",
        description: "",
        supplierId: "",
        startDate: "",
        endDate: "",
        totalAmount: "",
        currency: "USD"
    });

    // Create contract mutation
    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/contract-portal/contracts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Contract Created",
                description: `Contract ${data.contractNumber} created successfully`
            });
            setLocation(`/contracts/${data.id}`);
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const updateField = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const canProceed = () => {
        if (step === 1) return formData.title && formData.contractType;
        if (step === 2) return formData.startDate && formData.endDate;
        return true;
    };

    const handleSubmit = () => {
        createMutation.mutate();
    };

    return (
        <StandardPage title="Create New Contract">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                        
                    </div>
                    <p className="text-muted-foreground">Step {step} of {totalSteps}</p>
                    <Progress value={(step / totalSteps) * 100} className="mt-4" />
                </div>

                {/* Step Indicators */}
                <div className="flex justify-between mb-8">
                    {[
                        { num: 1, label: "Basic Info" },
                        { num: 2, label: "Dates & Value" },
                        { num: 3, label: "Review" }
                    ].map((s) => (
                        <div key={s.num} className="flex items-center gap-2">
                            <div className={cn(`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= s.num ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`)}>
                                {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                            </div>
                            <span className={cn(`text-sm ${step >= s.num ? 'font-medium' : 'text-muted-foreground'}`)}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Steps */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {step === 1 && "Basic Information"}
                            {step === 2 && "Contract Dates & Value"}
                            {step === 3 && "Review & Create"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && "Enter the contract title, type, and description"}
                            {step === 2 && "Set start/end dates and contract value"}
                            {step === 3 && "Review your information before creating the contract"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {step === 1 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Contract Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Software License Agreement"
                                        value={formData.title}
                                        onChange={(e) => updateField("title", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contractType">Contract Type *</Label>
                                    <Select value={formData.contractType} onValueChange={(val) => updateField("contractType", val)}>
                                        <SelectTrigger id="contractType">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PROCUREMENT">Procurement Contract</SelectItem>
                                            <SelectItem value="SALES">Sales Contract</SelectItem>
                                            <SelectItem value="SERVICE">Service Agreement</SelectItem>
                                            <SelectItem value="LICENSE">License Agreement</SelectItem>
                                            <SelectItem value="NDA">Non-Disclosure Agreement</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Brief description of the contract..."
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => updateField("description", e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Start Date *</Label>
                                        <DatePicker value={formData.startDate} onChange={(v) => updateField("startDate", v)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date *</Label>
                                        <DatePicker value={formData.endDate} onChange={(v) => updateField("endDate", v)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="totalAmount">Total Contract Value</Label>
                                        <Input
                                            id="totalAmount"
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.totalAmount}
                                            onChange={(e) => updateField("totalAmount", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select value={formData.currency} onValueChange={(val) => updateField("currency", val)}>
                                            <SelectTrigger id="currency">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                                <SelectItem value="AED">AED</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Title:</span>
                                        <p className="font-medium mt-1">{formData.title || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Type:</span>
                                        <p className="font-medium mt-1">{formData.contractType || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Start Date:</span>
                                        <p className="font-medium mt-1">{formData.startDate || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">End Date:</span>
                                        <p className="font-medium mt-1">{formData.endDate || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Value:</span>
                                        <p className="font-medium mt-1">
                                            {formData.totalAmount ?
                                                new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: formData.currency
                                                }).format(Number(formData.totalAmount))
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {formData.description && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Description:</span>
                                        <p className="mt-1 p-3 bg-slate-500/10 rounded border">{formData.description}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </Button>

                    {step < totalSteps ? (
                        <Button
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className="gap-2"
                        >
                            Next
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || !canProceed()}
                            className="gap-2"
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                            Create Contract
                        </Button>
                    )}
                </div>
            </div>
        </StandardPage>
    );
}
