import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Upload, RefreshCw, Plus, MapPin } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type RateType = "GSA Domestic" | "UN ICSC Intl" | "Custom";

interface PerDiemRate {
    id: string;
    country: string;
    city: string;
    state: string;
    effectiveFrom: string;
    effectiveTo: string | null;
    lodgingRate: number;
    mealsRate: number;
    incidentalsRate: number;
    totalRate: number;
    currency: string;
    rateType: RateType;
    status: "Active" | "Expired" | "Pending";
}

interface ImportBatch {
    id: string;
    source: string;
    importedDate: string;
    rateYear: string;
    rowCount: number;
    status: "Complete" | "Partial" | "Failed";
}

const MOCK_RATES: PerDiemRate[] = [
    { id: "PD001", country: "USA", city: "New York City", state: "NY", effectiveFrom: "2026-01-01", effectiveTo: null, lodgingRate: 280, mealsRate: 79, incidentalsRate: 5, totalRate: 364, currency: "USD", rateType: "GSA Domestic", status: "Active" },
    { id: "PD002", country: "USA", city: "San Francisco", state: "CA", effectiveFrom: "2026-01-01", effectiveTo: null, lodgingRate: 265, mealsRate: 79, incidentalsRate: 5, totalRate: 349, currency: "USD", rateType: "GSA Domestic", status: "Active" },
    { id: "PD003", country: "USA", city: "Washington DC", state: "DC", effectiveFrom: "2026-01-01", effectiveTo: null, lodgingRate: 258, mealsRate: 79, incidentalsRate: 5, totalRate: 342, currency: "USD", rateType: "GSA Domestic", status: "Active" },
    { id: "PD004", country: "USA", city: "Boston", state: "MA", effectiveFrom: "2026-01-01", effectiveTo: null, lodgingRate: 241, mealsRate: 74, incidentalsRate: 5, totalRate: 320, currency: "USD", rateType: "GSA Domestic", status: "Active" },
    { id: "PD005", country: "USA", city: "Chicago", state: "IL", effectiveFrom: "2026-01-01", effectiveTo: null, lodgingRate: 187, mealsRate: 74, incidentalsRate: 5, totalRate: 266, currency: "USD", rateType: "GSA Domestic", status: "Active" },
    { id: "PD006", country: "USA", city: "Standard CONUS", state: "All Other", effectiveFrom: "2026-01-01", effectiveTo: null, lodgingRate: 107, mealsRate: 59, incidentalsRate: 5, totalRate: 171, currency: "USD", rateType: "GSA Domestic", status: "Active" },
    { id: "PD007", country: "United Kingdom", city: "London", state: "England", effectiveFrom: "2026-01-01", effectiveTo: null, lodgingRate: 330, mealsRate: 95, incidentalsRate: 10, totalRate: 435, currency: "GBP", rateType: "UN ICSC Intl", status: "Active" },
    { id: "PD008", country: "Germany", city: "Frankfurt", state: "Hesse", effectiveFrom: "2026-01-01", effectiveTo: null, lodgingRate: 195, mealsRate: 58, incidentalsRate: 8, totalRate: 261, currency: "EUR", rateType: "UN ICSC Intl", status: "Active" },
    { id: "PD009", country: "UAE", city: "Dubai", state: "Dubai Emirate", effectiveFrom: "2026-01-01", effectiveTo: null, lodgingRate: 700, mealsRate: 185, incidentalsRate: 25, totalRate: 910, currency: "AED", rateType: "Custom", status: "Active" },
    { id: "PD010", country: "Singapore", city: "Singapore", state: "Singapore", effectiveFrom: "2026-01-01", effectiveTo: null, lodgingRate: 350, mealsRate: 110, incidentalsRate: 15, totalRate: 475, currency: "SGD", rateType: "UN ICSC Intl", status: "Active" },
    { id: "PD011", country: "USA", city: "Seattle", state: "WA", effectiveFrom: "2025-01-01", effectiveTo: "2025-12-31", lodgingRate: 222, mealsRate: 74, incidentalsRate: 5, totalRate: 301, currency: "USD", rateType: "GSA Domestic", status: "Expired" },
];

const MOCK_BATCHES: ImportBatch[] = [
    { id: "IMP001", source: "GSA FY2026 Domestic Rates (CSV)", importedDate: "2026-01-03", rateYear: "FY2026", rowCount: 4286, status: "Complete" },
    { id: "IMP002", source: "UN ICSC FY2026 International Allowances (XML)", importedDate: "2026-01-05", rateYear: "FY2026", rowCount: 912, status: "Complete" },
    { id: "IMP003", source: "GSA FY2025 Domestic Rates (CSV)", importedDate: "2025-01-04", rateYear: "FY2025", rowCount: 4249, status: "Complete" },
];

const statusBadge: Record<PerDiemRate["status"], string> = { Active: "default", Expired: "secondary", Pending: "outline" };
const typeBadge: Record<RateType, string> = { "GSA Domestic": "default", "UN ICSC Intl": "secondary", "Custom": "outline" };
const importBadge: Record<ImportBatch["status"], string> = { Complete: "default", Partial: "outline", Failed: "destructive" };

