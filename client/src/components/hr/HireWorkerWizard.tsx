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
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof hireSchema>>({
        resolver: zodResolver(step === 1 ? identitySchema : employmentSchema), // Simple step validation needed
        defaultValues: {
            workerType: "EMPLOYEE",
        }
    });

    // TODO: Fetch Legal Employers, Jobs, Depts for Selects

    const hireMutation = useMutation({
        mutationFn: (data: z.infer<typeof hireSchema>) => {
            // Transform flat form data into hierarchical Person > Rel > Asg structure
            const payload = {
                person: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    nationalId: data.nationalId,
                    personNumber: "AUTO", // Backend handles or we generate
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
        // Validate current step fields
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
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Hire New Worker</CardTitle>
                <CardDescription>Step {step} of 2: {step === 1 ? "Personal Details" : "Employment Information"}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {step === 1 && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="nationalId" render={({ field }) => (
                                    <FormItem><FormLabel>National ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <FormField control={form.control} name="legalEmployerId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Legal Employer</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Employer" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="le1">Acme US (Placeholder)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                {/* Add Job, Dept selects here */}
                                <FormField control={form.control} name="startDate" render={({ field }) => (
                                    <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
                            {step < 2 && <Button type="button" onClick={onNext}>Next</Button>}
                            {step === 2 && <Button type="submit">Submit</Button>}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
