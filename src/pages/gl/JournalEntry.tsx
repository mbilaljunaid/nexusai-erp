import { useQuery, useMutation } from "@tanstack/react-query";
import { useLedger } from "@/context/LedgerContext";
import React, { useState, useMemo, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Send, MoreHorizontal, AlertCircle, CheckCircle2, Paperclip, X } from "lucide-react";
import { CodeCombinationPicker } from "@/components/gl/CodeCombinationPicker";
import { cn } from "@/lib/utils";
import { StandardPage } from "@/components/layout/StandardPage";
import { AuditSidebar, AuditEvent } from "@/components/audit/AuditSidebar";
import { LedgerContextBadge } from "@/components/gl/LedgerContextBadge";
import { DatePicker } from '@/components/ui/DatePicker';

interface JournalLine {
    id: string; // temp id for UI
    accountId: string; // CCID or Account
    debit: string;
    credit: string;
    statisticalAmount?: string; // Oracle GL: Statistical Ledger amount (non-financial)
    description: string;
    reference?: string;
    attribute1?: string;
    attribute2?: string;
    attribute3?: string;
    attribute4?: string;
    attribute5?: string;
    attribute6?: string;
    attribute7?: string;
    attribute8?: string;
    attribute9?: string;
    attribute10?: string;
}

import { useRoute } from "wouter";
import { formatNumber } from '@/lib/formatters';

