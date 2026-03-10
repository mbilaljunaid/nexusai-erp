import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, X, Plus, FileSearch } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type ExceptionStatus = "Unresolved" | "Force Matched" | "Written Off" | "Excluded" | "Receipt Created";
type ExceptionType = "No Match Found" | "Amount Mismatch" | "Date Mismatch" | "Duplicate" | "Unknown Originator";

interface BankStatementException {
    id: string;
    statementDate: string;
    bankRef: string;
    description: string;
    amount: number;
    currency: string;
    exceptionType: ExceptionType;
    status: ExceptionStatus;
    bankAccount: string;
}

const MOCK_EXCEPTIONS: BankStatementException[] = [
    { id: "EX-001", statementDate: "2026-03-31", bankRef: "TXN-29841", description: "BACS CREDIT UNKNOWN PAYER 44812", amount: 18450.00, currency: "USD", exceptionType: "Unknown Originator", status: "Unresolved", bankAccount: "Chase ****4821" },
    { id: "EX-002", statementDate: "2026-03-31", bankRef: "TXN-29842", description: "DEBIT AMAZON WEB SERVICES", amount: 12400.00, currency: "USD", exceptionType: "Amount Mismatch", status: "Unresolved", bankAccount: "Chase ****4821" },
    { id: "EX-003", statementDate: "2026-03-29", bankRef: "TXN-29655", description: "WIRE IN ACME CORP MARCH PAY", amount: 48000.00, currency: "USD", exceptionType: "No Match Found", status: "Receipt Created", bankAccount: "Chase ****4821" },
    { id: "EX-004", statementDate: "2026-03-28", bankRef: "TXN-29590", description: "CHAPS GLOBAL TRADE LTD INV-2026-0891", amount: 125000.00, currency: "GBP", exceptionType: "Date Mismatch", status: "Force Matched", bankAccount: "HSBC ****7732" },
    { id: "EX-005", statementDate: "2026-03-27", bankRef: "TXN-29521", description: "CREDIT OFFICE SOLUTIONS", amount: 2340.00, currency: "USD", exceptionType: "Duplicate", status: "Excluded", bankAccount: "Chase ****4821" },
];

const exceptionTypeColors: Record<ExceptionType, string> = {
    "No Match Found": "destructive",
    "Amount Mismatch": "outline",
    "Date Mismatch": "outline",
    "Duplicate": "secondary",
    "Unknown Originator": "destructive",
};

const statusColors: Record<ExceptionStatus, string> = {
    Unresolved: "destructive",
    "Force Matched": "default",
    "Written Off": "secondary",
    Excluded: "secondary",
    "Receipt Created": "default",
};

