import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, RefreshCw, FileText, CheckCircle2, AlertTriangle, Play } from "lucide-react";

// Oracle CE: CAMT.054 Credit Advice Import — ISO 20022 bank credit notification

interface Camt054Import {
    id: string; filename: string; importedAt: string; bankAccount: string; creditCount: number; totalAmount: number; currency: string; status: "Processed" | "Pending" | "Errors"; errorCount: number; matchedCount: number;
}

const MOCK_IMPORTS: Camt054Import[] = [
    { id: "1", filename: "camt054_HSBC_20260307.xml", importedAt: "2026-03-07 14:32", bankAccount: "GBP ****6819", creditCount: 23, totalAmount: 1842750, currency: "GBP", status: "Processed", errorCount: 0, matchedCount: 23 },
    { id: "2", filename: "camt054_NBD_20260307.xml", importedAt: "2026-03-07 11:15", bankAccount: "AED ****4412", creditCount: 8, totalAmount: 487500, currency: "AED", status: "Processed", errorCount: 1, matchedCount: 7 },
    { id: "3", filename: "camt054_JPM_20260306.xml", importedAt: "2026-03-06 16:48", bankAccount: "USD ****9921", creditCount: 45, totalAmount: 3241800, currency: "USD", status: "Processed", errorCount: 0, matchedCount: 45 },
];

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.054.001.08">
  <BkToCstmrDbtCdtNtfctn>
    <GrpHdr>
      <MsgId>CAMT054-20260307-001</MsgId>
      <CreDtTm>2026-03-07T14:30:00Z</CreDtTm>
    </GrpHdr>
    <Ntfctn>
      <Acct><Id><IBAN>GB29NWBK60161331926819</IBAN></Id></Acct>
      <Ntry>
        <Amt Ccy="GBP">42500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Refs><EndToEndId>INV-AR-00921</EndToEndId></Refs>
      </Ntry>
    </Ntfctn>
  </BkToCstmrDbtCdtNtfctn>
</Document>`;

export function CamtImport() {
    const { toast } = useToast();
    const [imports, setImports] = useState<Camt054Import[]>(MOCK_IMPORTS);
    const [processing, setProcessing] = useState(false);
    const [showSample, setShowSample] = useState(false);

    const handleUpload = async () => {
        setProcessing(true);
        await new Promise(r => setTimeout(r, 1800));
        const newImport: Camt054Import = {
            id: Date.now().toString(),
            filename: `camt054_BANK_${new Date().toISOString().split("T")[0].replace(/-/g, "")}.xml`,
            importedAt: new Date().toLocaleString(),
            bankAccount: "GBP ****6819",
            creditCount: Math.floor(Math.random() * 30) + 5,
            totalAmount: Math.random() * 2000000 + 100000,
            currency: "GBP",
            status: "Processed",
            errorCount: 0,
            matchedCount: Math.floor(Math.random() * 30) + 5,
        };
        setImports(prev => [newImport, ...prev]);
        setProcessing(false);
        toast({
            title: `CAMT.054 file imported — ${newImport.creditCount} credits`,
            description: `Matched to AR receipts. Total: ${newImport.currency} ${(newImport.totalAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
            className: "bg-green-900 border-green-700 text-white",
        });
    };

    return (
        <StandardPage
            title="CAMT.054 Credit Advice Import"
            description="Import ISO 20022 bank-to-customer credit notifications and auto-match to AR receipts"
            actions={
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowSample(true)}><FileText className="h-4 w-4 mr-2" />View Schema</Button>
                    <Button size="sm" onClick={handleUpload} disabled={processing}>
                        {processing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        {processing ? "Processing..." : "Import CAMT.054 File"}
                    </Button>
                </div>
            }
        >
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                <FileText className="h-3 w-3 inline mr-1" />
                CAMT.054 (BankToCustomerDebitCreditNotification) is the ISO 20022 credit advice standard. Import files to automatically reconcile bank credits against AR receipts. Supported: CAMT.054.001.02 through .08.
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                    { label: "Files Imported (30 days)", value: imports.length.toString(), color: "text-blue-400" },
                    { label: "Total Credits Matched", value: imports.reduce((s, i) => s + i.matchedCount, 0).toString(), color: "text-green-400" },
                    { label: "Unmatched / Errors", value: imports.reduce((s, i) => s + i.errorCount, 0).toString(), color: "text-red-400" },
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
                                <th className="p-3 text-left">Filename</th>
                                <th className="p-3 text-left">Imported At</th>
                                <th className="p-3 text-left">Bank Account</th>
                                <th className="p-3 text-right">Credits</th>
                                <th className="p-3 text-right">Total Amount</th>
                                <th className="p-3 text-right">Matched</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {imports.map(imp => (
                                <tr key={imp.id} className="hover:bg-muted/10">
                                    <td className="p-3 font-mono text-xs text-primary">{imp.filename}</td>
                                    <td className="p-3 text-xs">{imp.importedAt}</td>
                                    <td className="p-3 font-mono text-xs">{imp.bankAccount}</td>
                                    <td className="p-3 text-right">{imp.creditCount}</td>
                                    <td className="p-3 text-right font-medium">{imp.currency} {imp.totalAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                                    <td className="p-3 text-right">
                                        <span className={imp.errorCount > 0 ? "text-amber-400" : "text-green-400"}>
                                            {imp.matchedCount}/{imp.creditCount}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <Badge className={imp.status === "Processed" ? (imp.errorCount > 0 ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400") : "bg-blue-500/20 text-blue-400"}>
                                            {imp.status}{imp.errorCount > 0 && ` (${imp.errorCount} err)`}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="h-3 w-3" /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Dialog open={showSample} onOpenChange={setShowSample}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>CAMT.054 XML Schema Example</DialogTitle></DialogHeader>
                    <pre className="bg-muted/30 p-3 rounded text-xs overflow-auto max-h-80 font-mono text-muted-foreground">{SAMPLE_XML}</pre>
                    <DialogFooter><Button variant="outline" onClick={() => setShowSample(false)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default CamtImport;
