import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Zap, Calculator, ChevronRight } from "lucide-react";

const REGIMES: any[] = [
    { id: "r-1", name: "EU VAT", country: "European Union", taxType: "VAT", status: "Active", taxCount: 5 },
    { id: "r-2", name: "US Sales Tax", country: "United States", taxType: "Sales Tax", status: "Active", taxCount: 52 },
    { id: "r-3", name: "UK VAT", country: "United Kingdom", taxType: "VAT", status: "Active", taxCount: 3 },
    { id: "r-4", name: "GST – Australia", country: "Australia", taxType: "GST", status: "Active", taxCount: 1 },
    { id: "r-5", name: "UAE VAT", country: "UAE", taxType: "VAT", status: "Active", taxCount: 2 },
];

const TAXES: any[] = [
    { id: "t-1", regime: "EU VAT", name: "Standard Rate VAT", allowExemptions: true, status: "Active" },
    { id: "t-2", regime: "EU VAT", name: "Reduced Rate VAT", allowExemptions: true, status: "Active" },
    { id: "t-3", regime: "UK VAT", name: "UK Standard VAT", allowExemptions: true, status: "Active" },
    { id: "t-4", regime: "UAE VAT", name: "UAE VAT", allowExemptions: false, status: "Active" },
];

const RATES: any[] = [
    { id: "ra-1", tax: "Standard Rate VAT", status: "Standard", rate: "20.00%", effectiveFrom: "2011-01-04", effectiveTo: "–", rateType: "Percentage" },
    { id: "ra-2", tax: "Standard Rate VAT", status: "Zero-Rated", rate: "0.00%", effectiveFrom: "2011-01-04", effectiveTo: "–", rateType: "Percentage" },
    { id: "ra-3", tax: "Reduced Rate VAT", status: "Reduced", rate: "5.00%", effectiveFrom: "2011-01-04", effectiveTo: "–", rateType: "Percentage" },
    { id: "ra-4", tax: "UK Standard VAT", status: "Standard", rate: "20.00%", effectiveFrom: "2011-01-04", effectiveTo: "–", rateType: "Percentage" },
];

interface SimResult { regime: string; tax: string; status: string; rate: string; basis: number; taxAmount: number }

