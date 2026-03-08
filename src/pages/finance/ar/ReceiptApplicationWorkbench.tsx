import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type ReceiptStatus = "Unapplied" | "Partial" | "Applied" | "On-Account";
type AppType = "Invoice" | "On-Account" | "Write-Off" | "Deduction";

interface Receipt {
    id: string; receiptNumber: string; receiptDate: string;
    customerName: string; customerId: string; currency: string;
    receivedAmount: number; appliedAmount: number; remainingAmount: number;
    paymentMethod: string; status: ReceiptStatus;
}

const MOCK: Receipt[] = [
    { id: "R001", receiptNumber: "RCT-2026-0501", receiptDate: "2026-03-28", customerName: "Acme Corp", customerId: "C-0042", currency: "USD", receivedAmount: 45000, appliedAmount: 40000, remainingAmount: 5000, paymentMethod: "Wire", status: "Partial" },
    { id: "R002", receiptNumber: "RCT-2026-0502", receiptDate: "2026-03-29", customerName: "Global Tech Ltd", customerId: "C-0089", currency: "USD", receivedAmount: 22500, appliedAmount: 0, remainingAmount: 22500, paymentMethod: "ACH", status: "Unapplied" },
    { id: "R003", receiptNumber: "RCT-2026-0503", receiptDate: "2026-03-30", customerName: "Paris Consulting", customerId: "C-0134", currency: "EUR", receivedAmount: 8800, appliedAmount: 0, remainingAmount: 8800, paymentMethod: "SEPA", status: "Unapplied" },
    { id: "R004", receiptNumber: "RCT-2026-0499", receiptDate: "2026-03-25", customerName: "Gulf Ventures LLC", customerId: "C-0201", currency: "USD", receivedAmount: 15000, appliedAmount: 0, remainingAmount: 15000, paymentMethod: "Cheque", status: "On-Account" },
];

const OPEN_INVOICES: Record<string, { number: string; balance: number }[]> = {
    "C-0042": [{ number: "INV-10042", balance: 5000 }, { number: "INV-10088", balance: 12000 }],
    "C-0089": [{ number: "INV-10089", balance: 22500 }],
    "C-0134": [{ number: "INV-10134", balance: 9500 }],
    "C-0201": [{ number: "INV-10201", balance: 25000 }, { number: "INV-10202", balance: 8000 }],
};

const statusColors: Record<ReceiptStatus, string> = { Unapplied: "destructive", Partial: "outline", Applied: "default", "On-Account": "secondary" };

