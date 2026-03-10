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
import { Plus, AlertTriangle, ShieldCheck, Flag } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type Severity = "Warning" | "Reject" | "Flag for Review";
type Category = "Amount" | "Vendor" | "Receipt" | "Policy" | "Duplicate" | "Category";
type RuleStatus = "Active" | "Inactive";

interface AuditRule {
    id: string;
    ruleName: string;
    category: Category;
    description: string;
    condition: string;
    threshold?: number;
    currency?: string;
    severity: Severity;
    autoReject: boolean;
    notifyManager: boolean;
    isActive: boolean;
    trialsLast30Days: number;
    triggeredLast30Days: number;
}

const MOCK_RULES: AuditRule[] = [
    { id: "1", ruleName: "High-Value Single Expense", category: "Amount", description: "Flag expenses > $500 per line item", condition: "expense_amount > 500", threshold: 500, currency: "USD", severity: "Flag for Review", autoReject: false, notifyManager: true, isActive: true, trialsLast30Days: 342, triggeredLast30Days: 18 },
    { id: "2", ruleName: "Meals > $150 Per Person", category: "Category", description: "Flag meals exceeding per-person cap", condition: "category = 'Meals' AND amount_per_person > 150", threshold: 150, currency: "USD", severity: "Warning", autoReject: false, notifyManager: false, isActive: true, trialsLast30Days: 89, triggeredLast30Days: 7 },
    { id: "3", ruleName: "Missing Receipt (> $25)", category: "Receipt", description: "Auto-reject expenses > $25 with no receipt", condition: "amount > 25 AND receipt_attached = false", threshold: 25, currency: "USD", severity: "Reject", autoReject: true, notifyManager: true, isActive: true, trialsLast30Days: 512, triggeredLast30Days: 34 },
    { id: "4", ruleName: "Duplicate Merchant Same Day", category: "Duplicate", description: "Flag same merchant, same date, same amount", condition: "duplicate_detection = true", severity: "Reject", autoReject: true, notifyManager: true, isActive: true, trialsLast30Days: 512, triggeredLast30Days: 3 },
    { id: "5", ruleName: "Alcohol / Entertainment > $200", category: "Policy", description: "Flag entertainment expenses with alcohol > $200", condition: "category = 'Entertainment' AND amount > 200", threshold: 200, currency: "USD", severity: "Flag for Review", autoReject: false, notifyManager: true, isActive: true, trialsLast30Days: 45, triggeredLast30Days: 9 },
    { id: "6", ruleName: "Personal Category Merchant", category: "Vendor", description: "Flag vendors classified as personal (spa, gaming, etc.)", condition: "merchant_category = 'Personal'", severity: "Reject", autoReject: true, notifyManager: true, isActive: true, trialsLast30Days: 512, triggeredLast30Days: 2 },
    { id: "7", ruleName: "Lodging > $350/night", category: "Category", description: "Flag hotel nights exceeding nightly cap", condition: "category = 'Lodging' AND nightly_rate > 350", threshold: 350, currency: "USD", severity: "Warning", autoReject: false, notifyManager: false, isActive: false, trialsLast30Days: 0, triggeredLast30Days: 0 },
];

const severityColors: Record<Severity, string> = { "Warning": "secondary", "Reject": "destructive", "Flag for Review": "outline" };
const categoryColors: Record<Category, string> = { Amount: "default", Vendor: "secondary", Receipt: "destructive", Policy: "outline", Duplicate: "destructive", Category: "secondary" };

const formSchema = z.object({
    ruleName: z.string().min(1, "Rule name required"),
    category: z.enum(["Amount", "Vendor", "Receipt", "Policy", "Duplicate", "Category"]),
    description: z.string().min(5),
    condition: z.string().min(1),
    threshold: z.string().optional(),
    currency: z.string().optional(),
    severity: z.enum(["Warning", "Reject", "Flag for Review"]),
    autoReject: z.boolean().default(false),
    notifyManager: z.boolean().default(true),
});

