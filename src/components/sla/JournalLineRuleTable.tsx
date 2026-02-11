import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface JLT {
    id: string;
    code: string;
    name: string;
    balanceType: "Actual" | "Budget" | "Encumbrance";
    side: "Dr" | "Cr";
    accountingClass: string;
    condition?: string;
    priority: number;
}

import { FormulaBuilder } from "./FormulaBuilder";

export function JournalLineRuleTable({ eventClassId }: { eventClassId: string }) {
    const [jlts, setJlts] = useState<JLT[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Fetch JLTs when class changes
    useEffect(() => {
        setLoading(true);
        fetch(`/api/sla/event-classes/${eventClassId}/jlts`)
            .then(res => res.json())
            .then(data => setJlts(data.sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [eventClassId]);

    const handleUpdate = async (jlt: JLT) => {
        try {
            const res = await fetch("/api/sla/jlts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...jlt, eventClassId })
            });
            if (res.ok) {
                const savedJlt = await res.json();
                setJlts(prev => prev.map(p => p.id === jlt.id ? savedJlt : p));
                toast({ title: "Saved", description: `Updated rule for ${jlt.name}` });
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to save rule", variant: "destructive" });
        }
    };

    const addRow = () => {
        const newJlt: JLT = {
            id: `temp-${Date.now()}`,
            code: "NEW_RULE",
            name: "New Journal Line Rule",
            balanceType: "Actual",
            side: "Dr",
            accountingClass: "Expense",
            priority: (jlts[jlts.length - 1]?.priority || 0) + 10
        };
        setJlts([...jlts, newJlt]);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-muted-foreground italic">
                    Define the templates for individual journal lines.
                </div>
                <Button size="sm" onClick={addRow} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Line Type
                </Button>
            </div>
            <div className="rounded-md border p-1 bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Template Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Side</TableHead>
                            <TableHead>Acct Class</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Balance Type</TableHead>
                            <TableHead className="w-[80px] text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jlts.map(jlt => (
                            <TableRow key={jlt.id} className="hover:bg-muted/10 transition-colors">
                                <TableCell>
                                    <Input
                                        type="number"
                                        className="w-16 h-8 text-xs text-center"
                                        value={jlt.priority || 0}
                                        onChange={(e) => setJlts(prev => prev.map(p => p.id === jlt.id ? { ...p, priority: parseInt(e.target.value) } : p))}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={jlt.name}
                                        className="h-8 text-sm"
                                        placeholder="e.g. Item Expense"
                                        onChange={(e) => setJlts(prev => prev.map(p => p.id === jlt.id ? { ...p, name: e.target.value } : p))}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={jlt.code}
                                        className="font-mono text-[10px] h-8 uppercase"
                                        placeholder="JLT_CODE"
                                        onChange={(e) => setJlts(prev => prev.map(p => p.id === jlt.id ? { ...p, code: e.target.value } : p))}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={jlt.side}
                                        onValueChange={(val: any) => setJlts(prev => prev.map(p => p.id === jlt.id ? { ...p, side: val } : p))}
                                    >
                                        <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Dr">Debit</SelectItem>
                                            <SelectItem value="Cr">Credit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={jlt.accountingClass}
                                        onValueChange={(val: any) => setJlts(prev => prev.map(p => p.id === jlt.id ? { ...p, accountingClass: val } : p))}
                                    >
                                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Liability">Liability</SelectItem>
                                            <SelectItem value="Expense">Expense</SelectItem>
                                            <SelectItem value="Recievable">Receivable</SelectItem>
                                            <SelectItem value="Revenue">Revenue</SelectItem>
                                            <SelectItem value="Tax">Tax</SelectItem>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <FormulaBuilder
                                        value={jlt.condition || ""}
                                        onChange={(val) => setJlts(prev => prev.map(p => p.id === jlt.id ? { ...p, condition: val } : p))}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] font-mono tracking-tight">{jlt.balanceType}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100"
                                        onClick={() => handleUpdate(jlt)}
                                    >
                                        <Save className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {jlts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                    No JLTs found for this class. Please seed initial metadata.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
