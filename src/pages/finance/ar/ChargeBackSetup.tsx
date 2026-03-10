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
import { Plus, RotateCcw, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface ChargeBack {
    id: string;
    chargeBackNumber: string;
    receiptRef: string;
    customerName: string;
    customerId: string;
    originalAmount: number;
    chargeBackAmount: number;
    currency: string;
    reason: string;
    glAccount: string;
    status: "Draft" | "Submitted" | "Posted" | "Closed";
    createdDate: string;
}

const MOCK_CHARGEBACKS: ChargeBack[] = [
    { id: "CB-001", chargeBackNumber: "CB-2026-001", receiptRef: "REC-2026-0892", customerName: "Acme Corp", customerId: "CUST-0042", originalAmount: 48000, chargeBackAmount: 3200, currency: "USD", reason: "Pricing dispute — overcharge on Item SKU-2291", glAccount: "01-000-1200-000", status: "Posted", createdDate: "2026-03-02" },
    { id: "CB-002", chargeBackNumber: "CB-2026-002", receiptRef: "REC-2026-0943", customerName: "Global Trading Ltd", customerId: "CUST-0178", originalAmount: 125000, chargeBackAmount: 8400, currency: "USD", reason: "Short payment — credit note not applied", glAccount: "01-000-1200-000", status: "Submitted", createdDate: "2026-03-05" },
    { id: "CB-003", chargeBackNumber: "CB-2026-003", receiptRef: "REC-2026-1021", customerName: "Pacific Retail Inc", customerId: "CUST-0205", originalAmount: 22500, chargeBackAmount: 950, currency: "USD", reason: "Damaged goods returned — partial credit applied", glAccount: "01-000-1200-000", status: "Draft", createdDate: "2026-03-07" },
];

const statusColors: Record<ChargeBack["status"], string> = {
    Draft: "secondary",
    Submitted: "outline",
    Posted: "default",
    Closed: "secondary",
};

const REASONS = [
    "Pricing dispute — overcharge",
    "Short payment — credit not applied",
    "Damaged goods — partial credit",
    "Duplicate payment received",
    "Wrong product shipped",
    "Service level breach",
    "Other (specify in note)",
];

const formSchema = z.object({
    receiptRef: z.string().min(1, "Receipt reference required"),
    customerName: z.string().min(1),
    customerId: z.string().min(1),
    originalAmount: z.string().min(1),
    chargeBackAmount: z.string().min(1, "Chargeback amount required"),
    currency: z.string().min(1),
    reason: z.string().min(1, "Reason required"),
    glAccount: z.string().min(1, "GL Account required"),
});

export default function ChargeBackSetup() {
    const { toast } = useToast();
    const [chargebacks, setChargebacks] = useState<ChargeBack[]>(MOCK_CHARGEBACKS);
    const [createOpen, setCreateOpen] = useState(false);
    const [postConfirm, setPostConfirm] = useState<ChargeBack | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { receiptRef: "", customerName: "", customerId: "", originalAmount: "", chargeBackAmount: "", currency: "USD", reason: "", glAccount: "01-000-1200-000" },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const newCB: ChargeBack = {
            id: `CB-${String(chargebacks.length + 1).padStart(3, "0")}`,
            chargeBackNumber: `CB-2026-${String(chargebacks.length + 1).padStart(3, "0")}`,
            receiptRef: values.receiptRef,
            customerName: values.customerName,
            customerId: values.customerId,
            currency: values.currency,
            reason: values.reason,
            glAccount: values.glAccount,
            originalAmount: parseFloat(values.originalAmount),
            chargeBackAmount: parseFloat(values.chargeBackAmount),
            status: "Draft",
            createdDate: new Date().toISOString().slice(0, 10),
        };
        setChargebacks(prev => [...prev, newCB]);
        form.reset();
        setCreateOpen(false);
        toast({ title: "Chargeback Created", description: `${newCB.chargeBackNumber} created. Submit for approval to post.` });
    };

    const handlePost = () => {
        if (!postConfirm) return;
        setChargebacks(prev => prev.map(cb => cb.id === postConfirm.id ? { ...cb, status: "Posted" } : cb));
        toast({
            title: "Chargeback Posted",
            description: `${postConfirm.chargeBackNumber} posted to GL. A new AR invoice for ${postConfirm.currency} ${formatNumber(postConfirm.chargeBackAmount)} has been created for ${postConfirm.customerName}.`,
        });
        setPostConfirm(null);
    };

    const columns: SpreadsheetColumn<ChargeBack>[] = useMemo(() => [
        { id: "chargeBackNumber", header: "CB Number", width: "140px", cellClassName: "font-mono text-sm font-medium", cell: (r) => r.chargeBackNumber },
        { id: "receiptRef", header: "Receipt Ref", width: "140px", cellClassName: "font-mono text-sm text-muted-foreground", cell: (r) => r.receiptRef },
        { id: "customerName", header: "Customer", width: "190px", cellClassName: "font-medium text-sm", cell: (r) => r.customerName },
        {
            id: "amounts", header: "CB Amount / Original", width: "210px",
            cell: (r) => (
                <div className="text-sm">
                    <span className="font-mono font-bold text-destructive">{r.currency} {formatNumber(r.chargeBackAmount)}</span>
                    <span className="text-muted-foreground ml-1 text-xs">/ {formatNumber(r.originalAmount)}</span>
                </div>
            ),
        },
        { id: "reason", header: "Reason", width: "230px", cellClassName: "text-xs text-muted-foreground", cell: (r) => r.reason },
        { id: "createdDate", header: "Created", width: "100px", cellClassName: "font-mono text-xs", cell: (r) => r.createdDate },
        { id: "status", header: "Status", width: "100px", cell: (r) => <Badge variant={statusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "Actions", width: "140px",
            cell: (r) => r.status === "Submitted" ? (
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setPostConfirm(r)}>
                    Post to GL
                </Button>
            ) : r.status === "Draft" ? (
                <Button size="sm" className="h-7 px-2 text-xs" onClick={() => {
                    setChargebacks(prev => prev.map(cb => cb.id === r.id ? { ...cb, status: "Submitted" } : cb));
                    toast({ title: "Submitted for Approval", description: r.chargeBackNumber });
                }}>
                    Submit
                </Button>
            ) : null,
        },
    ], [chargebacks]);

    return (
        <StandardPage
            title="Chargeback Workbench"
            description="Create chargebacks from disputed short-payment receipts. A chargeback creates a new AR invoice for the disputed amount and reduces the receipt application."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Receivable", href: "/finance/ar" },
                { label: "Chargeback Workbench" },
            ]}
            actions={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Chargeback
                </Button>
            }
        >
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                    { label: "Open Chargebacks", val: chargebacks.filter(c => c.status !== "Closed").length, color: "border-l-primary" },
                    { label: "Draft", val: chargebacks.filter(c => c.status === "Draft").length, color: "border-l-muted" },
                    { label: "Submitted", val: chargebacks.filter(c => c.status === "Submitted").length, color: "border-l-amber-400" },
                    { label: "Total CB Amount", val: `$${formatNumber(chargebacks.filter(c => c.status !== "Closed").reduce((s, c) => s + c.chargeBackAmount, 0))}`, color: "border-l-destructive" },
                ].map(m => (
                    <Card key={m.label} className={`border-l-4 ${m.color}`}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-2xl font-bold font-mono">{m.val}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <InteractiveSpreadsheet<ChargeBack>
                data={chargebacks}
                columns={columns}
                onChange={() => { }}
                containerHeight="400px"
            />

            <div className="mt-3 p-3 bg-muted/40 rounded text-xs text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <span><strong>Oracle Parity:</strong> A chargeback does not close the receipt — the original receipt remains applied, and a new AR invoice is created for the disputed amount. The customer must pay the chargeback invoice to settle the dispute.</span>
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5" /> Create Chargeback</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="receiptRef" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Receipt Reference *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="REC-2026-XXXX" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="customerId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer ID *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="CUST-XXXX" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="customerName" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Customer Name *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="originalAmount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Original Receipt Amount</FormLabel>
                                        <FormControl><Input {...field} type="number" step="0.01" className="font-mono" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="chargeBackAmount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Chargeback Amount *</FormLabel>
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
                                                {["USD", "EUR", "GBP", "AED"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="glAccount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GL Account *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="01-000-1200-000" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="reason" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Chargeback Reason *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select reason..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Chargeback</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Post Confirmation */}
            <AlertDialog open={!!postConfirm} onOpenChange={() => setPostConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Post Chargeback to GL</AlertDialogTitle>
                        <AlertDialogDescription>
                            Posting <strong>{postConfirm?.chargeBackNumber}</strong> will create a new AR invoice for <strong>{postConfirm?.currency} {formatNumber(postConfirm?.chargeBackAmount || 0)}</strong> against customer <strong>{postConfirm?.customerName}</strong> and generate the GL accounting entries. This action cannot be reversed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePost}>Post to GL</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
