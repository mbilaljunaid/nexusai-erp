import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, RefreshCw } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface RecurringTemplate {
    id: string;
    templateName: string;
    supplierName: string;
    supplierId: string;
    amount: number;
    currency: string;
    glAccount: string;
    frequency: "Monthly" | "Quarterly" | "Semi-Annual" | "Annual" | "Weekly";
    startDate: string;
    endDate: string;
    nextDueDate: string;
    remainingOccurrences: number;
    status: "Active" | "Inactive" | "Expired";
}

const MOCK_TEMPLATES: RecurringTemplate[] = [
    { id: "RT-001", templateName: "AWS Cloud Services Monthly", supplierName: "Amazon Web Services", supplierId: "SUP-0045", amount: 12400, currency: "USD", glAccount: "01-000-6510-000", frequency: "Monthly", startDate: "2025-01-01", endDate: "2026-12-31", nextDueDate: "2026-04-01", remainingOccurrences: 9, status: "Active" },
    { id: "RT-002", templateName: "Office 365 Annual Subscription", supplierName: "Microsoft Corporation", supplierId: "SUP-0012", amount: 45000, currency: "USD", glAccount: "01-000-6510-000", frequency: "Annual", startDate: "2025-06-01", endDate: "2027-05-31", nextDueDate: "2026-06-01", remainingOccurrences: 2, status: "Active" },
    { id: "RT-003", templateName: "Office Lease — Downtown HQ", supplierName: "Prime Properties LLC", supplierId: "SUP-0089", amount: 28500, currency: "USD", glAccount: "01-000-6100-000", frequency: "Monthly", startDate: "2023-01-01", endDate: "2027-12-31", nextDueDate: "2026-04-01", remainingOccurrences: 21, status: "Active" },
    { id: "RT-004", templateName: "Insurance Premium — Quarterly", supplierName: "AIG Commercial Insurance", supplierId: "SUP-0201", amount: 18750, currency: "USD", glAccount: "01-000-6400-000", frequency: "Quarterly", startDate: "2025-01-01", endDate: "2025-12-31", nextDueDate: "—", remainingOccurrences: 0, status: "Expired" },
];

