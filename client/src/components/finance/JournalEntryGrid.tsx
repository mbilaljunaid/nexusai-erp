import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, FileSpreadsheet } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLedger } from "@/context/LedgerContext";
import type { GlAccount, GlPeriod, InsertGlJournal, InsertGlJournalLine } from "@shared/schema";

export function JournalEntryGrid() {
    const { toast } = useToast();
    const { ledgers, currentLedgerId } = useLedger();
    const activeLedger = ledgers.find(l => l.id === currentLedgerId);
    const [journalNumber, setJournalNumber] = useState(`JE-${Date.now()}`);
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [description, setDescription] = useState("");

    const [lines, setLines] = useState<Partial<InsertGlJournalLine>[]>([
        { accountId: "", description: "", debit: "0", credit: "0" },
        { accountId: "", description: "", debit: "0", credit: "0" }
    ]);

    const { data: accounts = [] } = useQuery<GlAccount[]>({
        queryKey: ["/api/gl/accounts"],
        queryFn: () => fetch("/api/gl/accounts").then(res => res.json())
    });

    const { data: periods = [] } = useQuery<GlPeriod[]>({
        queryKey: ["/api/gl/periods"],
        queryFn: () => fetch("/api/gl/periods").then(res => res.json())
    });

    const createMutation = useMutation({
        mutationFn: async (data: { journal: InsertGlJournal, lines: InsertGlJournalLine[] }) => {
            const res = await fetch("/api/gl/journals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to post journal");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/journals"] });
            toast({ title: "Journal Posted Successfully" });
            // Reset
            setJournalNumber(`JE-${Date.now()}`);
            setDescription("");
            setLines([
                { accountId: "", description: "", debit: "0", credit: "0" },
                { accountId: "", description: "", debit: "0", credit: "0" }
            ]);
        },
        onError: () => {
            toast({ title: "Error posting journal", variant: "destructive" });
        }
    });

    const updateLine = (index: number, field: keyof InsertGlJournalLine, value: string) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };

    const removeLine = (index: number) => {
        if (lines.length > 2) {
            const newLines = lines.filter((_, i) => i !== index);
            setLines(newLines);
        }
    };

    const addLine = () => {
        setLines([...lines, { accountId: "", description: "", debit: "0", credit: "0" }]);
    };

    const totalDebits = lines.reduce((sum, line) => sum + parseFloat(line.debit || "0"), 0);
    const totalCredits = lines.reduce((sum, line) => sum + parseFloat(line.credit || "0"), 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    const handleSubmit = () => {
        if (!isBalanced) {
            toast({ title: "Journal must balance", variant: "destructive" });
            return;
        }
        if (!selectedPeriod) {
            toast({ title: "Select a period", variant: "destructive" });
            return;
        }

        // Construct payload
        const journalData: InsertGlJournal = {
            journalNumber,
            periodId: selectedPeriod,
            ledgerId: currentLedgerId || "",
            currencyCode: activeLedger?.currencyCode || "USD",
            description,
            status: "Posted",
            postedDate: new Date(),
            source: "Manual"
        };

        // We need backend to handle creating lines associated with the journal.
        // However, the standard insertGlJournalSchema doesn't include lines.
        // The backend endpoint should accept { journal, lines } structure.
        // Assuming we implemented a custom endpoint for this transaction.

        // Note: The mutation expects this structure.
        createMutation.mutate({
            journal: journalData,
            lines: lines as InsertGlJournalLine[] // Type assertion, validation happens in backend
        });
    };

    return (
        <Card className="h-full border-t-4 border-t-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    General Journal Entry
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Header Section */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                    <div>
                        <label className="text-sm font-medium">Journal Number</label>
                        <Input value={journalNumber} onChange={e => setJournalNumber(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Period</label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger><SelectValue placeholder="Select Period" /></SelectTrigger>
                            <SelectContent>
                                {periods.length === 0 ? (
                                    <SelectItem value="temp">No Periods Configured</SelectItem>
                                ) : periods.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.periodName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                </div>

                {/* Grid Section */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%]">Account</TableHead>
                                <TableHead className="w-[30%]">Line Description</TableHead>
                                <TableHead className="w-[15%] text-right">Debit</TableHead>
                                <TableHead className="w-[15%] text-right">Credit</TableHead>
                                <TableHead className="w-[5%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lines.map((line, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Select value={line.accountId} onValueChange={(v) => updateLine(index, "accountId", v)}>
                                            <SelectTrigger className="border-0 bg-transparent focus:ring-0">
                                                <SelectValue placeholder="Select Account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.accountCode} - {acc.accountName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={line.description || ""}
                                            onChange={e => updateLine(index, "description", e.target.value)}
                                            className="border-0 focus-visible:ring-0"
                                            placeholder="Description..."
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.debit}
                                            onChange={e => updateLine(index, "debit", e.target.value)}
                                            className="text-right border-0 focus-visible:ring-0"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.credit}
                                            onChange={e => updateLine(index, "credit", e.target.value)}
                                            className="text-right border-0 focus-visible:ring-0"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeLine(index)} disabled={lines.length <= 2}>
                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={addLine}><Plus className="w-4 h-4 mr-2" /> Add Line</Button>
                    <div className="flex gap-8 items-center text-sm font-medium">
                        <div>Total Debit: <span className="font-mono text-lg ml-2">{totalDebits.toFixed(2)}</span></div>
                        <div>Total Credit: <span className="font-mono text-lg ml-2">{totalCredits.toFixed(2)}</span></div>
                        <div>Diff: <span className={`font-mono text-lg ml-2 ${isBalanced ? "text-green-600" : "text-destructive"}`}>
                            {Math.abs(totalDebits - totalCredits).toFixed(2)}
                        </span></div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2 bg-muted/10 p-4">
                <Button variant="outline">Save as Draft</Button>
                <Button onClick={handleSubmit} disabled={!isBalanced || createMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" /> Post Journal
                </Button>
            </CardFooter>
        </Card>
    );
}
