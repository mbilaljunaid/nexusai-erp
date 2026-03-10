import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import {
    ChevronRight, ChevronLeft, CheckCircle2, FileText, Send, Download,
    Calculator, Globe, AlertTriangle, RefreshCw, Building2
} from "lucide-react";

// Oracle eBTax equivalent: VAT Return preparation + e-filing wizard (5 steps)

interface VatLine {
    boxRef: string;
    description: string;
    taxableAmount: number;
    vatAmount: number;
    editable: boolean;
}

const COUNTRIES = [
    { code: "GB", label: "United Kingdom (Making Tax Digital)", authority: "HMRC", frequency: "Quarterly", currency: "GBP", box: "UK_MTD" },
    { code: "AE", label: "UAE (Federal Tax Authority)", authority: "FTA", frequency: "Quarterly", currency: "AED", box: "UAE_FTA" },
    { code: "SA", label: "Saudi Arabia (ZATCA)", authority: "ZATCA", frequency: "Monthly", currency: "SAR", box: "SA_ZATCA" },
    { code: "DE", label: "Germany (Finanzamt)", authority: "Finanzamt", frequency: "Monthly", currency: "EUR", box: "DE_UVA" },
    { code: "FR", label: "France (DGFiP)", authority: "DGFiP", frequency: "Monthly", currency: "EUR", box: "FR_CA3" },
];

const UK_BOXES: VatLine[] = [
    { boxRef: "Box 1", description: "VAT due on sales and other outputs", taxableAmount: 0, vatAmount: 42750.00, editable: false },
    { boxRef: "Box 2", description: "VAT due on acquisitions from EU member states", taxableAmount: 0, vatAmount: 1250.00, editable: true },
    { boxRef: "Box 3", description: "Total VAT due (Box 1 + Box 2)", taxableAmount: 0, vatAmount: 44000.00, editable: false },
    { boxRef: "Box 4", description: "VAT reclaimed on purchases and other inputs", taxableAmount: 0, vatAmount: 28400.00, editable: false },
    { boxRef: "Box 5", description: "Net VAT to pay (Box 3 − Box 4)", taxableAmount: 0, vatAmount: 15600.00, editable: false },
    { boxRef: "Box 6", description: "Total value of sales and outputs (excl. VAT)", taxableAmount: 285000.00, vatAmount: 0, editable: false },
    { boxRef: "Box 7", description: "Total value of purchases and inputs (excl. VAT)", taxableAmount: 189333.00, vatAmount: 0, editable: false },
    { boxRef: "Box 8", description: "Total value of EC supplies of goods and related costs", taxableAmount: 0, vatAmount: 0, editable: true },
    { boxRef: "Box 9", description: "Total value of EC acquisitions and related costs", taxableAmount: 0, vatAmount: 0, editable: true },
];

const UAE_BOXES: VatLine[] = [
    { boxRef: "1a", description: "Standard-rated supplies in UAE (5%)", taxableAmount: 348000, vatAmount: 17400, editable: false },
    { boxRef: "1b", description: "Zero-rated supplies", taxableAmount: 45000, vatAmount: 0, editable: false },
    { boxRef: "1c", description: "Exempt supplies", taxableAmount: 12000, vatAmount: 0, editable: false },
    { boxRef: "2", description: "Output VAT on reverse charge", taxableAmount: 28000, vatAmount: 1400, editable: true },
    { boxRef: "3", description: "Total Output VAT", taxableAmount: 0, vatAmount: 18800, editable: false },
    { boxRef: "4a", description: "Recoverable input VAT (standard)", taxableAmount: 0, vatAmount: 11650, editable: false },
    { boxRef: "4b", description: "Input VAT on imports", taxableAmount: 0, vatAmount: 3200, editable: false },
    { boxRef: "5", description: "Net VAT Payable", taxableAmount: 0, vatAmount: 3950, editable: false },
];

const PERIODS = ["Q1 2026 (Jan–Mar)", "Q4 2025 (Oct–Dec)", "Q3 2025 (Jul–Sep)", "Q2 2025 (Apr–Jun)"];

