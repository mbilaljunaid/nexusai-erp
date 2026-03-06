import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    FileSignature,
    Plus,
    Save,
    Settings,
    Users,
    ListTodo,
    GripVertical,
    Trash2,
    Eye
} from "lucide-react";

type ParticipantRole = "MANAGER" | "WORKER" | "PEER" | "MATRIX_MANAGER";

type TemplateSection = {
    id: string;
    title: string;
    type: "GOALS" | "COMPETENCIES" | "QUESTIONNAIRE" | "OVERALL_SUMMARY";
    weight: number;
    participants: ParticipantRole[];
};

export default function PerformanceTemplateBuilder() {
    const { toast } = useToast();
    const [templateName, setTemplateName] = useState("Annual Leadership Review 2026");
    const [ratingModel, setRatingModel] = useState("5_POINT_STANDARD");

    const [sections, setSections] = useState<TemplateSection[]>([
        { id: "s1", title: "Enterprise Goals Achievement", type: "GOALS", weight: 40, participants: ["WORKER", "MANAGER"] },
        { id: "s2", title: "Core Competencies", type: "COMPETENCIES", weight: 40, participants: ["MANAGER", "PEER", "MATRIX_MANAGER"] },
        { id: "s3", title: "Development Plan & Feedback", type: "QUESTIONNAIRE", weight: 0, participants: ["WORKER", "MANAGER"] },
        { id: "s4", title: "Overall Rating & Summary", type: "OVERALL_SUMMARY", weight: 20, participants: ["MANAGER"] }
    ]);

    const addSection = () => {
        const newSection: TemplateSection = {
            id: `s${Date.now()}`,
            title: "New Section",
            type: "GOALS",
            weight: 0,
            participants: ["MANAGER"]
        };
        setSections([...sections, newSection]);
    };

    const removeSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
    };

    const toggleParticipant = (sectionId: string, role: ParticipantRole) => {
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                const hasRole = s.participants.includes(role);
                return {
                    ...s,
                    participants: hasRole ? s.participants.filter(r => r !== role) : [...s.participants, role]
                };
            }
            return s;
        }));
    };

    const totalWeight = sections.reduce((acc, curr) => acc + curr.weight, 0);

    const handleSave = () => {
        if (totalWeight !== 100) {
            toast({
                title: "Validation Error",
                description: `Total section weight must be exactly 100%. Currently: ${totalWeight}%.`,
                variant: "destructive"
            });
            return;
        }

        toast({
            title: "Template Saved",
            description: "Performance document template has been successfully configured."
        });
    };

    return (
        <StandardPage
            title="Performance Template Builder"
            description="Design multi-participant appraisal documents, weighting, and rating models."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Talent Management', href: '/hr/talent' },
                { label: 'Templates' },
                { label: 'Builder' }
            ]}
        >
            <div className="max-w-6xl mx-auto space-y-6 pb-12">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg">
                            <FileSignature className="h-6 w-6" />
                        </div>
                        <div>
                            <Input
                                value={templateName}
                                onChange={e => setTemplateName(e.target.value)}
                                className="text-xl font-bold border-none shadow-none h-auto p-0 focus-visible:ring-0 bg-transparent w-[400px]"
                            />
                            <p className="text-sm text-muted-foreground mt-1">Status: <Badge variant="secondary" className="font-normal border-zinc-200">Draft / Inactive</Badge></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline"><Eye className="h-4 w-4 mr-2" /> Preview Document</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700"><Save className="h-4 w-4 mr-2" /> Publish Template</Button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">

                    {/* Left Sidebar - General Settings */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Properties</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Document Type</Label>
                                    <Select defaultValue="ANNUAL">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ANNUAL">Annual Evaluation</SelectItem>
                                            <SelectItem value="MIDYEAR">Mid-Year Check-in</SelectItem>
                                            <SelectItem value="PROBATION">Probationary Review</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Default Rating Model</Label>
                                    <Select value={ratingModel} onValueChange={setRatingModel}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3_POINT">3-Point Scale (Needs Impr, Meets, Exceeds)</SelectItem>
                                            <SelectItem value="5_POINT_STANDARD">5-Point Scale (Standard)</SelectItem>
                                            <SelectItem value="9_BOX">9-Box Succession Readiness</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Require Acknowledgement</Label>
                                    <Switch defaultChecked />
                                </div>
                                <p className="text-xs text-muted-foreground">Worker must digitally sign the document after the manager shares it.</p>
                                <Separator className="bg-blue-200 dark:bg-blue-800/50" />
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Bypass Approval</Label>
                                    <Switch />
                                </div>
                                <p className="text-xs text-muted-foreground">If disabled, document routes to 2nd level manager before sharing.</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Area - Section Builder */}
                    <div className="col-span-12 lg:col-span-9 space-y-4">

                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2"><ListTodo className="h-5 w-5 text-blue-600" /> Structure & Roles</h3>
                                <p className="text-sm text-muted-foreground">Define what needs to be reviewed and who can evaluate it.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={cn(`px-3 py-1.5 rounded border text-sm font-semibold flex items-center gap-2 ${totalWeight === 100 ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30'}`)}>
                                    Total Weight: {totalWeight}%
                                    {totalWeight !== 100 && <span className="text-xs font-normal">(Must equal 100%)</span>}
                                </div>
                                <Button size="sm" variant="outline" onClick={addSection} className="bg-white dark:bg-zinc-950">
                                    <Plus className="h-4 w-4 mr-2" /> Add Section
                                </Button>
                            </div>
                        </div>

                        {/* Section Blocks */}
                        <div className="space-y-4">
                            {sections.map((section, index) => (
                                <Card key={section.id} className="border-zinc-200/60 dark:border-zinc-800/60 shadow-sm relative group overflow-hidden transition-all hover:border-blue-300 dark:hover:border-blue-700">
                                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-muted/50 border-r flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground opacity-50 hover:opacity-100">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="pl-12 pr-4 py-4 flex flex-col md:flex-row gap-6 items-start md:items-center">

                                        {/* Basic Info */}
                                        <div className="flex-1 space-y-3 min-w-64">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-background text-[10px] tracking-wider uppercase">Section {index + 1}</Badge>
                                            </div>
                                            <Input
                                                value={section.title}
                                                onChange={(e) => setSections(sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s))}
                                                className="font-medium bg-transparent border-t-0 border-x-0 border-b-zinc-200 dark:border-b-zinc-800 rounded-none px-0 h-8 focus-visible:ring-0 focus-visible:border-b-blue-500"
                                            />
                                            <Select
                                                value={section.type}
                                                onValueChange={(val: any) => setSections(sections.map(s => s.id === section.id ? { ...s, type: val } : s))}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-muted/20 border-none shadow-none w-fit">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GOALS">Goal Evaluation</SelectItem>
                                                    <SelectItem value="COMPETENCIES">Competency Assessment</SelectItem>
                                                    <SelectItem value="QUESTIONNAIRE">Custom Questionnaire</SelectItem>
                                                    <SelectItem value="OVERALL_SUMMARY">Overall Rating & Summary</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Multi-Participant Matrix */}
                                        <div className="flex-1 min-w-72 border rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900/50">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><Users className="h-3 w-3" /> Evaluating Roles</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(["WORKER", "MANAGER", "PEER", "MATRIX_MANAGER"] as ParticipantRole[]).map(role => (
                                                    <Badge
                                                        key={role}
                                                        variant={section.participants.includes(role) ? "default" : "outline"}
                                                        className={cn(`cursor-pointer transition-colors ${section.participants.includes(role) ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-muted text-muted-foreground'}`)}
                                                        onClick={() => toggleParticipant(section.id, role)}
                                                    >
                                                        {role.replace('_', ' ')}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-2">Selected roles will provide input and ratings for this highly specific section.</p>
                                        </div>

                                        {/* Weighting & Delete */}
                                        <div className="flex items-center gap-4 shrink-0 justify-end w-full md:w-auto">
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={section.weight}
                                                    onChange={(e) => setSections(sections.map(s => s.id === section.id ? { ...s, weight: parseInt(e.target.value) || 0 } : s))}
                                                    className="w-20 pr-6 text-right font-mono"
                                                />
                                                <span className="absolute right-3 top-2 text-sm text-muted-foreground">%</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => removeSection(section.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
