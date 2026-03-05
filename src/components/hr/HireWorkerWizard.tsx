import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { RiskIndicator } from "@/components/compliance/RiskIndicator";
import { ShieldCheck, Loader2 } from "lucide-react";
import { DatePickerField } from '@/components/forms/DatePickerField';

// Schema for Step 1: Identity
const identitySchema = z.object({
    firstName: z.string().min(2, "First name required"),
    lastName: z.string().min(2, "Last name required"),
    email: z.string().email().optional(),
    nationalId: z.string().min(5, "NID required"),
});

// Schema for Step 2: Employment
const employmentSchema = z.object({
    legalEmployerId: z.string().min(1, "Legal Employer required"),
    jobId: z.string().optional(),
    departmentId: z.string().optional(),
    workerType: z.enum(["EMPLOYEE", "CONTINGENT"]),
    startDate: z.string().min(1, "Start Date required"),
});

// Combined Schema
const hireSchema = identitySchema.merge(employmentSchema);

export function HireWorkerWizard({ onClose }: { onClose?: () => void }) {
    const [step, setStep] = useState(1);
    const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof hireSchema>>({
        resolver: zodResolver(step === 1 ? identitySchema : employmentSchema),
        defaultValues: {
            workerType: "EMPLOYEE",
        }
    });

    const riskMutation = useMutation({
        mutationFn: (data: z.infer<typeof hireSchema>) => {
            return fetch("/api/hr/compliance/predict-risk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transactionType: "HIRE",
                    data: {
                        ...data,
                        jobName: "Software Engineer" // Placeholder until job select is fixed
                    }
                })
            }).then(r => r.json());
        },
        onSuccess: (data) => setRiskAnalysis(data),
    });

    const hireMutation = useMutation({
        mutationFn: (data: z.infer<typeof hireSchema>) => {
            const payload = {
                person: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    nationalId: data.nationalId,
                    personNumber: "AUTO",
                },
                workRelationship: {
                    legalEmployerId: data.legalEmployerId,
                    workerType: data.workerType,
                    dateStart: data.startDate,
                },
                assignment: {
                    jobId: data.jobId,
                    departmentId: data.departmentId,
                    assignmentStatus: "ACTIVE"
                }
            };
            return api.hr.persons.create(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hr-persons-search"] });
            toast({ title: "Success", description: "Worker hired successfully" });
            onClose?.();
        },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });

    const onNext = async () => {
        const fields = step === 1
            ? ["firstName", "lastName", "nationalId"]
            : ["legalEmployerId", "startDate"];

        const valid = await form.trigger(fields as any);
        if (valid) setStep(step + 1);
    };

    const onSubmit = (data: z.infer<typeof hireSchema>) => {
        hireMutation.mutate(data);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold text-slate-900">Hire New Worker</CardTitle>
                        <CardDescription className="text-slate-500">Step {step} of 2: {step === 1 ? "Personal Details" : "Employment Information"}</CardDescription>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {step === 1 && (
                            <div className="grid grid-cols-2 gap-6">
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem><FormLabel className="font-semibold">First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem><FormLabel className="font-semibold">Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="nationalId" render={({ field }) => (
                                    <FormItem><FormLabel className="font-semibold">National ID / Passport</FormLabel><FormControl><Input placeholder="ABC123456" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel className="font-semibold">Email Address</FormLabel><FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <FormField control={form.control} name="legalEmployerId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Legal Employer</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Select Employer" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="le1">Acme US Corp</SelectItem>
                                                <SelectItem value="le2">Acme UK Ltd</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="startDate" render={({ field }) => (
                                    <FormItem><FormLabel className="font-semibold">Hire Date</FormLabel><FormControl><DatePickerField {...field} /></FormControl><FormMessage /></FormItem>
                                )} />

                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Compliance Analytics</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => riskMutation.mutate(form.getValues())}
                                            disabled={riskMutation.isPending}
                                            className="h-8 gap-2 bg-slate-50"
                                        >
                                            {riskMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                                            Preview Compliance Risk
                                        </Button>
                                    </div>
                                    <RiskIndicator analysis={riskAnalysis} isLoading={riskMutation.isPending} />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-6 mt-4 border-t">
                            {step > 1 && <Button type="button" variant="outline" className="px-8" onClick={() => setStep(step - 1)}>Back</Button>}
                            <div className="ml-auto">
                                {step < 2 ? (
                                    <Button type="button" className="px-8" onClick={onNext}>Continue</Button>
                                ) : (
                                    <Button type="submit" disabled={hireMutation.isPending} className="px-8 gap-2 font-bold shadow-lg shadow-primary/20">
                                        {hireMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Complete Hire
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
