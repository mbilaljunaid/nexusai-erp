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
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle2, AlertTriangle, X, Play, Download } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type ImportFormat = "BAI2" | "SWIFT MT940" | "CAMT.053" | "CSV";
type LineStatus = "Valid" | "Error" | "Warning" | "Imported";

interface ParsedLine {
    id: string;
    seq: number;
    transactionDate: string;
    bankRef: string;
    description: string;
    credit: number;
    debit: number;
    currency: string;
    status: LineStatus;
    errorMessage?: string;
}

interface ImportSession {
    id: string;
    filename: string;
    format: ImportFormat;
    bankAccount: string;
    statementDate: string;
    openingBalance: number;
    closingBalance: number;
    totalLines: number;
    validLines: number;
    errorLines: number;
    status: "Staged" | "Validated" | "Imported" | "Failed";
    importedAt: string;
}

const MOCK_SESSIONS: ImportSession[] = [
    { id: "IMP-001", filename: "BAI2_CHASE_20260331.bai", format: "BAI2", bankAccount: "Chase ****4821", statementDate: "2026-03-31", openingBalance: 1245820, closingBalance: 1389050, totalLines: 142, validLines: 139, errorLines: 3, status: "Validated", importedAt: "2026-04-01 08:14" },
    { id: "IMP-002", filename: "MT940_HSBC_20260228.sta", format: "SWIFT MT940", bankAccount: "HSBC ****7732", statementDate: "2026-02-28", openingBalance: 452100, closingBalance: 389200, totalLines: 67, validLines: 67, errorLines: 0, status: "Imported", importedAt: "2026-03-01 09:22" },
];

const MOCK_PARSED_LINES: ParsedLine[] = [
    { id: "L001", seq: 1, transactionDate: "2026-03-31", bankRef: "TXN-39201", description: "BACS CREDIT ACME CORP", credit: 48000, debit: 0, currency: "USD", status: "Valid" },
    { id: "L002", seq: 2, transactionDate: "2026-03-31", bankRef: "TXN-39202", description: "WIRE OUT MICROSOFT", credit: 0, debit: 45000, currency: "USD", status: "Valid" },
    { id: "L003", seq: 3, transactionDate: "2026-03-31", bankRef: "TXN-39203", description: "FX PURCHASE MULTI-CCY", credit: 0, debit: 22400, currency: "USD", status: "Warning", errorMessage: "Multi-currency FX line — manual review recommended" },
    { id: "L004", seq: 4, transactionDate: "2026-03-31", bankRef: "TXN-39204", description: "CHAPS UNKNOWN PAYEE 44001", credit: 18450, debit: 0, currency: "USD", status: "Error", errorMessage: "Originator BIC not found in bank master" },
    { id: "L005", seq: 5, transactionDate: "2026-03-30", bankRef: "TXN-39150", description: "AWS MONTHLY CHARGE", credit: 0, debit: 12400, currency: "USD", status: "Valid" },
];

const statusColors: Record<LineStatus, string> = { Valid: "default", Error: "destructive", Warning: "outline", Imported: "secondary" };
const sessionStatusColors: Record<ImportSession["status"], string> = { Staged: "outline", Validated: "default", Imported: "secondary", Failed: "destructive" };

