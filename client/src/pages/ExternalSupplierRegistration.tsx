import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Building2, Landmark, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const registrationSchema = z.object({
    companyName: z.string().min(2, "Company name is required"),
    taxId: z.string().min(5, "Tax ID/VAT is required"),
    contactEmail: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    businessClassification: z.string().optional(),
    bankAccountName: z.string().min(2, "Bank account name is required"),
    bankAccountNumber: z.string().min(5, "Bank account number is required"),
    bankRoutingNumber: z.string().min(5, "Routing number is required"),
    notes: z.string().optional()
});

export default function ExternalSupplierRegistration() {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof registrationSchema>>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            companyName: "",
            taxId: "",
            contactEmail: "",
            phone: "",
            bankAccountName: "",
            bankAccountNumber: "",
            bankRoutingNumber: "",
            notes: ""
        }
    });

    async function onSubmit(values: z.infer<typeof registrationSchema>) {
        try {
            const response = await fetch("/api/supplier-portal/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });

            if (!response.ok) throw new Error("Submission failed");

            setSubmitted(true);
            toast({
                title: "Registration Submitted",
                description: "Your request is being reviewed by our procurement team."
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit registration. Please try again.",
                variant: "destructive"
            });
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8 space-y-6">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Successfully Submitted</h1>
                        <p className="text-muted-foreground text-sm">
                            Thank you for your interest in becoming a supplier. Our team will review your information and contact you via email.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.location.href = "/"} className="w-full">
                        Return to Homepage
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 py-12">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Supplier Registration</h1>
                    <p className="text-muted-foreground">Join our global network of strategic partners.</p>
                </div>

                <div className="flex justify-between items-center px-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {s}
                            </div>
                            {s < 3 && <div className={cn("w-20 h-1 mx-2 rounded-full", step > s ? "bg-primary" : "bg-muted")} />}
                        </div>
                    ))}
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {step === 1 && <><Building2 className="w-5 h-5" /> Company Profile</>}
                                    {step === 2 && <><Landmark className="w-5 h-5" /> Financial & Tax Info</>}
                                    {step === 3 && <><ShieldCheck className="w-5 h-5" /> Confirmation</>}
                                </CardTitle>
                                <CardDescription>
                                    {step === 1 && "Basic information about your business entity."}
                                    {step === 2 && "Required for tax compliance and electronic payments."}
                                    {step === 3 && "Review your details before final submission."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {step === 1 && (
                                    <div className="grid gap-4">
                                        <FormField
                                            control={form.control}
                                            name="companyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Legal Company Name</FormLabel>
                                                    <FormControl><Input placeholder="Acme Corp" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="contactEmail"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Primary Contact Email</FormLabel>
                                                        <FormControl><Input placeholder="billing@acme.com" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl><Input placeholder="+1..." {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="grid gap-4">
                                        <FormField
                                            control={form.control}
                                            name="taxId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tax ID / VAT Number</FormLabel>
                                                    <FormControl><Input placeholder="Tax Registration No." {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid gap-4 p-4 border rounded-lg bg-primary/5">
                                            <p className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
                                                <Landmark className="w-3 h-3" /> Remittance Bank Details
                                            </p>
                                            <FormField
                                                control={form.control}
                                                name="bankAccountName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Account Bene Name</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="bankAccountNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Account Number / IBAN</FormLabel>
                                                            <FormControl><Input {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="bankRoutingNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Routing / SWIFT Code</FormLabel>
                                                            <FormControl><Input {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Company</p>
                                                <p className="font-medium">{form.getValues("companyName")}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Tax ID</p>
                                                <p className="font-medium">{form.getValues("taxId")}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Email</p>
                                                <p className="font-medium">{form.getValues("contactEmail")}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Bank Account</p>
                                                <p className="font-medium">{form.getValues("bankAccountName")}</p>
                                            </div>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Additional Comments</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="p-4 bg-muted rounded-lg text-[10px] text-muted-foreground leading-relaxed">
                                            By submitting this registration, you certify that all provided information is accurate and you agree to our Vendor Code of Conduct. Information will be processed in accordance with our Privacy Policy.
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-6">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep(s => s - 1)}
                                    disabled={step === 1}
                                >
                                    Previous
                                </Button>
                                {step < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={async () => {
                                            let fields: any[] = [];
                                            if (step === 1) fields = ["companyName", "contactEmail"];
                                            if (step === 2) fields = ["taxId", "bankAccountName", "bankAccountNumber", "bankRoutingNumber"];

                                            const isValid = await form.trigger(fields);
                                            if (isValid) setStep(s => s + 1);
                                        }}
                                    >
                                        Next Step
                                    </Button>
                                ) : (
                                    <Button type="submit">Submit Registration</Button>
                                )}
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </div>
        </div>
    );
}
