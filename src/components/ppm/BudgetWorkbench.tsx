import { formatDate } from "@/lib/dateUtils";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Lock, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function BudgetWorkbench() {
    const [projectId, setProjectId] = useState<string>(""); // In real app, from URL or Context
    const [activeTab, setActiveTab] = useState("versions");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Dialog States
    const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
    const [newVersionName, setNewVersionName] = useState("");
    const [isLineDialogOpen, setIsLineDialogOpen] = useState(false);
    const [newLineData, setNewLineData] = useState({ taskId: "", periodName: "", amount: "" });

    // Rule State
    const [ruleType, setRuleType] = useState("ADVISORY");
    const [ruleLevel, setRuleLevel] = useState("PROJECT");

    // Test State
    const [testAmount, setTestAmount] = useState("");
    const [testResult, setTestResult] = useState<any>(null);

    // 1. Fetch Projects (Reuse from existing API for selector)
    const { data: projects } = useQuery({
        queryKey: ["/api/projects"],
        queryFn: async () => {
            // In real app we use the unified project list, here assuming generic list for dropdown
            const res = await apiRequest("GET", "/api/projects");
            return res.json();
        }
    });

    // 2. Fetch Budget Versions
    const { data: versions, isLoading: loadingVersions } = useQuery({
        queryKey: ["/api/ppm/planning", projectId, "budget"],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/ppm/planning/${projectId}/budget`);
            return res.json();
        },
        enabled: !!projectId
    });

    // Mutations
    const createVersionMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest("POST", `/api/ppm/planning/${projectId}/budget`, {
                name: newVersionName,
                description: "Created from Workbench"
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ppm/planning", projectId, "budget"] });
            setIsVersionDialogOpen(false);
            setNewVersionName("");
            toast({ title: "Success", description: "Budget Version Created" });
        }
    });

    const baselineMutation = useMutation({
        mutationFn: async (versionId: string) => {
            return await apiRequest("POST", `/api/ppm/planning/budget/${versionId}/baseline`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ppm/planning", projectId, "budget"] });
            toast({ title: "Baselined", description: "Budget is now the Active Baseline" });
        }
    });

    const addLineMutation = useMutation({
        mutationFn: async (versionId: string) => {
            return await apiRequest("POST", `/api/ppm/planning/budget/${versionId}/lines`, {
                lines: [{ ...newLineData }]
            });
        },
        onSuccess: () => {
            // In a real app we'd fetch lines. Here just success toast.
            setIsLineDialogOpen(false);
            setNewLineData({ taskId: "", periodName: "", amount: "" });
            toast({ title: "Line Added", description: "Budget detail added successfully" });
        }
    });

    const setRuleMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest("POST", `/api/ppm/planning/${projectId}/control-rule`, {
                type: ruleType,
                level: ruleLevel
            });
        },
        onSuccess: () => {
            toast({ title: "Rule Updated", description: `Control Rule set to ${ruleType} at ${ruleLevel} Level` });
        }
    });

    const testFundsMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/ppm/planning/${projectId}/funds-check`, {
                amount: testAmount
            });
            return res.json();
        },
        onSuccess: (data) => {
            setTestResult(data);
        }
    });

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Budget Workbench</h1>
                    <p className="text-muted-foreground">Manage Project Plans and Budgetary Control</p>
                </div>
                <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                        {projects?.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.projectNumber})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {projectId ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="versions">Budget Versions</TabsTrigger>
                        <TabsTrigger value="control">Control Rules</TabsTrigger>
                        <TabsTrigger value="simulator">Funds Simulator</TabsTrigger>
                    </TabsList>

                    <TabsContent value="versions" className="space-y-4">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-semibold">Project Budgets</h2>
                            <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Create Version</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>New Budget Version</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label>Version Name</label>
                                            <Input value={newVersionName} onChange={e => setNewVersionName(e.target.value)} placeholder="e.g. Q1 Forecast" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => createVersionMutation.mutate()} disabled={createVersionMutation.isPending}>Create</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No.</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Current</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingVersions ? (
                                        <TableRow><TableCell colSpan={7} className="text-center"><Loader2 className="animate-spin inline" /></TableCell></TableRow>
                                    ) : versions?.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} className="text-center">No budgets found</TableCell></TableRow>
                                    ) : (
                                        versions?.map((v: any, idx: number) => (
                                            <TableRow key={v.id}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell className="font-medium">{v.versionName}</TableCell>
                                                <TableCell>{v.versionType}</TableCell>
                                                <TableCell>
                                                    <Badge variant={v.status === "BASELINED" ? "default" : "secondary"}>{v.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {v.currentFlag && <CheckCircle className="h-4 w-4 text-green-500" />}
                                                </TableCell>
                                                <TableCell>{formatDate(v.createdAt)}</TableCell>
                                                <TableCell className="space-x-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" onClick={() => { setIsLineDialogOpen(true); }}>Add Line</Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Add Budget Line to {v.versionName}</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <label className="text-right">Task ID</label>
                                                                    <Input className="col-span-3" value={newLineData.taskId} onChange={e => setNewLineData({ ...newLineData, taskId: e.target.value })} placeholder="Internal Task UUID" />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <label className="text-right">Period</label>
                                                                    <Input className="col-span-3" value={newLineData.periodName} onChange={e => setNewLineData({ ...newLineData, periodName: e.target.value })} placeholder="Jan-26" />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <label className="text-right">Amount</label>
                                                                    <Input className="col-span-3" value={newLineData.amount} onChange={e => setNewLineData({ ...newLineData, amount: e.target.value })} />
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button onClick={() => addLineMutation.mutate(v.id)}>Save Line</Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>

                                                    {v.status === "DRAFT" && (
                                                        <Button size="sm" onClick={() => baselineMutation.mutate(v.id)}>
                                                            <Lock className="mr-1 h-3 w-3" /> Baseline
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="control" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Funds Control Policy</CardTitle>
                                <CardDescription>Configure how strict the system should be when validating transactions against the budget.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Control Level</label>
                                        <Select value={ruleLevel} onValueChange={(val: any) => setRuleLevel(val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PROJECT">Project Total</SelectItem>
                                                <SelectItem value="TASK">Task Level</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Aggregates funds check at this level.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Control Type</label>
                                        <Select value={ruleType} onValueChange={(val: any) => setRuleType(val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ADVISORY">Advisory (Allow with Warning)</SelectItem>
                                                <SelectItem value="ABSOLUTE">Absolute (Hard Stop/Fail)</SelectItem>
                                                <SelectItem value="TRACKING">Tracking Only (No Validation)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Determines the action when budget is exceeded.</p>
                                    </div>
                                </div>
                                <Button onClick={() => setRuleMutation.mutate()} disabled={setRuleMutation.isPending}>Update Policy</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="simulator" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Funds Check Simulator</CardTitle>
                                <CardDescription>Test the engine logic against the current Baseline Budget.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-4 items-end">
                                    <div className="space-y-2 flex-1">
                                        <label>Request Amount</label>
                                        <Input value={testAmount} onChange={e => setTestAmount(e.target.value)} type="number" />
                                    </div>
                                    <Button onClick={() => testFundsMutation.mutate()} disabled={testFundsMutation.isPending}>Check Funds</Button>
                                </div>

                                {testResult && (
                                    <div className={`p-4 rounded-md border ${testResult.status === "FAIL" ? "bg-red-50 border-red-200" : testResult.status === "ADVISORY" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {testResult.status === "FAIL" && <AlertTriangle className="text-red-600" />}
                                            {testResult.status === "ADVISORY" && <AlertTriangle className="text-yellow-600" />}
                                            {testResult.status === "PASS" && <CheckCircle className="text-green-600" />}
                                            <span className="font-bold">{testResult.status}</span>
                                        </div>
                                        <p>{testResult.message}</p>
                                        <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                                            <div>
                                                <span className="block text-muted-foreground">Budget</span>
                                                <span className="font-mono">${testResult.budget}</span>
                                            </div>
                                            <div>
                                                <span className="block text-muted-foreground">Consumed</span>
                                                <span className="font-mono">${testResult.consumed}</span>
                                            </div>
                                            <div>
                                                <span className="block text-muted-foreground">Available</span>
                                                <span className="font-mono">${testResult.available}</span>
                                            </div>
                                            <div>
                                                <span className="block text-muted-foreground">Requested</span>
                                                <span className="font-mono">${testResult.requested}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="text-center py-20 text-muted-foreground border rounded-lg bg-slate-50">
                    Please select a Project to begin Planning.
                </div>
            )}
        </div>
    );
}
