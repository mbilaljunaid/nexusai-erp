import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Calendar, Layers, Activity, Play, Plus, CheckCircle, BrainCircuit } from "lucide-react";

export default function PayrollWorkbench() {
    const [activeTab, setActiveTab] = useState("runs");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [isElementOpen, setIsElementOpen] = useState(false);
    const [isRunOpen, setIsRunOpen] = useState(false);
    const [auditResults, setAuditResults] = useState<any[] | null>(null);
    const [isAuditOpen, setIsAuditOpen] = useState(false);

    // === QUERIES ===
    const { data: runs, isLoading: isRunsLoading } = useQuery({
        queryKey: ["payroll-runs"],
        queryFn: async () => (await fetch("/api/rewards/payroll-runs")).json()
    });

    const { data: groups } = useQuery({
        queryKey: ["pay-groups"],
        queryFn: async () => (await fetch("/api/rewards/pay-groups")).json()
    });

    const { data: elements } = useQuery({
        queryKey: ["pay-elements"],
        queryFn: async () => (await fetch("/api/rewards/elements")).json()
    });

    // === MUTATIONS ===
    const createGroupMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/rewards/pay-groups", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pay-groups"] }); setIsGroupOpen(false); toast({ title: "Pay Group Created" }); }
    });

    const createElementMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/rewards/elements", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pay-elements"] }); setIsElementOpen(false); toast({ title: "Element Created" }); }
    });

    const createRunMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/rewards/payroll-runs", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["payroll-runs"] }); setIsRunOpen(false); toast({ title: "Run Created" }); }
    });

    const calculateRunMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/rewards/payroll-runs/${id}/calculate`, { method: "POST" });
            if (!res.ok) throw new Error("Calculation Failed");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
            toast({ title: `Calculation Complete. Processed ${data.processedCount} records.` });
        }
    });

    const approveRunMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/rewards/payroll-runs/${id}/approve`, { method: "POST" });
            if (!res.ok) throw new Error("Approval Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
            toast({ title: "Run Approved & finalized." });
        }
    });

    const runAuditMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/rewards/payroll-runs/${id}/anomalies`);
            if (!res.ok) throw new Error("Audit Failed");
            return res.json();
        },
        onSuccess: (data) => {
            setAuditResults(data);
            setIsAuditOpen(true);
            if (data.length === 0) toast({ title: "AI Audit Passed: No anomalies detected." });
            else toast({ title: `AI Audit: ${data.length} anomalies detected.`, variant: "destructive" });
        }
    });

    // === HANDLERS (Simplified) ===
    const handleGroupSubmit = (e: any) => {
        e.preventDefault(); const fd = new FormData(e.target);
        createGroupMutation.mutate({ name: fd.get("name"), frequency: fd.get("frequency") });
    };
    const handleElementSubmit = (e: any) => {
        e.preventDefault(); const fd = new FormData(e.target);
        createElementMutation.mutate({ name: fd.get("name"), classification: fd.get("classification"), inputType: "CALCULATED" });
    };
    const handleRunSubmit = (e: any) => {
        e.preventDefault(); const fd = new FormData(e.target);
        createRunMutation.mutate({
            payGroupId: fd.get("payGroupId"),
            periodName: fd.get("periodName"),
            periodStartDate: fd.get("periodStartDate"),
            periodEndDate: fd.get("periodEndDate"),
            paymentDate: fd.get("paymentDate")
        });
    };

    if (isRunsLoading) return <div className="p-8">Loading Payroll...</div>;

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payroll Workbench</h1>
                    <p className="text-muted-foreground mt-1">Execute payroll runs, manage groups and elements.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Runs</CardTitle>
                        <Activity className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{runs?.filter((r: any) => r.status === 'OPEN' || r.status === 'CALCULATING').length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pay Groups</CardTitle>
                        <Layers className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{groups?.length || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
                    <TabsTrigger value="groups">Pay Groups</TabsTrigger>
                    <TabsTrigger value="elements">Elements</TabsTrigger>
                </TabsList>

                <TabsContent value="runs" className="space-y-4">
                    <div className="flex justify-end space-x-2">
                        <Dialog open={isAuditOpen} onOpenChange={setIsAuditOpen}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <BrainCircuit className="h-5 w-5 text-indigo-600" /> AI Audit Results
                                    </DialogTitle>
                                    <DialogDescription>
                                        Analyzing payroll variance and data integrity.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    {auditResults?.length === 0 ? (
                                        <div className="text-green-600 flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5" /> No anomalies detected.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {auditResults?.map((a: any, i: number) => (
                                                <div key={i} className="p-3 border rounded-md bg-amber-50 border-amber-200 text-sm">
                                                    <div className="font-semibold text-amber-800">{a.type}</div>
                                                    <div className="text-amber-700">{a.description}</div>
                                                    {a.variancePercent && <div className="text-xs mt-1 text-amber-600">Variance: {a.variancePercent.toFixed(1)}% ({a.previousNet} -> {a.currentNet})</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isRunOpen} onOpenChange={setIsRunOpen}>
                            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Create Run</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>New Payroll Run</DialogTitle></DialogHeader>
                                <form onSubmit={handleRunSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Pay Group</Label>
                                        <select name="payGroupId" className="w-full h-10 border rounded-md px-3" required>
                                            {groups?.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2"><Label>Period Name</Label><Input name="periodName" placeholder="2024-01 Monthly" required /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Start Date</Label><Input type="date" name="periodStartDate" required /></div>
                                        <div className="space-y-2"><Label>End Date</Label><Input type="date" name="periodEndDate" required /></div>
                                    </div>
                                    <div className="space-y-2"><Label>Payment Date</Label><Input type="date" name="paymentDate" required /></div>
                                    <Button type="submit" className="w-full">Initialize Run</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Gross</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {runs?.map((run: any) => (
                                    <TableRow key={run.id}>
                                        <TableCell className="font-medium">{run.periodName}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(run.periodStartDate).toLocaleDateString()} - {new Date(run.periodEndDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell><Badge>{run.status}</Badge></TableCell>
                                        <TableCell>{run.totalGross ? `$${run.totalGross}` : '-'}</TableCell>
                                        <TableCell>
                                            {run.status === 'OPEN' && (
                                                <Button size="sm" onClick={() => calculateRunMutation.mutate(run.id)}>
                                                    <Play className="h-3 w-3 mr-1" /> Calculate
                                                </Button>
                                            )}
                                            {run.status === 'PENDING_APPROVAL' && (
                                                <>
                                                    <Button size="sm" variant="outline" onClick={() => runAuditMutation.mutate(run.id)} className="mr-2">
                                                        <BrainCircuit className="h-3 w-3 mr-1" /> AI Audit
                                                    </Button>
                                                    <Button size="sm" onClick={() => approveRunMutation.mutate(run.id)} className="bg-amber-600 hover:bg-amber-700">
                                                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                                    </Button>
                                                </>
                                            )}
                                            {run.status === 'COMPLETED' && (
                                                <Button size="sm" variant="outline">View Results</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="groups" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isGroupOpen} onOpenChange={setIsGroupOpen}>
                            <DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Group</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>New Pay Group</DialogTitle></DialogHeader>
                                <form onSubmit={handleGroupSubmit} className="space-y-4">
                                    <div className="space-y-2"><Label>Name</Label><Input name="name" required /></div>
                                    <div className="space-y-2"><Label>Frequency</Label><Input name="frequency" placeholder="MONTHLY" required /></div>
                                    <Button type="submit" className="w-full">Save</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Frequency</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {groups?.map((g: any) => (
                                    <TableRow key={g.id}><TableCell>{g.name}</TableCell><TableCell>{g.frequency}</TableCell><TableCell><Badge variant="outline">{g.status}</Badge></TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="elements" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isElementOpen} onOpenChange={setIsElementOpen}>
                            <DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Element</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>New Pay Element</DialogTitle></DialogHeader>
                                <form onSubmit={handleElementSubmit} className="space-y-4">
                                    <div className="space-y-2"><Label>Name</Label><Input name="name" required /></div>
                                    <div className="space-y-2"><Label>Classification</Label>
                                        <select name="classification" className="w-full h-10 border rounded-md px-3">
                                            <option value="EARNINGS">Earnings</option>
                                            <option value="DEDUCTION">Deduction</option>
                                        </select>
                                    </div>
                                    <Button type="submit" className="w-full">Save</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Taxable</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {elements?.map((e: any) => (
                                    <TableRow key={e.id}><TableCell>{e.name}</TableCell><TableCell>{e.classification}</TableCell><TableCell>{e.taxable ? 'Yes' : 'No'}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
