import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle2, AlertTriangle, Play } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type ImportStatus = "Pending" | "Validating" | "Error" | "Ready" | "Imported";

interface APStagingLine {
    id: string;
    lineNum: number;
    invoiceNumber: string;
    invoiceDate: string;
    supplierNum: string;
    supplierName: string;
    amount: number;
    currency: string;
    dueDate: string;
    glAccount: string;
    description: string;
    status: ImportStatus;
    errorMessage?: string;
}

interface ImportBatch {
    id: string;
    batchName: string;
    source: string;
    uploadDate: string;
    totalLines: number;
    readyLines: number;
    errorLines: number;
    status: "Staged" | "Validated" | "Imported" | "Rejected";
}

const MOCK_BATCHES: ImportBatch[] = [
    { id: "APB-001", batchName: "March ERP Migration Invoices", source: "Legacy ERP CSV", uploadDate: "2026-03-30", totalLines: 48, readyLines: 46, errorLines: 2, status: "Validated" },
    { id: "APB-002", batchName: "Intercompany AP Invoices Q1", source: "AGIS Auto-Invoice", uploadDate: "2026-03-31", totalLines: 12, readyLines: 12, errorLines: 0, status: "Imported" },
];

const MOCK_LINES: APStagingLine[] = [
    { id: "1", lineNum: 1, invoiceNumber: "INV-LEGACY-001", invoiceDate: "2026-03-15", supplierNum: "SUP-0042", supplierName: "Acme Supplies Inc", amount: 12450.00, currency: "USD", dueDate: "2026-04-14", glAccount: "01-000-5100-000", description: "Office supplies March", status: "Ready" },
    { id: "2", lineNum: 2, invoiceNumber: "INV-LEGACY-002", invoiceDate: "2026-03-20", supplierNum: "SUP-0078", supplierName: "Global Tech Ltd", amount: 88200.00, currency: "USD", dueDate: "2026-04-19", glAccount: "01-000-6510-000", description: "Software licenses Q1", status: "Ready" },
    { id: "3", lineNum: 3, invoiceNumber: "INV-LEGACY-003", invoiceDate: "2026-03-25", supplierNum: "SUP-9999", supplierName: "UNKNOWN VENDOR", amount: 2100.00, currency: "USD", dueDate: "2026-04-24", glAccount: "01-000-5100-000", description: "Miscellaneous", status: "Error", errorMessage: "Supplier SUP-9999 not found in Supplier Master" },
    { id: "4", lineNum: 4, invoiceNumber: "INV-LEGACY-004", invoiceDate: "2026-03-28", supplierNum: "SUP-0123", supplierName: "Prime Properties LLC", amount: 28500.00, currency: "USD", dueDate: "2026-04-27", glAccount: "01-000-6100-000", description: "March office lease", status: "Ready" },
];

const lineStatusColors: Record<ImportStatus, string> = { Pending: "outline", Validating: "secondary", Error: "destructive", Ready: "default", Imported: "secondary" };
const batchStatusColors: Record<ImportBatch["status"], string> = { Staged: "outline", Validated: "default", Imported: "secondary", Rejected: "destructive" };

const formSchema = z.object({
    batchName: z.string().min(1, "Batch name required"),
    source: z.string().min(1, "Source required"),
    csvContent: z.string().min(1, "Content required"),
});

