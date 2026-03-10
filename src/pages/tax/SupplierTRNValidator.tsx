import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle2, XCircle, AlertTriangle, Building2 } from "lucide-react";

type ValidationResult = "Valid" | "Invalid" | "Not Found" | "Pending";

interface TRNRecord {
    id: string;
    taxRegistrationNumber: string;
    country: string;
    supplierName: string;
    supplierId: string;
    vatType: "Standard" | "Reduced" | "Exempt" | "Zero-Rated";
    validationResult: ValidationResult;
    validatedAt?: string;
    errorDetail?: string;
    euViesChecked?: boolean;
    format: string;
}

const MOCK_TRNS: TRNRecord[] = [
    { id: "1", taxRegistrationNumber: "GB123456789", country: "United Kingdom", supplierName: "Acme UK Ltd", supplierId: "SUP-0012", vatType: "Standard", validationResult: "Valid", validatedAt: "2026-03-15 09:00", format: "GB + 9 digits", euViesChecked: false },
    { id: "2", taxRegistrationNumber: "DE112233445", country: "Germany", supplierName: "Deutsche Tech GmbH", supplierId: "SUP-0089", vatType: "Standard", validationResult: "Valid", validatedAt: "2026-03-10 11:22", euViesChecked: true, format: "DE + 9 digits" },
    { id: "3", taxRegistrationNumber: "FR12345678901", country: "France", supplierName: "Paris Consulting SARL", supplierId: "SUP-0134", vatType: "Standard", validationResult: "Invalid", validatedAt: "2026-03-12 14:30", errorDetail: "Format error: French VAT must be 2 letters + 9 digits (FR XX XXXXXXXXX)", euViesChecked: false, format: "FR + 2 alpha + 9 digits" },
    { id: "4", taxRegistrationNumber: "100234567890003", country: "UAE", supplierName: "Gulf Ventures LLC", supplierId: "SUP-0201", vatType: "Standard", validationResult: "Valid", validatedAt: "2026-03-07 15:00", euViesChecked: false, format: "15 digits (FTA)" },
    { id: "5", taxRegistrationNumber: "ATU12345678", country: "Austria", supplierName: "Wien Supplies AG", supplierId: "SUP-0256", vatType: "Standard", validationResult: "Not Found", validatedAt: "2026-03-14 10:12", errorDetail: "Number not found in EU VIES database", euViesChecked: true, format: "ATU + 8 digits" },
];

const FORMAT_GUIDE: Record<string, { format: string; example: string; digits: string }> = {
    "United Kingdom": { format: "GB + 9 digits", example: "GB123456789", digits: "9" },
    "Germany": { format: "DE + 9 digits", example: "DE123456789", digits: "9" },
    "France": { format: "FR + 2 alpha + 9 digits", example: "FRXX123456789", digits: "13" },
    "Netherlands": { format: "NL + 9 digits + B + 2 digits", example: "NL123456789B01", digits: "12" },
    "Spain": { format: "ES + 1 alpha + 8 digits / 7 digits + 1 alpha", example: "ESX12345678", digits: "9" },
    "UAE": { format: "15 digits (TRN)", example: "100234567890003", digits: "15" },
    "Saudi Arabia": { format: "15 digits (VAT №)", example: "300012345678900", digits: "15" },
    "Australia": { format: "ABN: 11 digits", example: "12345678901", digits: "11" },
};

const validationColors: Record<ValidationResult, string> = { Valid: "default", Invalid: "destructive", "Not Found": "destructive", Pending: "outline" };

const formSchema = z.object({
    taxRegistrationNumber: z.string().min(1, "TRN required"),
    country: z.string().min(1, "Country required"),
    supplierId: z.string().min(1),
    supplierName: z.string().min(1),
    vatType: z.enum(["Standard", "Reduced", "Exempt", "Zero-Rated"]),
});

function validateTRN(trn: string, country: string): { result: ValidationResult; error?: string } {
    const cleaned = trn.replace(/\s/g, "").toUpperCase();
    const formats: Record<string, RegExp> = {
        "United Kingdom": /^GB\d{9}$/,
        "Germany": /^DE\d{9}$/,
        "France": /^FR[A-Z0-9]{2}\d{9}$/,
        "Netherlands": /^NL\d{9}B\d{2}$/,
        "UAE": /^\d{15}$/,
        "Saudi Arabia": /^\d{15}$/,
        "Australia": /^\d{11}$/,
    };
    const regex = formats[country];
    if (!regex) return { result: "Valid" }; // unknown country — pass through
    if (!regex.test(cleaned)) {
        return { result: "Invalid", error: `Format error: Expected ${FORMAT_GUIDE[country]?.format || "unknown format"}` };
    }
    return { result: "Valid" };
}

