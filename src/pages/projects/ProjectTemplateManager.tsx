import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Layout, Settings, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

    const columns: Column<ProjectTemplate>[] = [
        {
            header: "Template Name",
            accessorKey: "name",
            cell: (item) => (
                <div className="flex items-center gap-2 font-medium">
                    <Layout className="h-4 w-4 text-blue-500" />
                    {item.name}
                </div>
            )
        },
        {
            header: "Project Type",
            accessorKey: "projectType",
            cell: (item) => <Badge variant="outline">{item.projectType}</Badge>
        },
        {
            header: "Default Burden Schedule",
            accessorKey: "defaultBurdenScheduleId",
            cell: (item) => {
                const sch = burdenSchedules?.find(s => s.id === item.defaultBurdenScheduleId);
                return sch ? sch.name : "None";
            }
        },
        {
            header: "Status",
            accessorKey: "activeFlag",
            cell: (item) => (
                <div className="flex items-center gap-1">
                    {item.activeFlag ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-slate-400" />}
                    <span className={item.activeFlag ? "text-green-600" : "text-slate-500"}>{item.activeFlag ? "Active" : "Inactive"}</span>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Project Templates</h2>
                    <p className="text-muted-foreground">Define standard structures and defaults for new projects</p>
                </div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="py-4"><CardTitle className="text-sm text-muted-foreground">Standard Templates</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{templates?.length || 0}</div></CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                <StandardTable
                    data={templates || []}
                    columns={columns}
                    isLoading={isLoading}
                    pageSize={10}
                />
            </Card>
        </div>
    );
}
