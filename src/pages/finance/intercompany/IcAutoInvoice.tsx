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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type ICBatchStatus = "Draft" | "Approved" | "Posted" | "AR/AP Generated";

interface ICBatch {
    id: string;
    description: string;
    sellerEntityId: string;
    buyerEntityId: string;
    amount: number;
    currency: string;
    transactionDate: string;
    status: ICBatchStatus;
    arInvoiceRef?: string;
    apInvoiceRef?: string;
}

const MOCK_BATCHES: ICBatch[] = [
    { id: "IC-2026-001", description: "Management fee — HQ to EMEA Q1", sellerEntityId: "LE-001 (Parent HQ)", buyerEntityId: "LE-002 (EMEA Ltd)", amount: 125000, currency: "USD", transactionDate: "2026-03-31", status: "Posted" },
    { id: "IC-2026-002", description: "IT infrastructure recharge — HQ to APAC", sellerEntityId: "LE-001 (Parent HQ)", buyerEntityId: "LE-003 (APAC Pte Ltd)", amount: 48500, currency: "USD", transactionDate: "2026-03-31", status: "Posted" },
    { id: "IC-2026-003", description: "Intercompany inventory transfer", sellerEntityId: "LE-002 (EMEA Ltd)", buyerEntityId: "LE-003 (APAC Pte Ltd)", amount: 87200, currency: "EUR", transactionDate: "2026-03-15", status: "AR/AP Generated", arInvoiceRef: "ARINV-2026-891", apInvoiceRef: "APINV-2026-491" },
    { id: "IC-2026-004", description: "Royalty — IP licensing HQ to subsidiaries", sellerEntityId: "LE-001 (Parent HQ)", buyerEntityId: "LE-002 (EMEA Ltd)", amount: 32000, currency: "USD", transactionDate: "2026-02-28", status: "Approved" },
];

const statusColors: Record<ICBatchStatus, string> = {
    "Draft": "secondary",
    "Approved": "outline",
    "Posted": "default",
    "AR/AP Generated": "default",
};

export default function IcAutoInvoice() {
    const { toast } = useToast();
    const [batches, setBatches] = useState<ICBatch[]>(MOCK_BATCHES);
    const [selectedBatch, setSelectedBatch] = useState<ICBatch | null>(null);
    const [confirmGenerate, setConfirmGenerate] = useState(false);
    const [eligibleBatch, setEligibleBatch] = useState<ICBatch | null>(null);

    const handleGenerateInvoices = () => {
        if (!eligibleBatch) return;
        setBatches(prev => prev.map(b => b.id === eligibleBatch.id ? {
            ...b,
            status: "AR/AP Generated" as ICBatchStatus,
            arInvoiceRef: `ARINV-2026-${900 + Math.floor(Math.random() * 99)}`,
            apInvoiceRef: `APINV-2026-${500 + Math.floor(Math.random() * 99)}`,
        } : b));
        setConfirmGenerate(false);
        setEligibleBatch(null);
        toast({
            title: "AR/AP Invoices Generated",
            description: `IC batch ${eligibleBatch.id} → AR invoice created in "${eligibleBatch.sellerEntityId}", AP invoice created in "${eligibleBatch.buyerEntityId}".`,
        });
    };

    const columns: SpreadsheetColumn<ICBatch>[] = useMemo(() => [
        { id: "id", header: "IC Batch", width: "130px", cellClassName: "font-mono text-sm font-medium", cell: (r) => r.id },
        { id: "description", header: "Description", width: "260px", cellClassName: "text-sm", cell: (r) => r.description },
        {
            id: "flow", header: "Seller → Buyer", width: "300px",
            cell: (r) => (
                <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium">{r.sellerEntityId}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="font-medium">{r.buyerEntityId}</span>
                </div>
            ),
        },
        {
            id: "amount", header: "Amount", width: "130px",
            cellClassName: "text-right font-mono font-medium",
            cell: (r) => <>{r.currency} {formatNumber(r.amount)}</>,
        },
        {
            id: "status", header: "Status", width: "160px",
            cell: (r) => (
                <Badge variant={statusColors[r.status] as any}>
                    {r.status === "AR/AP Generated" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {r.status}
                </Badge>
            ),
        },
        {
            id: "invoiceRefs", header: "AR / AP Ref", width: "250px",
            cellClassName: "font-mono text-xs text-muted-foreground",
            cell: (r) => r.arInvoiceRef ? `${r.arInvoiceRef} / ${r.apInvoiceRef}` : "—",
        },
        {
            id: "actions", header: "Actions", width: "200px",
            cell: (r) => r.status === "Posted" ? (
                <Button
                    size="sm"
                    className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                    onClick={() => { setEligibleBatch(r); setConfirmGenerate(true); }}
                >
                    <Zap className="mr-1 h-3 w-3" /> Generate AR/AP
                </Button>
            ) : null,
        },
    ], []);

    const eligibleForGeneration = batches.filter(b => b.status === "Posted").length;

    return (
        <StandardPage
            title="Intercompany Auto-Invoice"
            description="Automatically generate matched AR invoices (in the selling entity) and AP invoices (in the buying entity) from approved and posted IC transaction batches."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Intercompany", href: "/finance/intercompany" },
                { label: "Auto-Invoice" },
            ]}
        >
            {/* KPI Banner */}
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total IC Batches", count: batches.length, color: "border-l-muted" },
                    { label: "Posted (Eligible)", count: eligibleForGeneration, color: "border-l-blue-500" },
                    { label: "AR/AP Generated", count: batches.filter(b => b.status === "AR/AP Generated").length, color: "border-l-green-500" },
                    { label: "Pending Approval", count: batches.filter(b => b.status !== "Posted" && b.status !== "AR/AP Generated").length, color: "border-l-yellow-400" },
                ].map((m) => (
                    <Card key={m.label} className={`border-l-4 ${m.color}`}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-3xl font-bold font-mono">{m.count}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <InteractiveSpreadsheet<ICBatch>
                data={batches}
                columns={columns}
                onChange={() => { }}
                containerHeight="460px"
            />

            <div className="mt-4 text-xs text-muted-foreground">
                <strong>Oracle Parity:</strong> Auto-Invoice generation creates a matching AR Invoice in the Receivables subledger of the selling entity and an AP Invoice in the Payables subledger of the buying entity. Both invoices share the same IC reference and are subject to elimination during consolidation.
            </div>

            {/* Confirm Generate */}
            <AlertDialog open={confirmGenerate} onOpenChange={setConfirmGenerate}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-green-600" /> Generate IC AR/AP Invoices
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will generate:
                            <ul className="mt-2 space-y-1 list-disc ml-4">
                                <li>An <strong>AR invoice</strong> ({eligibleBatch?.currency} {formatNumber(eligibleBatch?.amount || 0)}) in <strong>{eligibleBatch?.sellerEntityId}</strong></li>
                                <li>A matching <strong>AP invoice</strong> in <strong>{eligibleBatch?.buyerEntityId}</strong></li>
                            </ul>
                            <p className="mt-2">Both will be linked to IC Batch <strong>{eligibleBatch?.id}</strong> for elimination purposes.</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-green-600 hover:bg-green-700" onClick={handleGenerateInvoices}>
                            Generate Invoices
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