export default function BankStatementExceptions() {
    const { toast } = useToast();
    const [exceptions, setExceptions] = useState<BankStatementException[]>(MOCK_EXCEPTIONS);
    const [actionTarget, setActionTarget] = useState<{ ex: BankStatementException; action: ExceptionStatus } | null>(null);

    const handleResolve = () => {
        if (!actionTarget) return;
        setExceptions(prev => prev.map(e => e.id === actionTarget.ex.id ? { ...e, status: actionTarget.action } : e));
        const messages: Record<ExceptionStatus, string> = {
            "Force Matched": "Force matched to nearest system transaction. Journal created.",
            "Written Off": "Written off as bank charge. Expense account debited.",
            Excluded: "Line excluded from reconciliation. No accounting impact.",
            "Receipt Created": "AR receipt created for this line.",
            "Unresolved": "",
        };
        toast({
            title: `Exception ${actionTarget.action}`,
            description: messages[actionTarget.action],
        });
        setActionTarget(null);
    };

    const unresolvedCount = exceptions.filter(e => e.status === "Unresolved").length;

    const columns: SpreadsheetColumn<BankStatementException>[] = useMemo(() => [
        { id: "statementDate", header: "Date", width: "100px", cellClassName: "font-mono text-sm", cell: (r) => r.statementDate },
        { id: "bankRef", header: "Bank Ref", width: "110px", cellClassName: "font-mono text-xs text-muted-foreground", cell: (r) => r.bankRef },
        { id: "description", header: "Description", width: "250px", cellClassName: "text-sm", cell: (r) => r.description },
        { id: "amount", header: "Amount", width: "130px", cellClassName: "text-right font-mono font-medium", cell: (r) => `${r.currency} ${formatNumber(r.amount)}` },
        { id: "bankAccount", header: "Bank Account", width: "150px", cellClassName: "font-mono text-xs", cell: (r) => r.bankAccount },
        { id: "exceptionType", header: "Exception", width: "170px", cell: (r) => <Badge variant={exceptionTypeColors[r.exceptionType] as any} className="text-xs">{r.exceptionType}</Badge> },
        { id: "status", header: "Status", width: "140px", cell: (r) => <Badge variant={statusColors[r.status] as any} className="text-xs">{r.status}</Badge> },
        {
            id: "actions", header: "Actions", width: "260px",
            cell: (r) => r.status === "Unresolved" ? (
                <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setActionTarget({ ex: r, action: "Force Matched" })}>Force Match</Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setActionTarget({ ex: r, action: "Receipt Created" })}>Create Receipt</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground" onClick={() => setActionTarget({ ex: r, action: "Excluded" })}>Exclude</Button>
                </div>
            ) : null,
        },
    ], []);

    return (
        <StandardPage
            title="Bank Statement Line Exceptions"
            description="Review bank statement lines that could not be automatically matched during the reconciliation process. Resolve exceptions by force-matching, creating receipts, writing off, or excluding."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Cash Management", href: "/finance/cash" },
                { label: "Bank Statement Exceptions" },
            ]}
        >
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                    { label: "Unresolved", val: unresolvedCount, color: "border-l-destructive" },
                    { label: "Force Matched", val: exceptions.filter(e => e.status === "Force Matched").length, color: "border-l-primary" },
                    { label: "Receipts Created", val: exceptions.filter(e => e.status === "Receipt Created").length, color: "border-l-green-500" },
                    { label: "Excluded / Written Off", val: exceptions.filter(e => ["Excluded", "Written Off"].includes(e.status)).length, color: "border-l-muted" },
                ].map(m => (
                    <Card key={m.label} className={`border-l-4 ${m.color}`}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className={`text-2xl font-bold font-mono ${m.label === "Unresolved" && unresolvedCount > 0 ? "text-destructive" : ""}`}>{m.val}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {unresolvedCount === 0 && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    All bank statement lines have been resolved. Reconciliation is complete.
                </div>
            )}

            <InteractiveSpreadsheet<BankStatementException>
                data={exceptions}
                columns={columns}
                onChange={() => { }}
                containerHeight="440px"
            />

            {/* Resolve Confirmation */}
            <AlertDialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm: {actionTarget?.action}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionTarget?.action === "Force Matched" && (
                                <>Force matching <strong>{actionTarget.ex.bankRef}</strong> ({actionTarget.ex.currency} {formatNumber(actionTarget.ex.amount)}) to the nearest unreconciled system transaction. A reconciliation journal will be created for any difference.</>
                            )}
                            {actionTarget?.action === "Receipt Created" && (
                                <>Creating an AR receipt for <strong>{actionTarget.ex.currency} {formatNumber(actionTarget.ex.amount)}</strong> from bank ref <strong>{actionTarget.ex.bankRef}</strong>. The receipt will be in Unidentified status until applied to a customer invoice.</>
                            )}
                            {actionTarget?.action === "Excluded" && (
                                <>Excluding <strong>{actionTarget.ex.bankRef}</strong> from reconciliation. This line will be hidden from future reconciliation runs. No accounting entry will be generated.</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResolve}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
