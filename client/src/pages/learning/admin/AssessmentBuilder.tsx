
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

export default function AssessmentBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);

    // Create Quiz
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
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

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Assessment Builder</h1>

            {!selectedAssessment ? (
                <Card className="w-full max-w-md mx-auto mt-10">
                    <CardHeader>
                        <CardTitle>Create New Quiz</CardTitle>
                        <CardDescription>Configure the basic settings for your assessment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            createMutation.mutate({
                                title: fd.get("title"),
                                description: fd.get("description"),
                                passingScore: Number(fd.get("passingScore"))
                            });
                        }} className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input name="title" required placeholder="e.g. Final Exam" />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input name="description" placeholder="Instructions..." />
                            </div>
                            <div>
                                <Label>Passing Score (Points)</Label>
                                <Input name="passingScore" type="number" defaultValue="80" />
                            </div>
                            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create & Add Questions
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <QuestionEditor assessment={selectedAssessment} />
            )}
        </div>
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
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const options = {
            a: fd.get("optA"),
            b: fd.get("optB"),
            c: fd.get("optC"),
            d: fd.get("optD")
        };
        onSave({
            text: fd.get("text"),
            type: "MULTIPLE_CHOICE",
            points: Number(fd.get("points")),
            options,
            correctAnswer: fd.get("correctAnswer")
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Question Text</Label>
                <Input name="text" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Option A</Label><Input name="optA" required /></div>
                <div><Label>Option B</Label><Input name="optB" required /></div>
                <div><Label>Option C</Label><Input name="optC" /></div>
                <div><Label>Option D</Label><Input name="optD" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Correct Answer</Label>
                    <Select name="correctAnswer" defaultValue="a">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="a">Option A</SelectItem>
                            <SelectItem value="b">Option B</SelectItem>
                            <SelectItem value="c">Option C</SelectItem>
                            <SelectItem value="d">Option D</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Points</Label>
                    <Input name="points" type="number" defaultValue="10" />
                </div>
            </div>
            <Button type="submit" className="w-full">Save Question</Button>
        </form>
    );
}
