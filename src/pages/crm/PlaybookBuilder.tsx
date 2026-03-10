import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    BookOpen,
    Plus,
    ListTodo,
    Trash2,
    GripVertical,
    CheckCircle2
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Mock stages from system
const OPPORTUNITY_STAGES = [
    { id: "prospecting", name: "Prospecting" },
    { id: "qualification", name: "Qualification" },
    { id: "needs_analysis", name: "Needs Analysis" },
    { id: "value_proposition", name: "Value Proposition" },
    { id: "decision_makers", name: "Identify Decision Makers" },
    { id: "perception_analysis", name: "Perception Analysis" },
    { id: "proposal", name: "Proposal / Price Quote" },
    { id: "negotiation", name: "Negotiation / Review" }
];

export default function PlaybookBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPlaybookId, setSelectedPlaybookId] = useState<string | null>(null);

    // Fetch playbooks
    const { data: playbooks = [], isLoading } = useQuery({
        queryKey: ["/api/crm/playbooks"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/crm/playbooks");
            return res.json();
        }
    });

    // Create Playbook Mutation
    const createPlaybookMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/crm/playbooks", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Playbook created" });
            queryClient.invalidateQueries({ queryKey: ["/api/crm/playbooks"] });
        }
    });

    const [newPlaybook, setNewPlaybook] = useState({ name: "", stageRule: "prospecting", description: "" });

    return (
        <StandardPage
            title="Sales Playbooks Builder"
            description="Define structured sales methodologies and mandatory stage checklists for revenue teams."
            breadcrumbs={[
                { label: 'CRM Dashboard', href: '/crm' },
                { label: 'Settings', href: '/crm/settings' },
                { label: 'Sales Playbooks' }
            ]}
            actions={
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="font-semibold shadcn-button-premium">
                            <Plus className="mr-2 h-4 w-4" />
                            New Playbook
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Sales Playbook</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Playbook Name</Label>
                                <Input
                                    value={newPlaybook.name}
                                    onChange={e => setNewPlaybook(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Enterprise Qualification Script"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Trigger Stage</Label>
                                <Select value={newPlaybook.stageRule} onValueChange={v => setNewPlaybook(p => ({ ...p, stageRule: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {OPPORTUNITY_STAGES.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={newPlaybook.description}
                                    onChange={e => setNewPlaybook(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Instructions for reps..."
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => createPlaybookMutation.mutate(newPlaybook)}
                                disabled={!newPlaybook.name || createPlaybookMutation.isPending}
                            >
                                Create Playbook
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Playbooks</h2>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <Card key={i} className="h-24 animate-pulse bg-muted/20" />)}
                        </div>
                    ) : playbooks.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground">
                            <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-50" />
                            <p>No playbooks configured.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {playbooks.map((pb: any) => (
                                <Card
                                    key={pb.id}
                                    className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm ${selectedPlaybookId === pb.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : ''}`}
                                    onClick={() => setSelectedPlaybookId(pb.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold leading-tight">{pb.name}</h3>
                                            {pb.isActive ? <Badge variant="default" className="bg-green-500 hover:bg-green-600 border-none text-[10px] px-1.5 h-4">Active</Badge> : <Badge variant="secondary" className="text-[10px] px-1.5 h-4">Draft</Badge>}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{pb.description}</p>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                            <ListTodo className="h-3 w-3" />
                                            Stage: {OPPORTUNITY_STAGES.find(s => s.id === pb.stageRule)?.name || pb.stageRule}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    {selectedPlaybookId ? (
                        <Card className="h-full border-muted/60 shadow-sm">
                            <CardHeader className="bg-muted/20 border-b border-muted/50 pb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                            Playbook Configuration
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Define the required tasks that a sales representative must complete during this stage.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Task Builder Placeholder for brevity */}
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <ListTodo className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Stage Checklist Tasks</h3>
                                    <p className="text-muted-foreground max-w-sm text-sm">
                                        Tasks added here will appear in the opportunity workspace when it enters the triggering stage.
                                    </p>
                                    <Button variant="outline" className="mt-4"><Plus className="mr-2 h-4 w-4" /> Add Task Requirement</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/5 text-muted-foreground">
                            <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a Playbook</p>
                            <p className="text-sm opacity-70">Choose a playbook from the left sidebar to configure its checklist tasks.</p>
                        </div>
                    )}
                </div>
            </div>
        </StandardPage>
    );
}
