import React, { useState, useRef, useEffect, useCallback } from "react";
import { Wizard, WizardStep } from "@/components/layout/Wizard";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Copy, Upload, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVirtualizer } from "@tanstack/react-virtual";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Card } from "@/components/ui/card";
import { formatNumber } from '@/lib/formatters';

interface JournalLine {
    id: number;
    account: string;
    debit: number;
    credit: number;
    description: string;
    error?: string; // For validation
}

export default function JournalWizard() {
    const { toast } = useToast();
    const [headerData, setHeaderData] = useState({
        journalName: "",
        ledger: "Primary US Ledger",
        period: "JAN-26",
        category: "Manual",
        currency: "USD"
    });

    // High Volume State
    const [lines, setLines] = useState<JournalLine[]>(
        Array.from({ length: 5 }).map((_, i) => ({ id: i + 1, account: "", debit: 0, credit: 0, description: "" }))
    );

    // ================= STEP 1: HEADER =================
    const Step1 = (
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-2">
                <Label>Journal Name</Label>
                <Input
                    value={headerData.journalName}
                    onChange={(e) => setHeaderData({ ...headerData, journalName: e.target.value })}
                    placeholder="e.g., Monthly Accrual"
                    className="bg-card"
                />
            </div>
            <div className="space-y-2">
                <Label>Ledger</Label>
                <Select value={headerData.ledger} onValueChange={(v) => setHeaderData({ ...headerData, ledger: v })}>
                    <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Primary US Ledger">Primary US Ledger</SelectItem>
                        <SelectItem value="Primary UK Ledger">Primary UK Ledger</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Accounting Period</Label>
                <Select value={headerData.period} onValueChange={(v) => setHeaderData({ ...headerData, period: v })}>
                    <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="JAN-26">JAN-26</SelectItem>
                        <SelectItem value="FEB-26">FEB-26</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Category</Label>
                <Select value={headerData.category} onValueChange={(v) => setHeaderData({ ...headerData, category: v })}>
                    <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Accrual">Accrual</SelectItem>
                        <SelectItem value="Adjustment">Adjustment</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    // ================= STEP 2: HIGH VOLUME GRID =================
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: lines.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 45, // Row height
        overscan: 10,
    });

    const handleLineChange = useCallback((id: number, field: keyof JournalLine, value: any) => {
        setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
    }, []);

    const addLines = (count = 1) => {
        const newLines = Array.from({ length: count }).map((_, i) => ({
            id: lines.length + i + 1,
            account: "", debit: 0, credit: 0, description: ""
        }));
        setLines([...lines, ...newLines]);
    };

    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const rows = text.split('\n').filter(r => r.trim());

            // Simple Parser: Account | Debit | Credit | Desc
            const newLines = rows.map((row, i) => {
                const cols = row.split('\t'); // Assume Tab separated from Excel
                return {
                    id: lines.length + i + 1,
                    account: cols[0] || "",
                    debit: Number(cols[1]?.replace(/,/g, '')) || 0,
                    credit: Number(cols[2]?.replace(/,/g, '')) || 0,
                    description: cols[3] || ""
                };
            });

            setLines([...lines, ...newLines]);
            toast({ title: "Imported", description: `${newLines.length} lines pasted from clipboard` });
        } catch (err) {
            toast({ title: "Error", description: "Failed to read clipboard", variant: "destructive" });
        }
    };

    const columns: SpreadsheetColumn<JournalLine>[] = [
        {
            id: "index",
            header: "#",
            width: "60px",
            headerClassName: "text-center",
            cellClassName: "text-center text-xs text-muted-foreground font-mono flex items-center justify-center",
            cell: (row, index) => index + 1
        },
        {
            id: "account",
            header: "Account",
            width: "1fr",
            cellClassName: "flex items-center",
            cell: (line, index, updateRow) => (
                <Input
                    value={line.account}
                    onChange={(e) => updateRow("account", e.target.value)}
                    className="h-8 font-mono text-xs w-full"
                    placeholder="Account Code"
                />
            )
        },
        {
            id: "debit",
            header: "Debit",
            width: "120px",
            headerClassName: "text-right",
            cellClassName: "flex items-center",
            cell: (line, index, updateRow) => (
                <Input
                    type="number"
                    value={line.debit || ''}
                    onChange={(e) => updateRow("debit", Number(e.target.value))}
                    className="h-8 font-mono text-xs text-right w-full"
                    onFocus={(e) => e.target.select()}
                />
            )
        },
        {
            id: "credit",
            header: "Credit",
            width: "120px",
            headerClassName: "text-right",
            cellClassName: "flex items-center",
            cell: (line, index, updateRow) => (
                <Input
                    type="number"
                    value={line.credit || ''}
                    onChange={(e) => updateRow("credit", Number(e.target.value))}
                    className="h-8 font-mono text-xs text-right w-full"
                    onFocus={(e) => e.target.select()}
                />
            )
        },
        {
            id: "description",
            header: "Description",
            width: "1fr",
            cellClassName: "flex items-center",
            cell: (line, index, updateRow) => (
                <Input
                    value={line.description}
                    onChange={(e) => updateRow("description", e.target.value)}
                    className="h-8 text-xs w-full"
                />
            )
        },
        {
            id: "actions",
            header: "",
            width: "50px",
            cellClassName: "flex justify-center items-center",
            cell: (line) => (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => {
                    setLines(prev => prev.filter(l => l.id !== line.id));
                }} aria-label="Delete">
                    <Trash2 className="h-3 w-3" />
                </Button>
            )
        }
    ];

    const totalDebit = lines.reduce((acc, l) => acc + (l.debit || 0), 0);
    const totalCredit = lines.reduce((acc, l) => acc + (l.credit || 0), 0);

    const Step2 = (
        <div className="space-y-4 h-full flex flex-col">
            <Card className="flex justify-between items-center p-4 shadow-sm">
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Total Debit</span>
                        <span className="font-mono font-bold text-lg">{formatNumber(totalDebit, 2)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Total Credit</span>
                        <span className="font-mono font-bold text-lg">{formatNumber(totalCredit, 2)}</span>
                    </div>
                    <div className="px-4 py-1 rounded bg-muted flex items-center gap-2">
                        <span className={Math.abs(totalDebit - totalCredit) > 0.01 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                            Variance: {formatNumber(Math.abs(totalDebit - totalCredit), 2)}
                        </span>
                        {Math.abs(totalDebit - totalCredit) > 0.01 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={pasteFromClipboard}>
                        <Copy className="w-4 h-4 mr-2" /> Paste Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addLines(10)}>
                        <Plus className="w-4 h-4 mr-2" /> Add 10 Rows
                    </Button>
                </div>
            </Card>

            {/* Virtualized Table Container */}
            <div className="flex-1 overflow-hidden min-h-[500px]">
                <InteractiveSpreadsheet
                    data={lines}
                    columns={columns}
                    onChange={setLines}
                    virtualized={true}
                    rowHeight={45}
                    containerHeight="500px"
                />
            </div>
        </div>
    );

    // ================= STEP 3: REVIEW =================
    const createMutation = useMutation({
        mutationFn: async () => {
            // In real scenario, batch these writes or send as one JSON blob
            const res = await apiRequest("POST", "/api/gl/journals", {
                description: headerData.journalName,
                currencyCode: headerData.currency,
                source: headerData.category,
                status: "Draft",
                ledgerId: "PRIMARY", // Mock
                lines: lines.map(l => ({
                    accountId: l.account, // In real app, must resolve ID
                    enteredDebit: l.debit,
                    enteredCredit: l.credit,
                    description: l.description,
                    currencyCode: headerData.currency
                }))
            });
            return await res.json();
        },
        onSuccess: (data) => {
            toast({ title: "Success", description: `Journal ${data.journalNumber} Created` });
        },
        onError: (e: any) => {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    });

    const Step3 = (
        <div className="space-y-6 max-w-3xl mx-auto">
            <Card className="flex justify-between items-center bg-muted/20 p-4">
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Detailed Review</h3>
                    <p className="text-sm text-muted-foreground">Review your journal entry before submission.</p>
                </div>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700">
                    {createMutation.isPending ? "Submitting..." : "Submit Journal"}
                </Button>
            </Card>

            <Card className="grid grid-cols-2 gap-4 text-sm p-6 shadow-sm">
                <div>
                    <span className="text-muted-foreground block text-xs uppercase">Journal Name</span>
                    <span className="font-medium text-lg">{headerData.journalName}</span>
                </div>
                <div>
                    <span className="text-muted-foreground block text-xs uppercase">Category</span>
                    <Badge variant="outline">{headerData.category}</Badge>
                </div>
                <div>
                    <span className="text-muted-foreground block text-xs uppercase">Period</span>
                    <span className="font-mono">{headerData.period}</span>
                </div>
                <div>
                    <span className="text-muted-foreground block text-xs uppercase">Ledger</span>
                    <span className="font-medium">{headerData.ledger}</span>
                </div>
            </Card>
        </div>
    );

    const steps: WizardStep[] = [
        {
            id: "header",
            label: "Batch Header",
            component: Step1,
            validationFn: () => {
                if (!headerData.journalName) {
                    toast({ title: "Required", description: "Journal Name is missing", variant: "destructive" });
                    return false;
                }
                return true;
            }
        },
        {
            id: "lines",
            label: "Journal Lines",
            component: Step2,
            validationFn: () => {
                if (Math.abs(totalDebit - totalCredit) > 0.01) {
                    toast({ title: "Unbalanced", description: "Journal Entry must be balanced", variant: "destructive" });
                    return false;
                }
                if (lines.length === 0) return false;
                return true;
            }
        },
        {
            id: "review",
            label: "Review & Submit",
            component: Step3
        }
    ];

    return (
        <StandardPage title="High-Volume Journal Wizard">
            <div className="bg-muted/50/50 p-6 rounded-xl border min-h-[700px]">
                <Wizard
                    steps={steps}
                    onComplete={() => createMutation.mutate()}
                />
            </div>
        </StandardPage>
    );
}
