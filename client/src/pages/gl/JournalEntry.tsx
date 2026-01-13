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
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Send, MoreHorizontal, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { CodeCombinationPicker } from "@/components/gl/CodeCombinationPicker";
import { cn } from "@/lib/utils";
import { StandardPage } from "@/components/layout/StandardPage";
import { AuditSidebar, AuditEvent } from "@/components/audit/AuditSidebar";

interface JournalLine {
    id: string; // temp id for UI
    accountId: string; // CCID or Account
    debit: string;
    credit: string;
    description: string;
}

export default function JournalEntry() {
    const { toast } = useToast();
    const { currentLedgerId, activeLedger } = useLedger();

    const [header, setHeader] = useState({
        description: "",
        currencyCode: "USD",
        periodId: "",
        category: "Manual"
    });

    // Sync Currency with Ledger
    useEffect(() => {
        if (activeLedger) {
            setHeader(prev => ({ ...prev, currencyCode: activeLedger.currencyCode }));
        }
    }, [activeLedger]);

    const [lines, setLines] = useState<JournalLine[]>([
        { id: "1", accountId: "", debit: "0", credit: "0", description: "" },
        { id: "2", accountId: "", debit: "0", credit: "0", description: "" }
    ]);

    const [activeLineId, setActiveLineId] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isAuditOpen, setIsAuditOpen] = useState(false);

    // Mock Audit Data
    const auditEvents: AuditEvent[] = [
        { id: "1", action: "create", actor: "System", timestamp: new Date().toISOString(), details: "Draft initialized" }
    ];

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
        const newLine = { id: Math.random().toString(), accountId: "", debit: "0", credit: "0", description: "" };
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
                description: header.description,
                currencyCode: header.currencyCode,
                source: header.category,
                status,
                ledgerId: currentLedgerId,
                lines: lines.map(l => ({
                    accountId: l.accountId,
                    enteredDebit: l.debit,
                    enteredCredit: l.credit,
                    description: l.description,
                    currencyCode: header.currencyCode
                }))
            });
            return await res.json();
        },
        onSuccess: (data) => {
            if (data.status === "Processing") {
                toast({
                    title: "Posting Initiated",
                    description: `Journal ${data.journalNumber} is being processed in the background.`,
                    className: "bg-blue-600 text-white border-none",
                });
            } else {
                toast({
                    title: "Journal Saved",
                    description: `Journal ${data.journalNumber} created successfully as Draft.`,
                });
            }
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const activeLine = lines.find(l => l.id === activeLineId);

    return (
        <StandardPage
            title="New Journal Entry"
            breadcrumbs={[
                { label: "General Ledger", href: "/gl/journals" },
                { label: "Journals", href: "/gl/journals" },
                { label: "New Entry" }
            ]}
            actions={
                <>
                    <Button variant="ghost" onClick={() => setIsAuditOpen(true)}>
                        History
                    </Button>
                    <Button variant="outline" onClick={() => createMutation.mutate('Draft')} disabled={createMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                    <Button
                        onClick={() => createMutation.mutate('Posted')}
                        disabled={!totals.isBalanced || createMutation.isPending}
                        className={cn(totals.isBalanced ? "bg-green-600 hover:bg-green-700" : "opacity-50")}
                    >
                        <Send className="mr-2 h-4 w-4" /> Post Journal
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
                        <div className="text-2xl font-bold">{totals.debit.toLocaleString('en-US', { style: 'currency', currency: header.currencyCode })}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.credit.toLocaleString('en-US', { style: 'currency', currency: header.currencyCode })}</div>
                    </CardContent>
                </Card>
                <Card className={cn("shadow-sm border-l-4", totals.isBalanced ? "border-l-green-500 bg-green-50/50" : "border-l-red-500 bg-red-50/50")}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Variance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold flex items-center gap-2", totals.isBalanced ? "text-green-700" : "text-red-700")}>
                            {totals.variance.toLocaleString('en-US', { style: 'currency', currency: header.currencyCode })}
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
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Open</Badge>
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
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            value={header.description}
                            onChange={(e) => setHeader({ ...header, description: e.target.value })}
                            placeholder="e.g. Monthly Accruals for IT Dept"
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
                        <Input
                            value={header.periodId}
                            onChange={(e) => setHeader({ ...header, periodId: e.target.value })}
                            placeholder="Jan-2026"
                            className="bg-muted/30"
                        />
                    </div>
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
                                <TableHead className="w-[50px] text-center">#</TableHead>
                                <TableHead className="w-[350px]">Account</TableHead>
                                <TableHead className="min-w-[200px]">Description</TableHead>
                                <TableHead className="w-[180px] text-right">Debit</TableHead>
                                <TableHead className="w-[180px] text-right">Credit</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
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
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditLine(line)}>
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => removeLine(line.id)}>
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
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-2">
                                <Label>Line Description</Label>
                                <Input
                                    value={activeLine.description}
                                    onChange={(e) => updateLine(activeLine.id, 'description', e.target.value)}
                                    placeholder="Explanation for audit trail..."
                                />
                            </div>

                            {/* Placeholder for Attachments/DFF */}
                            <div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                                No attachments linked to this line.
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

