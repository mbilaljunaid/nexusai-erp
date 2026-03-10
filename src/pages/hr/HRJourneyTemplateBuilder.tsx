import React, { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, Eye, PlayCircle, Users, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JOURNEY_CATEGORIES = ["Onboarding", "Offboarding", "Life Event", "Transfer", "Rehire"];
const TRIGGER_EVENTS = ["Hire", "Rehire", "Transfer", "Termination", "Life Event — Childbirth", "Life Event — Marriage", "Life Event — Disability"];
const ASSIGNEE_TYPES = ["Worker", "Manager", "HR Specialist", "IT Admin", "Legal", "Facilities"];

const MOCK_TEMPLATES = [
    { id: "JT-001", name: "Standard Onboarding Journey", category: "Onboarding", trigger: "Hire", taskCount: 12, status: "ACTIVE" },
    { id: "JT-002", name: "Executive Offboarding Checklist", category: "Offboarding", trigger: "Termination", taskCount: 8, status: "ACTIVE" },
    { id: "JT-003", name: "Parental Leave Life Event", category: "Life Event", trigger: "Life Event — Childbirth", taskCount: 6, status: "DRAFT" },
    { id: "JT-004", name: "Internal Transfer Pack", category: "Transfer", trigger: "Transfer", taskCount: 5, status: "ACTIVE" },
];

interface Task {
    id: string;
    name: string;
    assigneeType: string;
    dueOffsetDays: number;
    required: boolean;
}

export default function HRJourneyTemplateBuilder() {
    const { toast } = useToast();
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<typeof MOCK_TEMPLATES[0] | null>(null);
    const [templateName, setTemplateName] = useState("");
    const [category, setCategory] = useState("Onboarding");
    const [trigger, setTrigger] = useState("Hire");
    const [tasks, setTasks] = useState<Task[]>([
        { id: "t1", name: "Send welcome email", assigneeType: "HR Specialist", dueOffsetDays: 0, required: true },
        { id: "t2", name: "Provision laptop and accounts", assigneeType: "IT Admin", dueOffsetDays: 1, required: true },
        { id: "t3", name: "Complete HR paperwork", assigneeType: "Worker", dueOffsetDays: 2, required: true },
    ]);

    const addTask = () => {
        setTasks(prev => [...prev, { id: `t${Date.now()}`, name: "", assigneeType: "Worker", dueOffsetDays: 5, required: false }]);
    };

    const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

    const updateTask = (id: string, field: keyof Task, value: string | number | boolean) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleSave = () => {
        toast({ title: "Journey Template Saved", description: `"${templateName}" is now active and will auto-trigger on ${trigger} events.` });
        setIsBuilderOpen(false);
    };

    return (
        <StandardPage title="HR Journey Template Builder" description="Define automated task sequences that trigger on HR lifecycle events: hirings, transfers, life events, and offboardings.">
            <Tabs defaultValue="templates">
                <TabsList className="mb-6">
                    <TabsTrigger value="templates" className="gap-2"><ClipboardList className="h-4 w-4" /> Templates</TabsTrigger>
                    <TabsTrigger value="active" className="gap-2"><PlayCircle className="h-4 w-4" /> Active Journeys</TabsTrigger>
                </TabsList>

                <TabsContent value="templates">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Journey Templates</CardTitle>
                                <CardDescription>Each template defines a task checklist that fires automatically when its trigger event occurs.</CardDescription>
                            </div>
                            <Button className="gap-2" onClick={() => setIsBuilderOpen(true)}><Plus className="h-4 w-4" /> New Template</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Template Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Trigger Event</TableHead>
                                        <TableHead className="text-center">Tasks</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {MOCK_TEMPLATES.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.name}</TableCell>
                                            <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{t.trigger}</TableCell>
                                            <TableCell className="text-center font-mono">{t.taskCount}</TableCell>
                                            <TableCell>
                                                <Badge variant={t.status === "ACTIVE" ? "default" : "secondary"}>{t.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => { setPreviewTemplate(t); setIsPreviewOpen(true); }}>
                                                        <Eye className="h-3 w-3" /> Preview
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setIsBuilderOpen(true)}>
                                                        Edit
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="active">
                    <Card className="p-12 text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Active Worker Journeys</h3>
                        <p className="max-w-md mx-auto mb-4">View all in-progress journey instances across workers. See task completion status, overdue items, and assigned workers.</p>
                        <Button variant="outline">View All Active Journeys</Button>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Template Builder Dialog */}
            <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Journey Template Builder</DialogTitle>
                        <DialogDescription>Define the trigger event and build the ordered task checklist for this journey.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-2">
                        {/* Template meta */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2 col-span-3 md:col-span-1">
                                <Label>Template Name *</Label>
                                <Input placeholder="e.g., Standard Onboarding" value={templateName} onChange={e => setTemplateName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{JOURNEY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Trigger Event</Label>
                                <Select value={trigger} onValueChange={setTrigger}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{TRIGGER_EVENTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Task list */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Tasks ({tasks.length})</Label>
                                <Button variant="outline" size="sm" className="gap-1" onClick={addTask}><Plus className="h-3 w-3" /> Add Task</Button>
                            </div>
                            <div className="space-y-2">
                                {tasks.map((task, idx) => (
                                    <Card key={task.id} className="border border-border">
                                        <CardContent className="p-3">
                                            <div className="grid grid-cols-12 gap-3 items-center">
                                                <div className="col-span-1 flex items-center justify-center">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="col-span-1 text-xs text-muted-foreground font-mono text-center">{idx + 1}</div>
                                                <div className="col-span-4">
                                                    <Input
                                                        placeholder="Task name..."
                                                        value={task.name}
                                                        onChange={e => updateTask(task.id, "name", e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <Select value={task.assigneeType} onValueChange={v => updateTask(task.id, "assigneeType", v)}>
                                                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                                        <SelectContent>{ASSIGNEE_TYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="col-span-2 flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={task.dueOffsetDays}
                                                        onChange={e => updateTask(task.id, "dueOffsetDays", Number(e.target.value))}
                                                        className="h-8 text-sm w-14"
                                                    />
                                                    <span className="text-xs text-muted-foreground">d</span>
                                                </div>
                                                <div className="col-span-1 flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeTask(task.id)}>
                                                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">Day offset = days after trigger event. Day 0 = same day as hire/transfer/etc.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={!templateName}>Save Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{previewTemplate?.name}</DialogTitle>
                        <DialogDescription>Category: {previewTemplate?.category} · Trigger: {previewTemplate?.trigger} · {previewTemplate?.taskCount} tasks</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        {[...Array(Math.min(previewTemplate?.taskCount ?? 0, 5))].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded border border-border">
                                <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Sample Task {i + 1}</p>
                                    <p className="text-xs text-muted-foreground">Due: Day {i * 2} · Assignee: HR Specialist</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
