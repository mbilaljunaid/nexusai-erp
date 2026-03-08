import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_ACCRUALS: any[] = [
    { id: "ACC-001", receiptNum: "RCV-2026-0512", poNumber: "PO-2026-1098", supplier: "Acme Office Supplies", receiptDate: "2026-03-01", itemDescription: "A4 Paper (Pallet)", qty: 40, unitCost: 320.00, accrualAmount: 12800.00, accrualAccount: "20100-INVACC-0000", matchedInvoice: "INV-2026-4201", matchedDate: "2026-03-05", clearingStatus: "Cleared", agingDays: 4 },
    { id: "ACC-002", receiptNum: "RCV-2026-0518", poNumber: "PO-2026-1142", supplier: "Industrial Parts Co", receiptDate: "2026-03-04", itemDescription: "Hydraulic Valve (Unit)", qty: 50, unitCost: 290.00, accrualAmount: 14500.00, accrualAccount: "20100-INVACC-0000", matchedInvoice: null, matchedDate: null, clearingStatus: "Open", agingDays: 4 },
    { id: "ACC-003", receiptNum: "RCV-2026-0500", poNumber: "PO-2026-1051", supplier: "Tech Hardware Inc", receiptDate: "2026-02-20", itemDescription: "Dell Monitor 27\"", qty: 20, unitCost: 450.00, accrualAmount: 9000.00, accrualAccount: "20100-INVACC-0000", matchedInvoice: null, matchedDate: null, clearingStatus: "Overdue", agingDays: 16 },
    { id: "ACC-004", receiptNum: "RCV-2026-0495", poNumber: "PO-2026-1033", supplier: "MetalsCo", receiptDate: "2026-02-15", itemDescription: "Aluminium Sheet 2mm (Lot)", qty: 200, unitCost: 3.50, accrualAmount: 700.00, accrualAccount: "20100-INVACC-0000", matchedInvoice: "INV-2026-4188", matchedDate: "2026-02-22", clearingStatus: "Cleared", agingDays: 7 },
];

export default function ReceiptAccountingViewer() {
    const [selectedOrg, setSelectedOrg] = useState("All");
    const [periodFilter, setPeriodFilter] = useState("Current Period");
    const [search, setSearch] = useState("");

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/cost/receipt-accounting"], queryFn: () => fetch("/api/cost/receipt-accounting").then(r => r.json()).catch(() => []) });
    const accruals = (apiData && apiData.length > 0) ? apiData : SEED_ACCRUALS;

    const filtered = accruals.filter(a =>
        (search === "" || a.poNumber.includes(search) || a.supplier.toLowerCase().includes(search.toLowerCase()) || a.receiptNum.includes(search))
    );

    const openAmount = accruals.filter(a => a.clearingStatus !== "Cleared").reduce((s, a) => s + a.accrualAmount, 0);
    const clearedAmount = accruals.filter(a => a.clearingStatus === "Cleared").reduce((s, a) => s + a.accrualAmount, 0);
    const overdueCount = accruals.filter(a => a.clearingStatus === "Overdue").length;

    const accrualCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "receiptNum", header: "Receipt #", width: "140px", cell: r => <span className="font-mono text-xs text-blue-600">{r.receiptNum}</span> },
        { id: "poNumber", header: "PO Number", width: "140px", cell: r => <span className="font-mono text-xs text-indigo-600">{r.poNumber}</span> },
        { id: "supplier", header: "Supplier", width: "180px", cell: r => <span className="font-medium">{r.supplier}</span> },
        { id: "receiptDate", header: "Receipt Date", width: "120px", cell: r => formatDate(r.receiptDate) },
        { id: "itemDescription", header: "Item", width: "200px" },
        { id: "qty", header: "Qty", width: "70px", cell: r => <span className="text-right block">{formatNumber(r.qty)}</span> },
        { id: "unitCost", header: "Unit Cost", width: "100px", cell: r => <span className="text-right block">${formatNumber(r.unitCost)}</span> },
        { id: "accrualAmount", header: "Accrual Amt", width: "130px", cell: r => <span className="text-right block font-bold">${formatNumber(r.accrualAmount)}</span> },
        { id: "accrualAccount", header: "Accrual Account", width: "180px", cell: r => <span className="font-mono text-xs">{r.accrualAccount}</span> },
        { id: "matchedInvoice", header: "AP Invoice", width: "140px", cell: r => r.matchedInvoice ? <span className="font-mono text-xs text-green-600">{r.matchedInvoice}</span> : <span className="text-muted-foreground text-xs italic">Not matched</span> },
        { id: "matchedDate", header: "Match Date", width: "120px", cell: r => r.matchedDate ? formatDate(r.matchedDate) : "—" },
        { id: "agingDays", header: "Days Open", width: "100px", cell: r => r.clearingStatus !== "Cleared" ? <span className={`text-center block font-bold ${r.agingDays >= 14 ? "text-red-600" : r.agingDays >= 7 ? "text-amber-600" : "text-muted-foreground"}`}>{r.agingDays}</span> : <span className="text-center block text-muted-foreground">—</span> },
        { id: "clearingStatus", header: "Status", width: "130px", cell: r => <StatusBadge status={r.clearingStatus} /> },
    ], []);

    return (
        <StandardPage
            title="Receipt Accounting (AP Accruals)"
            description="AP accrual postings generated when PO receipts occur. Each accrual clears when the supplier invoice is matched (3-way match). Overdue open accruals indicate invoicing gaps."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "Cost Management", href: "/scm/cost" }, { label: "Receipt Accounting" }]}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Clock className="h-4 w-4 text-amber-500" />Open Accruals</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">${formatNumber(openAmount)}</div><p className="text-xs text-muted-foreground mt-1">{accruals.filter(a => a.clearingStatus !== "Cleared").length} receipts unmatched</p></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><CheckCircle className="h-4 w-4 text-green-600" />Cleared</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">${formatNumber(clearedAmount)}</div><p className="text-xs text-muted-foreground mt-1">{accruals.filter(a => a.clearingStatus === "Cleared").length} receipts matched</p></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><AlertTriangle className="h-4 w-4 text-red-500" />Overdue (&gt;14 days)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{overdueCount}</div><p className="text-xs text-muted-foreground">Invoice not received</p></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><DollarSign className="h-4 w-4" />Total Accruals</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(accruals.reduce((s, a) => s + a.accrualAmount, 0))}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Accrual Transactions</CardTitle>
                    <CardDescription>Each row = one PO receipt. "Open" accruals represent a liability until matched by a supplier invoice via 3-way match.</CardDescription>
                    <div className="flex gap-3 mt-3">
                        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search PO, receipt, supplier..." className="max-w-xs" />
                        <Select value={periodFilter} onValueChange={setPeriodFilter}>
                            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>{["Current Period", "Prior Period", "Q1 2026", "All"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={filtered} columns={accrualCols} onChange={() => { }} containerHeight="500px" /></CardContent>
            </Card>
        </StandardPage>
    );
}
