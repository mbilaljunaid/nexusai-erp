import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertTriangle, Shield, DollarSign, Clock } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_BUDGETS: any[] = [
    { id: "BUD-2026-CAPEX-IT", budgetName: "IT Capex 2026", budgetType: "Departmental", department: "IT", totalBudget: 500000, encumbered: 54000, expended: 0, available: 446000, currency: "USD", status: "Active", fyear: "FY2026" },
    { id: "BUD-2026-PROC-MRO", budgetName: "MRO Procurement 2026", budgetType: "Procurement", department: "Operations", totalBudget: 250000, encumbered: 98250, expended: 87600, available: 64150, currency: "USD", status: "Active", fyear: "FY2026" },
    { id: "BUD-2026-CAPEX-PLANT", budgetName: "Plant Capex Q1-Q2", budgetType: "Capital", department: "Engineering", totalBudget: 1200000, encumbered: 340000, expended: 280000, available: 580000, currency: "USD", status: "Active", fyear: "FY2026" },
];

const SEED_RESERVATIONS: any[] = [
    { id: "ENC-001", documentRef: "PO-2026-1320", documentType: "Purchase Order", supplier: "Tech Hardware Inc", budgetId: "BUD-2026-CAPEX-IT", chargeAccount: "01-640-7210-0000", reservedAmount: 54000, currency: "USD", reservedDate: "2026-03-05", status: "Reserved", expiryDate: "2026-06-30" },
    { id: "ENC-002", documentRef: "PO-2026-1310", documentType: "Purchase Order", supplier: "CoatPro Services Ltd", budgetId: "BUD-2026-PROC-MRO", chargeAccount: "02-200-6000-0000", reservedAmount: 28500, currency: "USD", reservedDate: "2026-03-06", status: "Reserved", expiryDate: "2026-04-30" },
    { id: "ENC-003", documentRef: "PO-2026-1295", documentType: "Purchase Order", supplier: "HeatTech Ltd", budgetId: "BUD-2026-PROC-MRO", chargeAccount: "02-200-6000-0000", reservedAmount: 12500, currency: "USD", reservedDate: "2026-02-20", status: "Liquidated", expiryDate: "2026-03-31" },
    { id: "ENC-004", documentRef: "REQ-2026-0480", documentType: "Purchase Requisition", supplier: null, budgetId: "BUD-2026-PROC-MRO", chargeAccount: "02-100-5000-0000", reservedAmount: 6500, currency: "USD", reservedDate: "2026-03-08", status: "Pending Funds Check", expiryDate: "2026-04-30" },
];

const SEED_CHECKS: any[] = [
    { id: "FC-001", checkRef: "PO-2026-1320", amount: 54000, budgetId: "BUD-2026-CAPEX-IT", availableBefore: 500000, encumbered: 54000, availableAfter: 446000, result: "Passed", checkedAt: "2026-03-05 09:14 AM" },
    { id: "FC-002", checkRef: "REQ-2026-0481", amount: 220000, budgetId: "BUD-2026-CAPEX-IT", availableBefore: 446000, encumbered: 0, availableAfter: null, result: "Failed — Insufficient Funds", checkedAt: "2026-03-08 11:30 AM" },
];

