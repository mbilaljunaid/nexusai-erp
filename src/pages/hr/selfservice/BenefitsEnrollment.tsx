
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Heart,
    ShieldCheck,
    Eye,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BenefitsEnrollment() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(0); // 0: Program Select, 1: Plan Selection, 2: Review
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [selections, setSelections] = useState<Record<string, string>>({}); // planId -> planOptionId

    const { data: openPrograms, isLoading: loadingPrograms } = useQuery({
        queryKey: ["open-programs"],
        queryFn: async () => {
            const res = await fetch("/api/me/benefits/programs/open");
            if (!res.ok) throw new Error("Failed to fetch programs");
            return res.json();
        }
    });

    const { data: plans, isLoading: loadingPlans } = useQuery({
        queryKey: ["program-plans", selectedProgramId],
        enabled: !!selectedProgramId,
        queryFn: async () => {
            const res = await fetch(`/api/me/benefits/programs/${selectedProgramId}/plans`);
            if (!res.ok) throw new Error("Failed to fetch plans");
            return res.json();
        }
    });

    const enrollMutation = useMutation({
        mutationFn: async (data: { planOptionId: string; startDate: string }) => {
            const res = await fetch("/api/me/benefits/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Enrollment failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["active-benefits"] });
        }
    });

    const handleSelectOption = (planId: string, planOptionId: string) => {
        setSelections(prev => ({ ...prev, [planId]: planOptionId }));
    };

    const handleFinish = async () => {
        try {
            const startDate = new Date().toISOString().split('T')[0];
            for (const planOptionId of Object.values(selections)) {
                await enrollMutation.mutateAsync({ planOptionId, startDate });
            }
            toast({
                title: "Enrollment Complete",
                description: "Your benefit elections have been submitted successfully.",
            });
            setStep(3); // Success state
        } catch (err) {
            toast({
                title: "Error",
                description: "There was an issue processing your enrollment.",
                variant: "destructive"
            });
        }
    };

    if (step === 3) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <div className="h-20 w-20 bg-teal-500/20 text-teal-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h1 className="text-3xl font-bold">Enrollment Submitted!</h1>
                <p className="text-zinc-500 max-w-md">Your benefits have been updated. You can view your active elections in your profile.</p>
                <Button onClick={() => window.location.href = "/me/profile"} variant="outline" className="mt-4">
                    Back to Profile
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                        Benefits Enrollment
                    </h1>
                    <p className="text-zinc-500 mt-2">Configure your health and wellness package for the upcoming period.</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className={`h-2 w-12 rounded-full transition-all duration-300 ${step >= i ? "bg-teal-500" : "bg-zinc-200 dark:bg-zinc-800"}`} />
                    ))}
                </div>
            </div>

            {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loadingPrograms ? (
                        <p>Loading programs...</p>
                    ) : openPrograms?.map((prog: any) => (
                        <Card key={prog.id} className="relative overflow-hidden group hover:border-teal-500/50 transition-all cursor-pointer border-zinc-200/50 dark:border-zinc-800/50 shadow-sm" onClick={() => { setSelectedProgramId(prog.id); setStep(1); }}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShieldCheck className="h-24 w-24" />
                            </div>
                            <CardHeader>
                                <Badge className="w-fit mb-2 bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border-teal-500/30">Open Enrollment</Badge>
                                <CardTitle className="text-2xl">{prog.name}</CardTitle>
                                <CardDescription>{prog.description || "Comprehensive benefit package for all eligible employees."}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-zinc-500 space-y-1">
                                    <p>Ends: {new Date(prog.openEnrollmentEnd).toLocaleDateString()}</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" className="p-0 text-teal-600 hover:bg-transparent group-hover:gap-3 transition-all">
                                    Start Selection <ChevronRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {step === 1 && (
                <div className="space-y-8">
                    {loadingPlans ? <p>Loading plans...</p> : plans?.map((plan: any) => (
                        <Card key={plan.planId} className="border-zinc-200/50 dark:border-zinc-800/50 shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {plan.planType === 'MEDICAL' && <Heart className="h-6 w-6 text-red-500" />}
                                    {plan.planType === 'DENTAL' && <AlertCircle className="h-6 w-6 text-blue-500" />}
                                    {plan.planType === 'VISION' && <Eye className="h-6 w-6 text-purple-500" />}
                                    <div>
                                        <CardTitle>{plan.planName}</CardTitle>
                                        <CardDescription>{plan.planType} coverage elections</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {plan.options.map((opt: any) => (
                                    <div
                                        key={opt.planOptionId}
                                        onClick={() => handleSelectOption(plan.planId, opt.planOptionId)}
                                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selections[plan.planId] === opt.planOptionId ? "border-teal-500 bg-teal-500/5" : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <p className="font-semibold">{opt.optionName}</p>
                                            {selections[plan.planId] === opt.planOptionId && <CheckCircle2 className="h-5 w-5 text-teal-500" />}
                                        </div>
                                        <p className="text-3xl font-bold">${opt.employeeCost}<span className="text-sm text-zinc-400 font-normal">/mo</span></p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setStep(2)} disabled={Object.keys(selections).length === 0}>
                            Review Elections <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <Card className="border-teal-500/30 bg-teal-500/5">
                        <CardHeader>
                            <CardTitle>Election Summary</CardTitle>
                            <CardDescription>Review your choices before submitting.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {plans?.filter((p: any) => selections[p.planId]).map((p: any) => {
                                const selectedOpt = p.options.find((o: any) => o.planOptionId === selections[p.planId]);
                                return (
                                    <div key={p.planId} className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                                        <div>
                                            <p className="font-medium text-sm text-zinc-400">{p.planType}</p>
                                            <p className="font-bold">{p.planName} - {selectedOpt.optionName}</p>
                                        </div>
                                        <p className="font-bold text-lg">${selectedOpt.employeeCost}</p>
                                    </div>
                                );
                            })}
                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xl font-bold">
                                <span>Monthly Deduction Total</span>
                                <span className="text-teal-600">
                                    ${plans?.reduce((acc: number, p: any) => {
                                        const opt = p.options.find((o: any) => o.planOptionId === selections[p.planId]);
                                        return acc + (opt ? Number(opt.employeeCost) : 0);
                                    }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8" onClick={handleFinish} disabled={enrollMutation.isPending}>
                            {enrollMutation.isPending ? "Submitting..." : "Confirm & Enroll"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