export default function TaxRegimeSetup() {
    const { toast } = useToast();
    const [regimeDialog, setRegimeDialog] = useState(false);
    const [newRegime, setNewRegime] = useState({ name: "", country: "", taxType: "VAT" });
    const [simForm, setSimForm] = useState({ supplierCountry: "GB", customerCountry: "GB", itemCategory: "Goods", amount: "10000" });
    const [simResult, setSimResult] = useState<SimResult | null>(null);

    const regimeColumns = useMemo((): SpreadsheetColumn<any>[] => [
        { id: "name", header: "Regime Name", width: "220px", cell: (r) => <span className="font-semibold text-primary">{r.name}</span> },
        { id: "country", header: "Country / Region", width: "180px" },
        { id: "taxType", header: "Tax Type", width: "130px", cell: (r) => <Badge variant="outline">{r.taxType}</Badge> },
        { id: "taxCount", header: "Taxes Defined", width: "130px", cell: (r) => <Badge variant="secondary">{r.taxCount}</Badge> },
        { id: "status", header: "Status", width: "120px", cell: (r) => <StatusBadge status={r.status} /> },
    ], []);

    const taxColumns = useMemo((): SpreadsheetColumn<any>[] => [
        { id: "regime", header: "Regime", width: "180px", cell: (r) => <span className="text-sm text-muted-foreground">{r.regime}</span> },
        { id: "name", header: "Tax Name", width: "240px", cell: (r) => <span className="font-medium">{r.name}</span> },
        { id: "allowExemptions", header: "Allow Exemptions", width: "160px", cell: (r) => <StatusBadge status={r.allowExemptions ? "Active" : "Inactive"} label={r.allowExemptions ? "Yes" : "No"} /> },
        { id: "status", header: "Status", width: "120px", cell: (r) => <StatusBadge status={r.status} /> },
    ], []);

    const rateColumns = useMemo((): SpreadsheetColumn<any>[] => [
        { id: "tax", header: "Tax", width: "220px", cell: (r) => <span className="text-sm text-muted-foreground">{r.tax}</span> },
        { id: "status", header: "Tax Status", width: "140px", cell: (r) => <Badge variant="outline">{r.status}</Badge> },
        { id: "rate", header: "Rate %", width: "100px", cell: (r) => <span className="font-mono font-semibold">{r.rate}</span> },
        { id: "rateType", header: "Rate Type", width: "130px" },
        { id: "effectiveFrom", header: "Effective From", width: "140px" },
        { id: "effectiveTo", header: "Effective To", width: "130px" },
    ], []);

    const handleRunSimulator = () => {
        const amount = parseFloat(simForm.amount) || 0;
        let rate = 0;
        let taxName = "";
        let regime = "";
        let status = "Standard";

        if (simForm.customerCountry === "GB" && simForm.supplierCountry === "GB") {
            regime = "UK VAT"; taxName = "UK Standard VAT"; rate = 0.20;
        } else if (["DE", "FR", "IT", "ES", "NL"].includes(simForm.customerCountry)) {
            regime = "EU VAT"; taxName = "Standard Rate VAT"; rate = 0.20;
        } else if (simForm.customerCountry === "AE") {
            regime = "UAE VAT"; taxName = "UAE VAT"; rate = 0.05;
        } else if (simForm.customerCountry === "AU") {
            regime = "GST – Australia"; taxName = "Australian GST"; rate = 0.10;
        } else {
            regime = "US Sales Tax"; taxName = "State Sales Tax (avg)"; rate = 0.087;
        }
        if (simForm.itemCategory === "Services" && (simForm.customerCountry !== simForm.supplierCountry)) {
            rate = 0; status = "Zero-Rated";
        }
        setSimResult({ regime, tax: taxName, status, rate: `${(rate * 100).toFixed(2)}%`, basis: amount, taxAmount: amount * rate });
    };

    return (
        <StandardPage
            title="Tax Regime Configuration"
            description="Configure the Oracle eBTax-style 4-level tax hierarchy: Regime → Tax → Status → Rate, plus a live tax simulator."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Tax Management", href: "/tax" },
                { label: "Tax Regime Setup" },
            ]}
        >
            <Tabs defaultValue="regimes" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="regimes">Regimes</TabsTrigger>
                    <TabsTrigger value="taxes">Taxes</TabsTrigger>
                    <TabsTrigger value="rates">Rates</TabsTrigger>
                    <TabsTrigger value="simulator" className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" /> Simulator
                    </TabsTrigger>
                </TabsList>

                {/* REGIMES TAB */}
                <TabsContent value="regimes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Tax Regimes</CardTitle>
                                <CardDescription>The top-level tax hierarchy node. Each regime represents a distinct tax system (e.g., VAT, US Sales Tax, GST).</CardDescription>
                            </div>
                            <Button onClick={() => setRegimeDialog(true)}>
                                <Plus className="h-4 w-4 mr-2" /> Add Regime
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 h-[380px]">
                            <InteractiveSpreadsheet data={REGIMES} columns={regimeColumns} onChange={() => { }} containerHeight="380px" />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAXES TAB */}
                <TabsContent value="taxes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Taxes</CardTitle>
                                <CardDescription>Child nodes of a Regime. Each tax represents a specific levy (e.g., Standard Rate VAT within EU VAT).</CardDescription>
                            </div>
                            <Button onClick={() => toast({ title: "Tax creation form — connect to API for live data" })}>
                                <Plus className="h-4 w-4 mr-2" /> Add Tax
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 h-[380px]">
                            <InteractiveSpreadsheet data={TAXES} columns={taxColumns} onChange={() => { }} containerHeight="380px" />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* RATES TAB */}
                <TabsContent value="rates">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Tax Rates</CardTitle>
                                <CardDescription>Effective-dated percentage rates assigned to each Tax Status. Multiple rates allow for historical rate changes.</CardDescription>
                            </div>
                            <Button onClick={() => toast({ title: "Rate creation form — connect to API for live data" })}>
                                <Plus className="h-4 w-4 mr-2" /> Add Rate
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 h-[380px]">
                            <InteractiveSpreadsheet data={RATES} columns={rateColumns} onChange={() => { }} containerHeight="380px" />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SIMULATOR TAB */}
                <TabsContent value="simulator">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-primary" /> Mock Transaction
                                </CardTitle>
                                <CardDescription>Enter transaction details and the system shows which tax rules apply — matching Oracle's Tax Simulator.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Supplier (Ship-From) Country</Label>
                                    <Select value={simForm.supplierCountry} onValueChange={v => setSimForm({ ...simForm, supplierCountry: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {[["GB", "United Kingdom"], ["US", "United States"], ["DE", "Germany"], ["FR", "France"], ["AE", "UAE"], ["AU", "Australia"]].map(([v, l]) => (
                                                <SelectItem key={v} value={v}>{l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Customer (Ship-To) Country</Label>
                                    <Select value={simForm.customerCountry} onValueChange={v => setSimForm({ ...simForm, customerCountry: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {[["GB", "United Kingdom"], ["US", "United States"], ["DE", "Germany"], ["FR", "France"], ["IT", "Italy"], ["AE", "UAE"], ["AU", "Australia"], ["NL", "Netherlands"]].map(([v, l]) => (
                                                <SelectItem key={v} value={v}>{l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Item Category</Label>
                                    <Select value={simForm.itemCategory} onValueChange={v => setSimForm({ ...simForm, itemCategory: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Goods">Goods (Tangible)</SelectItem>
                                            <SelectItem value="Services">Services</SelectItem>
                                            <SelectItem value="Digital">Digital Products</SelectItem>
                                            <SelectItem value="Exempt">Tax-Exempt Supplies</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Transaction Amount</Label>
                                    <Input type="number" value={simForm.amount} onChange={e => setSimForm({ ...simForm, amount: e.target.value })} className="font-mono" placeholder="10000" />
                                </div>
                                <Button className="w-full" onClick={handleRunSimulator}>
                                    <Zap className="h-4 w-4 mr-2" /> Run Tax Simulator
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tax Determination Trace</CardTitle>
                                <CardDescription>Audit trail showing which regime and rate was selected and why.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {simResult ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline" className="text-xs">Regime</Badge>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                            <span className="font-medium">{simResult.regime}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline" className="text-xs">Tax</Badge>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                            <span className="font-medium">{simResult.tax}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline" className="text-xs">Status</Badge>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                            <StatusBadge status={simResult.status === "Zero-Rated" ? "Inactive" : "Active"} label={simResult.status} />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline" className="text-xs">Rate</Badge>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                            <span className="font-mono font-bold text-lg">{simResult.rate}</span>
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Tax Basis Amount</p>
                                                <p className="font-mono font-semibold">{simResult.basis.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Calculated Tax Amount</p>
                                                <p className="font-mono font-bold text-primary text-xl">{simResult.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                        <div className="p-3 border border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 rounded text-xs text-amber-800 dark:text-amber-300">
                                            <strong>Determination Logic:</strong> Country-pair ({simForm.supplierCountry} → {simForm.customerCountry}) matched to {simResult.regime}. Category "{simForm.itemCategory}" applied {simResult.status} status.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                                        Enter transaction details and click "Run Tax Simulator" to see the determination trace.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add Regime Dialog */}
            <Dialog open={regimeDialog} onOpenChange={setRegimeDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Tax Regime</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Regime Name *</Label>
                            <Input value={newRegime.name} onChange={e => setNewRegime({ ...newRegime, name: e.target.value })} placeholder="e.g. EU VAT" />
                        </div>
                        <div className="space-y-2">
                            <Label>Country / Region</Label>
                            <Input value={newRegime.country} onChange={e => setNewRegime({ ...newRegime, country: e.target.value })} placeholder="e.g. European Union" />
                        </div>
                        <div className="space-y-2">
                            <Label>Tax Type</Label>
                            <Select value={newRegime.taxType} onValueChange={v => setNewRegime({ ...newRegime, taxType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VAT">VAT</SelectItem>
                                    <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                                    <SelectItem value="GST">GST</SelectItem>
                                    <SelectItem value="WHT">Withholding Tax</SelectItem>
                                    <SelectItem value="Customs">Customs Duty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRegimeDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            if (!newRegime.name) { toast({ title: "Name required", variant: "destructive" }); return; }
                            toast({ title: `Tax Regime "${newRegime.name}" created` });
                            setRegimeDialog(false);
                        }}>Create Regime</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