export function VatReturnWizard() {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [country, setCountry] = useState("GB");
    const [period, setPeriod] = useState(PERIODS[0]);
    const [legalEntity, setLegalEntity] = useState("UK Ltd");
    const [vatReg, setVatReg] = useState("GB987654321");
    const [boxes, setBoxes] = useState<VatLine[]>([]);
    const [filing, setFiling] = useState(false);
    const [filed, setFiled] = useState(false);
    const [filingRef, setFilingRef] = useState("");

    const countryInfo = COUNTRIES.find(c => c.code === country)!;
    const boxSource = country === "AE" ? UAE_BOXES : UK_BOXES;
    const netPayable = boxes.find(b => b.boxRef === "Box 5" || b.boxRef === "5")?.vatAmount ?? 0;

    const initBoxes = () => setBoxes(boxSource.map(b => ({ ...b })));

    const updateBox = (boxRef: string, field: "taxableAmount" | "vatAmount", value: string) => {
        setBoxes(prev => prev.map(b => b.boxRef === boxRef ? { ...b, [field]: parseFloat(value) || 0 } : b));
    };

    const handleFile = async () => {
        setFiling(true);
        await new Promise(r => setTimeout(r, 2000));
        const ref = `${country}-VAT-${Date.now().toString().slice(-8)}`;
        setFilingRef(ref);
        setFiled(true);
        setFiling(false);
        toast({
            title: `VAT Return Filed — ${ref}`,
            description: `Submitted to ${countryInfo.authority}. Acknowledgement reference: ${ref}`,
            className: "bg-green-900 border-green-700 text-white",
        });
        setStep(5);
    };

    const STEP_LABELS = ["Setup", "Calculation", "Review Boxes", "Submit", "Confirmation"];

    return (
        <StandardPage
            title="VAT Return Filing Wizard"
            description={`Prepare and submit VAT returns to ${countryInfo.authority}`}
        >
            {/* Step indicator */}
            <div className="flex items-center mb-6 gap-0">
                {STEP_LABELS.map((label, i) => (
                    <div key={label} className="flex items-center flex-1">
                        <div className={`flex items-center gap-2 flex-1`}>
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${i + 1 < step ? "bg-green-600 text-white" : i + 1 === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                            </div>
                            <span className={`text-xs ${i + 1 === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                        </div>
                        {i < STEP_LABELS.length - 1 && <div className="h-px w-6 bg-border mx-2 shrink-0" />}
                    </div>
                ))}
            </div>

            {/* Step 1: Setup */}
            {step === 1 && (
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Return Setup</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 max-w-lg">
                            <div>
                                <Label htmlFor="country">Country / Tax Authority</Label>
                                <Select value={country} onValueChange={setCountry}>
                                    <SelectTrigger id="country" className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="period">Return Period</Label>
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger id="period" className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {PERIODS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="le">Legal Entity</Label>
                                <Select value={legalEntity} onValueChange={setLegalEntity}>
                                    <SelectTrigger id="le" className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["UK Ltd", "UAE FZ LLC", "KSA LLC"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="vatreg">VAT Registration Number</Label>
                                <Input id="vatreg" className="mt-1 font-mono" value={vatReg} onChange={e => setVatReg(e.target.value)} />
                            </div>
                        </div>
                        <div className="mt-4 bg-muted/30 rounded p-3 text-xs space-y-1 max-w-lg">
                            <div className="flex justify-between"><span className="text-muted-foreground">Authority</span><span>{countryInfo.authority}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Filing Frequency</span><span>{countryInfo.frequency}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span>{countryInfo.currency}</span></div>
                        </div>
                        <Button className="mt-4" onClick={() => { initBoxes(); setStep(2); }}>
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Calculation Summary */}
            {step === 2 && (
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Data Extraction Summary</CardTitle>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">Auto-extracted from sub-ledgers</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[
                                { label: "Output VAT (Sales)", amount: boxes.find(b => b.boxRef === "Box 1" || b.boxRef === "1a")?.vatAmount ?? 0, color: "text-blue-400" },
                                { label: "Input VAT (Purchases)", amount: boxes.find(b => b.boxRef === "Box 4" || b.boxRef === "4a")?.vatAmount ?? 0, color: "text-green-400" },
                                { label: "Net VAT Payable", amount: netPayable, color: netPayable > 0 ? "text-red-400" : "text-green-400" },
                            ].map(m => (
                                <Card key={m.label} className="border-border">
                                    <CardContent className="pt-4 pb-4 text-center">
                                        <p className="text-xs text-muted-foreground">{m.label}</p>
                                        <p className={`text-xl font-bold ${m.color} mt-1`}>{countryInfo.currency} {formatNumber(m.amount)}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
                            <Button onClick={() => setStep(3)}>Review Box Values <ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Review Boxes */}
            {step === 3 && (
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Return Box Values</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/20">
                                <tr>
                                    <th className="p-3 text-left w-24">Box</th>
                                    <th className="p-3 text-left">Description</th>
                                    <th className="p-3 text-right w-40">Taxable Amount ({countryInfo.currency})</th>
                                    <th className="p-3 text-right w-40">VAT Amount ({countryInfo.currency})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {boxes.map(b => (
                                    <tr key={b.boxRef} className="hover:bg-muted/10">
                                        <td className="p-3 font-mono font-bold text-primary">{b.boxRef}</td>
                                        <td className="p-3 text-muted-foreground text-xs">{b.description}</td>
                                        <td className="p-3 text-right">
                                            {b.editable && b.taxableAmount !== undefined ? (
                                                <Input type="number" className="h-7 text-xs text-right w-36 ml-auto"
                                                    value={b.taxableAmount} onChange={e => updateBox(b.boxRef, "taxableAmount", e.target.value)} />
                                            ) : b.taxableAmount ? formatNumber(b.taxableAmount) : "—"}
                                        </td>
                                        <td className="p-3 text-right font-medium">
                                            {b.editable ? (
                                                <Input type="number" className="h-7 text-xs text-right w-36 ml-auto"
                                                    value={b.vatAmount} onChange={e => updateBox(b.boxRef, "vatAmount", e.target.value)} />
                                            ) : b.vatAmount ? formatNumber(b.vatAmount) : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t border-border bg-muted/10">
                                <tr>
                                    <td colSpan={3} className="p-3 font-semibold text-right">Net VAT {netPayable >= 0 ? "Payable" : "Refundable"}</td>
                                    <td className={`p-3 font-bold text-right ${netPayable >= 0 ? "text-red-400" : "text-green-400"}`}>
                                        {countryInfo.currency} {formatNumber(Math.abs(netPayable))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                        <div className="p-4 flex gap-2">
                            <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
                            <Button onClick={() => setStep(4)}>Proceed to Submit <ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Submit */}
            {step === 4 && (
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Submit Return to {countryInfo.authority}</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-w-md">
                            <div className="bg-muted/30 rounded p-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Legal Entity</span><span>{legalEntity}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">VAT Number</span><span className="font-mono">{vatReg}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Period</span><span>{period}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Authority</span><span>{countryInfo.authority}</span></div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                    <span>Net VAT Payable</span>
                                    <span className="text-red-400">{countryInfo.currency} {formatNumber(netPayable)}</span>
                                </div>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-400">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                Submitting this return will transmit to {countryInfo.authority}'s online portal. Ensure all figures are verified before proceeding.
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setStep(3)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />Export as PDF
                                </Button>
                                <Button onClick={handleFile} disabled={filing}>
                                    {filing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                    {filing ? "Submitting..." : `Submit to ${countryInfo.authority}`}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
                <Card className="border-green-500/30">
                    <CardContent className="pt-10 pb-10 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">VAT Return Filed Successfully</h2>
                        <p className="text-muted-foreground mb-4">
                            Your VAT return for <strong>{period}</strong> has been submitted to {countryInfo.authority}.
                        </p>
                        <div className="bg-muted/30 rounded p-4 inline-block text-left text-sm mb-6">
                            <div className="flex justify-between gap-8 mb-1">
                                <span className="text-muted-foreground">Filing Reference</span>
                                <span className="font-mono font-bold text-primary">{filingRef}</span>
                            </div>
                            <div className="flex justify-between gap-8 mb-1">
                                <span className="text-muted-foreground">Amount Payable</span>
                                <span className="font-bold text-red-400">{countryInfo.currency} {formatNumber(netPayable)}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                                <span className="text-muted-foreground">Filed At</span>
                                <span>{new Date().toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Download Acknowledgment</Button>
                            <Button onClick={() => { setStep(1); setFiled(false); setBoxes([]); }}>
                                File Another Return
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </StandardPage>
    );
}

export default VatReturnWizard;
