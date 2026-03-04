
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, PenTool } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StandardPage } from "@/components/layout/StandardPage";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const assessmentSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    passingScore: z.coerce.number().min(0, "Must be positive")
});

const questionSchema = z.object({
    text: z.string().min(1, "Question Text is required"),
    optA: z.string().min(1, "Option A is required"),
    optB: z.string().min(1, "Option B is required"),
    optC: z.string().optional(),
    optD: z.string().optional(),
    correctAnswer: z.string().min(1, "Correct Answer is required"),
    points: z.coerce.number().min(1, "Must be > 0")
});

export default function AssessmentBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);

    // Create Quiz
    const createMutation = useMutation({
        mutationFn: async (data: z.infer<typeof assessmentSchema>) => {
            const res = await fetch("/api/learning/assessments", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: (data) => {
            setSelectedAssessment(data);
            toast({ title: "Quiz Created", description: "Now add questions." });
        }
    });

    const form = useForm<z.infer<typeof assessmentSchema>>({
        resolver: zodResolver(assessmentSchema),
        defaultValues: {
            title: "",
            description: "",
            passingScore: 80
        }
    });

    const onSubmit = (values: z.infer<typeof assessmentSchema>) => {
        createMutation.mutate(values);
    };

    return (
        <StandardPage
            title="Assessment Builder"
            description="Create quizzes and certification exams."
            breadcrumbs={[
                { label: "Learning", href: "/hr/learning/me" },
                { label: "Administration", href: "/hr/learning/admin" },
                { label: "Assessment Builder" }
            ]}
        >
            <div className="space-y-6">

                {!selectedAssessment ? (
                    <Card className="w-full max-w-md mx-auto mt-10">
                        <CardHeader>
                            <CardTitle>Create New Quiz</CardTitle>
                            <CardDescription>Configure the basic settings for your assessment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Final Exam" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Instructions..." {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="passingScore"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Passing Score (Points)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                        {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create & Add Questions
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                ) : (
                    <QuestionEditor assessment={selectedAssessment} />
                )}
            </div>
        </StandardPage>
    );
}

function QuestionEditor({ assessment }: { assessment: any }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data: details, isLoading } = useQuery({
        queryKey: ["assessment", assessment.id],
        queryFn: async () => {
            const res = await fetch(`/api/learning/assessments/${assessment.id}`);
            return res.json();
        }
    });

    const addQuestionMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/learning/assessments/${assessment.id}/questions`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment", assessment.id] });
            setIsAddOpen(false);
            toast({ title: "Question Added" });
        }
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{assessment.title}</CardTitle>
                    <CardDescription>Passing Score: {assessment.passingScore} points</CardDescription>
                </CardHeader>
            </Card>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Questions ({details?.questions?.length || 0})</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Question</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>New Question</DialogTitle></DialogHeader>
                        <QuestionForm onSave={(q) => addQuestionMutation.mutate(q)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {isLoading ? <Loader2 className="animate-spin" /> : details?.questions?.map((q: any, i: number) => (
                    <Card key={q.id}>
                        <CardContent className="p-4 pt-4">
                            <div className="flex justify-between">
                                <span className="font-bold">Q{i + 1}: {q.text}</span>
                                <span className="text-muted-foreground">{q.points} pts</span>
                            </div>
                            <div className="mt-2 pl-4 border-l-2">
                                {q.options?.a && <div className={q.correctAnswer === "a" ? "text-green-600 font-medium" : ""}>A) {q.options.a}</div>}
                                {q.options?.b && <div className={q.correctAnswer === "b" ? "text-green-600 font-medium" : ""}>B) {q.options.b}</div>}
                                {q.options?.c && <div className={q.correctAnswer === "c" ? "text-green-600 font-medium" : ""}>C) {q.options.c}</div>}
                                {q.options?.d && <div className={q.correctAnswer === "d" ? "text-green-600 font-medium" : ""}>D) {q.options.d}</div>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function QuestionForm({ onSave }: { onSave: (data: any) => void }) {
    const form = useForm<z.infer<typeof questionSchema>>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            text: "",
            optA: "",
            optB: "",
            optC: "",
            optD: "",
            correctAnswer: "a",
            points: 10
        }
    });

    const onSubmit = (values: z.infer<typeof questionSchema>) => {
        onSave({
            text: values.text,
            type: "MULTIPLE_CHOICE",
            points: values.points,
            options: {
                a: values.optA,
                b: values.optB,
                c: values.optC,
                d: values.optD
            },
            correctAnswer: values.correctAnswer
        });
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question Text</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="optA"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Option A</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="optB"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Option B</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="optC"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Option C</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="optD"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Option D</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="correctAnswer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correct Answer</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="a">Option A</SelectItem>
                                        <SelectItem value="b">Option B</SelectItem>
                                        <SelectItem value="c">Option C</SelectItem>
                                        <SelectItem value="d">Option D</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="points"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Points</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full">Save Question</Button>
            </form>
        </Form>
    );
}