export default function BankStatementImport() {
    const { toast } = useToast();
    const [sessions, setSessions] = useState<ImportSession[]>(MOCK_SESSIONS);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<ImportSession | null>(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [importConfirm, setImportConfirm] = useState<ImportSession | null>(null);

    // Upload form
    const [format, setFormat] = useState<ImportFormat>("BAI2");
    const [bankAccount, setBankAccount] = useState("");
    const [dragging, setDragging] = useState(false);
    const [stagedFile, setStagedFile] = useState<string | null>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) setStagedFile(file.name);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setStagedFile(file.name);
    };

    const handleParse = () => {
        if (!stagedFile || !bankAccount) {
            toast({ title: "Validation Error", description: "Please select a file and bank account.", variant: "destructive" });
            return;
        }
        const ext = format === "BAI2" ? "bai" : format === "SWIFT MT940" ? "sta" : "xml";
        const newSession: ImportSession = {
            id: `IMP-${String(sessions.length + 1).padStart(3, "0")}`,
            filename: stagedFile,
            format,
            bankAccount,
            statementDate: "2026-03-31",
            openingBalance: Math.floor(Math.random() * 2000000),
            closingBalance: Math.floor(Math.random() * 2000000),
            totalLines: MOCK_PARSED_LINES.length,
            validLines: MOCK_PARSED_LINES.filter(l => l.status !== "Error").length,
            errorLines: MOCK_PARSED_LINES.filter(l => l.status === "Error").length,
            status: "Validated",
            importedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        };
        setSessions(prev => [newSession, ...prev]);
        setUploadOpen(false);
        setStagedFile(null);
        setBankAccount("");
        toast({ title: `${format} File Parsed`, description: `${newSession.totalLines} lines staged. ${newSession.errorLines} errors found — review before importing.` });
    };

    const handleImport = () => {
        if (!importConfirm) return;
        setImportConfirm(null);
        setImporting(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setImporting(false);
                    setSessions(prev => prev.map(s => s.id === importConfirm.id ? { ...s, status: "Imported" } : s));
                    toast({ title: "Import Complete", description: `${importConfirm.validLines} bank statement lines imported to Cash Management. Unmatched lines routed to Exceptions workbench.` });
                    return 100;
                }
                return p + 12;
            });
        }, 180);
    };

    const sessionColumns: SpreadsheetColumn<ImportSession>[] = useMemo(() => [
        { id: "filename", header: "File Name", width: "220px", cellClassName: "font-mono text-sm font-medium", cell: r => r.filename },
        { id: "format", header: "Format", width: "110px", cell: r => <Badge variant="outline">{r.format}</Badge> },
        { id: "bankAccount", header: "Bank Account", width: "150px", cellClassName: "font-mono text-sm", cell: r => r.bankAccount },
        { id: "statementDate", header: "Stmt Date", width: "100px", cellClassName: "font-mono text-sm", cell: r => r.statementDate },
        { id: "lines", header: "Lines", width: "110px", cell: r => <span className="font-mono text-sm">{r.validLines}<span className="text-muted-foreground">/{r.totalLines}</span></span> },
        { id: "errors", header: "Errors", width: "80px", cell: r => r.errorLines > 0 ? <Badge variant="destructive">{r.errorLines}</Badge> : <span className="text-muted-foreground font-mono">0</span> },
        { id: "status", header: "Status", width: "100px", cell: r => <Badge variant={sessionStatusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "Actions", width: "180px",
            cell: r => (
                <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { setSelectedSession(r); setPreviewOpen(true); }}>Preview</Button>
                    {r.status === "Validated" && (
                        <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setImportConfirm(r)}>
                            <Play className="mr-1 h-3 w-3" /> Import
                        </Button>
                    )}
                </div>
            ),
        },
    ], []);

    const lineColumns: SpreadsheetColumn<ParsedLine>[] = useMemo(() => [
        { id: "seq", header: "#", width: "50px", cellClassName: "font-mono text-xs text-muted-foreground", cell: r => r.seq },
        { id: "transactionDate", header: "Date", width: "100px", cellClassName: "font-mono text-sm", cell: r => r.transactionDate },
        { id: "bankRef", header: "Bank Ref", width: "110px", cellClassName: "font-mono text-xs", cell: r => r.bankRef },
        { id: "description", header: "Description", width: "250px", cellClassName: "text-sm", cell: r => r.description },
        { id: "credit", header: "Credit", width: "110px", cellClassName: "text-right font-mono font-medium text-green-600", cell: r => r.credit > 0 ? formatNumber(r.credit) : "—" },
        { id: "debit", header: "Debit", width: "110px", cellClassName: "text-right font-mono font-medium text-destructive", cell: r => r.debit > 0 ? formatNumber(r.debit) : "—" },
        {
            id: "status", header: "Status", width: "180px",
            cell: r => (
                <div>
                    <Badge variant={statusColors[r.status] as any}>{r.status}</Badge>
                    {r.errorMessage && <p className="text-xs text-muted-foreground mt-0.5">{r.errorMessage}</p>}
                </div>
            ),
        },
    ], []);

    return (
        <StandardPage
            title="Bank Statement Import"
            description="Import bank statements in BAI2, SWIFT MT940, or ISO 20022 CAMT.053 formats. Parsed lines are validated and staged before being committed to Cash Management for auto-reconciliation."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Cash Management", href: "/finance/cash" },
                { label: "Bank Statement Import" },
            ]}
            actions={
                <Button size="sm" onClick={() => setUploadOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Statement
                </Button>
            }
        >
            {/* Format reference */}
            <div className="mb-4 grid md:grid-cols-3 gap-3">
                {[
                    { fmt: "BAI2", desc: "US bank standard — J.P. Morgan, Chase, Wells Fargo, Citi", ext: ".bai / .txt" },
                    { fmt: "SWIFT MT940", desc: "European/GCC wire & nostro statements — HSBC, Standard Chartered", ext: ".sta / .mt940" },
                    { fmt: "CAMT.053 (ISO 20022)", desc: "XML-based — Deutsche Bank, BNP Paribas, Santander", ext: ".xml" },
                ].map(f => (
                    <Card key={f.fmt} className="border-l-4 border-l-primary/30">
                        <CardContent className="p-3">
                            <p className="font-mono font-bold text-sm text-primary">{f.fmt}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                            <p className="text-xs font-mono text-muted-foreground mt-1">{f.ext}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {importing && (
                <div className="mb-4 p-3 border rounded-lg space-y-2">
                    <p className="text-sm font-medium">Importing bank statement lines...</p>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{progress}% complete</p>
                </div>
            )}

            <InteractiveSpreadsheet<ImportSession>
                data={sessions}
                columns={sessionColumns}
                onChange={() => { }}
                containerHeight="340px"
            />

            {/* Upload Dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Upload Bank Statement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label>Format *</Label>
                            <Select value={format} onValueChange={v => setFormat(v as ImportFormat)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(["BAI2", "SWIFT MT940", "CAMT.053", "CSV"] as ImportFormat[]).map(f => (
                                        <SelectItem key={f} value={f}>{f}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Bank Account *</Label>
                            <Select value={bankAccount} onValueChange={setBankAccount}>
                                <SelectTrigger><SelectValue placeholder="Select bank account..." /></SelectTrigger>
                                <SelectContent>
                                    {["Chase ****4821 (USD)", "HSBC ****7732 (GBP)", "Emirates NBD ****1044 (AED)"].map(a => (
                                        <SelectItem key={a} value={a}>{a}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${dragging ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`}
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("stmt-file-input")?.click()}
                        >
                            {stagedFile ? (
                                <div className="flex items-center justify-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <span className="font-mono text-sm font-medium">{stagedFile}</span>
                                    <button aria-label="Remove selected file" onClick={e => { e.stopPropagation(); setStagedFile(null); }}><X className="h-4 w-4 text-muted-foreground hover:text-destructive" /></button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                                    <p className="text-xs text-muted-foreground mt-1">.bai / .sta / .xml / .txt / .csv</p>
                                </>
                            )}
                            <input id="stmt-file-input" type="file" aria-label="Upload bank statement file" className="hidden" accept=".bai,.sta,.xml,.txt,.csv" onChange={handleFileInput} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
                        <Button onClick={handleParse} disabled={!stagedFile}>Parse & Stage</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Statement Preview — {selectedSession?.filename}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                        {[
                            { label: "Bank Account", val: selectedSession?.bankAccount },
                            { label: "Total Lines", val: selectedSession?.totalLines },
                            { label: "Valid", val: selectedSession?.validLines },
                            { label: "Errors", val: selectedSession?.errorLines },
                        ].map(m => (
                            <Card key={m.label}>
                                <CardContent className="p-3">
                                    <p className="text-xs text-muted-foreground">{m.label}</p>
                                    <p className="text-lg font-bold font-mono">{m.val}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <InteractiveSpreadsheet<ParsedLine>
                        data={MOCK_PARSED_LINES}
                        columns={lineColumns}
                        onChange={() => { }}
                        containerHeight="340px"
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
                        <AlertDialogTitle>Import Bank Statement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Importing <strong>{importConfirm?.filename}</strong> — <strong>{importConfirm?.validLines}</strong> valid lines will be created in Cash Management. <strong>{importConfirm?.errorLines}</strong> error lines will be routed to the Bank Statement Exceptions workbench for manual resolution.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImport}>Confirm Import</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