export default function ReceiptApplicationWorkbench() {
    const { toast } = useToast();
    const [receipts, setReceipts] = useState<Receipt[]>(MOCK);
    const [target, setTarget] = useState<Receipt | null>(null);
    const [appType, setAppType] = useState<AppType>("Invoice");
    const [invoice, setInvoice] = useState("");
    const [amount, setAmount] = useState("");
    const [confirming, setConfirming] = useState(false);

    const open = (r: Receipt) => { setTarget(r); setAppType("Invoice"); setInvoice(""); setAmount(String(r.remainingAmount)); };

    const handleApply = () => {
        if (!target) return;
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0 || amt > target.remainingAmount) {
            toast({ title: "Invalid Amount", variant: "destructive" }); return;
        }
        const remaining = target.remainingAmount - amt;
        const status: ReceiptStatus = remaining === 0 ? "Applied" : appType === "On-Account" ? "On-Account" : "Partial";
        setReceipts(prev => prev.map(r => r.id === target.id ? { ...r, appliedAmount: r.appliedAmount + amt, remainingAmount: remaining, status } : r));
        toast({ title: "Receipt Applied", description: `${target.receiptNumber}: ${target.currency} ${formatNumber(amt)} applied as ${appType}${invoice ? ` → ${invoice}` : ""}.` });
        setTarget(null); setConfirming(false);
    };

    const columns: SpreadsheetColumn<Receipt>[] = useMemo(() => [
        { id: "num", header: "Receipt #", width: "145px", cellClassName: "font-mono text-sm font-bold", cell: r => r.receiptNumber },
        { id: "date", header: "Date", width: "100px", cellClassName: "font-mono text-sm", cell: r => r.receiptDate },
        { id: "customer", header: "Customer", width: "180px", cellClassName: "font-medium text-sm", cell: r => r.customerName },
        { id: "method", header: "Method", width: "100px", cell: r => <Badge variant="outline">{r.paymentMethod}</Badge> },
        { id: "received", header: "Received", width: "130px", cellClassName: "text-right font-mono", cell: r => `${r.currency} ${formatNumber(r.receivedAmount)}` },
        { id: "applied", header: "Applied", width: "110px", cellClassName: "text-right font-mono text-green-600", cell: r => r.appliedAmount > 0 ? formatNumber(r.appliedAmount) : "—" },
        { id: "remaining", header: "Remaining", width: "110px", cellClassName: "text-right font-mono", cell: r => r.remainingAmount > 0 ? <span className="text-destructive font-bold">{formatNumber(r.remainingAmount)}</span> : <span className="text-muted-foreground">—</span> },
        { id: "status", header: "Status", width: "110px", cell: r => <Badge variant={statusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "", width: "110px",
            cell: r => ["Unapplied", "Partial", "On-Account"].includes(r.status)
                ? <Button size="sm" className="h-7 px-2 text-xs" onClick={() => open(r)}><ArrowRight className="mr-1 h-3 w-3" /> Apply</Button>
                : <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Done</span>,
        },
    ], []);

    return (
        <StandardPage
            title="Receipt Application Workbench"
            description="Apply unapplied and on-account cash receipts to open AR invoices, or classify as on-account credit, write-off, or deduction."
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Accounts Receivable", href: "/finance/ar" }, { label: "Receipt Application" }]}
        >
            {receipts.some(r => r.status === "Unapplied") && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <strong>{receipts.filter(r => r.status === "Unapplied").length} receipt(s) fully unapplied</strong> — apply to invoices or move to On-Account to clear the open receipt bucket.
                </div>
            )}
            <div className="grid grid-cols-4 gap-4 mb-4">
                {([["Unapplied", "border-l-destructive"], ["Partial", "border-l-amber-400"], ["On-Account", "border-l-secondary"], ["Applied", "border-l-green-500"]] as const).map(([status, color]) => (
                    <Card key={status} className={`border-l-4 ${color}`}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{status}</p>
                            <p className="text-2xl font-bold font-mono">{receipts.filter(r => r.status === status).length}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <InteractiveSpreadsheet<Receipt> data={receipts} columns={columns} onChange={() => { }} containerHeight="400px" />

            <Dialog open={!!target} onOpenChange={() => setTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Apply Receipt — {target?.receiptNumber}</DialogTitle>
                    </DialogHeader>
                    {target && (
                        <div className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 text-sm">
                                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{target.customerName}</p></div>
                                <div><p className="text-xs text-muted-foreground">Remaining</p><p className="font-bold font-mono text-destructive">{target.currency} {formatNumber(target.remainingAmount)}</p></div>
                            </div>
                            <div className="space-y-1">
                                <Label>Application Type *</Label>
                                <Select value={appType} onValueChange={v => { setAppType(v as AppType); setInvoice(""); }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Invoice">Apply to Invoice</SelectItem>
                                        <SelectItem value="On-Account">Move to On-Account</SelectItem>
                                        <SelectItem value="Write-Off">Write-Off</SelectItem>
                                        <SelectItem value="Deduction">Deduction / Dispute</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {appType === "Invoice" && (
                                <div className="space-y-1">
                                    <Label>Open Invoice *</Label>
                                    <Select value={invoice} onValueChange={setInvoice}>
                                        <SelectTrigger><SelectValue placeholder="Select invoice..." /></SelectTrigger>
                                        <SelectContent>
                                            {(OPEN_INVOICES[target.customerId] || []).map(inv => (
                                                <SelectItem key={inv.number} value={inv.number}>{inv.number} — Balance: {target.currency} {formatNumber(inv.balance)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-1">
                                <Label>Amount to Apply *</Label>
                                <Input type="number" step="0.01" max={target.remainingAmount} className="font-mono" value={amount} onChange={e => setAmount(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Max: {target.currency} {formatNumber(target.remainingAmount)}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
                        <Button onClick={() => setConfirming(true)} disabled={!amount || (appType === "Invoice" && !invoice)}>Apply</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirming} onOpenChange={() => setConfirming(false)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Receipt Application</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apply <strong>{target?.currency} {formatNumber(parseFloat(amount) || 0)}</strong> from <strong>{target?.receiptNumber}</strong>
                            {appType === "Invoice" && invoice ? ` to invoice ${invoice}` : ` as ${appType}`}.
                            This will update the AR subledger and GL clearing account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirming(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApply}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
