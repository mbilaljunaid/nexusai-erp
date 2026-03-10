import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Play, RefreshCw, CheckCircle2, Download, Inbox, ArrowRight } from "lucide-react";

// Oracle AR: Remittance Batch Workbench — group receipts for bank remittance advice

interface RemittanceBatch {
    id: string; batchRef: string; bankAccount: string; remittanceDate: string; currency: string; receiptCount: number; totalAmount: number; status: "Draft" | "Confirmed" | "Transmitted" | "Cleared"; method: "EFT" | "Wire" | "Check" | "SEPA";
}
interface RemittanceLine { id: string; batchId: string; receiptNumber: string; customer: string; invoiceRef: string; receiptDate: string; amount: number; }

const MOCK_BATCHES: RemittanceBatch[] = [
    { id: "1", batchRef: "RMT-2026-0031", bankAccount: "GBP ****6819", remittanceDate: "2026-03-08", currency: "GBP", receiptCount: 18, totalAmount: 284750, status: "Draft", method: "EFT" },
    { id: "2", batchRef: "RMT-2026-0030", bankAccount: "USD ****4421", remittanceDate: "2026-03-07", currency: "USD", receiptCount: 34, totalAmount: 612800, status: "Transmitted", method: "Wire" },
    { id: "3", batchRef: "RMT-2026-0029", bankAccount: "EUR ****9910", remittanceDate: "2026-03-06", currency: "EUR", receiptCount: 8, totalAmount: 97400, status: "Cleared", method: "SEPA" },
];
const MOCK_LINES: RemittanceLine[] = [
    { id: "1", batchId: "1", receiptNumber: "RCT-2026-1841", customer: "Acme Corp", invoiceRef: "AR-INV-00921", receiptDate: "2026-03-06", amount: 42500 },
    { id: "2", batchId: "1", receiptNumber: "RCT-2026-1842", customer: "Global Tech", invoiceRef: "AR-INV-00904", receiptDate: "2026-03-06", amount: 87250 },
    { id: "3", batchId: "1", receiptNumber: "RCT-2026-1843", customer: "MidEast Trading", invoiceRef: "AR-INV-00898", receiptDate: "2026-03-07", amount: 155000 },
];

