import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, DollarSign, Send, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type SettlementStatus = "Open" | "Proposed" | "Approved" | "Payment Sent" | "Settled";
type PaymentMethod = "Wire Transfer" | "ACH" | "Internal Journal";

interface NettingPosition {
    entityId: string;
    entityName: string;
    totalReceivable: number;
    totalPayable: number;
    netPosition: number;
    currency: string;
    direction: "Receive" | "Pay" | "Net Zero";
}

interface Settlement {
    id: string;
    settlementNumber: string;
    cycle: string;
    fromEntity: string;
    toEntity: string;
    grossPayable: number;
    grossReceivable: number;
    netSettlementAmount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    status: SettlementStatus;
    dueDate: string;
    paymentRef?: string;
}

const ENTITIES = [
    { id: "E001", name: "NexusAI US (Parent)" },
    { id: "E002", name: "NexusAI UK Ltd" },
    { id: "E003", name: "NexusAI MENA FZE" },
    { id: "E004", name: "NexusAI APAC Pte Ltd" },
];

const MOCK_POSITIONS: NettingPosition[] = [
    { entityId: "E001", entityName: "NexusAI US (Parent)", totalReceivable: 284000, totalPayable: 145000, netPosition: 139000, currency: "USD", direction: "Receive" },
    { entityId: "E002", entityName: "NexusAI UK Ltd", totalReceivable: 48000, totalPayable: 193000, netPosition: -145000, currency: "USD", direction: "Pay" },
    { entityId: "E003", entityName: "NexusAI MENA FZE", totalReceivable: 0, totalPayable: 84000, netPosition: -84000, currency: "USD", direction: "Pay" },
    { entityId: "E004", entityName: "NexusAI APAC Pte Ltd", totalReceivable: 90000, totalPayable: 0, netPosition: 90000, currency: "USD", direction: "Receive" },
];

const MOCK_SETTLEMENTS: Settlement[] = [
    { id: "NS-001", settlementNumber: "NETT-2026-Q1-001", cycle: "Q1 2026", fromEntity: "NexusAI UK Ltd", toEntity: "NexusAI US (Parent)", grossPayable: 193000, grossReceivable: 48000, netSettlementAmount: 145000, currency: "USD", paymentMethod: "Wire Transfer", status: "Payment Sent", dueDate: "2026-03-31", paymentRef: "SWIFT-20260328-001" },
    { id: "NS-002", settlementNumber: "NETT-2026-Q1-002", cycle: "Q1 2026", fromEntity: "NexusAI MENA FZE", toEntity: "NexusAI US (Parent)", grossPayable: 84000, grossReceivable: 0, netSettlementAmount: 84000, currency: "USD", paymentMethod: "Internal Journal", status: "Proposed", dueDate: "2026-03-31" },
];

const statusColors: Record<SettlementStatus, string> = { Open: "outline", Proposed: "secondary", Approved: "default", "Payment Sent": "default", Settled: "secondary" };
const directionColors: Record<NettingPosition["direction"], string> = { Receive: "default", Pay: "destructive", "Net Zero": "secondary" };