export default function PerDiemRateTable() {
    const { toast } = useToast();
    const [rates, setRates] = useState<PerDiemRate[]>(MOCK_RATES);
    const [batches] = useState<ImportBatch[]>(MOCK_BATCHES);
    const [addOpen, setAddOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [filterCountry, setFilterCountry] = useState("All");
    const [filterType, setFilterType] = useState("All");

    // Add rate form
    const [fCountry, setFCountry] = useState("");
    const [fCity, setFCity] = useState("");
    const [fState, setFState] = useState("");
    const [fFrom, setFFrom] = useState(new Date().toISOString().slice(0, 10));
    const [fLodge, setFLodge] = useState("");
    const [fMeals, setFMeals] = useState("");
    const [fInc, setFInc] = useState("5");
    const [fCurrency, setFCurrency] = useState("USD");
    const [fType, setFType] = useState<RateType>("Custom");

    const filtered = rates.filter(r =>
        (filterCountry === "All" || r.country === filterCountry) &&
        (filterType === "All" || r.rateType === filterType)
    );

    const countries = ["All", ...Array.from(new Set(rates.map(r => r.country)))];

    const handleAdd = () => {
        if (!fCountry || !fCity || !fLodge || !fMeals) {
            toast({ title: "Validation Error", description: "Country, city, lodging, and meals rates are required.", variant: "destructive" }); return;
        }
        const lodge = parseFloat(fLodge), meals = parseFloat(fMeals), inc = parseFloat(fInc) || 5;
        const newRate: PerDiemRate = {
            id: `PD${String(rates.length + 1).padStart(3, "0")}`, country: fCountry, city: fCity, state: fState,
            effectiveFrom: fFrom, effectiveTo: null, lodgingRate: lodge, mealsRate: meals, incidentalsRate: inc,
            totalRate: lodge + meals + inc, currency: fCurrency, rateType: fType, status: "Active",
        };
        setRates(prev => [newRate, ...prev]);
        toast({ title: "Per Diem Rate Added", description: `${fCity}, ${fCountry} — ${fCurrency} ${formatNumber(newRate.totalRate)}/day effective ${fFrom}.` });
        setAddOpen(false);
    };

    const columns: SpreadsheetColumn<PerDiemRate>[] = useMemo(() => [
        { id: "city", header: "City / Location", width: "170px", cellClassName: "font-medium text-sm", cell: r => <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" />{r.city}</span> },
        { id: "country", header: "Country", width: "110px", cellClassName: "text-sm", cell: r => r.country },
        { id: "rateType", header: "Source", width: "110px", cell: r => <Badge variant={typeBadge[r.rateType] as any} className="text-xs">{r.rateType}</Badge> },
        { id: "effectiveFrom", header: "Effective", width: "100px", cellClassName: "font-mono text-sm", cell: r => r.effectiveFrom },
        { id: "lodging", header: "Lodging", width: "100px", cellClassName: "text-right font-mono", cell: r => `${r.currency} ${formatNumber(r.lodgingRate)}` },
        { id: "meals", header: "M&IE", width: "90px", cellClassName: "text-right font-mono", cell: r => `${r.currency} ${formatNumber(r.mealsRate)}` },
        { id: "inc", header: "Incidentals", width: "95px", cellClassName: "text-right font-mono text-muted-foreground", cell: r => `${r.currency} ${formatNumber(r.incidentalsRate)}` },
        { id: "total", header: "Total/Day", width: "110px", cellClassName: "text-right font-mono font-bold text-primary", cell: r => `${r.currency} ${formatNumber(r.totalRate)}` },
        { id: "status", header: "Status", width: "90px", cell: r => <Badge variant={statusBadge[r.status] as any}>{r.status}</Badge> },
    ], []);

    const batchColumns: SpreadsheetColumn<ImportBatch>[] = useMemo(() => [
        { id: "source", header: "Source / File", width: "300px", cellClassName: "text-sm", cell: r => r.source },
        { id: "rateYear", header: "Rate Year", width: "100px", cellClassName: "font-mono text-sm", cell: r => r.rateYear },
        { id: "importedDate", header: "Imported", width: "110px", cellClassName: "font-mono text-sm", cell: r => r.importedDate },
        { id: "rowCount", header: "Rates", width: "80px", cellClassName: "font-mono text-center", cell: r => r.rowCount.toLocaleString() },
        { id: "status", header: "Status", width: "90px", cell: r => <Badge variant={importBadge[r.status] as any}>{r.status}</Badge> },
    ], []);

    return (
        <StandardPage
            title="Per Diem Rate Table"
            description="Manage employee travel per diem allowances: GSA domestic rates, UN ICSC international rates, and custom corporate rates. Rates auto-populate on expense reports based on destination city."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Expense Management", href: "/finance/expense-management" },
                { label: "Per Diem Rates" },
            ]}
            actions={
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" /> Import GSA / UN Rates
                    </Button>
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Rate
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                    { l: "Active Rates", v: rates.filter(r => r.status === "Active").length, c: "border-l-primary" },
                    { l: "GSA Domestic", v: rates.filter(r => r.rateType === "GSA Domestic" && r.status === "Active").length, c: "border-l-secondary" },
                    { l: "UN ICSC Intl", v: rates.filter(r => r.rateType === "UN ICSC Intl" && r.status === "Active").length, c: "border-l-secondary" },
                    { l: "Custom Rates", v: rates.filter(r => r.rateType === "Custom").length, c: "border-l-amber-400" },
                ].map(m => (
                    <Card key={m.l} className={`border-l-4 ${m.c}`}>
                        <CardContent className="p-4"><p className="text-xs text-muted-foreground">{m.l}</p><p className="text-2xl font-bold font-mono">{m.v}</p></CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="rates">
                <TabsList className="mb-3">
                    <TabsTrigger value="rates">Rate Table</TabsTrigger>
                    <TabsTrigger value="imports">Import History</TabsTrigger>
                </TabsList>
                <TabsContent value="rates">
                    <div className="flex gap-3 mb-3">
                        <Select value={filterCountry} onValueChange={setFilterCountry}>
                            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Country" /></SelectTrigger>
                            <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Rate Type" /></SelectTrigger>
                            <SelectContent>
                                {["All", "GSA Domestic", "UN ICSC Intl", "Custom"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <InteractiveSpreadsheet<PerDiemRate> data={filtered} columns={columns} onChange={() => { }} containerHeight="400px" />
                </TabsContent>
                <TabsContent value="imports">
                    <InteractiveSpreadsheet<ImportBatch> data={batches} columns={batchColumns} onChange={() => { }} containerHeight="360px" />
                </TabsContent>
            </Tabs>

            {/* Add Rate Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Per Diem Rate</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1"><Label>Country *</Label><Input value={fCountry} onChange={e => setFCountry(e.target.value)} placeholder="USA" /></div>
                            <div className="space-y-1"><Label>City *</Label><Input value={fCity} onChange={e => setFCity(e.target.value)} placeholder="Denver" /></div>
                            <div className="space-y-1"><Label>State / Region</Label><Input value={fState} onChange={e => setFState(e.target.value)} placeholder="CO" /></div>
                            <div className="space-y-1"><Label>Effective From *</Label><Input type="date" value={fFrom} onChange={e => setFFrom(e.target.value)} /></div>
                            <div className="space-y-1">
                                <Label>Currency</Label>
                                <Select value={fCurrency} onValueChange={setFCurrency}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{["USD", "EUR", "GBP", "AED", "SGD"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Rate Source</Label>
                                <Select value={fType} onValueChange={v => setFType(v as RateType)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GSA Domestic">GSA Domestic</SelectItem>
                                        <SelectItem value="UN ICSC Intl">UN ICSC International</SelectItem>
                                        <SelectItem value="Custom">Custom Corporate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1"><Label>Lodging / Night *</Label><Input type="number" step="1" className="font-mono" value={fLodge} onChange={e => setFLodge(e.target.value)} /></div>
                            <div className="space-y-1"><Label>Meals & Incidentals *</Label><Input type="number" step="1" className="font-mono" value={fMeals} onChange={e => setFMeals(e.target.value)} /></div>
                            <div className="space-y-1 col-span-2">
                                <Label>Incidentals</Label>
                                <Input type="number" step="1" className="font-mono w-28" value={fInc} onChange={e => setFInc(e.target.value)} />
                            </div>
                        </div>
                        {fLodge && fMeals && (
                            <div className="p-2.5 bg-muted/30 rounded-lg text-sm font-mono">
                                <span className="text-muted-foreground">Total per day:</span> <span className="font-bold text-primary">{fCurrency} {formatNumber((parseFloat(fLodge) || 0) + (parseFloat(fMeals) || 0) + (parseFloat(fInc) || 0))}</span>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Add Rate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle><Upload className="h-5 w-5 text-primary inline mr-2" />Import GSA / UN ICSC Rates</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-muted-foreground">Download official rate tables from the links below and upload the CSV/XML file to auto-populate all destinations for the selected fiscal year.</p>
                        {[
                            { label: "GSA Domestic Rates", url: "gsa.gov/travel/plan-book/per-diem-rates", format: "CSV", note: "United States CONUS + OCONUS" },
                            { label: "UN ICSC International", url: "icsc.un.org/resources/hrpd/daily-subsistence-allowance", format: "XML/PDF", note: "193 countries, quarterly updates" },
                        ].map(s => (
                            <div key={s.label} className="p-2.5 border rounded-lg">
                                <p className="font-medium text-sm">{s.label}</p>
                                <p className="text-xs text-muted-foreground">{s.note} — <span className="font-mono text-xs">{s.format}</span></p>
                                <p className="text-xs text-primary mt-0.5">{s.url}</p>
                            </div>
                        ))}
                        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { toast({ title: "Rate Import Simulated", description: "In production, this uploads a GSA CSV and bulk-creates per-diem rates." }); setImportOpen(false); }}>
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload CSV / XML</p>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setImportOpen(false)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
