import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, GitBranch, ArrowRight, Shield } from "lucide-react";

type ApproverRole = "Lease Manager" | "Finance Controller" | "CFO" | "Legal Counsel" | "Board Approval";
type ThresholdType = "Amount" | "Lease Type" | "Term Length";

interface ApprovalStep {
    stepNumber: number;
    approverRole: ApproverRole;
    condition: string;
    isParallel: boolean;
    escalationDays: number;
    escalateTo?: ApproverRole;
}

interface ApprovalChain {
    id: string;
    chainName: string;
    description: string;
    thresholdType: ThresholdType;
    thresholdValue: string;
    leaseType?: string;
    steps: ApprovalStep[];
    isActive: boolean;
    leasesApplied: number;
}

const MOCK_CHAINS: ApprovalChain[] = [
    {
        id: "1", chainName: "Standard Lease < $100K", description: "Operating leases under $100K NPV", thresholdType: "Amount", thresholdValue: "100,000", isActive: true, leasesApplied: 24,
        steps: [
            { stepNumber: 1, approverRole: "Lease Manager", condition: "Always", isParallel: false, escalationDays: 3, escalateTo: "Finance Controller" },
        ],
    },
    {
        id: "2", chainName: "Mid-Tier Lease $100K–$1M", description: "Finance leases or operating leases $100K–$1M", thresholdType: "Amount", thresholdValue: "1,000,000", isActive: true, leasesApplied: 11,
        steps: [
            { stepNumber: 1, approverRole: "Lease Manager", condition: "Always", isParallel: false, escalationDays: 3, escalateTo: "Finance Controller" },
            { stepNumber: 2, approverRole: "Finance Controller", condition: "NPV > 100,000", isParallel: false, escalationDays: 5, escalateTo: "CFO" },
        ],
    },
    {
        id: "3", chainName: "High-Value Lease > $1M", description: "Finance leases > $1M NPV — C-suite + Legal required", thresholdType: "Amount", thresholdValue: "> 1,000,000", isActive: true, leasesApplied: 3,
        steps: [
            { stepNumber: 1, approverRole: "Finance Controller", condition: "Always", isParallel: true, escalationDays: 3, escalateTo: "CFO" },
            { stepNumber: 1, approverRole: "Legal Counsel", condition: "Always", isParallel: true, escalationDays: 5 },
            { stepNumber: 2, approverRole: "CFO", condition: "Previous steps complete", isParallel: false, escalationDays: 7, escalateTo: "Board Approval" },
        ],
    },
    {
        id: "4", chainName: "Vehicle / Fleet Lease", description: "Short-term or operating vehicle leases", thresholdType: "Lease Type", thresholdValue: "Vehicle / Fleet", isActive: true, leasesApplied: 8,
        steps: [
            { stepNumber: 1, approverRole: "Lease Manager", condition: "Always", isParallel: false, escalationDays: 2 },
        ],
    },
];

const APPROVER_ROLES: ApproverRole[] = ["Lease Manager", "Finance Controller", "CFO", "Legal Counsel", "Board Approval"];
const THRESHOLD_TYPES: ThresholdType[] = ["Amount", "Lease Type", "Term Length"];

const formSchema = z.object({
    chainName: z.string().min(1, "Chain name required"),
    description: z.string().min(1),
    thresholdType: z.enum(["Amount", "Lease Type", "Term Length"]),
    thresholdValue: z.string().min(1, "Threshold value required"),
    leaseType: z.string().optional(),
    step1Role: z.enum(["Lease Manager", "Finance Controller", "CFO", "Legal Counsel", "Board Approval"]),
    step1Escalation: z.string(),
    step2Enabled: z.boolean().default(false),
    step2Role: z.enum(["Lease Manager", "Finance Controller", "CFO", "Legal Counsel", "Board Approval"]).optional(),
    requireLegal: z.boolean().default(false),
});

