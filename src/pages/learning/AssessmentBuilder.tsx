import { cn } from "@/lib/utils";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ClipboardList, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Assessment {
    id: string;
    title: string;
    courseId?: string;
    courseTitle?: string;
    questionCount: number;
    passingScore: number;
    timeLimit?: number;
}

interface Question {
    id: string;
    text: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    options?: string[];
    correctAnswer: string;
}

export default function AssessmentBuilder() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        passingScore: 70,
        timeLimit: 30,
    });
    const [questionForm, setQuestionForm] = useState({
        text: "",
        type: "MULTIPLE_CHOICE" as "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER",
        options: ["", "", "", ""],
        correctAnswer: "",
    });

    const queryClient = useQueryClient();

    const { data: assessments = [] } = useQuery<any>({
        queryKey: ["/api/learning/assessments"],
    });

    const { data: questions = [] } = useQuery<any>({
        queryKey: ["/api/learning/assessments", selectedAssessmentId, "questions"],
        enabled: !!selectedAssessmentId,
    });

    const createAssessmentMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/learning/assessments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/learning/assessments"] });
            setIsCreateOpen(false);
            setFormData({ title: "", passingScore: 70, timeLimit: 30 });
        },
    });

    const addQuestionMutation = useMutation({
        mutationFn: async (data: typeof questionForm) => {
            const res = await fetch(`/api/learning/assessments/${selectedAssessmentId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/learning/assessments", selectedAssessmentId, "questions"],
            });
            setQuestionForm({
                text: "",
                type: "MULTIPLE_CHOICE",
                options: ["", "", "", ""],
                correctAnswer: "",
            });
        },
    });

    const selectedAssessment = assessments.find((a: Assessment) => a.id === selectedAssessmentId);

    return (
        <StandardPage title="Assessment Builder">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    
                    <p className="text-muted-foreground">
                        Create quizzes and tests for your courses
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Assessment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Assessment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="title">Assessment Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Final Quiz"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                                    <Input
                                        id="passingScore"
                                        type="number"
                                        value={formData.passingScore}
                                        onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="timeLimit">Time Limit (min)</Label>
                                    <Input
                                        id="timeLimit"
                                        type="number"
                                        value={formData.timeLimit}
                                        onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 30 })}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={() => createAssessmentMutation.mutate(formData)}
                                disabled={!formData.title || createAssessmentMutation.isPending}
                                className="w-full"
                            >
                                Create Assessment
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assessments List */}
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold">Assessments</h2>
                    {assessments.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No assessments created</p>
                            </CardContent>
                        </Card>
                    ) : (
                        assessments.map((assessment: Assessment) => (
                            <Card
                                key={assessment.id}
                                className={cn(`cursor-pointer transition-all ${selectedAssessmentId === assessment.id
                                        ? "border-primary ring-2 ring-primary"
                                        : "hover:border-primary/50"
                                    }`)}
                                onClick={() => setSelectedAssessmentId(assessment.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg">{assessment.title}</CardTitle>
                                    {assessment.courseTitle && (
                                        <CardDescription>Course: {assessment.courseTitle}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">{assessment.questionCount} questions</Badge>
                                        <Badge variant="secondary">{assessment.passingScore}% pass</Badge>
                                        {assessment.timeLimit && (
                                            <Badge variant="outline">{assessment.timeLimit}min</Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Question Editor */}
                <Card>
                    <CardHeader>
                        <CardTitle>Questions</CardTitle>
                        <CardDescription>
                            {selectedAssessment ? selectedAssessment.title : "Select an assessment"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedAssessment ? (
                            <p className="text-center py-12 text-muted-foreground">
                                Select an assessment to manage questions
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {/* Existing Questions */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">
                                        Questions ({questions.length})
                                    </h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {questions.map((q: Question, idx: number) => (
                                            <div key={q.id} className="p-3 border rounded-lg">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{idx + 1}. {q.text}</div>
                                                        <Badge variant="outline" className="mt-1 text-xs">
                                                            {q.type.replace("_", " ")}
                                                        </Badge>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Add Question */}
                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold mb-3">Add Question</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="questionText">Question</Label>
                                            <Input
                                                id="questionText"
                                                value={questionForm.text}
                                                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                                                placeholder="Enter question..."
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="questionType">Type</Label>
                                            <Select
                                                value={questionForm.type}
                                                onValueChange={(v: any) => setQuestionForm({ ...questionForm, type: v })}
                                            >
                                                <SelectTrigger id="questionType">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                                    <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                                    <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {questionForm.type === "MULTIPLE_CHOICE" && (
                                            <div className="space-y-2">
                                                <Label>Options</Label>
                                                {questionForm.options.map((opt, idx) => (
                                                    <Input
                                                        key={idx}
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOptions = [...questionForm.options];
                                                            newOptions[idx] = e.target.value;
                                                            setQuestionForm({ ...questionForm, options: newOptions });
                                                        }}
                                                        placeholder={`Option ${idx + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <Button
                                            onClick={() => addQuestionMutation.mutate(questionForm)}
                                            disabled={!questionForm.text || addQuestionMutation.isPending}
                                            className="w-full"
                                        >
                                            Add Question
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
