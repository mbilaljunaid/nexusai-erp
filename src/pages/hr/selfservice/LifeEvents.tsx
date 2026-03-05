import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    HeartHandshake,
    Baby,
    Home,
    FileUp,
    AlertCircle,
    CheckCircle2,
    CalendarDays,
    UploadCloud
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePickerField } from '@/components/forms/DatePickerField';

const lifeEventSchema = z.object({
    eventDate: z.string().min(1, "Event Date is required"),
    effectivity: z.string().min(1, "Effective Date is required"),
    description: z.string().optional()
});

export default function LifeEvents() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

    const lifeEvents = [
        { id: "marriage", title: "Marriage / Domestic Partnership", icon: HeartHandshake, color: "text-rose-500", bg: "bg-rose-500/10" },
        { id: "birth", title: "Birth / Adoption", icon: Baby, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "relocation", title: "Relocation", icon: Home, color: "text-amber-500", bg: "bg-amber-500/10" }
    ];

    const form = useForm<z.infer<typeof lifeEventSchema>>({
        resolver: zodResolver(lifeEventSchema),
        defaultValues: {
            eventDate: "",
            effectivity: "",
            description: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof lifeEventSchema>) => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Life Event Submitted",
                description: "Your documentation is under review. You will be notified when your enrollment window opens.",
            });
            form.reset();
            setSelectedEvent(null);
        }, 1500);
    };

    return (
        <StandardPage
            title="Life Events"
            description="Declare a qualified life event to update your benefits outside of the Open Enrollment period."
            breadcrumbs={[
                { label: 'HR Self-Service', href: '/hr/dashboard' },
                { label: 'Benefits', href: '/hr/self-service/benefits' },
                { label: 'Life Events' }
            ]}
        >
            <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!selectedEvent ? (
                    <>
                        <Card className="bg-amber-500/10 border-amber-500/20 shadow-none">
                            <CardContent className="p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                <div className="text-sm text-amber-900 dark:text-amber-200">
                                    <strong>Important Policy:</strong> You must report a qualifying life event and provide supporting documentation within <strong>30 days</strong> of the event date. Failure to do so will result in waiting until the next annual Open Enrollment period.
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {lifeEvents.map((event) => (
                                <Card
                                    key={event.id}
                                    className="cursor-pointer border-zinc-200/50 dark:border-zinc-800/50 hover:border-teal-500/50 hover:shadow-md transition-all group"
                                    onClick={() => setSelectedEvent(event.id)}
                                >
                                    <CardContent className="p-6 text-center space-y-4">
                                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${event.bg} group-hover:scale-110 transition-transform`}>
                                            <event.icon className={`h-8 w-8 ${event.color}`} />
                                        </div>
                                        <h3 className="font-semibold">{event.title}</h3>
                                        <Button variant="link" className="text-teal-600 p-0 h-auto">Report Event &rarr;</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                ) : (
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-4 bg-muted/20 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedEvent(null)}>
                                &larr;
                            </Button>
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    Declare: {lifeEvents.find(e => e.id === selectedEvent)?.title}
                                </CardTitle>
                                <CardDescription>Submit details and required proof to verify your event.</CardDescription>
                            </div>
                        </CardHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="eventDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Date of Event *</FormLabel>
                                                    <div className="relative">
                                                        <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                                        <FormControl>
                                                            <DatePickerField {...field} className="pl-10" />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="effectivity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Desired Effective Date *</FormLabel>
                                                    <div className="relative">
                                                        <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                                        <FormControl>
                                                            <DatePickerField {...field} className="pl-10" />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Additional Details</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Provide any necessary context for HR..." className="min-h-[100px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-3">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Supporting Documentation <span className="text-red-500">*</span></Label>
                                        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                                            <UploadCloud className="mx-auto h-10 w-10 text-zinc-400 mb-4" />
                                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 10MB)</p>
                                            <p className="text-xs font-medium text-teal-600 mt-2">Required: Marriage Certificate, Birth Certificate, etc.</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
                                    <Button type="button" variant="outline" onClick={() => setSelectedEvent(null)}>Cancel</Button>
                                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                                        {isSubmitting ? "Submitting Event..." : "Submit for HR Verification"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