export default function FundsCheckDashboard() {
    const { toast } = useToast();
    const [checkAmount, setCheckAmount] = useState("");
    const [checkBudget, setCheckBudget] = useState(SEED_BUDGETS[0].id);
    const [checkRef, setCheckRef] = useState("");
    const [checkResult, setCheckResult] = useState<any>(null);

    const runCheck = () => {
        const budget = SEED_BUDGETS.find(b => b.id === checkBudget);
        if (!budget || !checkAmount) return;
        const amt = parseFloat(checkAmount);
        const pass = amt <= budget.available;
        setCheckResult({ pass, requested: amt, available: budget.available, budgetName: budget.budgetName, ref: checkRef });
        toast({ title: pass ? "✅ Funds Check Passed" : "❌ Insufficient Funds", variant: pass ? "default" : "destructive" });
    };

    const budgetCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "budgetName", header: "Budget Name", width: "230px", cell: r => <span className="font-medium">{r.budgetName}</span> },
        { id: "budgetType", header: "Type", width: "120px", cell: r => <Badge variant="outline" className="text-xs">{r.budgetType}</Badge> },
        { id: "department", header: "Department", width: "130px" },
        { id: "totalBudget", header: "Total Budget", width: "130px", cell: r => <span className="text-right block font-semibold">${formatNumber(r.totalBudget)}</span> },
        { id: "encumbered", header: "Encumbered", width: "130px", cell: r => <span className="text-right block text-amber-600 font-medium">${formatNumber(r.encumbered)}</span> },
        { id: "expended", header: "Expended", width: "120px", cell: r => <span className="text-right block text-red-600 font-medium">${formatNumber(r.expended)}</span> },
        {
            id: "available", header: "Available", width: "130px", cell: r => {
                const pct = Math.round((r.available / r.totalBudget) * 100);
                return <span className={`text-right block font-bold text-lg ${pct < 20 ? "text-red-600" : pct < 40 ? "text-amber-600" : "text-green-700"}`}>${formatNumber(r.available)}</span>;
            }
        },
        { id: "fyear", header: "FY", width: "80px" },
        { id: "status", header: "Status", width: "100px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    const encCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "documentRef", header: "Document Ref", width: "160px", cell: r => <span className="font-mono text-xs text-blue-600">{r.documentRef}</span> },
        { id: "documentType", header: "Type", width: "160px", cell: r => <Badge variant="outline" className="text-xs">{r.documentType}</Badge> },
        { id: "supplier", header: "Supplier", width: "180px", cell: r => r.supplier ?? <span className="text-muted-foreground text-xs">—</span> },
        { id: "chargeAccount", header: "Charge Account", width: "180px", cell: r => <span className="font-mono text-xs text-indigo-700">{r.chargeAccount}</span> },
        { id: "reservedAmount", header: "Reserved $", width: "130px", cell: r => <span className="text-right block font-bold">${formatNumber(r.reservedAmount)}</span> },
        { id: "reservedDate", header: "Reserved Date", width: "130px", cell: r => formatDate(r.reservedDate) },
        { id: "expiryDate", header: "Expiry", width: "110px", cell: r => formatDate(r.expiryDate) },
        { id: "status", header: "Status", width: "180px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    const checkHistCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "checkRef", header: "Reference", width: "160px", cell: r => <span className="font-mono text-xs text-blue-600">{r.checkRef}</span> },
        { id: "amount", header: "Requested $", width: "130px", cell: r => <span className="text-right block font-bold">${formatNumber(r.amount)}</span> },
        { id: "availableBefore", header: "Available Before", width: "150px", cell: r => <span className="text-right block">${formatNumber(r.availableBefore)}</span> },
        { id: "encumbered", header: "Reserved $", width: "120px", cell: r => <span className={`text-right block font-medium ${r.encumbered > 0 ? "text-green-700" : "text-muted-foreground"}`}>{r.encumbered > 0 ? `$${formatNumber(r.encumbered)}` : "—"}</span> },
        { id: "result", header: "Result", width: "260px", cell: r => <span className={`text-sm font-semibold flex items-center gap-1 ${r.result === "Passed" ? "text-green-700" : "text-red-600"}`}>{r.result === "Passed" ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}{r.result}</span> },
        { id: "checkedAt", header: "Checked At", width: "160px", cell: r => <span className="text-xs text-muted-foreground">{r.checkedAt}</span> },
    ], []);

    return (
        <StandardPage
            title="Funds Check & GL Encumbrance"
            description="Reserve budget funds (encumber) when a PO is approved. Prevents overspending by checking available budget before allowing procurement actions."
            breadcrumbs={[{ label: "Procurement", href: "/scm/procurement" }, { label: "Funds Check" }]}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Shield className="h-4 w-4 text-green-600" />Total Encumbered</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">${formatNumber(SEED_RESERVATIONS.filter(r => r.status === "Reserved").reduce((s, r) => s + r.reservedAmount, 0))}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><DollarSign className="h-4 w-4" />Active Reservations</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_RESERVATIONS.filter(r => r.status === "Reserved").length}</div></CardContent>
                </Card>
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Clock className="h-4 w-4 text-amber-500" />Pending Checks</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{SEED_RESERVATIONS.filter(r => r.status === "Pending Funds Check").length}</div></CardContent>
                </Card>
            </div>

            {/* Manual Funds Check */}
            <Card className="mb-6 border-2 border-dashed">
                <CardHeader><CardTitle className="text-base flex gap-2 items-center"><Shield className="h-4 w-4" />Manual Funds Check</CardTitle><CardDescription>Verify if a specific amount can be committed against a budget before raising a PO or PR.</CardDescription></CardHeader>
                <CardContent>
                    <div className="flex gap-3 items-end flex-wrap">
                        <div className="space-y-2 w-44"><label className="text-xs font-bold">Budget *</label>
                            <Select value={checkBudget} onValueChange={setCheckBudget}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{SEED_BUDGETS.map(b => <SelectItem key={b.id} value={b.id}><span className="text-xs">{b.budgetName}</span></SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 w-36"><label className="text-xs font-bold">Amount (USD) *</label><Input type="number" value={checkAmount} onChange={e => setCheckAmount(e.target.value)} className="h-9 text-xs" placeholder="0.00" /></div>
                        <div className="space-y-2 w-40"><label className="text-xs font-bold">Document Ref</label><Input value={checkRef} onChange={e => setCheckRef(e.target.value)} className="h-9 text-xs" placeholder="PO-, REQ-…" /></div>
                        <Button onClick={runCheck} disabled={!checkAmount} className="h-9"><Shield className="h-4 w-4 mr-2" />Run Check</Button>
                    </div>
                    {checkResult && (
                        <div className={`mt-4 p-3 rounded-lg border ${checkResult.pass ? "border-green-300 bg-green-50 dark:bg-green-950/20" : "border-red-300 bg-red-50 dark:bg-red-950/20"} text-sm`}>
                            <div className="flex items-center gap-2 font-bold mb-1">
                                {checkResult.pass ? <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-green-700">Funds Check PASSED</span></> : <><AlertTriangle className="h-4 w-4 text-red-600" /><span className="text-red-700">Funds Check FAILED — Insufficient Budget</span></>}
                            </div>
                            <p className="text-xs text-muted-foreground">Budget: <strong>{checkResult.budgetName}</strong> · Requested: <strong>${formatNumber(checkResult.requested)}</strong> · Available: <strong>${formatNumber(checkResult.available)}</strong></p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="budgets">
                <TabsList className="mb-4"><TabsTrigger value="budgets">Budget Register</TabsTrigger><TabsTrigger value="reservations">Encumbrance Reservations</TabsTrigger><TabsTrigger value="history">Check History</TabsTrigger></TabsList>
                <TabsContent value="budgets">
                    <Card><CardHeader><CardTitle>Budget Register</CardTitle></CardHeader><CardContent className="p-0"><InteractiveSpreadsheet data={SEED_BUDGETS} columns={budgetCols} onChange={() => { }} containerHeight="360px" /></CardContent></Card>
                </TabsContent>
                <TabsContent value="reservations">
                    <Card><CardHeader><CardTitle>GL Encumbrance Reservations</CardTitle><CardDescription>Funds reserved when a document is submitted. Released on invoice match (liquidation) or cancellation.</CardDescription></CardHeader><CardContent className="p-0"><InteractiveSpreadsheet data={SEED_RESERVATIONS} columns={encCols} onChange={() => { }} containerHeight="360px" /></CardContent></Card>
                </TabsContent>
                <TabsContent value="history">
                    <Card><CardHeader><CardTitle>Funds Check History</CardTitle></CardHeader><CardContent className="p-0"><InteractiveSpreadsheet data={SEED_CHECKS} columns={checkHistCols} onChange={() => { }} containerHeight="360px" /></CardContent></Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
