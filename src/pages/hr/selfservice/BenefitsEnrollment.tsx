import { formatDate } from "@/lib/dateUtils";
import React, { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
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
import { StandardPage } from "@/components/layout/StandardPage";

export default function BenefitsEnrollment() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();
    const [step, setStep] = useState(0); // 0: Program Select, 1: Plan Selection, 2: Review
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [selections, setSelections] = useState<Record<string, string>>({}); // planId -> planOptionId

    const { data: openPrograms, isLoading: loadingPrograms } = useQuery<any>({
        queryKey: ["open-programs"],
        queryFn: async () => {
            const res = await fetch("/api/me/benefits/programs/open");
            if (!res.ok) throw new Error("Failed to fetch programs");
            return res.json();
        }
    });

    const { data: plans, isLoading: loadingPlans } = useQuery<any>({
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
                <Button onClick={() => setLocation("/hr/self-service/profile")} variant="outline" className="mt-4">
                    Back to Profile
                </Button>
            </div>
        );
    }
    const MOCK_PLANS = {
        MEDICAL: [
            { planId: 'm1', planName: 'Nexus PPO', planType: 'MEDICAL', options: [{ planOptionId: 'o1', optionName: 'Employee Only', employeeCost: '150.00' }, { planOptionId: 'o2', optionName: 'Family', employeeCost: '450.00' }] },
            { planId: 'm2', planName: 'Nexus HDHP', planType: 'MEDICAL', options: [{ planOptionId: 'o3', optionName: 'Employee Only', employeeCost: '50.00' }] }
        ],
        DENTAL: [
            { planId: 'd1', planName: 'Delta Dental Premier', planType: 'DENTAL', options: [{ planOptionId: 'o4', optionName: 'Employee Only', employeeCost: '15.00' }] }
        ],
        VISION: [
            { planId: 'v1', planName: 'VSP Standard', planType: 'VISION', options: [{ planOptionId: 'o5', optionName: 'Employee Only', employeeCost: '5.00' }] }
        ]
    };

    const wizardSteps = ["Program Selection", "Medical", "Dental", "Vision", "Review"];

    return (
        <StandardPage
            title="Open Enrollment 2026"
            description="Configure your health and wellness package step-by-step."
            breadcrumbs={[
                { label: "Self Service", href: "/hr/self-service/me" },
                { label: "Benefits Enrollment" }
            ]}
        >
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-end items-end mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        {wizardSteps.map((label, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className={cn(`h-2.5 w-16 rounded-full transition-all duration-300 ${step >= i ? "bg-teal-500 shadow-sm shadow-teal-500/20" : "bg-zinc-200 dark:bg-zinc-800"}`)} />
                                <span className={cn(`text-[10px] font-semibold uppercase tracking-wider ${step >= i ? "text-teal-600" : "text-zinc-400"}`)}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {step === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loadingPrograms ? (
                            <p>Loading programs...</p>
                        ) : openPrograms?.map((prog: any) => (
                            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => { setSelectedProgramId(prog.id); setStep(1); }}>
                            <Card key={prog.id} className="relative overflow-hidden group hover:border-teal-500/50 transition-all cursor-pointer border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
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
                                                                    <p>Ends: {formatDate(prog.openEnrollmentEnd)}</p>
                                                                </div>
                                                            </CardContent>
                                                            <CardFooter>
                                                                <Button variant="ghost" className="p-0 text-teal-600 hover:bg-transparent group-hover:gap-3 transition-all">
                                                                    Start Selection <ChevronRight className="h-4 w-4" />
                                                                </Button>
                                                            </CardFooter>
                                                        </Card>
                            </Button>
                        ))}
                    </div>
                )}

                {/* STEP 1: MEDICAL */}
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <Heart className="h-8 w-8 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Medical Coverage</h2>
                                <p className="text-muted-foreground">Select a medical plan for you and your dependents.</p>
                            </div>
                        </div>
                        {MOCK_PLANS.MEDICAL.map((plan: any) => (
                            <Card key={plan.planId} className={cn("border-zinc-200/50 dark:border-zinc-800/50 shadow-md transition-all", selections[plan.planId] ? "border-teal-500" : "")}>
                                <CardHeader className="flex flex-row items-center justify-between bg-muted/20">
                                    <div>
                                        <CardTitle>{plan.planName}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                                    {plan.options.map((opt: any) => (
                                        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => handleSelectOption(plan.planId, opt.planOptionId)}>
                                        <div
                                                                                    key={opt.planOptionId}
                                                                                    className={cn(`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selections[plan.planId] === opt.planOptionId ? "border-teal-500 bg-teal-500/5 shadow-sm shadow-teal-500/10" : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`)}
                                                                                >
                                                                                    <div className="flex justify-between items-start mb-4">
                                                                                        <p className="font-semibold">{opt.optionName}</p>
                                                                                        {selections[plan.planId] === opt.planOptionId && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                                                                                    </div>
                                                                                    <p className="text-3xl font-bold">${opt.employeeCost}<span className="text-sm text-zinc-400 font-normal">/mo</span></p>
                                                                                </div>
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                        <div className="flex justify-between pt-6">
                            <Button variant="outline" onClick={() => setStep(0)}>Cancel</Button>
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setStep(2)}>
                                Next: Dental <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 2: DENTAL */}
                {step === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <AlertCircle className="h-8 w-8 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Dental Coverage</h2>
                                <p className="text-muted-foreground">Select a dental plan.</p>
                            </div>
                        </div>
                        {MOCK_PLANS.DENTAL.map((plan: any) => (
                            <Card key={plan.planId} className={cn("border-zinc-200/50 dark:border-zinc-800/50 shadow-md transition-all", selections[plan.planId] ? "border-teal-500" : "")}>
                                <CardHeader className="flex flex-row items-center justify-between bg-muted/20">
                                    <div>
                                        <CardTitle>{plan.planName}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                                    {plan.options.map((opt: any) => (
                                        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => handleSelectOption(plan.planId, opt.planOptionId)}>
                                        <div
                                                                                    key={opt.planOptionId}
                                                                                    className={cn(`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selections[plan.planId] === opt.planOptionId ? "border-teal-500 bg-teal-500/5 shadow-sm shadow-teal-500/10" : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`)}
                                                                                >
                                                                                    <div className="flex justify-between items-start mb-4">
                                                                                        <p className="font-semibold">{opt.optionName}</p>
                                                                                        {selections[plan.planId] === opt.planOptionId && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                                                                                    </div>
                                                                                    <p className="text-3xl font-bold">${opt.employeeCost}<span className="text-sm text-zinc-400 font-normal">/mo</span></p>
                                                                                </div>
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                        <div className="flex justify-between pt-6">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setStep(3)}>
                                Next: Vision <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: VISION */}
                {step === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <Eye className="h-8 w-8 text-purple-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Vision Coverage</h2>
                                <p className="text-muted-foreground">Select a vision plan.</p>
                            </div>
                        </div>
                        {MOCK_PLANS.VISION.map((plan: any) => (
                            <Card key={plan.planId} className={cn("border-zinc-200/50 dark:border-zinc-800/50 shadow-md transition-all", selections[plan.planId] ? "border-teal-500" : "")}>
                                <CardHeader className="flex flex-row items-center justify-between bg-muted/20">
                                    <div>
                                        <CardTitle>{plan.planName}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                                    {plan.options.map((opt: any) => (
                                        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => handleSelectOption(plan.planId, opt.planOptionId)}>
                                        <div
                                                                                    key={opt.planOptionId}
                                                                                    className={cn(`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selections[plan.planId] === opt.planOptionId ? "border-teal-500 bg-teal-500/5 shadow-sm shadow-teal-500/10" : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`)}
                                                                                >
                                                                                    <div className="flex justify-between items-start mb-4">
                                                                                        <p className="font-semibold">{opt.optionName}</p>
                                                                                        {selections[plan.planId] === opt.planOptionId && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                                                                                    </div>
                                                                                    <p className="text-3xl font-bold">${opt.employeeCost}<span className="text-sm text-zinc-400 font-normal">/mo</span></p>
                                                                                </div>
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                        <div className="flex justify-between pt-6">
                            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setStep(4)}>
                                Review Elections <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: REVIEW */}
                {step === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                        <Card className="border-teal-500/30 bg-teal-500/100/5 shadow-lg">
                            <CardHeader>
                                <CardTitle>Election Summary</CardTitle>
                                <CardDescription>Review your choices for the 2026 plan year before final submission.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.values(MOCK_PLANS).flat().filter((p: any) => selections[p.planId]).map((p: any) => {
                                    const selectedOpt = p.options.find((o: any) => o.planOptionId === selections[p.planId]);
                                    return (
                                        <div key={p.planId} className="flex justify-between items-center p-4 bg-card dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                                            <div>
                                                <p className="font-semibold text-xs tracking-wider uppercase text-zinc-500">{p.planType}</p>
                                                <p className="font-bold text-lg">{p.planName} <span className="text-muted-foreground font-normal ml-2">({selectedOpt.optionName})</span></p>
                                            </div>
                                            <p className="font-bold text-2xl text-teal-700 dark:text-teal-400">${selectedOpt.employeeCost}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                        </div>
                                    );
                                })}
                                <div className="pt-6 border-t border-teal-500/20 flex justify-between items-end mt-8">
                                    <div>
                                        <p className="font-semibold uppercase tracking-wider text-xs text-zinc-500">Total Pre-Tax Deduction</p>
                                    </div>
                                    <span className="text-4xl font-black text-teal-600">
                                        ${Object.values(MOCK_PLANS).flat().reduce((acc: number, p: any) => {
                                            const opt = p.options.find((o: any) => o.planOptionId === selections[p.planId]);
                                            return acc + (opt ? Number(opt.employeeCost) : 0);
                                        }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4">
                            <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-amber-900 dark:text-amber-200">
                                <strong>Legal Agreement:</strong> By confirming your elections, you authorize NexusAI to deduct the total amount shown from your periodic paychecks. These elections cannot be changed outside of a qualifying Life Event.
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" size="lg" onClick={() => setStep(3)}>Back</Button>
                            <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-12" onClick={handleFinish} disabled={enrollMutation.isPending}>
                                {enrollMutation.isPending ? "Submitting..." : "Confirm & Enroll"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
