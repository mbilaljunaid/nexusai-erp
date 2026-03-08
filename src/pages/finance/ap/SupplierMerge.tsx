import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription
} from "@/components/ui/form";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, ArrowRightLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface Supplier {
    id: string;
    supplierNumber: string;
    supplierName: string;
    taxRegistrationNumber?: string;
    outstandingBalance: number;
    invoiceCount: number;
    paymentCount: number;
    status: "Active" | "Inactive" | "Merged";
}

const MOCK_SUPPLIERS: Supplier[] = [
    { id: "S-001", supplierNumber: "SUP-00042", supplierName: "Techline Solutions Inc.", taxRegistrationNumber: "TRN-123-456", outstandingBalance: 48200, invoiceCount: 34, paymentCount: 29, status: "Active" },
    { id: "S-002", supplierNumber: "SUP-00043", supplierName: "TechLine Solutions", taxRegistrationNumber: "TRN-123-456", outstandingBalance: 6800, invoiceCount: 5, paymentCount: 3, status: "Active" },
    { id: "S-003", supplierNumber: "SUP-00087", supplierName: "Global Services Ltd", outstandingBalance: 124500, invoiceCount: 67, paymentCount: 61, status: "Active" },
    { id: "S-004", supplierNumber: "SUP-00088", supplierName: "Global Services Ltd (Old)", outstandingBalance: 0, invoiceCount: 12, paymentCount: 12, status: "Active" },
    { id: "S-005", supplierNumber: "SUP-00110", supplierName: "Office Depot UK", outstandingBalance: 3200, invoiceCount: 201, paymentCount: 198, status: "Active" },
];

const mergeSchema = z.object({
    fromSupplierId: z.string().min(1, "Source supplier required"),
    toSupplierId: z.string().min(1, "Target supplier required"),
    mergeTransactions: z.boolean().default(true),
    mergeContacts: z.boolean().default(true),
    mergeAddresses: z.boolean().default(true),
    inactivateSource: z.boolean().default(true),
    mergeReason: z.string().min(1, "Reason is required"),
}).refine(v => v.fromSupplierId !== v.toSupplierId, {
    message: "Source and target suppliers must be different",
    path: ["toSupplierId"],
});