const formSchema = z.object({
    templateName: z.string().min(1, "Template name required"),
    supplierId: z.string().min(1, "Supplier required"),
    supplierName: z.string().min(1),
    amount: z.string().min(1, "Amount required"),
    currency: z.string().min(1),
    glAccount: z.string().min(1, "GL Account required"),
    frequency: z.enum(["Monthly", "Quarterly", "Semi-Annual", "Annual", "Weekly"]),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    occurrences: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RecurringInvoiceTemplates() {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<RecurringTemplate[]>(MOCK_TEMPLATES);
    const [createOpen, setCreateOpen] = useState(false);
    const [generateConfirm, setGenerateConfirm] = useState<RecurringTemplate | null>(null);
    const [generatedInvoices, setGeneratedInvoices] = useState<number>(0);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { templateName: "", supplierId: "", supplierName: "", amount: "", currency: "USD", glAccount: "", frequency: "Monthly", startDate: "", endDate: "", occurrences: "" },
    });

    const onSubmit = (values: FormValues) => {
        const newTemplate: RecurringTemplate = {
            id: `RT-${String(templates.length + 1).padStart(3, "0")}`,
            templateName: values.templateName,
            supplierName: values.supplierName,
            supplierId: values.supplierId,
            amount: parseFloat(values.amount),
            currency: values.currency,
            glAccount: values.glAccount,
            frequency: values.frequency,
            startDate: values.startDate,
            endDate: values.endDate,
            nextDueDate: values.startDate,
            remainingOccurrences: parseInt(values.occurrences || "12"),
            status: "Active",
        };
        setTemplates(prev => [...prev, newTemplate]);
        form.reset();
        setCreateOpen(false);
        toast({ title: "Template Created", description: `Recurring invoice template "${values.templateName}" created successfully.` });
    };

    const handleGenerate = () => {
        if (!generateConfirm) return;
        const count = generateConfirm.frequency === "Monthly" ? 1 : generateConfirm.frequency === "Quarterly" ? 1 : 1;
        setGeneratedInvoices(count);
        setTemplates(prev => prev.map(t => t.id === generateConfirm.id ? {
            ...t,
            remainingOccurrences: Math.max(0, t.remainingOccurrences - 1),
            nextDueDate: t.frequency === "Monthly" ? "2026-05-01" : "2026-07-01",
        } : t));
        setGenerateConfirm(null);
        toast({
            title: `${count} Invoice(s) Generated`,
            description: `AP invoice(s) created from template "${generateConfirm.templateName}". Navigate to Invoice Workbench to review.`,
        });
    };

    const statusColors: Record<RecurringTemplate["status"], string> = {
        Active: "default",
        Inactive: "secondary",
        Expired: "outline",
    };

    const columns: SpreadsheetColumn<RecurringTemplate>[] = useMemo(() => [
        { id: "templateName", header: "Template Name", width: "220px", cellClassName: "font-medium", cell: (r) => r.templateName },
        { id: "supplierName", header: "Supplier", width: "190px", cellClassName: "text-sm", cell: (r) => r.supplierName },
        { id: "amount", header: "Amount", width: "130px", cellClassName: "text-right font-mono font-medium", cell: (r) => `${r.currency} ${formatNumber(r.amount)}` },
        { id: "frequency", header: "Frequency", width: "110px", cell: (r) => <Badge variant="outline">{r.frequency}</Badge> },
        { id: "glAccount", header: "GL Account", width: "170px", cellClassName: "font-mono text-sm text-muted-foreground", cell: (r) => r.glAccount },
        { id: "nextDueDate", header: "Next Due", width: "110px", cellClassName: "font-mono text-sm", cell: (r) => r.nextDueDate },
        { id: "remainingOccurrences", header: "Remaining", width: "100px", cellClassName: "text-center font-mono", cell: (r) => r.remainingOccurrences },
        { id: "status", header: "Status", width: "100px", cell: (r) => <Badge variant={statusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "Actions", width: "160px",
            cell: (r) => r.status === "Active" ? (
                <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setGenerateConfirm(r)}>
                    <Play className="mr-1 h-3 w-3" /> Generate
                </Button>
            ) : null,
        },
    ], []);

    return (
        <StandardPage
            title="Recurring Invoice Templates"
            description="Define invoice templates that automatically generate AP invoices on a recurring schedule. Templates reduce manual entry for regular operational expenses."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Recurring Templates" },
            ]}
            actions={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Template
                </Button>
            }
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                    { label: "Active Templates", val: templates.filter(t => t.status === "Active").length },
                    { label: "Due This Month", val: templates.filter(t => t.status === "Active" && t.nextDueDate.startsWith("2026-04")).length },
                    { label: "Total Monthly Spend", val: `$${formatNumber(templates.filter(t => t.status === "Active" && t.frequency === "Monthly").reduce((s, t) => s + t.amount, 0))}` },
                    { label: "Expired Templates", val: templates.filter(t => t.status === "Expired").length },
                ].map(m => (
                    <Card key={m.label} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-2xl font-bold font-mono">{m.val}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <InteractiveSpreadsheet<RecurringTemplate>
                data={templates}
                columns={columns}
                onChange={() => { }}
                containerHeight="440px"
            />

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-primary" /> New Recurring Invoice Template
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="templateName" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Template Name *</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. AWS Monthly Invoice" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="supplierName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier Name *</FormLabel>
                                        <FormControl><Input {...field} placeholder="Supplier" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="supplierId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier # *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="SUP-XXXX" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="amount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount *</FormLabel>
                                        <FormControl><Input {...field} type="number" step="0.01" className="font-mono" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="currency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["USD", "EUR", "GBP", "AED", "JPY"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="glAccount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GL Account *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="01-000-6510-000" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="frequency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frequency *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["Weekly", "Monthly", "Quarterly", "Semi-Annual", "Annual"].map(f => (
                                                    <SelectItem key={f} value={f}>{f}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="occurrences" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of Occurrences</FormLabel>
                                        <FormControl><Input {...field} type="number" min="1" className="font-mono" placeholder="12" /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="startDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date *</FormLabel>
                                        <FormControl><Input {...field} type="date" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="endDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date *</FormLabel>
                                        <FormControl><Input {...field} type="date" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Template</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Generate Confirmation */}
            <AlertDialog open={!!generateConfirm} onOpenChange={() => setGenerateConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Generate Recurring Invoice</AlertDialogTitle>
                        <AlertDialogDescription>
                            Generate an AP invoice for <strong>{generateConfirm?.templateName}</strong> — {generateConfirm?.currency} {formatNumber(generateConfirm?.amount || 0)} from {generateConfirm?.supplierName}.
                            The invoice will be created in Draft status in the Invoice Workbench.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleGenerate}>Generate Invoice</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
