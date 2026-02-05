
import React, { useState, useEffect } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface AutoPostRule {
    id: string;
    criteriaName: string;
    source: string;
    category: string;
    amountLimit: string;
    enabled: boolean;
}

export function PostingRulesManager() {
    const { toast } = useToast();
    const [rules, setRules] = useState<AutoPostRule[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // New Rule Form
    const [newName, setNewName] = useState("");
    const [newSource, setNewSource] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newLimit, setNewLimit] = useState("");

    const ledgerId = "primary-ledger-id"; // Value from context

    useEffect(() => {
        fetchRules();
    }, [ledgerId]);

    const fetchRules = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/gl/posting-rules?ledgerId=${ledgerId}`);
            if (res.ok) {
                const data = await res.json();
                setRules(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch("/api/gl/posting-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    criteriaName: newName,
                    ledgerId: ledgerId,
                    source: newSource,
                    category: newCategory,
                    amountLimit: newLimit || null,
                    enabled: true
                })
            });

            if (!res.ok) throw new Error("Failed to create rule");

            toast({ title: "Success", description: "Auto-Post Rule Created" });
            fetchRules();
            setNewName("");
            setNewSource("");
            setNewCategory("");
            setNewLimit("");
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/gl/posting-rules/${id}`, { method: "DELETE" });
            fetchRules();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Posting Rules Engine</h1>
                    <p className="text-muted-foreground">Configure criteria for automated journal posting.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create Auto-Post Rule</CardTitle>
                    <CardDescription>Define conditions under which journals are automatically posted.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-5 items-end">
                    <div className="space-y-2">
                        <Label>Rule Name</Label>
                        <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Small Spreadsheets" />
                    </div>
                    <div className="space-y-2">
                        <Label>Source</Label>
                        <Input value={newSource} onChange={e => setNewSource(e.target.value)} placeholder="e.g. Spreadsheet" />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="e.g. Adjustment" />
                    </div>
                    <div className="space-y-2">
                        <Label>Max Amount</Label>
                        <Input type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)} placeholder="e.g. 1000" />
                    </div>
                    <Button onClick={handleCreate} disabled={!newName}>Add Rule</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Active Rules</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rule Name</TableHead>
                                <TableHead>Source Filter</TableHead>
                                <TableHead>Category Filter</TableHead>
                                <TableHead>Amount Limit</TableHead>
                                <TableHead>Enabled</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.criteriaName}</TableCell>
                                    <TableCell>{rule.source || "All"}</TableCell>
                                    <TableCell>{rule.category || "All"}</TableCell>
                                    <TableCell>{rule.amountLimit ? `< ${rule.amountLimit}` : "No Limit"}</TableCell>
                                    <TableCell>
                                        <Switch checked={rule.enabled} />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)} className="text-destructive">
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rules.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                        No rules defined. All journals will require manual posting.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-md border border-yellow-200 dark:border-yellow-900">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Note on Processing</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Auto-posting runs securely in the background. Rules are evaluated whenever a journal batch is approved.
                </p>
            </div>
        </div>
    );
}