export default function APOpenInterface() {
    const { toast } = useToast();
    const [batches, setBatches] = useState<ImportBatch[]>(MOCK_BATCHES);
    const [lines] = useState<APStagingLine[]>(MOCK_LINES);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [importConfirm, setImportConfirm] = useState<ImportBatch | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { batchName: "", source: "CSV Upload", csvContent: "" },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const newBatch: ImportBatch = {
            id: `APB-${String(batches.length + 1).padStart(3, "0")}`,
            batchName: values.batchName,
            source: values.source,
            uploadDate: new Date().toISOString().slice(0, 10),
            totalLines: MOCK_LINES.length,
            readyLines: MOCK_LINES.filter(l => l.status === "Ready").length,
            errorLines: MOCK_LINES.filter(l => l.status === "Error").length,
            status: "Validated",
        };
        setBatches(prev => [newBatch, ...prev]);
        form.reset();
        setUploadOpen(false);
        toast({ title: "Batch Staged", description: `${newBatch.batchName}: ${newBatch.readyLines} lines ready, ${newBatch.errorLines} errors.` });
    };

    const handleImport = () => {
        if (!importConfirm) return;
        setBatches(prev => prev.map(b => b.id === importConfirm.id ? { ...b, status: "Imported" } : b));
        toast({ title: "AP Invoices Imported", description: `${importConfirm.readyLines} invoices created in AP Payables from batch "${importConfirm.batchName}". Error lines rejected.` });
        setImportConfirm(null);
    };

    const batchColumns: SpreadsheetColumn<ImportBatch>[] = useMemo(() => [
        { id: "id", header: "Batch ID", width: "110px", cellClassName: "font-mono text-sm font-medium", cell: r => r.id },
        { id: "batchName", header: "Batch Name", width: "240px", cellClassName: "font-medium", cell: r => r.batchName },
        { id: "source", header: "Source", width: "150px", cell: r => <Badge variant="outline">{r.source}</Badge> },
        { id: "uploadDate", header: "Upload Date", width: "110px", cellClassName: "font-mono text-sm", cell: r => r.uploadDate },
        { id: "lines", header: "Lines", width: "100px", cell: r => <span className="font-mono text-sm">{r.readyLines}<span className="text-muted-foreground">/{r.totalLines}</span></span> },
        { id: "errors", header: "Errors", width: "80px", cell: r => r.errorLines > 0 ? <Badge variant="destructive">{r.errorLines}</Badge> : <span className="text-muted-foreground text-sm">0</span> },
        { id: "status", header: "Status", width: "100px", cell: r => <Badge variant={batchStatusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "Actions", width: "180px",
            cell: r => (
                <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { setSelectedBatch(r); setPreviewOpen(true); }}>Lines</Button>
                    {r.status === "Validated" && (
                        <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setImportConfirm(r)}>
                            <Play className="mr-1 h-3 w-3" /> Import
                        </Button>
                    )}
                </div>
            ),
        },
    ], []);

    const lineColumns: SpreadsheetColumn<APStagingLine>[] = useMemo(() => [
        { id: "lineNum", header: "#", width: "50px", cellClassName: "font-mono text-xs text-muted-foreground", cell: r => r.lineNum },
        { id: "invoiceNumber", header: "Invoice #", width: "150px", cellClassName: "font-mono text-sm font-medium", cell: r => r.invoiceNumber },
        { id: "invoiceDate", header: "Date", width: "100px", cellClassName: "font-mono text-sm", cell: r => r.invoiceDate },
        { id: "supplierName", header: "Supplier", width: "190px", cellClassName: "text-sm", cell: r => r.supplierName },
        { id: "amount", header: "Amount", width: "130px", cellClassName: "text-right font-mono font-medium", cell: r => `${r.currency} ${formatNumber(r.amount)}` },
        { id: "glAccount", header: "GL Account", width: "150px", cellClassName: "font-mono text-xs text-muted-foreground", cell: r => r.glAccount },
        {
            id: "status", header: "Status", width: "200px",
            cell: r => (
                <div>
                    <Badge variant={lineStatusColors[r.status] as any}>{r.status}</Badge>
                    {r.errorMessage && <p className="text-xs text-destructive mt-0.5">{r.errorMessage}</p>}
                </div>
            ),
        },
    ], []);

    return (
        <StandardPage
            title="AP Open Interface (Invoice Import)"
            description="Stage and import AP invoices in bulk from legacy systems, EDI feeds, or CSV uploads. The Open Interface validates each line against the Supplier Master and GL Account before creating invoices in Payables."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Open Interface Import" },
            ]}
            actions={
                <Button size="sm" onClick={() => setUploadOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" /> New Import Batch
                </Button>
            }
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                    { label: "Total Batches", val: batches.length },
                    { label: "Validated (Ready)", val: batches.filter(b => b.status === "Validated").length },
                    { label: "Imported", val: batches.filter(b => b.status === "Imported").length },
                    { label: "Total Lines Ready", val: batches.reduce((s, b) => s + b.readyLines, 0) },
                ].map(m => (
                    <Card key={m.label} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-2xl font-bold font-mono">{m.val}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <InteractiveSpreadsheet<ImportBatch>
                data={batches}
                columns={batchColumns}
                onChange={() => { }}
                containerHeight="380px"
            />

            {/* Upload Dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> New AP Import Batch</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
                            <FormField control={form.control} name="batchName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Batch Name *</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g. March ERP Migration" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="source" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source System</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {["CSV Upload", "Legacy ERP Export", "EDI 810", "AGIS Auto-Invoice", "API Push"].map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="csvContent" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paste CSV Data * <span className="text-xs text-muted-foreground">(Invoice#, Date, SupplierNum, Amount, Currency, DueDate, GLAccount, Desc)</span></FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={6} className="font-mono text-xs" placeholder="INV-001,2026-03-15,SUP-0042,12450.00,USD,2026-04-14,01-000-5100-000,Office supplies" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit">Stage & Validate</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Lines Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Staged Lines — {selectedBatch?.batchName}</DialogTitle>
                    </DialogHeader>
                    <InteractiveSpreadsheet<APStagingLine>
                        data={lines}
                        columns={lineColumns}
                        onChange={() => { }}
                        containerHeight="380px"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Confirm */}
            <AlertDialog open={!!importConfirm} onOpenChange={() => setImportConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Import AP Invoices from Batch</AlertDialogTitle>
                        <AlertDialogDescription>
                            Importing <strong>{importConfirm?.readyLines}</strong> valid invoices from batch <strong>"{importConfirm?.batchName}"</strong>. {importConfirm?.errorLines ? <><strong>{importConfirm.errorLines}</strong> error lines will be rejected and remain in staging for correction.</> : "All lines are valid."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImport}>Import Invoices</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