export default function LeaseApprovalChainConfig() {
    const { toast } = useToast();
    const [chains, setChains] = useState<ApprovalChain[]>(MOCK_CHAINS);
    const [createOpen, setCreateOpen] = useState(false);
    const [viewChain, setViewChain] = useState<ApprovalChain | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            chainName: "", description: "", thresholdType: "Amount", thresholdValue: "", leaseType: "",
            step1Role: "Lease Manager", step1Escalation: "3",
            step2Enabled: false, step2Role: "Finance Controller", requireLegal: false,
        },
    });

    const step2Enabled = form.watch("step2Enabled");
    const requireLegal = form.watch("requireLegal");

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const steps: ApprovalStep[] = [
            { stepNumber: 1, approverRole: values.step1Role, condition: "Always", isParallel: false, escalationDays: parseInt(values.step1Escalation) || 3 },
        ];
        if (values.requireLegal) {
            steps[0].isParallel = true;
            steps.push({ stepNumber: 1, approverRole: "Legal Counsel", condition: "Always", isParallel: true, escalationDays: 5 });
        }
        if (values.step2Enabled && values.step2Role) {
            steps.push({ stepNumber: 2, approverRole: values.step2Role, condition: "Previous steps complete", isParallel: false, escalationDays: 5 });
        }

        const newChain: ApprovalChain = {
            id: String(chains.length + 1),
            chainName: values.chainName,
            description: values.description,
            thresholdType: values.thresholdType,
            thresholdValue: values.thresholdValue,
            leaseType: values.leaseType,
            steps,
            isActive: true,
            leasesApplied: 0,
        };
        setChains(prev => [...prev, newChain]);
        form.reset();
        setCreateOpen(false);
        toast({ title: "Approval Chain Created", description: `"${newChain.chainName}" with ${steps.length} step(s) is now active.` });
    };

    const toggleChain = (id: string) => {
        setChains(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
        const c = chains.find(c => c.id === id);
        if (c) toast({ title: c.isActive ? "Chain Deactivated" : "Chain Activated", description: c.chainName });
    };

    const columns: SpreadsheetColumn<ApprovalChain>[] = useMemo(() => [
        { id: "chainName", header: "Chain Name", width: "200px", cellClassName: "font-medium", cell: r => r.chainName },
        { id: "description", header: "Description", width: "240px", cellClassName: "text-xs text-muted-foreground", cell: r => r.description },
        { id: "threshold", header: "Threshold", width: "160px", cell: r => (<div className="text-xs"><Badge variant="outline">{r.thresholdType}</Badge><p className="mt-0.5 font-mono">{r.thresholdValue}</p></div>) },
        {
            id: "steps", header: "Approval Steps", width: "280px", cell: r => (
                <div className="flex items-center gap-1 flex-wrap">
                    {r.steps.map((s, i) => (
                        <span key={i} className="flex items-center gap-0.5">
                            {i > 0 && !s.isParallel && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                            {s.isParallel && i > 0 && <span className="text-xs text-muted-foreground">||</span>}
                            <Badge variant="secondary" className="text-xs py-0">{s.approverRole}</Badge>
                        </span>
                    ))}
                </div>
            )
        },
        { id: "leasesApplied", header: "Leases", width: "75px", cellClassName: "font-mono text-sm text-center", cell: r => r.leasesApplied },
        {
            id: "isActive", header: "Status", width: "90px",
            cell: r => <Badge variant={r.isActive ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleChain(r.id)}>{r.isActive ? "Active" : "Off"}</Badge>,
        },
        {
            id: "actions", header: "Actions", width: "90px",
            cell: r => <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setViewChain(r)}>View</Button>,
        },
    ], [chains]);

    return (
        <StandardPage
            title="Lease Approval Chain Configuration"
            description="Define multi-threshold approval routing for lease contracts. Assign sequential or parallel approval steps based on NPV, lease type, or term length."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Lease Accounting", href: "/leases" },
                { label: "Approval Chain Config" },
            ]}
            actions={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Chain
                </Button>
            }
        >
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary flex items-start gap-2">
                <GitBranch className="h-4 w-4 mt-0.5 shrink-0" />
                <span><strong>Oracle Lease Parity:</strong> Approval chains are evaluated at lease abstraction. The system selects the matching chain by testing threshold conditions in priority order. Chains support sequential (→) and parallel (||) approver steps with configurable escalation timeouts.</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                    { label: "Active Chains", val: chains.filter(c => c.isActive).length },
                    { label: "Total Leases Managed", val: chains.reduce((s, c) => s + c.leasesApplied, 0) },
                    { label: "Multi-Step Chains", val: chains.filter(c => c.steps.length > 1).length },
                ].map(m => (
                    <Card key={m.label} className="border-l-4 border-l-primary/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-2xl font-bold font-mono">{m.val}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <InteractiveSpreadsheet<ApprovalChain>
                data={chains}
                columns={columns}
                onChange={() => { }}
                containerHeight="360px"
            />

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary" /> New Approval Chain</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
                            <FormField control={form.control} name="chainName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Chain Name *</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g. High-Value Finance Lease > $1M" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="thresholdType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Threshold Type *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {THRESHOLD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="thresholdValue" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Threshold Value *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="e.g. 1,000,000" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Step 1 — First Approver</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField control={form.control} name="step1Role" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Approver Role *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {APPROVER_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="step1Escalation" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Escalation After (days)</FormLabel>
                                            <FormControl><Input {...field} type="number" min="1" className="font-mono" /></FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="requireLegal" render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 rounded-lg border p-2.5 bg-background">
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div>
                                            <FormLabel className="!mt-0 text-sm">Require parallel Legal Counsel approval</FormLabel>
                                            <FormDescription className="text-xs">Legal Counsel approves simultaneously with Step 1 approver.</FormDescription>
                                        </div>
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="step2Enabled" render={({ field }) => (
                                <FormItem className="flex items-center gap-3 rounded-lg border p-2.5">
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="!mt-0 text-sm">Add sequential Step 2 approver</FormLabel>
                                </FormItem>
                            )} />
                            {step2Enabled && (
                                <FormField control={form.control} name="step2Role" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Step 2 Approver Role *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {APPROVER_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}
                            <DialogFooter>
                                <Button type="submit">Create Chain</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* View Chain Detail Dialog */}
            <Dialog open={!!viewChain} onOpenChange={() => setViewChain(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> {viewChain?.chainName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-muted-foreground">{viewChain?.description}</p>
                        <div className="flex gap-3 text-sm">
                            <span><strong>Threshold:</strong> {viewChain?.thresholdType} — {viewChain?.thresholdValue}</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Approval Flow</p>
                            {viewChain?.steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-2 p-2.5 border rounded-lg">
                                    {step.isParallel
                                        ? <Badge variant="outline" className="text-xs">Parallel</Badge>
                                        : <Badge variant="secondary" className="text-xs">Step {step.stepNumber}</Badge>
                                    }
                                    <Users className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">{step.approverRole}</span>
                                    <span className="text-xs text-muted-foreground ml-auto">Escalate after {step.escalationDays}d{step.escalateTo ? ` → ${step.escalateTo}` : ""}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewChain(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