export function ArRemittanceBatch() {
    const { toast } = useToast();
    const [batches, setBatches] = useState<RemittanceBatch[]>(MOCK_BATCHES);
    const [selectedBatch, setSelectedBatch] = useState<RemittanceBatch | null>(null);
    const [tab, setTab] = useState("list");
    const [transmitting, setTransmitting] = useState<string | null>(null);

    const batchLines = MOCK_LINES.filter(l => l.batchId === selectedBatch?.id);

    const handleTransmit = async (batchId: string) => {
        setTransmitting(batchId);
        await new Promise(r => setTimeout(r, 1500));
        setBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: "Transmitted" } : b));
        setTransmitting(null);
        toast({ title: "Remittance batch transmitted to bank", description: "EFT/Wire transfer initiated. Status will update when cleared.", className: "bg-green-900 border-green-700 text-white" });
    };

    const statusColor = (s: string) => ({
        Draft: "bg-muted text-muted-foreground",
        Confirmed: "bg-blue-500/20 text-blue-400",
        Transmitted: "bg-amber-500/20 text-amber-400",
        Cleared: "bg-green-500/20 text-green-400",
    }[s] || "bg-muted");

    return (
        <StandardPage
            title="Remittance Batch Workbench"
            description="Group receipts into remittance batches for bank EFT/Wire/SEPA transmission"
            actions={
                selectedBatch && (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedBatch(null); setTab("list"); }}>← Back to Batches</Button>
                )
            }
        >
            {!selectedBatch ? (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {[
                            { label: "Draft Batches", value: batches.filter(b => b.status === "Draft").length.toString(), color: "text-muted-foreground" },
                            { label: "Transmitted Today", value: batches.filter(b => b.status === "Transmitted").length.toString(), color: "text-amber-400" },
                            { label: "Total Remitted Today", value: formatNumber(batches.filter(b => b.status !== "Draft").reduce((s, b) => s + b.totalAmount, 0)), color: "text-green-400" },
                        ].map(m => (
                            <Card key={m.label}><CardContent className="pt-4 pb-4">
                                <p className="text-xs text-muted-foreground">{m.label}</p>
                                <p className={`text-xl font-bold ${m.color} mt-1`}>{m.value}</p>
                            </CardContent></Card>
                        ))}
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="p-3 text-left">Batch Ref</th>
                                        <th className="p-3 text-left">Bank Account</th>
                                        <th className="p-3 text-left">Date</th>
                                        <th className="p-3 text-left">Method</th>
                                        <th className="p-3 text-right">Receipts</th>
                                        <th className="p-3 text-right">Total Amount</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 w-28"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {batches.map(b => (
                                        <tr key={b.id} className="hover:bg-muted/10">
                                            <td className="p-3 font-mono text-xs text-primary cursor-pointer hover:underline"
                                                onClick={() => { setSelectedBatch(b); setTab("detail"); }}>{b.batchRef}</td>
                                            <td className="p-3 font-mono text-xs">{b.bankAccount}</td>
                                            <td className="p-3 text-xs">{b.remittanceDate}</td>
                                            <td className="p-3"><Badge className="text-xs">{b.method}</Badge></td>
                                            <td className="p-3 text-right">{b.receiptCount}</td>
                                            <td className="p-3 text-right font-medium">{formatNumber(b.totalAmount)} {b.currency}</td>
                                            <td className="p-3"><Badge className={`text-xs ${statusColor(b.status)}`}>{b.status}</Badge></td>
                                            <td className="p-3 flex gap-1">
                                                {b.status === "Draft" && (
                                                    <Button size="sm" className="h-7 text-xs" onClick={() => handleTransmit(b.id)}
                                                        disabled={transmitting === b.id}>
                                                        {transmitting === b.id ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
                                                        Transmit
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="h-3 w-3" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <div className="space-y-4">
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-primary">{selectedBatch.batchRef}</span>
                                    <Badge className="text-xs">{selectedBatch.method}</Badge>
                                    <Badge className={`text-xs ${statusColor(selectedBatch.status)}`}>{selectedBatch.status}</Badge>
                                </div>
                                {selectedBatch.status === "Draft" && (
                                    <Button size="sm" onClick={() => handleTransmit(selectedBatch.id)}>
                                        <Play className="h-4 w-4 mr-2" />Transmit Batch
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-3 text-xs">
                                <div><p className="text-muted-foreground">Bank Account</p><p>{selectedBatch.bankAccount}</p></div>
                                <div><p className="text-muted-foreground">Remittance Date</p><p>{selectedBatch.remittanceDate}</p></div>
                                <div><p className="text-muted-foreground">Total Receipts</p><p className="font-bold">{selectedBatch.receiptCount}</p></div>
                                <div><p className="text-muted-foreground">Total Amount</p><p className="font-bold">{formatNumber(selectedBatch.totalAmount)} {selectedBatch.currency}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm">Receipt Lines</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="p-3 text-left">Receipt #</th>
                                        <th className="p-3 text-left">Customer</th>
                                        <th className="p-3 text-left">Invoice Ref</th>
                                        <th className="p-3 text-left">Receipt Date</th>
                                        <th className="p-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {batchLines.map(l => (
                                        <tr key={l.id} className="hover:bg-muted/10">
                                            <td className="p-3 font-mono text-xs text-primary">{l.receiptNumber}</td>
                                            <td className="p-3">{l.customer}</td>
                                            <td className="p-3 font-mono text-xs">{l.invoiceRef}</td>
                                            <td className="p-3 text-xs">{l.receiptDate}</td>
                                            <td className="p-3 text-right font-medium">{formatNumber(l.amount)} {selectedBatch.currency}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </StandardPage>
    );
}

export default ArRemittanceBatch;