export default function JournalEntry() {
    const { toast } = useToast();
    const { currentLedgerId, activeLedger } = useLedger();
    const [match, params] = useRoute("/finance/gl/journals/:id");
    const [journalId, setJournalId] = useState<string | null>(match ? (params as any)?.id : null);

    const [header, setHeader] = useState({
        batchName: "",
        description: "",
        currencyCode: "USD",
        conversionRateType: "Corporate",
        conversionRate: "",
        encumbranceType: "None",
        periodId: "",
        category: "Manual",
        reversalPeriodId: "",
        reversalDate: "",
        autoReverse: false
    });

    // Sync Currency with Ledger
    useEffect(() => {
        if (activeLedger) {
            setHeader(prev => ({ ...prev, currencyCode: activeLedger.currencyCode }));
        }
    }, [activeLedger]);

    const [lines, setLines] = useState<JournalLine[]>([
        { id: "1", accountId: "", debit: "0", credit: "0", statisticalAmount: "", description: "", reference: "" },
        { id: "2", accountId: "", debit: "0", credit: "0", statisticalAmount: "", description: "", reference: "" }
    ]);
    // Attachments state
    const [attachments, setAttachments] = useState<File[]>([]);

    const [activeLineId, setActiveLineId] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isAuditOpen, setIsAuditOpen] = useState(false);

    const [actionType, setActionType] = useState<'DRAFT' | 'SUBMIT'>('DRAFT');
    const [journalStatus, setJournalStatus] = useState<string>('Draft');
    const [approvalStatus, setApprovalStatus] = useState<string>('Not Required');

    // Fetch existing Journal Details if editing
    useQuery<any>({
        queryKey: ["journal", journalId],
        queryFn: async () => {
            if (!journalId) return null;
            const res = await apiRequest("GET", `/api/gl/journals/${journalId}`);
            if (!res.ok) throw new Error("Failed to load journal");
            const data = await res.json();

            setHeader({
                batchName: data.batchName || "",
                description: data.description || "",
                currencyCode: data.currencyCode || "USD",
                conversionRateType: data.conversionRateType || "Corporate",
                conversionRate: data.conversionRate || "",
                encumbranceType: data.encumbranceType || "None",
                periodId: data.periodId || "",
                category: data.category || data.source || "Manual",
                reversalPeriodId: data.reversalPeriodId || "",
                reversalDate: data.reversalDate ? new Date(data.reversalDate).toISOString().split('T')[0] : "",
                autoReverse: data.autoReverse || false
            });

            if (data.lines && data.lines.length > 0) {
                setLines(data.lines.map((l: any) => ({
                    id: l.id || Math.random().toString(),
                    accountId: l.accountId || "",
                    debit: l.enteredDebit || l.accountedDebit || l.debit || "0",
                    credit: l.enteredCredit || l.accountedCredit || l.credit || "0",
                    description: l.description || "",
                    reference: l.reference || "",
                    attribute1: l.attribute1 || "",
                    attribute2: l.attribute2 || "",
                    attribute3: l.attribute3 || "",
                    attribute4: l.attribute4 || "",
                    attribute5: l.attribute5 || "",
                    attribute6: l.attribute6 || "",
                    attribute7: l.attribute7 || "",
                    attribute8: l.attribute8 || "",
                    attribute9: l.attribute9 || "",
                    attribute10: l.attribute10 || "",
                })));
            }

            setJournalStatus(data.status || 'Draft');
            setApprovalStatus(data.approvalStatus || 'Not Required');

            return data;
        },
        enabled: !!journalId,
        refetchOnWindowFocus: false
    });

    // Fetch Audit Logs
    const { data: realAuditLogs = [] } = useQuery<any>({
        queryKey: ["journal-audit", journalId],
        queryFn: async () => {
            if (!journalId || journalId === "new") return [];
            const res = await fetch(`/api/gl/journals/${journalId}/audit`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        enabled: !!journalId
    });

    // Fetch GL Periods
    const { data: periods = [] } = useQuery<any>({
        queryKey: ["gl-periods", currentLedgerId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/gl/periods?ledgerId=${currentLedgerId}`);
            if (!res.ok) throw new Error("Failed to load periods");
            const data = await res.json();
            return data.filter((p: any) => p.status === 'Open' || p.status === 'Future-Entry');
        },
        enabled: !!currentLedgerId,
    });

    // Map to UI Event
    const auditEvents: AuditEvent[] = Array.isArray(realAuditLogs) ? realAuditLogs.map((log: any) => ({
        id: log.id,
        action: log.action,
        actor: log.actor || "System",
        timestamp: log.timestamp,
        details: log.details
    })) : [];

    // Derived State (Real-time Balancing)
    const totals = useMemo(() => {
        const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
        const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
        return {
            debit: totalDebit,
            credit: totalCredit,
            variance: totalDebit - totalCredit,
            isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
        };
    }, [lines]);

    const addLine = () => {
        const newLine = { id: Math.random().toString(), accountId: "", debit: "0", credit: "0", statisticalAmount: "", description: "", reference: "" };
        setLines([...lines, newLine]);
        // Open sheet for the new line to encourage detail entry
        setActiveLineId(newLine.id);
        setIsSheetOpen(true);
    };

    const updateLine = (id: string, field: keyof JournalLine, value: string) => {
        setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const removeLine = (id: string) => {
        if (lines.length <= 1) return;
        setLines(lines.filter(l => l.id !== id));
    };

    const handleEditLine = (line: JournalLine) => {
        setActiveLineId(line.id);
        setIsSheetOpen(true);
    };

    const createMutation = useMutation({
        mutationFn: async (status: 'Draft' | 'Posted') => {
            const res = await apiRequest("POST", "/api/gl/journals", {
                batchName: header.batchName,
                description: header.description,
                currencyCode: header.currencyCode,
                source: header.category,
                status,
                ledgerId: currentLedgerId,
                periodId: header.periodId,
                reversalPeriodId: header.reversalPeriodId || null,
                reversalDate: header.reversalDate || null,
                autoReverse: header.autoReverse,
                lines: lines.map(l => ({
                    accountId: l.accountId,
                    enteredDebit: l.debit,
                    enteredCredit: l.credit,
                    statisticalAmount: l.statisticalAmount || null,
                    description: l.description,
                    reference: l.reference,
                    currencyCode: header.currencyCode,
                    attribute1: l.attribute1,
                    attribute2: l.attribute2,
                    attribute3: l.attribute3,
                    attribute4: l.attribute4,
                    attribute5: l.attribute5,
                    attribute6: l.attribute6,
                    attribute7: l.attribute7,
                    attribute8: l.attribute8,
                    attribute9: l.attribute9,
                    attribute10: l.attribute10,
                }))
            });
            return await res.json();
        },
        onSuccess: (data) => {
            if (data.status === "Processing") {
                toast({
                    title: "Posting Initiated",
                    description: `Journal ${data.journalNumber} is being processed.`,
                    className: "bg-blue-600 text-white border-none",
                });
            } else {
                toast({
                    title: "Journal Saved",
                    description: `Journal ${data.journalNumber} created as Draft.`,
                });

                if (data.id) setJournalId(data.id);

                // Chained Submission
                if (actionType === 'SUBMIT' && data.id) {
                    submitMutation.mutate(data.id);
                }
            }
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const submitMutation = useMutation({
        mutationFn: async (journalId: string) => {
            const res = await apiRequest("POST", `/api/gl/journals/${journalId}/submit`, {});
            return await res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Submitted",
                description: data.message,
                className: "bg-indigo-600 text-white border-none",
            });
        },
        onError: (err: any) => {
            toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
        }
    });

    const activeLine = lines.find(l => l.id === activeLineId);

    return (
        <StandardPage
            title="New Journal Entry"
            breadcrumbs={[
                { label: "General Ledger", href: "/finance/gl/journals" },
                { label: "Journals", href: "/finance/gl/journals" },
                { label: journalId ? `Journal: ${journalId.substring(0, 8)}...` : "New Entry" },
            ]}
            description={<LedgerContextBadge />}
            actions={
                <>
                    <div className="flex items-center gap-2 mr-4">
                        <StatusBadge status={journalStatus} className="uppercase text-xs" />
                        <StatusBadge status={approvalStatus} label={`Approval: ${approvalStatus}`} className="uppercase text-xs" />
                    </div>
                    <Button variant="ghost" onClick={() => setIsAuditOpen(true)}>
                        History
                    </Button>
                    <Button variant="outline" onClick={() => {
                        setActionType('DRAFT');
                        createMutation.mutate('Draft');
                    }} disabled={createMutation.isPending || submitMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                    <Button
                        onClick={() => {
                            setActionType('SUBMIT');
                            createMutation.mutate('Draft');
                        }}
                        disabled={!totals.isBalanced || createMutation.isPending || submitMutation.isPending || journalStatus !== 'Draft'}
                        className={cn(totals.isBalanced && journalStatus === 'Draft' ? "bg-indigo-600 hover:bg-indigo-700" : "opacity-50")}
                    >
                        <Send className="mr-2 h-4 w-4" /> {approvalStatus === 'Rejected' ? 'Resubmit for Approval' : 'Submit for Approval'}
                    </Button>
                </>
            }
            className="animate-in fade-in duration-500"
        >
            <AuditSidebar open={isAuditOpen} onOpenChange={setIsAuditOpen} events={auditEvents} />

            {/* Metric Cards (Real-time Balance) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Debits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(totals.debit)}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(totals.credit)}</div>
                    </CardContent>
                </Card>
                <Card className={cn("shadow-sm border-l-4", totals.isBalanced ? "border-l-green-500 bg-green-50/50" : "border-l-red-500 bg-red-50/50")}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Variance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold flex items-center gap-2", totals.isBalanced ? "text-green-700" : "text-red-700")}>
                            {formatNumber(totals.variance)}
                            {totals.isBalanced ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Period Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <StatusBadge status="Open" />
                            <span className="text-xs text-muted-foreground">Jan-2026</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Form Area */}
            <Card className="border-t-4 border-t-primary/20 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Batch Header</CardTitle>
                    <CardDescription>Enter high-level details for this journal batch.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <Label>Batch Name</Label>
                        <Input
                            value={header.batchName}
                            onChange={(e) => setHeader({ ...header, batchName: e.target.value })}
                            placeholder="e.g. IT Accruals Dec 26"
                            className="bg-muted/30 focus:bg-background transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Journal Description</Label>
                        <Input
                            value={header.description}
                            onChange={(e) => setHeader({ ...header, description: e.target.value })}
                            placeholder="Detailed description..."
                            className="bg-muted/30 focus:bg-background transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Category / Source</Label>
                        <Input
                            value={header.category}
                            onChange={(e) => setHeader({ ...header, category: e.target.value })}
                            className="bg-muted/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Period</Label>
                        <Select value={header.periodId} onValueChange={(val) => setHeader({ ...header, periodId: val })}>
                            <SelectTrigger className="bg-muted/30">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                {periods.map((p: any) => (
                                    <SelectItem key={p.id} value={p.periodName}>{p.periodName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Oracle Parity: Currency Rate Type + Encumbrance */}
                    <div className="space-y-2">
                        <Label>Conversion Rate Type</Label>
                        <Select value={header.conversionRateType} onValueChange={(val) => setHeader({ ...header, conversionRateType: val, conversionRate: val !== "User" ? "" : header.conversionRate })}>
                            <SelectTrigger className="bg-muted/30">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Spot">Spot</SelectItem>
                                <SelectItem value="Corporate">Corporate</SelectItem>
                                <SelectItem value="User">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {header.conversionRateType === "User" && (
                        <div className="space-y-2">
                            <Label>Conversion Rate</Label>
                            <Input
                                type="number"
                                step="0.000001"
                                value={header.conversionRate}
                                onChange={(e) => setHeader({ ...header, conversionRate: e.target.value })}
                                placeholder="e.g. 1.245678"
                                className="bg-muted/30 font-mono"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Encumbrance Type</Label>
                        <Select value={header.encumbranceType} onValueChange={(val) => setHeader({ ...header, encumbranceType: val })}>
                            <SelectTrigger className="bg-muted/30">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">None (Actuals)</SelectItem>
                                <SelectItem value="Commitment">Commitment</SelectItem>
                                <SelectItem value="Obligation">Obligation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Oracle Parity: Journal Attachments */}
                    <div className="space-y-2 md:col-span-4">
                        <Label className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            Attachments <span className="text-xs text-muted-foreground font-normal">(supporting documents)</span>
                        </Label>
                        <div className="flex items-center gap-3">
                            <label
                                htmlFor="journal-attachments"
                                className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-muted-foreground/40 text-sm text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
                            >
                                <Paperclip className="h-4 w-4" /> Choose files...
                                <input
                                    id="journal-attachments"
                                    type="file"
                                    multiple
                                    className="sr-only"
                                    onChange={(e) => {
                                        if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                                    }}
                                />
                            </label>
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {attachments.map((f, i) => (
                                        <span key={i} className="flex items-center gap-1 text-xs bg-muted rounded-full px-3 py-1">
                                            {f.name}
                                            <button
                                                type="button"
                                                onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                                aria-label={`Remove ${f.name}`}
                                                className="ml-1 text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reversal Options Block */}
            <Card className="border shadow-sm mb-6">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={header.autoReverse}
                            onCheckedChange={(val) => setHeader({ ...header, autoReverse: val })}
                            id="auto-reverse"
                        />
                        <Label htmlFor="auto-reverse" className="cursor-pointer">Auto-Reverse Journal</Label>
                    </div>
                    {header.autoReverse && (
                        <>
                            <div className="space-y-2">
                                <Label>Reversal Period</Label>
                                <Select value={header.reversalPeriodId} onValueChange={(val) => setHeader({ ...header, reversalPeriodId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map((p: any) => (
                                            <SelectItem key={p.id} value={p.periodName}>{p.periodName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Reversal Date <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                <DatePicker value={header.reversalDate} onChange={(v) => setHeader({ ...header, reversalDate: v })} />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Journal Lines Grid */}
            <Card className="shadow-lg border-none ring-1 ring-border/50">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                    <div>
                        <CardTitle className="text-lg">Journal Lines</CardTitle>
                        <CardDescription>Enter the debits and credits. Use the action menu for details.</CardDescription>
                    </div>
                    <Button onClick={addLine} size="sm" className="bg-primary shadow-sm hover:shadow-md transition-all">
                        <Plus className="h-4 w-4 mr-2" /> Add Line
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead className="w-80">Account</TableHead>
                                <TableHead className="min-w-48">Description</TableHead>
                                <TableHead className="w-44 text-right">Debit</TableHead>
                                <TableHead className="w-44 text-right">Credit</TableHead>
                                <TableHead className="w-32 text-right text-muted-foreground/70" title="Statistical Amount (Statistical Ledger entries — does not affect financial balances)">Statistical</TableHead>
                                <TableHead className="w-20"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lines.map((line, index) => (
                                <TableRow key={line.id} className="group transition-colors hover:bg-muted/30">
                                    <TableCell className="text-center font-mono text-xs text-muted-foreground">{index + 10}</TableCell>
                                    <TableCell>
                                        <CodeCombinationPicker
                                            value={line.accountId}
                                            onChange={(val) => updateLine(line.id, 'accountId', val)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={line.description}
                                            onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                                            className="border-none shadow-none focus-visible:ring-0 bg-transparent px-0 placeholder:text-muted-foreground/50"
                                            placeholder="Enter line description..."
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.debit}
                                            onChange={(e) => updateLine(line.id, 'debit', e.target.value)}
                                            className="text-right border-none shadow-none focus-visible:ring-0 bg-transparent px-0 font-mono"
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.credit}
                                            onChange={(e) => updateLine(line.id, 'credit', e.target.value)}
                                            className="text-right border-none shadow-none focus-visible:ring-0 bg-transparent px-0 font-mono"
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.statisticalAmount || ""}
                                            onChange={(e) => updateLine(line.id, 'statisticalAmount', e.target.value)}
                                            className="text-right border-none shadow-none focus-visible:ring-0 bg-transparent px-0 font-mono text-muted-foreground"
                                            placeholder="—"
                                            title="Statistical Amount — for Statistical Ledger entries only"
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditLine(line)} aria-label="More options">
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => removeLine(line.id)} aria-label="Delete">
                                                <Trash2 className="h-4 w-4 text-red-500/70 hover:text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Line Detail Side Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-[540px] flex flex-col h-full">
                    {/* ... Sheet Content as before ... */}
                    <SheetHeader className="pb-6 border-b">
                        <SheetTitle className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                {lines.findIndex(l => l.id === activeLineId) + 10}
                            </div>
                            Line Details
                        </SheetTitle>
                        <SheetDescription>
                            Review and edit granular details for this journal line.
                        </SheetDescription>
                    </SheetHeader>

                    {activeLine && (
                        <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
                            {/* Account Details Block */}
                            <div className="space-y-4 p-4 rounded-lg bg-muted/40 border">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Badge variant="outline" className="h-6">Account</Badge>
                                    Technical & Segment Information
                                </h4>
                                <div className="space-y-2">
                                    <Label>Account Combination</Label>
                                    <CodeCombinationPicker
                                        value={activeLine.accountId}
                                        onChange={(val) => updateLine(activeLine.id, 'accountId', val)}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Amounts Block */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Debit ({header.currencyCode})</Label>
                                    <Input
                                        type="number"
                                        value={activeLine.debit}
                                        onChange={(e) => updateLine(activeLine.id, 'debit', e.target.value)}
                                        className="font-mono text-right"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Credit ({header.currencyCode})</Label>
                                    <Input
                                        type="number"
                                        value={activeLine.credit}
                                        onChange={(e) => updateLine(activeLine.id, 'credit', e.target.value)}
                                        className="font-mono text-right"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        Statistical Amount
                                        <span className="text-xs font-normal text-muted-foreground">(non-financial)</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={activeLine.statisticalAmount || ""}
                                        onChange={(e) => updateLine(activeLine.id, 'statisticalAmount', e.target.value)}
                                        className="font-mono text-right"
                                        placeholder="e.g. headcount, FTEs, sq ft"
                                    />
                                    <p className="text-xs text-muted-foreground">Used for statistical ledger entries only — does not affect financial balances.</p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Line Description</Label>
                                    <Input
                                        value={activeLine.description}
                                        onChange={(e) => updateLine(activeLine.id, 'description', e.target.value)}
                                        placeholder="Explanation for audit trail..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference</Label>
                                    <Input
                                        value={activeLine.reference || ""}
                                        onChange={(e) => updateLine(activeLine.id, 'reference', e.target.value)}
                                        placeholder="External system reference or document number..."
                                    />
                                </div>
                            </div>

                            {/* Descriptive Flexfields (DFF) */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Badge variant="secondary" className="h-6">DFF</Badge>
                                    Line-Level Attributes
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={`dff-${i + 1}`} className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Attribute {i + 1}</Label>
                                            <Input
                                                value={activeLine[`attribute${i + 1}` as keyof JournalLine] || ""}
                                                onChange={(e) => updateLine(activeLine.id, `attribute${i + 1}` as keyof JournalLine, e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    <SheetFooter className="mt-auto pt-6 border-t">
                        <SheetClose asChild>
                            <Button className="w-full">
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Save & Close Line
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </StandardPage>
    );
}

