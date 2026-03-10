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
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type MemoType = "Credit Memo" | "Debit Memo";
type MemoStatus = "Draft" | "Pending Approval" | "Approved" | "Posted" | "Voided";

interface MemoLine {
    lineNum: number;
    description: string;
    reasonCode: string;
    unitPrice: number;
    quantity: number;
    taxCode: string;
    amount: number;
}

interface Memo {
    id: string;
    memoNumber: string;
    memoType: MemoType;
    customerId: string;
    customerName: string;
    relatedInvoice: string;
    memoDate: string;
    accountingDate: string;
    currency: string;
    totalAmount: number;
    glAccount: string;
    status: MemoStatus;
    lines: MemoLine[];
    notes: string;
}

const REASON_CODES = [
    "Damaged Goods", "Billing Error", "Quantity Dispute", "Price Dispute",
    "Duplicate Invoice", "Early Payment Discount", "Returned Goods",
    "Service Level Credit", "Contractual Adjustment", "Freight Allowance",
];

const MOCK_MEMOS: Memo[] = [
    {
        id: "M001", memoNumber: "CM-2026-0041", memoType: "Credit Memo", customerId: "C-0042", customerName: "Acme Corp",
        relatedInvoice: "INV-10042", memoDate: "2026-03-15", accountingDate: "2026-03-15", currency: "USD",
        totalAmount: 1250.00, glAccount: "01-000-4100-000", status: "Posted",
        lines: [{ lineNum: 1, description: "Damaged goods returned per RMA-220", reasonCode: "Damaged Goods", unitPrice: 1250, quantity: 1, taxCode: "STANDARD", amount: 1250 }],
        notes: "Customer received damaged pallet #220",
    },
    {
        id: "M002", memoNumber: "DM-2026-0012", memoType: "Debit Memo", customerId: "C-0089", customerName: "Global Tech Ltd",
        relatedInvoice: "INV-10089", memoDate: "2026-03-22", accountingDate: "2026-03-22", currency: "USD",
        totalAmount: 450.00, glAccount: "01-000-4100-000", status: "Pending Approval",
        lines: [{ lineNum: 1, description: "Additional freight not billed on original invoice", reasonCode: "Freight Allowance", unitPrice: 450, quantity: 1, taxCode: "ZERO", amount: 450 }],
        notes: "Freight surcharge applied per rate schedule",
    },
    {
        id: "M003", memoNumber: "CM-2026-0042", memoType: "Credit Memo", customerId: "C-0134", customerName: "Paris Consulting SARL",
        relatedInvoice: "INV-10134", memoDate: "2026-03-28", accountingDate: "2026-03-28", currency: "EUR",
        totalAmount: 880.00, glAccount: "01-000-4100-000", status: "Draft",
        lines: [{ lineNum: 1, description: "Billing error — quantity overccharged by 2", reasonCode: "Billing Error", unitPrice: 440, quantity: 2, taxCode: "STANDARD", amount: 880 }],
        notes: "",
    },
];

const memoStatusColors: Record<MemoStatus, string> = { Draft: "secondary", "Pending Approval": "outline", Approved: "default", Posted: "default", Voided: "destructive" };
const memoTypeColors: Record<MemoType, string> = { "Credit Memo": "default", "Debit Memo": "secondary" };

const lineSchema = z.object({
    description: z.string().min(1),
    reasonCode: z.string().min(1, "Reason code required"),
    unitPrice: z.string().min(1),
    quantity: z.string().min(1),
    taxCode: z.string().min(1),
});

const formSchema = z.object({
    memoType: z.enum(["Credit Memo", "Debit Memo"]),
    customerName: z.string().min(1),
    customerId: z.string().min(1),
    relatedInvoice: z.string().min(1),
    memoDate: z.string().min(1),
    accountingDate: z.string().min(1),
    currency: z.string().default("USD"),
    glAccount: z.string().min(1),
    notes: z.string().optional(),
    lineDescription: z.string().min(1),
    lineReasonCode: z.string().min(1, "Reason code required"),
    lineUnitPrice: z.string().min(1),
    lineQuantity: z.string().default("1"),
    lineTaxCode: z.string().default("STANDARD"),
});

