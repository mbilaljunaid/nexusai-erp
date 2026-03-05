import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    ClipboardList,
    Plus,
    Save,
    Settings,
    GripVertical,
    Trash2,
    Eye,
    Type,
    ListChecks,
    StarHalf
} from "lucide-react";

type QuestionType = "TEXT" | "MULTIPLE_CHOICE" | "RATING_SCALE";

type QuestionObj = {
    id: string;
    text: string;
    type: QuestionType;
    required: boolean;
    options?: string[]; // For MULTIPLE_CHOICE
    scaleMax?: number;  // For RATING_SCALE
};

export default function QuestionnaireBuilder() {
    const { toast } = useToast();
    const [formName, setFormName] = useState("360 Peer Review Feedback Form");
    const [formType, setFormType] = useState("PERFORMANCE");

    const [questions, setQuestions] = useState<QuestionObj[]>([
        { id: "q1", text: "What are the employee's primary strengths?", type: "TEXT", required: true },
        { id: "q2", text: "How often does the employee collaborate effectively across teams?", type: "RATING_SCALE", required: true, scaleMax: 5 },
        { id: "q3", text: "Select the areas where the employee needs most improvement", type: "MULTIPLE_CHOICE", required: false, options: ["Communication", "Technical Skills", "Time Management", "Leadership"] }
    ]);

    const addQuestion = (type: QuestionType) => {
        const newQ: QuestionObj = {
            id: `q${Date.now()}`,
            text: "New Question",
            type: type,
            required: false,
            ...(type === "MULTIPLE_CHOICE" ? { options: ["Option 1", "Option 2"] } : {}),
            ...(type === "RATING_SCALE" ? { scaleMax: 5 } : {})
        };
        setQuestions([...questions, newQ]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestionText = (id: string, newText: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text: newText } : q));
    };

    const toggleRequired = (id: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, required: !q.required } : q));
    };

    const addOption = (id: string) => {
        setQuestions(questions.map(q => {
            if (q.id === id && q.options) {
                return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
            }
            return q;
        }));
    };

    const updateOption = (qId: string, idx: number, val: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId && q.options) {
                const newOpts = [...q.options];
                newOpts[idx] = val;
                return { ...q, options: newOpts };
            }
            return q;
        }));
    };

    const removeOption = (qId: string, idx: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId && q.options) {
                const newOpts = q.options.filter((_, i) => i !== idx);
                return { ...q, options: newOpts };
            }
            return q;
        }));
    };

    const handleSave = () => {
        if (questions.length === 0) {
            toast({
                title: "Validation Error",
                description: "Questionnaire must contain at least one question.",
                variant: "destructive"
            });
            return;
        }

        toast({
            title: "Questionnaire Saved",
            description: "Custom form has been published to the library."
        });
    };

    return (
        <StandardPage
            title="Questionnaire Form Builder"
            description="Design custom data collection forms for feedback, interviews, and onboarding."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Talent Management', href: '/hr/talent' },
                { label: 'Questionnaires' },
                { label: 'Builder' }
            ]}
        >
            <div className="max-w-5xl mx-auto space-y-6 pb-12">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                        <div>
                            <Input
                                value={formName}
                                onChange={e => setFormName(e.target.value)}
                                className="text-xl font-bold border-none shadow-none h-auto p-0 focus-visible:ring-0 bg-transparent w-[500px]"
                            />
                            <p className="text-sm text-muted-foreground mt-1">Status: <StatusBadge status="active" label="Active" /></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline"><Eye className="h-4 w-4 mr-2" /> Preview</Button>
                        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700"><Save className="h-4 w-4 mr-2" /> Save Form</Button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">

                    {/* Left Sidebar - Settings & Tools */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Properties</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Form Category</Label>
                                    <Select value={formType} onValueChange={setFormType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERFORMANCE">Performance & 360 Feedback</SelectItem>
                                            <SelectItem value="RECRUITING">Interview Evaluation</SelectItem>
                                            <SelectItem value="ONBOARDING">New Hire Check-in</SelectItem>
                                            <SelectItem value="OFFBOARDING">Exit Interview</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200/50 dark:border-purple-800/50 shadow-sm">
                            <CardHeader className="pb-3 border-b bg-purple-50/50 dark:bg-purple-900/10">
                                <CardTitle className="text-sm flex items-center gap-2 text-purple-800 dark:text-purple-300">
                                    <Plus className="h-4 w-4" /> Add Question Block
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2">
                                <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => addQuestion("TEXT")}>
                                    <Type className="h-4 w-4 mr-2 text-blue-500" /> Free Text Area
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => addQuestion("MULTIPLE_CHOICE")}>
                                    <ListChecks className="h-4 w-4 mr-2 text-amber-500" /> Multiple Choice
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => addQuestion("RATING_SCALE")}>
                                    <StarHalf className="h-4 w-4 mr-2 text-teal-500" /> Rating Scale (1-N)
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Area - Canvas */}
                    <div className="col-span-12 lg:col-span-9 space-y-6 bg-zinc-50/50 dark:bg-zinc-900/20 p-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">

                        {questions.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No questions added yet.</p>
                                <p className="text-sm">Use the tools panel to drag or click to add blocks.</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <Card key={q.id} className="border-zinc-200/60 dark:border-zinc-800/60 shadow-sm relative group overflow-hidden transition-colors hover:border-purple-300 dark:hover:border-purple-700">
                                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-muted/50 border-r flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground opacity-50 hover:opacity-100">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="pl-12 pr-4 pt-4 pb-2">

                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex-1">
                                                <Input
                                                    value={q.text}
                                                    onChange={e => updateQuestionText(q.id, e.target.value)}
                                                    placeholder="Enter question text here..."
                                                    className="font-medium bg-transparent border-t-0 border-x-0 border-b-zinc-200 dark:border-b-zinc-800 rounded-none px-0 h-8 focus-visible:ring-0 focus-visible:border-b-purple-500 text-lg placeholder:font-normal placeholder:text-muted-foreground/50"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="flex items-center gap-2 bg-muted/30 px-2 py-1 rounded text-xs">
                                                    <Switch checked={q.required} onCheckedChange={() => toggleRequired(q.id)} id={`req-${q.id}`} />
                                                    <Label htmlFor={`req-${q.id}`} className="cursor-pointer">Required</Label>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeQuestion(q.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Configuration based on type */}
                                        <div className="pl-2 border-l-[3px] border-muted ml-1 mb-2">
                                            {q.type === "TEXT" && (
                                                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded text-muted-foreground text-sm border border-dashed">
                                                    Participant will see a multi-line text area here.
                                                </div>
                                            )}

                                            {q.type === "RATING_SCALE" && (
                                                <div className="flex items-center gap-3 text-sm p-2">
                                                    <span className="text-muted-foreground">Rating Scale format:</span>
                                                    <span className="font-medium bg-muted px-2 py-1 rounded">1 to {q.scaleMax}</span>
                                                    <Button variant="link" size="sm" className="h-auto p-0 ml-2" onClick={() => setQuestions(questions.map(qx => qx.id === q.id ? { ...qx, scaleMax: qx.scaleMax === 5 ? 10 : 5 } : qx))}>
                                                        Change to {q.scaleMax === 5 ? '10' : '5'}
                                                    </Button>
                                                </div>
                                            )}

                                            {q.type === "MULTIPLE_CHOICE" && q.options && (
                                                <div className="space-y-2 py-2">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex items-center gap-2 group/opt">
                                                            <div className="h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-700 bg-background shrink-0" />
                                                            <Input
                                                                value={opt}
                                                                onChange={e => updateOption(q.id, oIdx, e.target.value)}
                                                                className="h-8 w-64 bg-transparent border-transparent hover:border-zinc-200 focus-visible:border-purple-500 transition-colors"
                                                            />
                                                            {q.options!.length > 1 && (
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/opt:opacity-100 text-muted-foreground hover:text-red-500" onClick={() => removeOption(q.id, oIdx)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <Button variant="ghost" size="sm" onClick={() => addOption(q.id)} className="ml-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                                        <Plus className="h-3 w-3 mr-1" /> Add Option
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </Card>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </StandardPage>
    );
}
