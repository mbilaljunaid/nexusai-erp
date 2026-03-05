
import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, GripVertical, Mail, ListOrdered } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RecruitmentConfiguration() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("pipelines");

    // --- DATA FETCHING ---
    const { data: pipelines = [] } = useQuery<any>({
        queryKey: ["/api/recruitment/config/pipelines"],
        queryFn: () => fetch("/api/recruitment/config/pipelines").then(r => r.json())
    });

    const { data: emailTemplates = [] } = useQuery<any>({
        queryKey: ["/api/recruitment/config/emails"],
        queryFn: () => fetch("/api/recruitment/config/emails").then(r => r.json())
    });

    return (
        <StandardPage
            title="Recruitment Configuration"
            description="Manage pipelines, stages, and communication templates."
        >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="pipelines"><ListOrdered className="w-4 h-4 mr-2" /> Pipelines</TabsTrigger>
                    <TabsTrigger value="emails"><Mail className="w-4 h-4 mr-2" /> Email Templates</TabsTrigger>
                </TabsList>

                {/* PIPELINES TAB */}
                <TabsContent value="pipelines" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Pipeline Templates</h2>
                        <CreatePipelineDialog />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pipelines.length === 0 ? <p className="text-muted-foreground col-span-2">No pipelines defined.</p> : null}
                        {pipelines.map((pipe: any) => (
                            <PipelineEditor key={pipe.id} pipeline={pipe} />
                        ))}
                    </div>
                </TabsContent>

                {/* EMAILS TAB */}
                <TabsContent value="emails" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Email Templates</h2>
                        <CreateEmailDialog />
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Subject</TableHead><TableHead>Type</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {emailTemplates.map((t: any) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.name}</TableCell>
                                            <TableCell>{t.subject}</TableCell>
                                            <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}

// --- SUB COMPONENTS ---

function PipelineEditor({ pipeline }: { pipeline: any }) {
    const { toast } = useToast();
    const { data: stages = [] } = useQuery<any>({
        queryKey: [`/api/recruitment/config/pipelines/${pipeline.id}/stages`],
        queryFn: () => fetch(`/api/recruitment/config/pipelines/${pipeline.id}/stages`).then(r => r.json())
    });

    const addStageMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/recruitment/config/pipelines/stages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/recruitment/config/pipelines/${pipeline.id}/stages`] });
            toast({ title: "Stage Added" });
        }
    });

    const [newStage, setNewStage] = useState("");

    return (
        <Card>
            <CardHeader>
                <CardTitle>{pipeline.name}</CardTitle>
                <CardDescription>{pipeline.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {stages.map((stage: any) => (
                        <div key={stage.id} className="flex items-center gap-2 p-2 border rounded bg-muted/50">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium flex-1">{stage.name}</span>
                            <Badge variant="secondary">{stage.type}</Badge>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input placeholder="New Stage Name" value={newStage} onChange={e => setNewStage(e.target.value)} />
                    <Button size="sm" onClick={() => {
                        if (!newStage) return;
                        addStageMutation.mutate({
                            templateId: pipeline.id,
                            name: newStage,
                            order: stages.length + 1,
                            type: "CUSTOM"
                        });
                        setNewStage("");
                    }}>Add</Button>
                </div>
            </CardContent>
        </Card>
    )
}

function CreatePipelineDialog() {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const mutation = useMutation({
        mutationFn: (data: any) => fetch("/api/recruitment/config/pipelines", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/recruitment/config/pipelines"] });
            toast({ title: "Pipeline Created" });
            setOpen(false); setName("");
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Pipeline</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Create Pipeline Template</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Pipeline Name (e.g. Sales Pipeline)" value={name} onChange={e => setName(e.target.value)} />
                    <Button onClick={() => mutation.mutate({ name })} disabled={!name}>Create</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function CreateEmailDialog() {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", subject: "", body: "", type: "OFFER" });

    const mutation = useMutation({
        mutationFn: (data: any) => fetch("/api/recruitment/config/emails", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/recruitment/config/emails"] });
            toast({ title: "Template Created" });
            setOpen(false); setForm({ name: "", subject: "", body: "", type: "OFFER" });
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Template</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Create Email Template</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Template Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <Input placeholder="Subject Line" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                    <Textarea placeholder="Email Body..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
                    <Button onClick={() => mutation.mutate(form)} disabled={!form.name}>Create</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
