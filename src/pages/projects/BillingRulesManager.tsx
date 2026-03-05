
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, DollarSign, Clock, FileText } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

interface BillingRule {
    id: string;
    projectId: string;
    ruleType: "FIXED_PRICE" | "TM" | "COST_PLUS";
    contractAmount: string;
    markupPercentage: string;
    description: string;
    activeFlag: boolean;
}

interface Project {
    id: string;
    projectNumber: string;
    name: string;
}

export default function BillingRulesManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string>("");

    // Form state
    const [formData, setFormData] = useState({
        projectId: "",
        ruleType: "FIXED_PRICE",
        contractAmount: "",
        markupPercentage: "",
        description: ""
    });

    // Fetch projects for selection
    const { data: projects = [] } = useQuery<Project[]>({
        queryKey: ['/api/ppm/projects'],
        queryFn: () => fetch("/api/ppm/projects").then(r => r.json())
    });

    // Fetch rules for selected project
    const { data: rules = [], isLoading } = useQuery<BillingRule[]>({
        queryKey: ['/api/ppm/projects', selectedProject, 'billing-rules'],
        queryFn: async () => {
            if (!selectedProject) return [];
            const res = await fetch(`/api/ppm/projects/${selectedProject}/billing-rules`);
            return res.json();
        },
        enabled: !!selectedProject
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/ppm/billing-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Billing Rule created" });
            queryClient.invalidateQueries({ queryKey: ['/api/ppm/projects', selectedProject, 'billing-rules'] });
            setIsOpen(false);
            setFormData({ ...formData, contractAmount: "", markupPercentage: "", description: "" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/ppm/billing-rules/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            toast({ title: "Deleted", description: "Rule removed" });
            queryClient.invalidateQueries({ queryKey: ['/api/ppm/projects', selectedProject, 'billing-rules'] });
        }
    });

    const columns: SpreadsheetColumn<any>[] = [
        {
            id: "ruleType",
            header: "Type",
            width: "30%",
            cell: (item: any) => (
                <div className="p-2 flex items-center gap-2">
                    {item.ruleType === "FIXED_PRICE" && <DollarSign className="h-4 w-4 text-green-500" />}
                    {item.ruleType === "TM" && <Clock className="h-4 w-4 text-blue-500" />}
                    {item.ruleType === "COST_PLUS" && <FileText className="h-4 w-4 text-purple-500" />}
                    <span className="font-medium">{item.ruleType.replace("_", " ")}</span>
                </div>
            )
        },
        {
            id: "contractAmount",
            header: "Terms",
            width: "25%",
            cell: (item: any) => (
                <div className="p-2">
                    {item.ruleType === "FIXED_PRICE" && `$${Number(item.contractAmount).toLocaleString()}`}
                    {item.ruleType === "COST_PLUS" && `Markup: ${item.markupPercentage}%`}
                    {item.ruleType === "TM" && "As Incurred"}
                </div>
            )
        },
        { id: "description", header: "Description", width: "35%", cell: (item: any) => <div className="p-2">{item.description}</div> },
        {
            id: "actions",
            header: "Actions",
            width: "10%",
            cell: (item: any) => (
                <div className="p-2">
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Billing Rules"
            description="Define revenue recognition and billing methods for projects."
            actions={
                selectedProject ? (
                    <Button onClick={() => {
                        setFormData({ ...formData, projectId: selectedProject });
                        setIsOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Rule
                    </Button>
                ) : null
            }
        >

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Project Selection</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="w-[400px]">
                            <SelectValue placeholder="Select a project to manage rules" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.projectNumber} - {p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedProject ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Active Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <TableSkeleton rows={5} />
                        ) : (
                            <InteractiveSpreadsheet
                                data={rules}
                                columns={columns}
                                virtualized={true}
                                containerHeight="300px"
                                onChange={() => { }}
                            />
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/50">
                    <FileText className="h-10 w-10 mb-2 opacity-50" />
                    <p>Select a project to view and manage billing rules</p>
                </div>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Create Billing Rule</SheetTitle>
                        <SheetDescription>Define how this project bill customers.</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 py-6">
                        <div className="space-y-2">
                            <Label>Rule Type</Label>
                            <Select
                                value={formData.ruleType}
                                onValueChange={(v) => setFormData({ ...formData, ruleType: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FIXED_PRICE">Fixed Price</SelectItem>
                                    <SelectItem value="TM">Time & Materials</SelectItem>
                                    <SelectItem value="COST_PLUS">Cost Plus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.ruleType === "FIXED_PRICE" && (
                            <div className="space-y-2">
                                <Label>Contract Amount ($)</Label>
                                <Input
                                    type="number"
                                    value={formData.contractAmount}
                                    onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
                                />
                            </div>
                        )}

                        {formData.ruleType === "COST_PLUS" && (
                            <div className="space-y-2">
                                <Label>Markup Percentage (%)</Label>
                                <Input
                                    type="number"
                                    value={formData.markupPercentage}
                                    onChange={(e) => setFormData({ ...formData, markupPercentage: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. Milestone 1 - 50%"
                            />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button
                            onClick={() => createMutation.mutate(formData)}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Creating..." : "Create Rule"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </StandardPage>
    );
}
