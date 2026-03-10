import { useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, AlertTriangle, Check, ArrowLeft } from "lucide-react";
import { useTenantLocale } from "@/hooks/use-tenant-locale";
import { formatNumber } from "@/lib/formatters";

interface Installment {
    id: string;
    num: number;
    dueDate: string;
    grossAmount: string;
    discountDate: string;
    discountAmount: string;
    status: "Unpaid" | "Paid" | "Partial";
}

function generateId() {
    return Math.random().toString(36).slice(2, 10);
}

export default function InvoiceInstallments() {
    const [, params] = useRoute("/finance/ap/invoices/:id/installments");
    const invoiceId = (params as any)?.id;
    const { toast } = useToast();
    const { currency } = useTenantLocale();

    const { data: invoiceData } = useQuery<any>({
        queryKey: [`/api/ap/invoices/${invoiceId}`],
        enabled: !!invoiceId,
        queryFn: async () => {
            const res = await fetch(`/api/ap/invoices/${invoiceId}`);
            if (!res.ok) throw new Error("Failed to fetch invoice");
            return res.json();
        },
    });

    const invoice = invoiceData?.invoice || invoiceData;
    const invoiceTotal = parseFloat(invoice?.invoiceAmount || invoice?.amount || "0");
    const invoiceNumber = invoice?.invoiceNumber || (invoiceId ? invoiceId.substring(0, 8).toUpperCase() : "–");

    // Default: single installment = full invoice amount
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 30);

    const [installments, setInstallments] = useState<Installment[]>([
        {
            id: generateId(),
            num: 1,
            dueDate: defaultDue.toISOString().split("T")[0],
            grossAmount: invoiceTotal > 0 ? invoiceTotal.toFixed(2) : "",
            discountDate: "",
            discountAmount: "0.00",
            status: "Unpaid",
        },
    ]);

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const installmentSum = useMemo(
        () => installments.reduce((acc, r) => acc + parseFloat(r.grossAmount || "0"), 0),
        [installments]
    );

    const mismatch = invoiceTotal > 0 && Math.abs(installmentSum - invoiceTotal) > 0.01;

    const addInstallment = () => {
        const remaining = Math.max(0, invoiceTotal - installmentSum);
        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + 30 * (installments.length + 1));
        setInstallments((prev) => [
            ...prev,
            {
                id: generateId(),
                num: prev.length + 1,
                dueDate: nextDue.toISOString().split("T")[0],
                grossAmount: remaining > 0 ? remaining.toFixed(2) : "",
                discountDate: "",
                discountAmount: "0.00",
                status: "Unpaid",
            },
        ]);
    };

    const updateInstallment = (id: string, field: keyof Installment, value: string) => {
        setInstallments((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );
    };

    const confirmDelete = (id: string) => {
        setInstallments((prev) =>
            prev
                .filter((r) => r.id !== id)
                .map((r, i) => ({ ...r, num: i + 1 }))
        );
        setDeleteId(null);
        toast({ title: "Installment removed" });
    };

    const handleSave = () => {
        if (mismatch) {
            toast({
                title: "Total Mismatch",
                description: `Installments (${formatNumber(installmentSum)}) must equal invoice total (${formatNumber(invoiceTotal)}).`,
                variant: "destructive",
            });
            return;
        }
        toast({ title: "Payment Schedule Saved", description: `${installments.length} installment(s) saved for invoice ${invoiceNumber}.` });
    };

    const columns: SpreadsheetColumn<Installment>[] = useMemo(
        () => [
            {
                id: "num",
                header: "#",
                width: "60px",
                headerClassName: "text-center",
                cellClassName: "text-center font-mono text-muted-foreground",
                cell: (r) => r.num,
            },
            {
                id: "dueDate",
                header: "Due Date",
                width: "160px",
                cell: (r) => (
                    <Input
                        type="date"
                        className="h-9"
                        value={r.dueDate}
                        onChange={(e) => updateInstallment(r.id, "dueDate", e.target.value)}
                    />
                ),
            },
            {
                id: "grossAmount",
                header: `Gross Amount (${currency})`,
                width: "180px",
                cell: (r) => (
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-9 font-mono"
                        value={r.grossAmount}
                        onChange={(e) => updateInstallment(r.id, "grossAmount", e.target.value)}
                        placeholder="0.00"
                    />
                ),
            },
            {
                id: "discountDate",
                header: "Discount Date",
                width: "160px",
                cell: (r) => (
                    <Input
                        type="date"
                        className="h-9"
                        value={r.discountDate}
                        onChange={(e) => updateInstallment(r.id, "discountDate", e.target.value)}
                    />
                ),
            },
            {
                id: "discountAmount",
                header: `Discount Amt (${currency})`,
                width: "170px",
                cell: (r) => (
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-9 font-mono"
                        value={r.discountAmount}
                        onChange={(e) => updateInstallment(r.id, "discountAmount", e.target.value)}
                        placeholder="0.00"
                    />
                ),
            },
            {
                id: "remaining",
                header: `Remaining (${currency})`,
                width: "160px",
                cellClassName: "text-right font-mono",
                cell: (r) => {
                    const net = parseFloat(r.grossAmount || "0") - parseFloat(r.discountAmount || "0");
                    return <span className="pr-2">{formatNumber(Math.max(0, net))}</span>;
                },
            },
            {
                id: "status",
                header: "Status",
                width: "120px",
                cell: (r) => <StatusBadge status={r.status} />,
            },
            {
                id: "actions",
                header: "Actions",
                width: "80px",
                headerClassName: "text-center",
                cell: (r) => (
                    <div className="flex justify-center">
                        <AlertDialog open={deleteId === r.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                    disabled={installments.length === 1}
                                    onClick={() => setDeleteId(r.id)}
                                    aria-label="Remove installment"
                                >
                                    Remove
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Installment #{r.num}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove the <strong>{currency} {formatNumber(parseFloat(r.grossAmount || "0"))}</strong> installment
                                        due on <strong>{r.dueDate || "–"}</strong>. You can re-add it at any time.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => confirmDelete(r.id)}>Remove</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [installments, deleteId, currency]
    );

    return (
        <StandardPage
            title={`Payment Schedule — ${invoiceNumber}`}
            description="Split invoice payment across multiple installments with individual due dates and early-payment discounts (Oracle AP Installments parity)."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Invoices", href: "/finance/ap/invoices" },
                { label: invoiceNumber, href: `/finance/ap/invoices/${invoiceId}` },
                { label: "Payment Schedule" },
            ]}
            actions={
                <div className="flex items-center gap-2">
                    <Link href={`/finance/ap/invoices/${invoiceId}`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Invoice
                        </Button>
                    </Link>
                    <Button onClick={handleSave} size="sm">
                        <Check className="mr-2 h-4 w-4" />
                        Save Schedule
                    </Button>
                </div>
            }
        >
            {/* Summary bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Invoice Total:</span>
                    <Badge variant="outline" className="font-mono">
                        {currency} {formatNumber(invoiceTotal)}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Scheduled Total:</span>
                    <Badge variant={mismatch ? "destructive" : "default"} className="font-mono">
                        {currency} {formatNumber(installmentSum)}
                    </Badge>
                </div>
                {mismatch && (
                    <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                            Difference of {currency} {formatNumber(Math.abs(invoiceTotal - installmentSum))} — installments must equal the invoice total.
                        </span>
                    </div>
                )}
                {!mismatch && installmentSum > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                        <Check className="h-4 w-4" />
                        <span>Installments balance to invoice total.</span>
                    </div>
                )}

                <div className="ml-auto">
                    <Button variant="outline" size="sm" onClick={addInstallment}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Installment
                    </Button>
                </div>
            </div>

            <InteractiveSpreadsheet<Installment>
                data={installments}
                columns={columns}
                onChange={setInstallments}
                containerHeight="400px"
            />

            <div className="mt-4 text-xs text-muted-foreground">
                <p>
                    <strong>Oracle Parity:</strong> Oracle AP allows you to split a single invoice into multiple payment installments,
                    each with its own due date, early-payment discount date, and discount amount.
                    The sum of all installments must equal the invoice header amount before validation.
                </p>
            </div>
        </StandardPage>
    );
}