export default function SupplierMerge() {
    const { toast } = useToast();
    const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
    const [mergeOpen, setMergeOpen] = useState(false);
    const [mergePreview, setMergePreview] = useState<{ from: Supplier, to: Supplier } | null>(null);
    const [confirmMerge, setConfirmMerge] = useState(false);

    const form = useForm<z.infer<typeof mergeSchema>>({
        resolver: zodResolver(mergeSchema),
        defaultValues: {
            fromSupplierId: "", toSupplierId: "", mergeTransactions: true, mergeContacts: true,
            mergeAddresses: true, inactivateSource: true, mergeReason: ""
        },
    });

    const fromSupplier = suppliers.find(s => s.id === form.watch("fromSupplierId"));
    const toSupplier = suppliers.find(s => s.id === form.watch("toSupplierId"));

    const onPreview = () => {
        if (!fromSupplier || !toSupplier) { toast({ title: "Select both suppliers", variant: "destructive" }); return; }
        setMergePreview({ from: fromSupplier, to: toSupplier });
        setConfirmMerge(true);
    };

    const onConfirmedMerge = (values: z.infer<typeof mergeSchema>) => {
        setSuppliers(prev => prev.map(s => {
            if (s.id === values.fromSupplierId) return { ...s, status: "Merged" as const };
            if (s.id === values.toSupplierId) return {
                ...s,
                invoiceCount: s.invoiceCount + (fromSupplier?.invoiceCount || 0),
                paymentCount: s.paymentCount + (fromSupplier?.paymentCount || 0),
                outstandingBalance: s.outstandingBalance + (fromSupplier?.outstandingBalance || 0),
            };
            return s;
        }));
        form.reset();
        setMergeOpen(false);
        setConfirmMerge(false);
        setMergePreview(null);
        toast({
            title: "Supplier Merge Complete",
            description: `${mergePreview?.from.supplierName} has been merged into ${mergePreview?.to.supplierName}. Source supplier inactivated.`,
        });
    };

    const columns: SpreadsheetColumn<Supplier>[] = useMemo(() => [
        { id: "supplierNumber", header: "Supplier #", width: "120px", cellClassName: "font-mono text-sm font-medium", cell: (r) => r.supplierNumber },
        { id: "supplierName", header: "Supplier Name", width: "240px", cellClassName: "font-medium", cell: (r) => r.supplierName },
        { id: "taxRegistrationNumber", header: "Tax Reg. #", width: "150px", cellClassName: "font-mono text-sm text-muted-foreground", cell: (r) => r.taxRegistrationNumber || "—" },
        { id: "outstandingBalance", header: "Outstanding Balance", width: "160px", cellClassName: "text-right font-mono", cell: (r) => formatNumber(r.outstandingBalance) },
        { id: "invoiceCount", header: "Invoices", width: "90px", cellClassName: "text-center", cell: (r) => r.invoiceCount },
        {
            id: "status", header: "Status", width: "120px",
            cell: (r) => (
                <Badge variant={r.status === "Active" ? "default" : r.status === "Merged" ? "secondary" : "outline"}>
                    {r.status === "Merged" && <ArrowRightLeft className="mr-1 h-3 w-3" />}
                    {r.status}
                </Badge>
            ),
        },
    ], []);

    const duplicatePairs = useMemo(() => {
        const pairs: { a: Supplier, b: Supplier }[] = [];
        for (let i = 0; i < suppliers.length; i++) {
            for (let j = i + 1; j < suppliers.length; j++) {
                const sa = suppliers[i], sb = suppliers[j];
                if (sa.status !== "Active" || sb.status !== "Active") continue;
                const sameVAT = sa.taxRegistrationNumber && sa.taxRegistrationNumber === sb.taxRegistrationNumber;
                const similarName = sa.supplierName.toLowerCase().includes(sb.supplierName.toLowerCase().slice(0, 10)) ||
                    sb.supplierName.toLowerCase().includes(sa.supplierName.toLowerCase().slice(0, 10));
                if (sameVAT || similarName) pairs.push({ a: sa, b: sb });
            }
        }
        return pairs;
    }, [suppliers]);

    return (
        <StandardPage
            title="Supplier Merge"
            description="Identify and merge duplicate supplier records. Consolidates transaction history, contacts, and addresses from the source (duplicate) supplier into the master supplier."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Supplier Merge" },
            ]}
            actions={
                <Button size="sm" onClick={() => setMergeOpen(true)}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Merge Suppliers
                </Button>
            }
        >
            {/* Duplicate Detection Banner */}
            {duplicatePairs.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200 rounded-lg flex items-start gap-3 text-sm text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium">Potential duplicates detected</p>
                        <p>The system found {duplicatePairs.length} potential duplicate supplier pair(s) based on matching VAT/Tax Registration Numbers or similar names:</p>
                        <ul className="list-disc ml-4 mt-1 space-y-0.5">
                            {duplicatePairs.map((p, i) => (
                                <li key={i}><strong>{p.a.supplierName}</strong> → <strong>{p.b.supplierName}</strong></li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <InteractiveSpreadsheet<Supplier>
                data={suppliers}
                columns={columns}
                onChange={() => { }}
                containerHeight="460px"
            />

            {/* Merge Wizard Dialog */}
            <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5 text-primary" /> Supplier Merge Wizard
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onPreview)} className="space-y-4 py-2">
                            <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground">
                                Select the <strong>source (duplicate)</strong> supplier and the <strong>target (master)</strong> supplier. All transactions, contacts, and addresses will be moved from source to target. The source will be inactivated.
                            </div>
                            <FormField control={form.control} name="fromSupplierId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source Supplier (Duplicate to Remove) *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select source..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {suppliers.filter(s => s.status === "Active").map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.supplierNumber} — {s.supplierName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="toSupplierId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Supplier (Master Record) *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select target..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {suppliers.filter(s => s.status === "Active").map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.supplierNumber} — {s.supplierName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                {(["mergeTransactions", "mergeContacts", "mergeAddresses", "inactivateSource"] as const).map(fieldName => (
                                    <FormField key={fieldName} control={form.control} name={fieldName} render={({ field }) => (
                                        <FormItem className="flex items-center gap-3 rounded-lg border p-3">
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel className="cursor-pointer !mt-0 text-sm">
                                                {fieldName === "mergeTransactions" && "Transfer Transactions"}
                                                {fieldName === "mergeContacts" && "Transfer Contacts"}
                                                {fieldName === "mergeAddresses" && "Transfer Addresses"}
                                                {fieldName === "inactivateSource" && "Inactivate Source"}
                                            </FormLabel>
                                        </FormItem>
                                    )} />
                                ))}
                            </div>
                            <FormField control={form.control} name="mergeReason" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Merge Reason *</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g. Duplicate name — same VAT registration" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit">Preview Merge</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Confirm Merge */}
            <AlertDialog open={confirmMerge} onOpenChange={setConfirmMerge}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Supplier Merge</AlertDialogTitle>
                        <AlertDialogDescription>
                            <p>Merging <strong>{mergePreview?.from.supplierName}</strong> ({mergePreview?.from.supplierNumber}) INTO <strong>{mergePreview?.to.supplierName}</strong> ({mergePreview?.to.supplierNumber}).</p>
                            <ul className="mt-2 list-disc ml-4 space-y-1 text-sm">
                                <li>{mergePreview?.from.invoiceCount} invoices and {mergePreview?.from.paymentCount} payments transferred</li>
                                <li>Outstanding balance of {formatNumber(mergePreview?.from.outstandingBalance || 0)} moved to master</li>
                                <li>Source supplier will be inactivated</li>
                            </ul>
                            <p className="mt-2 font-medium text-destructive">⚠️ This action cannot be reversed. Ensure backup prior to merge.</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => form.handleSubmit(onConfirmedMerge)()}>
                            Confirm Merge
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
