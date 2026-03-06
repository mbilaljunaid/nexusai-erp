
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertTriangle, Save } from "lucide-react";

interface Question {
    id: string;
    text: string;
    type: 'YES_NO' | 'PASS_FAIL' | 'TEXT' | 'NUMBER' | 'CHECKBOX';
    required: boolean;
}

interface InspectionDefinition {
    id: string;
    name: string;
    questions: Question[];
}

interface InspectionFormRunnerProps {
    inspectionId: string;
    definition: InspectionDefinition;
    onComplete: () => void;
}

export default function InspectionFormRunner({ inspectionId, definition, onComplete }: InspectionFormRunnerProps) {
    const { toast } = useToast();
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [comments, setComments] = useState<Record<string, string>>({});

    const submitMutation = useMutation({
        mutationFn: async (data: any) => {
            // If offline, this would save to localStorage instead
            const isOffline = !navigator.onLine; // Simple check

            if (isOffline) {
                const queue = JSON.parse(localStorage.getItem("offline_inspection_queue") || "[]");
                queue.push({ inspectionId, data, timestamp: Date.now() });
                localStorage.setItem("offline_inspection_queue", JSON.stringify(queue));
                return { offline: true };
            }

            const res = await fetch(`/api/maintenance/quality/inspections/${inspectionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ results: data, status: 'COMPLETED' })
            });
            if (!res.ok) throw new Error("Failed to submit");
            return res.json();
        },
        onSuccess: (data) => {
            if (data.offline) {
                toast({ title: "Saved Offline", description: "Inspection validaton saved locally. Will sync when online." });
            } else {
                toast({ title: "Inspection Submitted", description: "Results recorded successfully." });
            }
            onComplete();
        },
        onError: () => {
            toast({ title: "Error", description: "Could not submit inspection.", variant: "destructive" });
        }
    });

    const handleAnswerChange = (qId: string, val: any) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const handleCommentChange = (qId: string, val: string) => {
        setComments(prev => ({ ...prev, [qId]: val }));
    };

    const validate = () => {
        for (const q of definition.questions) {
            if (q.required && (answers[q.id] === undefined || answers[q.id] === "")) {
                toast({ title: "Missing Required Field", description: q.text, variant: "destructive" });
                return false;
            }
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const results = definition.questions.map(q => ({
            questionId: q.id,
            answer: answers[q.id],
            comment: comments[q.id]
        }));

        submitMutation.mutate(results);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>{definition.name}</CardTitle>
                <CardDescription>Please complete all items below.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto space-y-6">
                {definition.questions.map((q, idx) => (
                    <div key={q.id} className="p-4 border rounded-lg bg-card space-y-3">
                        <div className="flex justify-between items-start">
                            <Label className="text-base font-medium">
                                {idx + 1}. {q.text} {q.required && <span className="text-destructive">*</span>}
                            </Label>
                        </div>

                        {/* Render Input based on Type */}
                        <div className="mt-2">
                            {q.type === 'PASS_FAIL' && (
                                <RadioGroup
                                    value={answers[q.id] || ""}
                                    onValueChange={(v) => handleAnswerChange(q.id, v)}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="PASS" id={`q-${q.id}-pass`} className="text-green-600 border-green-600" />
                                        <Label htmlFor={`q-${q.id}-pass`} className="text-green-700 font-bold">PASS</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="FAIL" id={`q-${q.id}-fail`} className="text-red-600 border-red-600" />
                                        <Label htmlFor={`q-${q.id}-fail`} className="text-red-700 font-bold">FAIL</Label>
                                    </div>
                                </RadioGroup>
                            )}

                            {q.type === 'YES_NO' && (
                                <RadioGroup
                                    value={answers[q.id] || ""}
                                    onValueChange={(v) => handleAnswerChange(q.id, v)}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="YES" id={`q-${q.id}-yes`} />
                                        <Label htmlFor={`q-${q.id}-yes`}>Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="NO" id={`q-${q.id}-no`} />
                                        <Label htmlFor={`q-${q.id}-no`}>No</Label>
                                    </div>
                                </RadioGroup>
                            )}

                            {q.type === 'NUMBER' && (
                                <Input
                                    type="number"
                                    placeholder="Enter value..."
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    className="max-w-36"
                                />
                            )}

                            {q.type === 'TEXT' && (
                                <Textarea
                                    placeholder="Enter observation..."
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                />
                            )}
                        </div>

                        {/* Optional Comment for any Question */}
                        <Input
                            placeholder="Add notes/comments (optional)"
                            className="text-sm bg-muted/20"
                            value={comments[q.id] || ""}
                            onChange={(e) => handleCommentChange(q.id, e.target.value)}
                        />
                    </div>
                ))}
            </CardContent>

            <div className="p-6 border-t bg-muted/10">
                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitMutation.isPending}>
                    {submitMutation.isPending ? "Submitting..." : (
                        <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Submit Inspection</span>
                    )}
                </Button>
            </div>
        </Card>
    );
}
