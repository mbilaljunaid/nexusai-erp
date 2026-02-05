import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save } from "lucide-react";

interface JournalLine {
    id: number;
    accountId: string;
    enteredDr: string;
    enteredCr: string;
    description: string;
}

export default function ManualJournalEntry() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // specific Header State
    const [ledgerId, setLedgerId] = useState("PRIMARY");
    const [journalName, setJournalName] = useState("");
    const [description, setDescription] = useState("");
    const [glDate, setGlDate] = useState(new Date().toISOString().split('T')[0]);
    const [currency, setCurrency] = useState("USD");
    const [category, setCategory] = useState("Adjustment");

    // specific Lines State
    const [lines, setLines] = useState<JournalLine[]>([
        { id: 1, accountId: "", enteredDr: "", enteredCr: "", description: "" },
        { id: 2, accountId: "", enteredDr: "", enteredCr: "", description: "" }
    ]);

    // specific Totals
    const totalDr = lines.reduce((sum, line) => sum + (parseFloat(line.enteredDr) || 0), 0);
    const totalCr = lines.reduce((sum, line) => sum + (parseFloat(line.enteredCr) || 0), 0);
    const isBalanced = Math.abs(totalDr - totalCr) < 0.01;

    // specific Mutation
    const createJournalMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch("/api/sla/manual-journals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create journal");
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast({ title: "Journal Created", description: `Journal ID: ${data.id}` });
            // Reset Form? 
            setJournalName("");
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleAddLine = () => {
        setLines([...lines, { id: lines.length + 1, accountId: "", enteredDr: "", enteredCr: "", description: "" }]);
    };

    const updateLine = (id: number, field: keyof JournalLine, value: string) => {
        setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const removeLine = (id: number) => {
        if (lines.length <= 2) return;
        setLines(lines.filter(l => l.id !== id));
    };

    const handleSubmit = () => {
        if (!journalName) return toast({ title: "Error", description: "Journal Name is required", variant: "destructive" });
        if (!isBalanced) return toast({ title: "Error", description: "Journal is not balanced", variant: "destructive" });

        const payload = {
            ledgerId,
            journalName,
            description,
            glDate,
            category,
            currencyCode: currency,
            lines: lines.map(l => ({
                accountId: l.accountId,
                enteredDr: parseFloat(l.enteredDr) || 0,
                enteredCr: parseFloat(l.enteredCr) || 0,
                description: l.description
            }))
        };
        createJournalMutation.mutate(payload);
    };

    return (
        <StandardPage title="Create Manual Journal" subtitle="Enter generic SLA adjustment journals">
            <div className="space-y-6">
                {/* Header Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Journal Header</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Journal Name</Label>
                            <Input value={journalName} onChange={e => setJournalName(e.target.value)} placeholder="e.g. Jan Adjustment" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>GL Date</Label>
                            <Input type="date" value={glDate} onChange={e => setGlDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Ledger</Label>
                            <Input value={ledgerId} onChange={e => setLedgerId(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Input value={currency} onChange={e => setCurrency(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input value={category} onChange={e => setCategory(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Lines Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Journal Lines</CardTitle>
                        <div className="flex gap-4 items-center">
                            <div className={isBalanced ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                Diff: {(totalDr - totalCr).toFixed(2)}
                            </div>
                            <Button size="sm" variant="outline" onClick={handleAddLine}><Plus className="w-4 h-4 mr-2" /> Add Line</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[400px]">Account (CCID)</TableHead>
                                    <TableHead>Debit</TableHead>
                                    <TableHead>Credit</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.map((line) => (
                                    <TableRow key={line.id}>
                                        <TableCell>
                                            <Input
                                                value={line.accountId}
                                                onChange={e => updateLine(line.id, "accountId", e.target.value)}
                                                placeholder="01-000-..."
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={line.enteredDr}
                                                onChange={e => updateLine(line.id, "enteredDr", e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={line.enteredCr}
                                                onChange={e => updateLine(line.id, "enteredCr", e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={line.description}
                                                onChange={e => updateLine(line.id, "description", e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button size="icon" variant="ghost" onClick={() => removeLine(line.id)} disabled={lines.length <= 2}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex justify-end gap-8 mt-4 font-semibold text-lg border-t pt-4">
                            <div>Total Debit: {totalDr.toFixed(2)}</div>
                            <div>Total Credit: {totalCr.toFixed(2)}</div>
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={!isBalanced || createJournalMutation.isPending} size="lg">
                        <Save className="w-4 h-4 mr-2" />
                        {createJournalMutation.isPending ? "Posting..." : "Post Journal"}
                    </Button>
                </div>
            </div>
        </StandardPage>
    );
}
