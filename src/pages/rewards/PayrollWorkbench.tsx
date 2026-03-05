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
import { Calculator, Calendar, Layers, Activity, Play, Plus, CheckCircle, BrainCircuit, FileText } from "lucide-react";
import PayrollRunDetails from "./PayrollRunDetails";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerField } from '@/components/forms/DatePickerField';

const runSchema = z.object({
    payGroupId: z.string().min(1, "Pay Group is required"),
    periodName: z.string().min(1, "Period Name is required"),
    periodStartDate: z.string().min(1, "Start Date is required"),
    periodEndDate: z.string().min(1, "End Date is required"),
    paymentDate: z.string().min(1, "Payment Date is required"),
});

const groupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    frequency: z.string().min(1, "Frequency is required"),
});

const elementSchema = z.object({
    name: z.string().min(1, "Name is required"),
    classification: z.enum(["EARNINGS", "DEDUCTION"]).default("EARNINGS"),
});

export default function PayrollWorkbench() {
    const [activeTab, setActiveTab] = useState("runs");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [isElementOpen, setIsElementOpen] = useState(false);
    const [isRunOpen, setIsRunOpen] = useState(false);
    const [auditResults, setAuditResults] = useState<any[] | null>(null);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const runForm = useForm<z.infer<typeof runSchema>>({
        resolver: zodResolver(runSchema),
        defaultValues: {
            payGroupId: "",
            periodName: "",
            periodStartDate: "",
            periodEndDate: "",
            paymentDate: ""
        }
    });

    const groupForm = useForm<z.infer<typeof groupSchema>>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            name: "",
            frequency: ""
        }
    });

    const elementForm = useForm<z.infer<typeof elementSchema>>({
        resolver: zodResolver(elementSchema),
        defaultValues: {
            name: "",
            classification: "EARNINGS"
        }
    });

    // === QUERIES ===
    const { data: runs, isLoading: isRunsLoading } = useQuery<any>({
        queryKey: ["payroll-runs"],
        queryFn: async () => (await fetch("/api/rewards/payroll-runs")).json()
    });

    const { data: groups } = useQuery<any>({
        queryKey: ["pay-groups"],
        queryFn: async () => (await fetch("/api/rewards/pay-groups")).json()
    });

    const { data: elements } = useQuery<any>({
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
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pay-groups"] }); setIsGroupOpen(false); groupForm.reset(); toast({ title: "Pay Group Created" }); }
    });

    const createElementMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/rewards/elements", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pay-elements"] }); setIsElementOpen(false); elementForm.reset(); toast({ title: "Element Created" }); }
    });

    const createRunMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/rewards/payroll-runs", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["payroll-runs"] }); setIsRunOpen(false); runForm.reset(); toast({ title: "Run Created" }); }
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

    // === HANDLERS ===
    const onGroupSubmit = (values: z.infer<typeof groupSchema>) => {
        createGroupMutation.mutate(values);
    };
    const onElementSubmit = (values: z.infer<typeof elementSchema>) => {
        createElementMutation.mutate({ ...values, inputType: "CALCULATED" });
    };
    const onRunSubmit = (values: z.infer<typeof runSchema>) => {
        createRunMutation.mutate(values);
    };

    if (isRunsLoading) return <div className="p-8">Loading Payroll...</div>;

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payroll Command Center</h1>
                    <p className="text-muted-foreground mt-1">Execute payroll runs, manage groups, and analyze performance.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Activity className="mr-2 h-4 w-4" /> Reports
                    </Button>
                    <Dialog open={isRunOpen} onOpenChange={(open) => { setIsRunOpen(open); if (!open) runForm.reset(); }}>
                        <DialogTrigger asChild><Button><Play className="mr-2 h-4 w-4" /> Run Payroll</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>New Payroll Run</DialogTitle></DialogHeader>
                            <Form {...runForm}>
                                <form onSubmit={runForm.handleSubmit(onRunSubmit)} className="space-y-4">
                                    <FormField
                                        control={runForm.control}
                                        name="payGroupId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pay Group</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Group" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {groups?.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField control={runForm.control} name="periodName" render={({ field }) => <FormItem><FormLabel>Period Name</FormLabel><FormControl><Input placeholder="2024-01 Monthly" {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={runForm.control} name="periodStartDate" render={({ field }) => <FormItem><FormLabel>Start Date</FormLabel><FormControl><DatePickerField {...field} /></FormControl><FormMessage /></FormItem>} />
                                        <FormField control={runForm.control} name="periodEndDate" render={({ field }) => <FormItem><FormLabel>End Date</FormLabel><FormControl><DatePickerField {...field} /></FormControl><FormMessage /></FormItem>} />
                                    </div>
                                    <FormField control={runForm.control} name="paymentDate" render={({ field }) => <FormItem><FormLabel>Payment Date</FormLabel><FormControl><DatePickerField {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <Button type="submit" className="w-full">Initialize Run</Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Run Total</CardTitle>
                        <Calculator className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {runs && runs.length > 0 ? `$${Number(runs[0].totalNet || 0).toLocaleString()}` : "$0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {runs && runs.length > 0 ? `${runs[0].periodName} (Paid)` : "No Date"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Activity className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {runs ? runs.filter((r: any) => r.status === 'PENDING_APPROVAL').length : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Runs waiting for final sign-off</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Pay Groups</CardTitle>
                        <Layers className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{groups?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Scheduled frequencies</p>
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
                                                <Button size="sm" variant="outline" onClick={() => { setSelectedRunId(run.id); setIsDetailsOpen(true); }}>View Details</Button>
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
                        <Dialog open={isGroupOpen} onOpenChange={(open) => { setIsGroupOpen(open); if (!open) groupForm.reset(); }}>
                            <DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Group</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>New Pay Group</DialogTitle></DialogHeader>
                                <Form {...groupForm}>
                                    <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
                                        <FormField control={groupForm.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                        <FormField control={groupForm.control} name="frequency" render={({ field }) => <FormItem><FormLabel>Frequency</FormLabel><FormControl><Input placeholder="MONTHLY" {...field} /></FormControl><FormMessage /></FormItem>} />
                                        <Button type="submit" className="w-full">Save</Button>
                                    </form>
                                </Form>
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
                        <Dialog open={isElementOpen} onOpenChange={(open) => { setIsElementOpen(open); if (!open) elementForm.reset(); }}>
                            <DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Element</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>New Pay Element</DialogTitle></DialogHeader>
                                <Form {...elementForm}>
                                    <form onSubmit={elementForm.handleSubmit(onElementSubmit)} className="space-y-4">
                                        <FormField control={elementForm.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                        <FormField control={elementForm.control} name="classification" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Classification</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="EARNINGS">Earnings</SelectItem>
                                                        <SelectItem value="DEDUCTION">Deduction</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <Button type="submit" className="w-full">Save</Button>
                                    </form>
                                </Form>
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
        </div >
    );
}