export default function NettingSettlementPayment() {
    const { toast } = useToast();
    const [settlements, setSettlements] = useState<Settlement[]>(MOCK_SETTLEMENTS);
    const [generateOpen, setGenerateOpen] = useState(false);
    const [payConfirm, setPayConfirm] = useState<Settlement | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    // Generate form state
    const [cycle, setCycle] = useState("Q1 2026");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Wire Transfer");

    const handleGenerate = () => {
        const newSettlements = MOCK_POSITIONS
            .filter(p => p.direction === "Pay")
            .map((p, i) => {
                const settler: Settlement = {
                    id: `NS-NEW-${i}`,
                    settlementNumber: `NETT-2026-Q1-${String(settlements.length + i + 1).padStart(3, "0")}`,
                    cycle,
                    fromEntity: p.entityName,
                    toEntity: "NexusAI US (Parent)",
                    grossPayable: p.totalPayable,
                    grossReceivable: p.totalReceivable,
                    netSettlementAmount: Math.abs(p.netPosition),
                    currency: p.currency,
                    paymentMethod,
                    status: "Proposed",
                    dueDate: "2026-03-31",
                };
                return settler;
            })
            .filter(s => !settlements.find(ex => ex.fromEntity === s.fromEntity && ex.cycle === s.cycle));
        if (newSettlements.length === 0) {
            toast({ title: "No new settlements to generate", description: "All netting positions for this cycle already have settlements." });
        } else {
            setSettlements(prev => [...prev, ...newSettlements]);
            toast({ title: "Settlement Instructions Generated", description: `${newSettlements.length} net settlement instruction(s) created in "Proposed" status.` });
        }
        setGenerateOpen(false);
    };

    const handleApprove = (id: string) => {
        setSettlements(prev => prev.map(s => s.id === id ? { ...s, status: "Approved" } : s));
        toast({ title: "Settlement Approved", description: "Now ready to send payment." });
    };

    const handleSendPayment = () => {
        if (!payConfirm) return;
        const method = payConfirm.paymentMethod;
        setPayConfirm(null);
        setProcessing(payConfirm.id);
        setTimeout(() => {
            const ref = method === "Internal Journal"
                ? `JNL-${Date.now().toString().slice(-8)}`
                : `SWIFT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`;
            setSettlements(prev => prev.map(s => s.id === payConfirm.id ? { ...s, status: "Payment Sent", paymentRef: ref } : s));
            setProcessing(null);
            toast({ title: `Payment Sent — ${method}`, description: `${payConfirm.settlementNumber}: ${payConfirm.currency} ${formatNumber(payConfirm.netSettlementAmount)} → ${payConfirm.toEntity}. Ref: ${ref}` });
        }, 1200);
    };

    const positionColumns: SpreadsheetColumn<NettingPosition>[] = useMemo(() => [
        { id: "entityName", header: "Legal Entity", width: "210px", cellClassName: "font-medium", cell: r => r.entityName },
        { id: "totalReceivable", header: "Total IC Receivable", width: "170px", cellClassName: "text-right font-mono text-green-600", cell: r => r.totalReceivable > 0 ? formatNumber(r.totalReceivable) : "—" },
        { id: "totalPayable", header: "Total IC Payable", width: "160px", cellClassName: "text-right font-mono text-destructive", cell: r => r.totalPayable > 0 ? formatNumber(r.totalPayable) : "—" },
        {
            id: "netPosition", header: "Net Position", width: "140px", cellClassName: "text-right font-mono font-bold",
            cell: r => <span className={r.direction === "Receive" ? "text-green-600" : r.direction === "Pay" ? "text-destructive" : ""}>{r.netPosition > 0 ? "+" : ""}{formatNumber(r.netPosition)}</span>,
        },
        { id: "direction", header: "Direction", width: "110px", cell: r => <Badge variant={directionColors[r.direction] as any}>{r.direction}</Badge> },
        { id: "currency", header: "CCY", width: "70px", cellClassName: "font-mono text-sm text-muted-foreground", cell: r => r.currency },
    ], []);

    const settlementColumns: SpreadsheetColumn<Settlement>[] = useMemo(() => [
        { id: "settlementNumber", header: "Settlement #", width: "170px", cellClassName: "font-mono text-sm font-bold", cell: r => r.settlementNumber },
        {
            id: "flow", header: "From → To", width: "280px",
            cell: r => (
                <div className="text-xs flex items-center gap-1">
                    <span className="text-destructive font-medium max-w-28 truncate">{r.fromEntity}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-primary" />
                    <span className="text-green-600 font-medium max-w-28 truncate">{r.toEntity}</span>
                </div>
            ),
        },
        { id: "net", header: "Net Amount", width: "130px", cellClassName: "text-right font-mono font-bold", cell: r => `${r.currency} ${formatNumber(r.netSettlementAmount)}` },
        { id: "method", header: "Method", width: "140px", cell: r => <Badge variant="outline">{r.paymentMethod}</Badge> },
        { id: "dueDate", header: "Due", width: "95px", cellClassName: "font-mono text-sm", cell: r => r.dueDate },
        {
            id: "paymentRef", header: "Payment Ref", width: "160px",
            cell: r => r.paymentRef ? <span className="font-mono text-xs text-muted-foreground">{r.paymentRef}</span> : <span className="text-muted-foreground">—</span>,
        },
        { id: "status", header: "Status", width: "110px", cell: r => <Badge variant={statusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "Actions", width: "140px",
            cell: r => {
                if (processing === r.id) return <span className="text-xs text-muted-foreground animate-pulse">Processing...</span>;
                if (r.status === "Proposed") return <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleApprove(r.id)}>Approve</Button>;
                if (r.status === "Approved") return (
                    <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setPayConfirm(r)}>
                        <Send className="mr-1 h-3 w-3" /> Send Payment
                    </Button>
                );
                if (r.status === "Payment Sent") return <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Sent</span>;
                return null;
            },
        },
    ], [processing]);

    return (
        <StandardPage
            title="IC Netting — Settlement & Payment"
            description="Generate net settlement instructions from intercompany netting cycles and trigger actual payments (Wire, ACH, Internal Journal) to settle multi-entity balances."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Intercompany", href: "/finance/intercompany" },
                { label: "Netting Settlement" },
            ]}
            actions={
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { }}>
                        <Download className="mr-2 h-4 w-4" /> Export SWIFT MT101
                    </Button>
                    <Button size="sm" onClick={() => setGenerateOpen(true)}>
                        <DollarSign className="mr-2 h-4 w-4" /> Generate Settlements
                    </Button>
                </div>
            }
        >
            <Tabs defaultValue="settlements">
                <TabsList className="mb-4">
                    <TabsTrigger value="settlements">Settlement Instructions ({settlements.length})</TabsTrigger>
                    <TabsTrigger value="positions">Entity Net Positions</TabsTrigger>
                </TabsList>

                <TabsContent value="settlements">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {[
                            { label: "Proposed", val: settlements.filter(s => s.status === "Proposed").length, color: "border-l-secondary" },
                            { label: "Approved", val: settlements.filter(s => s.status === "Approved").length, color: "border-l-primary" },
                            { label: "Payment Sent", val: settlements.filter(s => s.status === "Payment Sent").length, color: "border-l-green-500" },
                            { label: "Total Net ($)", val: `$${formatNumber(settlements.reduce((s, ns) => s + ns.netSettlementAmount, 0))}`, color: "border-l-amber-400" },
                        ].map(m => (
                            <Card key={m.label} className={`border-l-4 ${m.color}`}>
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground">{m.label}</p>
                                    <p className="text-2xl font-bold font-mono">{m.val}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <InteractiveSpreadsheet<Settlement>
                        data={settlements}
                        columns={settlementColumns}
                        onChange={() => { }}
                        containerHeight="380px"
                    />
                </TabsContent>

                <TabsContent value="positions">
                    <div className="mb-3 p-2.5 bg-muted/30 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        Positions are calculated from open IC invoices in the current netting cycle. "Pay" entities must fund the settlement; "Receive" entities will have cash applied.
                    </div>
                    <InteractiveSpreadsheet<NettingPosition>
                        data={MOCK_POSITIONS}
                        columns={positionColumns}
                        onChange={() => { }}
                        containerHeight="280px"
                    />
                </TabsContent>
            </Tabs>

            {/* Generate Dialog */}
            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Generate Settlement Instructions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1">
                            <Label>Netting Cycle</Label>
                            <Select value={cycle} onValueChange={setCycle}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["Q1 2026", "Feb 2026", "Mar 2026"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Default Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v as PaymentMethod)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(["Wire Transfer", "ACH", "Internal Journal"] as PaymentMethod[]).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="p-3 bg-muted/40 rounded text-xs text-muted-foreground">
                            The system will compute net bilateral positions for <strong>{MOCK_POSITIONS.filter(p => p.direction === "Pay").length}</strong> "Pay" entities and generate settlement instructions automatically.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
                        <Button onClick={handleGenerate}>Generate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Payment Confirm */}
            <AlertDialog open={!!payConfirm} onOpenChange={() => setPayConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Send Settlement Payment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Initiating a <strong>{payConfirm?.paymentMethod}</strong> of <strong>{payConfirm?.currency} {formatNumber(payConfirm?.netSettlementAmount || 0)}</strong> from <strong>{payConfirm?.fromEntity}</strong> to <strong>{payConfirm?.toEntity}</strong>.
                            {payConfirm?.paymentMethod === "Internal Journal" && <span className="block mt-2 text-xs">This will generate a GL journal entry — no actual bank wire is initiated.</span>}
                            {payConfirm?.paymentMethod === "Wire Transfer" && <span className="block mt-2 text-xs">A SWIFT MT103 payment order will be generated and submitted to your bank.</span>}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSendPayment}>Confirm Payment</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
