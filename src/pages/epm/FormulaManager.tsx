
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Trash2 } from "lucide-react";

interface FormulaRule {
    id: string;
    name: string;
    expression: string;
    targetAccount: string;
    description?: string;
}

const FormulaManager = () => {
    const { toast } = useToast();
    const [rules, setRules] = useState<FormulaRule[]>([
        { id: '1', name: 'Inflation Adjustment', expression: 'Amount * 1.05', targetAccount: 'All Expenses', description: 'Apply 5% increase across expenses' },
        { id: '2', name: 'Revenue Growth', expression: 'Amount * 1.10', targetAccount: '40000 Revenue', description: 'Target 10% YoY growth' }
    ]);

    const [newRule, setNewRule] = useState<Partial<FormulaRule>>({});

    const handleAddRule = () => {
        if (!newRule.name || !newRule.expression) return;
        const rule: FormulaRule = {
            id: Math.random().toString(36).substr(2, 9),
            name: newRule.name,
            expression: newRule.expression,
            targetAccount: newRule.targetAccount || 'Global',
            description: newRule.description
        };
        setRules([...rules, rule]);
        setNewRule({});
        toast({ title: "Rule Created", description: `Formula "${rule.name}" added successfully.` });
    };

    const handleDelete = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const handleRun = (id: string) => {
        toast({ title: "Executing Formula...", description: "Calculation job submitted to engine." });
        // API call to backend would go here
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Formula Manager</CardTitle>
                <CardDescription>Define driver-based logic for planning models.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Create New Rule */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b pb-6">
                    <div className="space-y-2">
                        <Label>Rule Name</Label>
                        <Input
                            placeholder="e.g. Merit Increase"
                            value={newRule.name || ''}
                            onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Expression</Label>
                        <Input
                            placeholder="e.g. Amount * 1.03"
                            value={newRule.expression || ''}
                            onChange={e => setNewRule({ ...newRule, expression: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Target Scope</Label>
                        <Input
                            placeholder="Account / Dept"
                            value={newRule.targetAccount || ''}
                            onChange={e => setNewRule({ ...newRule, targetAccount: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleAddRule}><Plus className="mr-2 h-4 w-4" /> Add Rule</Button>
                </div>

                {/* Rules List */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Expression</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">
                                        {rule.name}
                                        {rule.description && <p className="text-xs text-muted-foreground">{rule.description}</p>}
                                    </TableCell>
                                    <TableCell><code className="bg-muted px-2 py-1 rounded text-sm">{rule.expression}</code></TableCell>
                                    <TableCell><Badge variant="outline">{rule.targetAccount}</Badge></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(rule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        <Button size="sm" onClick={() => handleRun(rule.id)}><Play className="mr-2 h-4 w-4" /> Run</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default FormulaManager;