export default function ExpenseAuditRuleSets() {
    const { toast } = useToast();
    const [rules, setRules] = useState<AuditRule[]>(MOCK_RULES);
    const [createOpen, setCreateOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { ruleName: "", category: "Amount", description: "", condition: "", threshold: "", currency: "USD", severity: "Warning", autoReject: false, notifyManager: true },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const rule: AuditRule = {
            id: String(rules.length + 1),
            ruleName: values.ruleName,
            category: values.category,
            description: values.description,
            condition: values.condition,
            threshold: values.threshold ? parseFloat(values.threshold) : undefined,
            currency: values.currency,
            severity: values.severity,
            autoReject: values.autoReject,
            notifyManager: values.notifyManager,
            isActive: true,
            trialsLast30Days: 0,
            triggeredLast30Days: 0,
        };
        setRules(prev => [...prev, rule]);
        form.reset();
        setCreateOpen(false);
        toast({ title: "Audit Rule Created", description: `"${rule.ruleName}" added to the active rule set.` });
    };

    const toggleRule = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
        const rule = rules.find(r => r.id === id);
        if (rule) toast({ title: rule.isActive ? "Rule Deactivated" : "Rule Activated", description: rule.ruleName });
    };

    const columns: SpreadsheetColumn<AuditRule>[] = useMemo(() => [
        { id: "ruleName", header: "Rule Name", width: "200px", cellClassName: "font-medium", cell: r => r.ruleName },
        { id: "category", header: "Category", width: "110px", cell: r => <Badge variant={categoryColors[r.category] as any}>{r.category}</Badge> },
        { id: "description", header: "Description", width: "230px", cellClassName: "text-xs text-muted-foreground", cell: r => r.description },
        { id: "threshold", header: "Threshold", width: "110px", cellClassName: "font-mono text-sm text-right", cell: r => r.threshold ? `${r.currency} ${formatNumber(r.threshold)}` : "—" },
        { id: "severity", header: "Severity", width: "130px", cell: r => <Badge variant={severityColors[r.severity] as any}>{r.severity}</Badge> },
        { id: "autoReject", header: "Auto-Reject", width: "90px", cellClassName: "text-center", cell: r => r.autoReject ? <span className="text-destructive font-bold text-sm">✗ Auto</span> : "—" },
        { id: "notify", header: "Notify Mgr", width: "90px", cellClassName: "text-center", cell: r => r.notifyManager ? "✅" : "—" },
        {
            id: "hit_rate", header: "Triggered / Runs", width: "130px",
            cell: r => r.isActive ? (
                <span className="font-mono text-sm">
                    <span className={r.triggeredLast30Days > 10 ? "text-destructive font-bold" : ""}>{r.triggeredLast30Days}</span>
                    <span className="text-muted-foreground">/{r.trialsLast30Days}</span>
                </span>
            ) : <span className="text-muted-foreground text-xs">Inactive</span>,
        },
        {
            id: "isActive", header: "Status", width: "90px",
            cell: r => (
                <Badge variant={r.isActive ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleRule(r.id)}>
                    {r.isActive ? <ShieldCheck className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
                    {r.isActive ? "Active" : "Off"}
                </Badge>
            ),
        },
    ], [rules]);

    const activeRules = rules.filter(r => r.isActive);
    const autoRejectRules = rules.filter(r => r.isActive && r.autoReject);

    return (
        <StandardPage
            title="Expense Audit Rule Sets"
            description="Define automated audit rules for expense reports. Rules are evaluated at submission time to flag, warn, or auto-reject expenses that violate policy."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Expense Management", href: "/expenses" },
                { label: "Audit Rule Sets" },
            ]}
            actions={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Rule
                </Button>
            }
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                    { label: "Active Rules", val: activeRules.length, color: "border-l-green-500" },
                    { label: "Auto-Reject Rules", val: autoRejectRules.length, color: "border-l-destructive" },
                    { label: "Triggered (30d)", val: rules.reduce((s, r) => s + r.triggeredLast30Days, 0), color: "border-l-amber-400" },
                    { label: "Total Evaluations (30d)", val: rules.reduce((s, r) => s + r.trialsLast30Days, 0), color: "border-l-primary" },
                ].map(m => (
                    <Card key={m.label} className={`border-l-4 ${m.color}`}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-2xl font-bold font-mono">{m.val}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mb-3 flex gap-2 text-xs text-muted-foreground items-center p-2.5 bg-muted/30 rounded-lg">
                <Flag className="h-3.5 w-3.5 text-amber-500" />
                <span><strong>Oracle OIE Parity:</strong> Rules are evaluated in priority order. Auto-Reject rules immediately block expense report submission. Flag for Review rules route the report to the next approver with an attached policy warning.</span>
            </div>

            <InteractiveSpreadsheet<AuditRule>
                data={rules}
                columns={columns}
                onChange={() => { }}
                containerHeight="420px"
            />

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> New Audit Rule</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
                            <FormField control={form.control} name="ruleName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rule Name *</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g. High-Value Single Expense" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["Amount", "Vendor", "Receipt", "Policy", "Duplicate", "Category"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="severity" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Severity *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["Warning", "Reject", "Flag for Review"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="threshold" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Threshold Amount</FormLabel>
                                        <FormControl><Input {...field} type="number" step="0.01" className="font-mono" placeholder="e.g. 500" /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="currency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || "USD"}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["USD", "EUR", "GBP", "AED"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="condition" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Condition Expression *</FormLabel>
                                    <FormControl><Input {...field} className="font-mono text-xs" placeholder="expense_amount > 500" /></FormControl>
                                    <FormDescription className="text-xs">Pseudo-SQL expression evaluated at submission.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-3">
                                {(["autoReject", "notifyManager"] as const).map(fn => (
                                    <FormField key={fn} control={form.control} name={fn} render={({ field }) => (
                                        <FormItem className="flex items-center gap-3 rounded-lg border p-3">
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel className="!mt-0 text-sm">{fn === "autoReject" ? "Auto-Reject" : "Notify Manager"}</FormLabel>
                                        </FormItem>
                                    )} />
                                ))}
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Rule</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
