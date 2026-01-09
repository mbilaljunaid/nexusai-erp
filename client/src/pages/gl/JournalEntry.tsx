import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Plus, Trash2, Save, Send } from "lucide-react";
import { CodeCombinationPicker } from "@/components/gl/CodeCombinationPicker";

interface JournalLine {
    id: string; // temp id for UI
    accountId: string; // CCID or Account
    debit: string;
    credit: string;
    description: string;
}

export default function JournalEntry() {
    const { toast } = useToast();
    const [header, setHeader] = useState({
        description: "",
        currencyCode: "USD",
        periodId: "",
    });

    const [lines, setLines] = useState<JournalLine[]>([
        { id: "1", accountId: "", debit: "0", credit: "0", description: "" }
    ]);

    const addLine = () => {
        setLines([...lines, { id: Math.random().toString(), accountId: "", debit: "0", credit: "0", description: "" }]);
    };

    const updateLine = (id: string, field: keyof JournalLine, value: string) => {
        setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const removeLine = (id: string) => {
        setLines(lines.filter(l => l.id !== id));
    };

    const createMutation = useMutation({
        mutationFn: async () => {
            // 1. Create Journal
            const res = await apiRequest("POST", "/api/gl/journals", {
                description: header.description,
                currencyCode: header.currencyCode,
                // periodId: header.periodId || null, // Optional for draft
                source: "Manual",
                lines: lines.map(l => ({
                    accountId: l.accountId, // Need valid UUIDs here in real app
                    // For now, assuming user types account ID directly or we map it.
                    // In prod: Logic to map "100-200" to UUID.
                    enteredDebit: l.debit,
                    enteredCredit: l.credit,
                    description: l.description,
                    currencyCode: header.currencyCode
                }))
            });
            const data = await res.json();
            return data;
        },
        onSuccess: (data) => {
            toast({ title: "Journal Created", description: "Journal saved as Draft." });
            // Optionally trigger Post
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Create Journal Entry</h1>
                <div className="space-x-2">
                    <Button variant="outline" onClick={() => createMutation.mutate()}>
                        <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                    <Button onClick={() => { }}>
                        <Send className="mr-2 h-4 w-4" /> Post
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Batch Header</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Journal Name / Description</Label>
                        <Input
                            value={header.description}
                            onChange={(e) => setHeader({ ...header, description: e.target.value })}
                            placeholder="e.g. Monthly Accruals"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Currency</Label>
                        <Input
                            value={header.currencyCode}
                            onChange={(e) => setHeader({ ...header, currencyCode: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Period</Label>
                        <Input
                            value={header.periodId}
                            onChange={(e) => setHeader({ ...header, periodId: e.target.value })}
                            placeholder="e.g. Jan-2026"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Journal Lines</CardTitle>
                    <Button size="sm" onClick={addLine}><Plus className="h-4 w-4 mr-2" /> Add Line</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Account</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[150px]">Debit ({header.currencyCode})</TableHead>
                                <TableHead className="w-[150px]">Credit ({header.currencyCode})</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lines.map((line) => (
                                <TableRow key={line.id}>
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
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.debit}
                                            onChange={(e) => updateLine(line.id, 'debit', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.credit}
                                            onChange={(e) => updateLine(line.id, 'credit', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeLine(line.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
