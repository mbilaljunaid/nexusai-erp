import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Layout, Settings, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";

interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    projectType: string;
    defaultBurdenScheduleId?: string;
    activeFlag: boolean;
}

export default function ProjectTemplateManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        projectType: "INDIRECT",
        defaultBurdenScheduleId: ""
    });

    const { data: templates, isLoading } = useQuery<ProjectTemplate[]>({
        queryKey: ['/api/ppm/project-templates'],
    });

    const { data: burdenSchedules } = useQuery<any[]>({
        queryKey: ['/api/ppm/burden-schedules'],
    });

    const mutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/ppm/project-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Project Template created" });
            queryClient.invalidateQueries({ queryKey: ['/api/ppm/project-templates'] });
            setIsOpen(false);
            setFormData({ name: "", description: "", projectType: "INDIRECT", defaultBurdenScheduleId: "" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const columns: SpreadsheetColumn<any>[] = [
        {
            id: "name",
            header: "Template Name",
            width: "35%",
            cell: (item: any) => (
                <div className="p-2 flex items-center gap-2 font-medium">
                    <Layout className="h-4 w-4 text-blue-500" />
                    {item.name}
                </div>
            )
        },
        {
            id: "projectType",
            header: "Project Type",
            width: "20%",
            cell: (item: any) => <div className="p-2"><Badge variant="outline">{item.projectType}</Badge></div>
        },
        {
            id: "defaultBurdenScheduleId",
            header: "Default Burden Schedule",
            width: "30%",
            cell: (item: any) => {
                const sch = burdenSchedules?.find(s => s.id === item.defaultBurdenScheduleId);
                return <div className="p-2">{sch ? sch.name : "None"}</div>;
            }
        },
        {
            id: "activeFlag",
            header: "Status",
            width: "15%",
            cell: (item: any) => (
                <div className="p-2 flex items-center gap-1">
                    {item.activeFlag ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/70" />}
                    <span className={item.activeFlag ? "text-green-600" : "text-muted-foreground"}>{item.activeFlag ? "Active" : "Inactive"}</span>
                </div>
            )
        },
    ];

    return (
        <StandardPage
            title="Project Templates"
            description="Define standard structures and defaults for new projects"
            actions={
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" /> New Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Project Template</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Template Name</Label>
                                <Input
                                    placeholder="e.g. Standard Construction Template"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Project Type</Label>
                                <Select
                                    value={formData.projectType}
                                    onValueChange={(v) => setFormData({ ...formData, projectType: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CAPITAL">Capital Project</SelectItem>
                                        <SelectItem value="INDIRECT">Indirect project</SelectItem>
                                        <SelectItem value="CONTRACT">Contract Project</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Default Burden Schedule</Label>
                                <Select
                                    value={formData.defaultBurdenScheduleId}
                                    onValueChange={(v) => setFormData({ ...formData, defaultBurdenScheduleId: v })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select schedule..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">None</SelectItem>
                                        {burdenSchedules?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="Optional template description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending} className="w-full">
                                {mutation.isPending ? "Creating..." : "Create Template"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            }
        >

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="py-4"><CardTitle className="text-sm text-muted-foreground">Standard Templates</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{templates?.length || 0}</div></CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                {isLoading ? (
                    <TableSkeleton rows={5} />
                ) : (
                    <InteractiveSpreadsheet
                        data={templates || []}
                        columns={columns}
                        virtualized={true}
                        containerHeight="600px"
                        onChange={() => { }}
                    />
                )}
            </Card>
        </StandardPage>
    );
}
