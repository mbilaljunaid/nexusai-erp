import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Save, Play, Trash2, ArrowRight, DollarSign, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

interface AllocationRule {
    id?: number;
    name: string;
    description: string;
    sourceProjectId: number;
    targetProjects: TargetProject[];
    allocationBasis: 'LABOR_HOURS' | 'ACTUAL_COST' | 'BUDGET' | 'REVENUE' | 'FTE_COUNT' | 'CUSTOM';
    customFormula?: string;
    accountRange?: string;
    schedule: 'MANUAL' | 'WEEKLY' | 'MONTHLY' | 'PERIOD_CLOSE';
    isActive: boolean;
}

interface TargetProject {
    projectId: number;
    projectNumber: string;
    projectName: string;
    percentage?: number;
    fixedAmount?: number;
    basisValue?: number;
}

export default function InterprojectAllocation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [buId, setBuId] = useState<string | undefined>();
    const [selectedRule, setSelectedRule] = useState<number | null>(null);
    const [ruleName, setRuleName] = useState("");
    const [description, setDescription] = useState("");
    const [sourceProject, setSourceProject] = useState("");
    const [allocationBasis, setAllocationBasis] = useState<'LABOR_HOURS' | 'ACTUAL_COST' | 'BUDGET' | 'REVENUE' | 'FTE_COUNT' | 'CUSTOM'>('ACTUAL_COST');
    const [schedule, setSchedule] = useState<'MANUAL' | 'WEEKLY' | 'MONTHLY' | 'PERIOD_CLOSE'>('MONTHLY');
    const [isActive, setIsActive] = useState(true);
    const [targetProjects, setTargetProjects] = useState<TargetProject[]>([]);
    const [selectedProjectToAdd, setSelectedProjectToAdd] = useState("");

    const scopeHeaders = buildScopeHeaders({ "business-unit": buId });

    // Fetch allocation rules
    const { data: rules, isLoading } = useQuery<any>({
        queryKey: ["/api/ppm/allocation-rules", buId],
        queryFn: () =>
            fetch("/api/ppm/allocation-rules", { headers: scopeHeaders }).then(r => r.json()),
    });

    // Fetch projects
    const { data: projects } = useQuery<any>({
        queryKey: ["/api/ppm/projects", buId],
        queryFn: () =>
            fetch("/api/ppm/projects", { headers: scopeHeaders }).then(r => r.json()),
    });

    // Fetch allocation preview
    const { data: preview } = useQuery<any>({
        queryKey: ["/api/ppm/allocation-preview", sourceProject, targetProjects, allocationBasis, buId],
        queryFn: () =>
            fetch("/api/ppm/allocation-preview", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...scopeHeaders },
                body: JSON.stringify({
                    sourceProjectId: parseInt(sourceProject),
                    targetProjects: targetProjects.map((t) => ({
                        projectId: t.projectId,
                        percentage: t.percentage,
                    })),
                    allocationBasis,
                }),
            }).then(r => r.json()),
        enabled: !!sourceProject && targetProjects.length > 0,
    });

    // Save rule mutation
    const saveMutation = useMutation({
        mutationFn: (data: AllocationRule) =>
            selectedRule
                ? fetch(`/api/ppm/allocation-rules/${selectedRule}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", ...scopeHeaders },
                    body: JSON.stringify(data),
                }).then(r => r.json())
                : fetch("/api/ppm/allocation-rules", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...scopeHeaders },
                    body: JSON.stringify(data),
                }).then(r => r.json()),
        onSuccess: () => {
            toast({ title: "Success", description: "Allocation rule saved" });
            queryClient.invalidateQueries({ queryKey: ["/api/ppm/allocation-rules", buId] });
        },
    });

    // Run allocation mutation
    const runMutation = useMutation({
        mutationFn: (ruleId: number) =>
            fetch(`/api/ppm/allocation-rules/${ruleId}/run`, {
                method: "POST",
                headers: scopeHeaders,
            }).then(r => r.json()),
        onSuccess: (data) => {
            toast({
                title: "Allocation Complete",
                description: `Allocated ${data.totalAmount} across ${data.transactionCount} transactions`,
            });
        },
    });

    const addTargetProject = () => {
        if (!selectedProjectToAdd) return;
        const project = projects?.find((p: any) => p.id.toString() === selectedProjectToAdd);
        if (!project) return;

        const existing = targetProjects.find((t) => t.projectId === project.id);
        if (existing) {
            toast({ title: "Error", description: "Project already added", variant: "destructive" });
            return;
        }

        setTargetProjects([
            ...targetProjects,
            {
                projectId: project.id,
                projectNumber: project.projectNumber,
                projectName: project.name,
                percentage: 0,
            },
        ]);
        setSelectedProjectToAdd("");
    };

    const updateTargetProject = (projectId: number, updates: Partial<TargetProject>) => {
        setTargetProjects(
            targetProjects.map((t) => (t.projectId === projectId ? { ...t, ...updates } : t))
        );
    };

    const removeTargetProject = (projectId: number) => {
        setTargetProjects(targetProjects.filter((t) => t.projectId !== projectId));
    };

    const calculateTotalPercentage = () => {
        return targetProjects.reduce((sum, t) => sum + (t.percentage || 0), 0);
    };

    const autoDistribute = () => {
        const equalPercentage = 100 / targetProjects.length;
        setTargetProjects(
            targetProjects.map((t) => ({ ...t, percentage: Number(equalPercentage.toFixed(2)) }))
        );
    };

    const targetColumns: SpreadsheetColumn[] = [
        {
            id: "project",
            header: "Project",
            width: "250px",
            cell: (row) => (
                <div className="px-2 py-1 flex flex-col justify-center">
                    <div className="font-medium text-sm leading-tight text-left">{row.projectNumber}</div>
                    <div className="text-xs text-muted-foreground text-left">{row.projectName}</div>
                </div>
            )
        },
        {
            id: "percentage",
            header: "Percentage",
            width: "120px",
            cell: (row) => (
                <Input
                    type="number"
                    value={row.percentage || ""}
                    onChange={(e) =>
                        updateTargetProject(row.projectId, {
                            percentage: parseFloat(e.target.value) || 0,
                        })
                    }
                    className="h-8 border-0 ring-0 focus-visible:ring-0 shadow-none px-2 bg-transparent text-right w-full"
                    step="0.01"
                    min="0"
                    max="100"
                />
            )
        },
        {
            id: "amount",
            header: "Estimated Amount",
            width: "150px",
            cell: (row) => (
                <div className="px-2 text-right text-muted-foreground">
                    {preview?.allocations?.find((a: any) => a.projectId === row.projectId)
                        ? `$${preview.allocations.find((a: any) => a.projectId === row.projectId).amount.toLocaleString()}`
                        : "-"}
                </div>
            )
        },
        {
            id: "actions",
            header: "",
            width: "80px",
            cell: (row) => (
                <div className="flex justify-end pr-2">
                    <Button size="sm" variant="ghost" onClick={() => removeTargetProject(row.projectId)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const saveRule = () => {
        const rule: AllocationRule = {
            name: ruleName,
            description,
            sourceProjectId: parseInt(sourceProject),
            targetProjects,
            allocationBasis,
            schedule,
            isActive,
        };
        saveMutation.mutate(rule);
    };

    return (
        <StandardPage
            title="Interproject Allocation"
            description="Allocate costs across projects based on various drivers"
            actions={
                <div className="flex items-center gap-3">
                    <EnterpriseContextSwitcher
                        type="business-unit"
                        value={buId}
                        onChange={setBuId}
                    />
                    <Button variant="outline" onClick={() => {
                        setSelectedRule(null);
                        setRuleName("");
                        setDescription("");
                        setSourceProject("");
                        setTargetProjects([]);
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Rule
                    </Button>
                    <Button onClick={saveRule} disabled={saveMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                    {selectedRule && (
                        <Button onClick={() => runMutation.mutate(selectedRule)} disabled={runMutation.isPending}>
                            <Play className="h-4 w-4 mr-2" />
                            Run Allocation
                        </Button>
                    )}
                </div>
            }
        >
            <div className="grid grid-cols-12 gap-6">
                {/* Rules List */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Allocation Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {rules?.map((rule: AllocationRule) => (
                            <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                key={rule.id}
                                className={`p-3 rounded-lg cursor-pointer border ${selectedRule === rule.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                                    }`}
                                onClick={() => {
                                    setSelectedRule(rule.id || null);
                                    setRuleName(rule.name);
                                    setDescription(rule.description);
                                    setSourceProject(rule.sourceProjectId.toString());
                                    setTargetProjects(rule.targetProjects);
                                    setAllocationBasis(rule.allocationBasis);
                                    setSchedule(rule.schedule);
                                    setIsActive(rule.isActive);
                                }}
                            >
                                <div className="font-medium">{rule.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {rule.targetProjects.length} targets • {rule.allocationBasis}
                                </div>
                                <Badge variant={rule.isActive ? "default" : "secondary"} className="mt-2">
                                    {rule.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Rule Builder */}
                <Card className="col-span-9">
                    <CardHeader>
                        <CardTitle>Rule Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Rule Name</Label>
                                <Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="e.g., IT Shared Services Allocation" />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Rule purpose" />
                            </div>
                        </div>

                        {/* Source and Basis */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-4">Allocation Configuration</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Source Project</Label>
                                    <Select value={sourceProject} onValueChange={setSourceProject}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects?.map((project: any) => (
                                                <SelectItem key={project.id} value={project.id.toString()}>
                                                    {project.projectNumber} - {project.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Allocation Basis</Label>
                                    <Select value={allocationBasis} onValueChange={(value: any) => setAllocationBasis(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LABOR_HOURS">Labor Hours</SelectItem>
                                            <SelectItem value="ACTUAL_COST">Actual Cost</SelectItem>
                                            <SelectItem value="BUDGET">Budget</SelectItem>
                                            <SelectItem value="REVENUE">Revenue</SelectItem>
                                            <SelectItem value="FTE_COUNT">FTE Count</SelectItem>
                                            <SelectItem value="CUSTOM">Custom Formula</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Schedule</Label>
                                    <Select value={schedule} onValueChange={(value: any) => setSchedule(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MANUAL">Manual</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="PERIOD_CLOSE">Period Close</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Target Projects */}
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Target Projects</h3>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={autoDistribute} disabled={targetProjects.length === 0}>
                                        Auto Distribute
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <Select value={selectedProjectToAdd} onValueChange={setSelectedProjectToAdd}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select project to add" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects?.filter((p: any) => p.id.toString() !== sourceProject).map((project: any) => (
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                {project.projectNumber} - {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={addTargetProject}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </div>

                            <div className="border rounded-lg h-[300px]">
                                <InteractiveSpreadsheet
                                    data={targetProjects}
                                    columns={targetColumns}
                                    containerHeight="300px"
                                    virtualized={true}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-4 border-t pt-2">
                                <div className="font-bold pl-2">TOTAL</div>
                                <div className="flex gap-16 pr-[120px]">
                                    <div className={`font-bold ${calculateTotalPercentage() !== 100 ? "text-red-600" : "text-green-600"}`}>
                                        {calculateTotalPercentage().toFixed(2)}%
                                    </div>
                                    <div className="font-bold text-right w-[150px]">
                                        {preview?.totalAmount ? `$${preview.totalAmount.toLocaleString()}` : "-"}
                                    </div>
                                </div>
                            </div>
                            {calculateTotalPercentage() !== 100 && targetProjects.length > 0 && (
                                <p className="text-sm text-red-600 mt-2">⚠️ Percentages must total 100%</p>
                            )}
                        </div>

                        {/* Preview */}
                        {preview && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-4">Allocation Preview</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="text-sm text-muted-foreground">Source Amount</div>
                                            <div className="text-2xl font-bold mt-1">${preview.sourceAmount?.toLocaleString()}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="text-sm text-muted-foreground">Total Allocated</div>
                                            <div className="text-2xl font-bold mt-1">${preview.totalAmount?.toLocaleString()}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="text-sm text-muted-foreground">Transaction Count</div>
                                            <div className="text-2xl font-bold mt-1">{preview.transactionCount || 0}</div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Status */}
                        <div className="border-t pt-4">
                            <div className="flex items-center space-x-2">
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                                <Label>Rule is Active</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