export default function CreditDebitMemoWorkbench() {
    const { toast } = useToast();
    const [memos, setMemos] = useState<Memo[]>(MOCK_MEMOS);
    const [createOpen, setCreateOpen] = useState(false);
    const [postConfirm, setPostConfirm] = useState<Memo | null>(null);
    const [selectedTab, setSelectedTab] = useState<"all" | "credit" | "debit">("all");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            memoType: "Credit Memo", customerName: "", customerId: "", relatedInvoice: "",
            memoDate: new Date().toISOString().slice(0, 10), accountingDate: new Date().toISOString().slice(0, 10),
            currency: "USD", glAccount: "", notes: "",
            lineDescription: "", lineReasonCode: "", lineUnitPrice: "", lineQuantity: "1", lineTaxCode: "STANDARD",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const unitPrice = parseFloat(values.lineUnitPrice);
        const qty = parseFloat(values.lineQuantity);
        const total = unitPrice * qty;
        const prefix = values.memoType === "Credit Memo" ? "CM" : "DM";
        const newMemo: Memo = {
            id: `M${String(memos.length + 1).padStart(3, "0")}`,
            memoNumber: `${prefix}-2026-${String(memos.length + 1).padStart(4, "0")}`,
            memoType: values.memoType,
            customerId: values.customerId,
            customerName: values.customerName,
            relatedInvoice: values.relatedInvoice,
            memoDate: values.memoDate,
            accountingDate: values.accountingDate,
            currency: values.currency,
            totalAmount: total,
            glAccount: values.glAccount,
            status: "Draft",
            lines: [{
                lineNum: 1,
                description: values.lineDescription,
                reasonCode: values.lineReasonCode,
                unitPrice,
                quantity: qty,
                taxCode: values.lineTaxCode,
                amount: total,
            }],
            notes: values.notes || "",
        };
        setMemos(prev => [newMemo, ...prev]);
        form.reset();
        setCreateOpen(false);
        toast({ title: `${values.memoType} Created`, description: `${newMemo.memoNumber} — ${newMemo.currency} ${formatNumber(total)} against ${newMemo.relatedInvoice}` });
    };

    const handlePost = () => {
        if (!postConfirm) return;
        setMemos(prev => prev.map(m => m.id === postConfirm.id ? { ...m, status: "Posted" } : m));
        toast({ title: `${postConfirm.memoType} Posted to GL`, description: `${postConfirm.memoNumber} — ${postConfirm.currency} ${formatNumber(postConfirm.totalAmount)} posted to AR + GL.` });
        setPostConfirm(null);
    };

    const filteredMemos = memos.filter(m =>
        selectedTab === "all" ? true : selectedTab === "credit" ? m.memoType === "Credit Memo" : m.memoType === "Debit Memo"
    );

    const columns: SpreadsheetColumn<Memo>[] = useMemo(() => [
        { id: "memoNumber", header: "Memo #", width: "150px", cellClassName: "font-mono text-sm font-bold", cell: r => r.memoNumber },
        { id: "memoType", header: "Type", width: "120px", cell: r => <Badge variant={memoTypeColors[r.memoType] as any}>{r.memoType}</Badge> },
        { id: "customerName", header: "Customer", width: "180px", cellClassName: "font-medium text-sm", cell: r => r.customerName },
        { id: "relatedInvoice", header: "Related Invoice", width: "140px", cellClassName: "font-mono text-sm text-muted-foreground", cell: r => r.relatedInvoice },
        { id: "memoDate", header: "Date", width: "100px", cellClassName: "font-mono text-sm", cell: r => r.memoDate },
        {
            id: "totalAmount", header: "Amount", width: "130px", cellClassName: "text-right font-mono font-bold",
            cell: r => <span className={r.memoType === "Credit Memo" ? "text-green-600" : "text-destructive"}>{r.currency} {formatNumber(r.totalAmount)}</span>,
        },
        { id: "reasonCode", header: "Reason", width: "160px", cellClassName: "text-xs text-muted-foreground", cell: r => r.lines[0]?.reasonCode || "—" },
        { id: "status", header: "Status", width: "120px", cell: r => <Badge variant={memoStatusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "Actions", width: "130px",
            cell: r => r.status === "Draft" || r.status === "Approved" ? (
                <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setPostConfirm(r)}>Post to GL</Button>
            ) : null,
        },
    ], []);

    return (
        <StandardPage
            title="Credit / Debit Memo Workbench"
            description="Create and manage credit memos (reduce customer balance) and debit memos (increase customer balance) with memo line reason codes. Memos post to AR and GL simultaneously."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Receivable", href: "/finance/ar" },
                { label: "Credit / Debit Memos" },
            ]}
            actions={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Memo
                </Button>
            }
        >
            <div className="mb-3 p-2.5 bg-muted/30 rounded-lg text-xs text-muted-foreground flex items-start gap-2">
                <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <span><strong>Oracle AR Parity:</strong> Credit Memos reduce the customer's balance (e.g., returns, billing errors). Debit Memos increase the customer's balance (e.g., underbilling, freight). Both types require a memo line reason code for GL classification and audit trail.</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                    { label: "Credit Memos (Posted)", val: memos.filter(m => m.memoType === "Credit Memo" && m.status === "Posted").length, color: "border-l-green-500" },
                    { label: "Debit Memos (Posted)", val: memos.filter(m => m.memoType === "Debit Memo" && m.status === "Posted").length, color: "border-l-destructive" },
                    { label: "Draft / Pending", val: memos.filter(m => ["Draft", "Pending Approval"].includes(m.status)).length, color: "border-l-amber-400" },
                ].map(m => (
                    <Card key={m.label} className={`border-l-4 ${m.color}`}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-2xl font-bold font-mono">{m.val}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={selectedTab} onValueChange={v => setSelectedTab(v as typeof selectedTab)} className="mb-3">
                <TabsList>
                    <TabsTrigger value="all">All ({memos.length})</TabsTrigger>
                    <TabsTrigger value="credit">Credit Memos ({memos.filter(m => m.memoType === "Credit Memo").length})</TabsTrigger>
                    <TabsTrigger value="debit">Debit Memos ({memos.filter(m => m.memoType === "Debit Memo").length})</TabsTrigger>
                </TabsList>
            </Tabs>

            <InteractiveSpreadsheet<Memo>
                data={filteredMemos}
                columns={columns}
                onChange={() => { }}
                containerHeight="380px"
            />

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> New Credit / Debit Memo</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="memoType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Memo Type *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Credit Memo">Credit Memo (reduce balance)</SelectItem>
                                                <SelectItem value="Debit Memo">Debit Memo (increase balance)</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                <FormField control={form.control} name="customerName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="customerId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer # *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="C-XXXX" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="relatedInvoice" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Related Invoice # *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="INV-XXXXX" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="glAccount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GL Account *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="01-000-4100-000" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="memoDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Memo Date *</FormLabel>
                                        <FormControl><Input {...field} type="date" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="accountingDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Accounting Date *</FormLabel>
                                        <FormControl><Input {...field} type="date" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            {/* Line Section */}
                            <div className="border rounded-lg p-3 bg-muted/20 space-y-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Memo Line 1</p>
                                <FormField control={form.control} name="lineDescription" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. Damaged goods returned per RMA-220" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="grid grid-cols-3 gap-3">
                                    <FormField control={form.control} name="lineReasonCode" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reason Code *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {REASON_CODES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="lineUnitPrice" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit Price *</FormLabel>
                                            <FormControl><Input {...field} type="number" step="0.01" className="font-mono" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="lineQuantity" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl><Input {...field} type="number" step="1" className="font-mono" /></FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="lineTaxCode" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tax Code</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["STANDARD", "ZERO", "EXEMPT", "REDUCED"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="notes" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl><Textarea {...field} rows={2} /></FormControl>
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                                <Button type="submit">Create Memo</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Post Confirm */}
            <AlertDialog open={!!postConfirm} onOpenChange={() => setPostConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Post {postConfirm?.memoType} to GL</AlertDialogTitle>
                        <AlertDialogDescription>
                            Posting <strong>{postConfirm?.memoNumber}</strong> ({postConfirm?.currency} {formatNumber(postConfirm?.totalAmount || 0)}) for customer <strong>{postConfirm?.customerName}</strong>.
                            {postConfirm?.memoType === "Credit Memo"
                                ? " This will create a debit to the AR control account and a credit to the specified GL account, reducing the customer's balance."
                                : " This will create a credit to the AR control account and a debit to the specified GL account, increasing the customer's balance."
                            }
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
