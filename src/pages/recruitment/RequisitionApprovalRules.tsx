import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, ArrowRight, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Rule {
    id: string;
    condition: string;
    approverLevel: string;
    active: boolean;
}

const INITIAL_RULES: Rule[] = [
    { id: '1', condition: 'Salary Band >= Sr. Director', approverLevel: 'VP Approval', active: true },
    { id: '2', condition: 'Headcount > 1', approverLevel: 'Finance Approval', active: true },
    { id: '3', condition: 'Worker Type = Contingent', approverLevel: 'Procurement Approval', active: false },
];

export default function RequisitionApprovalRules() {
    const { toast } = useToast();
    const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
    const [newCondition, setNewCondition] = useState('');
    const [newApprover, setNewApprover] = useState('');

    const toggleRule = (id: string) => {
        setRules((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r));
    };
    const deleteRule = (id: string) => {
        setRules((prev) => prev.filter((r) => r.id !== id));
        toast({ title: 'Rule Removed', description: 'Approval rule has been deleted.' });
    };
    const addRule = () => {
        if (!newCondition || !newApprover) return;
        setRules((prev) => [...prev, { id: `${Date.now()}`, condition: newCondition, approverLevel: newApprover, active: true }]);
        setNewCondition('');
        setNewApprover('');
        toast({ title: 'Rule Added', description: 'New approval routing rule is now active.' });
    };

    return (
        <StandardPage
            title="Requisition Approval Rules"
            description="Define conditional approval chains for job requisitions. Rules route based on salary band, headcount, worker type, and business unit."
        >
            <div className="space-y-6">
                {/* Rules List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Routing Rules</CardTitle>
                        <CardDescription>Rules are evaluated in order. First matching rule wins.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {rules.map((rule, idx) => (
                            <div key={rule.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${rule.active ? 'border-border bg-background' : 'border-dashed border-border/50 bg-muted/30 opacity-60'}`}>
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">{idx + 1}</span>
                                <div className="flex-1 flex items-center gap-3 flex-wrap">
                                    <Badge variant="outline" className="font-mono text-xs">IF</Badge>
                                    <span className="text-sm font-medium">{rule.condition}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <Badge className="bg-primary/10 text-primary border-0 shadow-none">{rule.approverLevel}</Badge>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => toggleRule(rule.id)} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Toggle rule">
                                        {rule.active ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                                    </button>
                                    <button onClick={() => deleteRule(rule.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete rule">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {rules.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">No rules defined. All requisitions follow the default single-level approval.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Add Rule */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Rule</CardTitle>
                        <CardDescription>Specify a condition and the required approval chain when that condition is met.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Condition</Label>
                                <Select onValueChange={setNewCondition} value={newCondition}>
                                    <SelectTrigger><SelectValue placeholder="Select condition..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Salary Band >= Sr. Director">Salary Band ≥ Sr. Director</SelectItem>
                                        <SelectItem value="Salary Band >= Director">Salary Band ≥ Director</SelectItem>
                                        <SelectItem value="Headcount > 1">Headcount &gt; 1</SelectItem>
                                        <SelectItem value="Headcount > 5">Headcount &gt; 5</SelectItem>
                                        <SelectItem value="Worker Type = Contingent">Worker Type = Contingent</SelectItem>
                                        <SelectItem value="Annual Budget Impact > $500K">Annual Budget Impact &gt; $500K</SelectItem>
                                        <SelectItem value="Business Unit = International">Business Unit = International</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>→ Route to Approver</Label>
                                <Select onValueChange={setNewApprover} value={newApprover}>
                                    <SelectTrigger><SelectValue placeholder="Select approver level..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Direct Manager Approval">Direct Manager</SelectItem>
                                        <SelectItem value="HR Business Partner Approval">HR Business Partner</SelectItem>
                                        <SelectItem value="VP Approval">VP (Level 3)</SelectItem>
                                        <SelectItem value="C-Suite Approval">C-Suite (Level 4)</SelectItem>
                                        <SelectItem value="Finance Approval">Finance Controller</SelectItem>
                                        <SelectItem value="Procurement Approval">Procurement</SelectItem>
                                        <SelectItem value="Board Approval">Board of Directors</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={addRule} disabled={!newCondition || !newApprover}>
                            <Plus className="mr-2 h-4 w-4" /> Add Rule
                        </Button>
                    </CardContent>
                </Card>

                {/* Default Chain */}
                <Card>
                    <CardHeader>
                        <CardTitle>Default Approval Chain</CardTitle>
                        <CardDescription>Applied when no specific rule matches</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 flex-wrap">
                            {['Hiring Manager', 'HR Business Partner', 'Department Head'].map((step, i, arr) => (
                                <React.Fragment key={step}>
                                    <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm font-medium">
                                        <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                        {step}
                                    </div>
                                    {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