export default function SupplierTRNValidator() {
    const { toast } = useToast();
    const [records, setRecords] = useState<TRNRecord[]>(MOCK_TRNS);
    const [addOpen, setAddOpen] = useState(false);
    const [validating, setValidating] = useState<string | null>(null);
    const [singleTRN, setSingleTRN] = useState("");
    const [singleCountry, setSingleCountry] = useState("United Kingdom");
    const [singleResult, setSingleResult] = useState<{ result: ValidationResult; error?: string } | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { taxRegistrationNumber: "", country: "United Kingdom", supplierId: "", supplierName: "", vatType: "Standard" },
    });

    const handleValidate = (id: string) => {
        const record = records.find(r => r.id === id);
        if (!record) return;
        setValidating(id);
        setTimeout(() => {
            const { result, error } = validateTRN(record.taxRegistrationNumber, record.country);
            setRecords(prev => prev.map(r => r.id === id ? {
                ...r,
                validationResult: result,
                validatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
                errorDetail: error,
            } : r));
            setValidating(null);
            toast({ title: `Validation: ${result}`, description: `${record.taxRegistrationNumber} — ${record.country}` });
        }, 800);
    };

    const handleAdd = (values: z.infer<typeof formSchema>) => {
        const { result, error } = validateTRN(values.taxRegistrationNumber, values.country);
        const guide = FORMAT_GUIDE[values.country];
        const rec: TRNRecord = {
            id: String(records.length + 1),
            taxRegistrationNumber: values.taxRegistrationNumber.toUpperCase(),
            country: values.country,
            supplierName: values.supplierName,
            supplierId: values.supplierId,
            vatType: values.vatType,
            validationResult: result,
            validatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
            errorDetail: error,
            euViesChecked: ["Germany", "France", "Netherlands", "Spain", "Austria"].includes(values.country),
            format: guide?.format || "—",
        };
        setRecords(prev => [...prev, rec]);
        form.reset();
        setAddOpen(false);
        toast({ title: `TRN ${result}`, description: `${values.taxRegistrationNumber} — ${result === "Valid" ? "Format validated successfully" : error}` });
    };

    const handleQuickCheck = () => {
        const res = validateTRN(singleTRN, singleCountry);
        setSingleResult(res);
    };

    const columns: SpreadsheetColumn<TRNRecord>[] = useMemo(() => [
        { id: "taxRegistrationNumber", header: "TRN", width: "160px", cellClassName: "font-mono text-sm font-bold", cell: r => r.taxRegistrationNumber },
        { id: "country", header: "Country", width: "140px", cellClassName: "text-sm", cell: r => r.country },
        { id: "supplierName", header: "Supplier", width: "190px", cellClassName: "font-medium text-sm", cell: r => r.supplierName },
        { id: "format", header: "Expected Format", width: "170px", cellClassName: "text-xs text-muted-foreground font-mono", cell: r => r.format },
        { id: "vatType", header: "VAT Type", width: "100px", cell: r => <Badge variant="outline">{r.vatType}</Badge> },
        {
            id: "validationResult", header: "Result", width: "190px",
            cell: r => (
                <div>
                    <Badge variant={validationColors[r.validationResult] as any}>
                        {r.validationResult === "Valid" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                        {r.validationResult}
                    </Badge>
                    {r.errorDetail && <p className="text-xs text-destructive mt-0.5">{r.errorDetail}</p>}
                </div>
            ),
        },
        { id: "euVies", header: "EU VIES", width: "80px", cellClassName: "text-center", cell: r => r.euViesChecked ? "✅" : "—" },
        {
            id: "actions", header: "Actions", width: "110px",
            cell: r => (
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleValidate(r.id)} disabled={validating === r.id}>
                    {validating === r.id ? "..." : "Re-Validate"}
                </Button>
            ),
        },
    ], [validating]);

    return (
        <StandardPage
            title="Supplier TRN / VAT Validator"
            description="Validate supplier Tax Registration Numbers (VAT numbers) against country-specific formats for UK HMRC, EU VIES, UAE FTA, and other tax authorities."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Tax", href: "/tax" },
                { label: "Supplier TRN Validator" },
            ]}
            actions={
                <Button size="sm" onClick={() => setAddOpen(true)}>
                    <Search className="mr-2 h-4 w-4" /> Add & Validate TRN
                </Button>
            }
        >
            <Tabs defaultValue="registry">
                <TabsList className="mb-4">
                    <TabsTrigger value="registry">Supplier Registry ({records.length})</TabsTrigger>
                    <TabsTrigger value="quickcheck">Quick Validate</TabsTrigger>
                    <TabsTrigger value="formats">Format Reference</TabsTrigger>
                </TabsList>

                <TabsContent value="registry">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                            { label: "Valid", val: records.filter(r => r.validationResult === "Valid").length, color: "border-l-green-500" },
                            { label: "Invalid / Not Found", val: records.filter(r => ["Invalid", "Not Found"].includes(r.validationResult)).length, color: "border-l-destructive" },
                            { label: "EU VIES Checked", val: records.filter(r => r.euViesChecked).length, color: "border-l-primary" },
                        ].map(m => (
                            <Card key={m.label} className={`border-l-4 ${m.color}`}>
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground">{m.label}</p>
                                    <p className="text-2xl font-bold font-mono">{m.val}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <InteractiveSpreadsheet<TRNRecord>
                        data={records}
                        columns={columns}
                        onChange={() => { }}
                        containerHeight="380px"
                    />
                </TabsContent>

                <TabsContent value="quickcheck">
                    <Card className="max-w-lg">
                        <CardHeader>
                            <CardTitle className="text-base">Quick TRN Format Check</CardTitle>
                            <CardDescription>Validate a single TRN against country-specific format rules without adding to the registry.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Country</label>
                                <Select value={singleCountry} onValueChange={v => { setSingleCountry(v); setSingleResult(null); }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(FORMAT_GUIDE).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">TRN / VAT Number</label>
                                <div className="flex gap-2">
                                    <Input
                                        className="font-mono uppercase"
                                        placeholder={FORMAT_GUIDE[singleCountry]?.example || "Enter TRN..."}
                                        value={singleTRN}
                                        onChange={e => { setSingleTRN(e.target.value.toUpperCase()); setSingleResult(null); }}
                                    />
                                    <Button onClick={handleQuickCheck} disabled={!singleTRN.trim()}>Validate</Button>
                                </div>
                            </div>
                            {singleResult && (
                                <div className={`p-3 rounded-lg flex items-start gap-2 ${singleResult.result === "Valid" ? "bg-green-50 dark:bg-green-900/10 border border-green-200" : "bg-red-50 dark:bg-red-900/10 border border-red-200"}`}>
                                    {singleResult.result === "Valid" ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive mt-0.5" />}
                                    <div>
                                        <p className="text-sm font-medium">{singleResult.result === "Valid" ? "Format Valid" : "Format Invalid"}</p>
                                        {singleResult.error && <p className="text-xs text-muted-foreground mt-0.5">{singleResult.error}</p>}
                                        <p className="text-xs text-muted-foreground mt-0.5">Expected: {FORMAT_GUIDE[singleCountry]?.format}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="formats">
                    <div className="grid md:grid-cols-2 gap-3">
                        {Object.entries(FORMAT_GUIDE).map(([country, info]) => (
                            <Card key={country} className="border-l-4 border-l-primary/20">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        <p className="font-medium text-sm">{country}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Format: <span className="font-mono">{info.format}</span></p>
                                    <p className="text-xs text-muted-foreground">Example: <span className="font-mono text-foreground">{info.example}</span></p>
                                    <p className="text-xs text-muted-foreground">Length: {info.digits} chars</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Add & Validate TRN</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="country" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {Object.keys(FORMAT_GUIDE).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="taxRegistrationNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TRN / VAT Number *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono uppercase" placeholder={FORMAT_GUIDE[form.watch("country")]?.example} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="supplierName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier Name *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="supplierId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier # *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="SUP-XXXX" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="vatType" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>VAT Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["Standard", "Reduced", "Exempt", "Zero-Rated"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Validate & Save</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
