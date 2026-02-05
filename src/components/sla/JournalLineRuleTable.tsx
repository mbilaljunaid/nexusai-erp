import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
                body: JSON.stringify(jlt)
            });
            if (res.ok) {
                toast({ title: "Saved", description: `Updated rule for ${jlt.name}` });
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to save rule", variant: "destructive" });
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead>Acct Class</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Balance Type</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jlts.map(jlt => (
                        <TableRow key={jlt.id}>
                            <TableCell>
                                <Input
                                    type="number"
                                    className="w-12 h-8"
                                    value={jlt.priority || 0}
                                    onChange={(e) => setJlts(prev => prev.map(p => p.id === jlt.id ? { ...p, priority: parseInt(e.target.value) } : p))}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    value={jlt.name}
                                    onChange={(e) => setJlts(prev => prev.map(p => p.id === jlt.id ? { ...p, name: e.target.value } : p))}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    value={jlt.code}
                                    className="font-mono text-xs"
                                    onChange={(e) => setJlts(prev => prev.map(p => p.id === jlt.id ? { ...p, code: e.target.value } : p))}
                                />
                            </TableCell>
                            <TableCell>
                                <Select
                                    value={jlt.side}
                                    onValueChange={(val: any) => setJlts(prev => prev.map(p => p.id === jlt.id ? { ...p, side: val } : p))}
                                >
                                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
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
                                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
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
                                <span className="text-xs bg-secondary px-2 py-1 rounded">{jlt.balanceType}</span>
                            </TableCell>
                            <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => handleUpdate(jlt)}>
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
    );
}
