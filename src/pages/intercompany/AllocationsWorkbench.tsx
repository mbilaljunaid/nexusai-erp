import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Play, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";


export default function AllocationsWorkbench() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isRunOpen, setIsRunOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<string | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Queries
    const { data: rules = [], isLoading } = useQuery<any>({
        queryKey: ["ic-allocation-rules"],
        queryFn: async () => {
            const res = await fetch("/api/intercompany/rules/allocations");
            if (!res.ok) throw new Error("Failed to fetch rules");
            return res.json();
        }
    });

    const { data: orgs = [] } = useQuery<any>({
        queryKey: ["ic-orgs"],
        queryFn: async () => {
            const res = await fetch("/api/intercompany/setup/orgs");
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    // Mutations
    const createRuleMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/intercompany/rules/allocations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ic-allocation-rules"] });
            setIsCreateOpen(false);
            toast({ title: "Rule Created", description: "Allocation rule saved successfully." });
        }
    });

    const runAllocationMutation = useMutation({
        mutationFn: async ({ ruleId, amount, currency }: { ruleId: string, amount: number, currency: string }) => {
            const res = await fetch(`/api/intercompany/allocations/${ruleId}/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, currency })
            });
            if (!res.ok) throw new Error("Failed to run allocation");
            return res.json();
        },
        onSuccess: () => {
            setIsRunOpen(false);
            toast({ title: "Allocation Run", description: "Batch created successfully from allocation rule." });
        }
    });

    return (
        <StandardPage title="Mass Allocations">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground mt-2">Manage and execute recurring intercompany cost distributions.</p>
                </div>
                <CreateRuleDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                    orgs={orgs}
                    onSubmit={(data) => createRuleMutation.mutate(data)}
                />
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {rules.length === 0 && (
                            <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                                <p className="text-muted-foreground">No allocation rules defined.</p>
                            </div>
                        )}
                        {rules.map((rule: any) => (
                            <Card key={rule.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {rule.name}
                                            <Badge variant="outline">{rule.allocationMethod}</Badge>
                                        </CardTitle>
                                        <CardDescription>{rule.description || "No description provided"}</CardDescription>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                        onClick={() => { setSelectedRule(rule.id); setIsRunOpen(true); }}
                                    >
                                        <Play className="h-4 w-4" /> Run
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground mb-4">
                                        Source: <span className="font-medium text-foreground">{orgs.find((o: any) => o.id === rule.sourceOrgId)?.orgName || rule.sourceOrgId}</span>
                                    </div>
                                    <div className="bg-muted/50 rounded-md p-3">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Target Lines</h4>
                                        <div className="space-y-2">
                                            {rule.lines?.map((line: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span>{orgs.find((o: any) => o.id === line.targetOrgId)?.orgName || line.targetOrgId}</span>
                                                    <span className="font-mono">
                                                        {rule.allocationMethod === "PERCENTAGE"
                                                            ? `${line.percentage}%`
                                                            : `$${line.fixedAmount}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <RunAllocationDialog
                open={isRunOpen}
                onOpenChange={setIsRunOpen}
                onSubmit={(amt: number, curr: string) => selectedRule && runAllocationMutation.mutate({ ruleId: selectedRule, amount: amt, currency: curr })}
            />
        </StandardPage>
    );
}

function CreateRuleDialog({ open, onOpenChange, orgs, onSubmit }: { open: boolean, onOpenChange: any, orgs: any[], onSubmit: (data: any) => void }) {
    const [name, setName] = useState("");
    const [sourceOrg, setSourceOrg] = useState("");
    const [lines, setLines] = useState<any[]>([{ targetOrgId: "", percentage: "" }]);

    const handleSubmit = () => {
        onSubmit({
            name,
            sourceOrgId: sourceOrg,
            allocationMethod: "PERCENTAGE", // Only supporting percentage for now
            lines: lines.map(l => ({ targetOrgId: l.targetOrgId, percentage: l.percentage }))
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New Rule</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Create Allocation Rule</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rule Name</label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. IT Overhead Sep 2025" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Source Org</label>
                            <Select value={sourceOrg} onValueChange={setSourceOrg}>
                                <SelectTrigger><SelectValue placeholder="Select Org" /></SelectTrigger>
                                <SelectContent>
                                    {orgs.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.orgName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Allocation Lines (Percentage)</label>
                        {lines.map((line, idx) => (
                            <div key={idx} className="flex gap-2">
                                <Select value={line.targetOrgId} onValueChange={(val) => {
                                    const newLines = [...lines]; newLines[idx].targetOrgId = val; setLines(newLines);
                                }}>
                                    <SelectTrigger className="w-48"><SelectValue placeholder="Target Org" /></SelectTrigger>
                                    <SelectContent>
                                        {orgs.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.orgName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="%"
                                    className="w-20"
                                    value={line.percentage}
                                    onChange={e => {
                                        const newLines = [...lines]; newLines[idx].percentage = e.target.value; setLines(newLines);
                                    }}
                                />
                                {idx === lines.length - 1 && (
                                    <Button variant="ghost" size="icon" onClick={() => setLines([...lines, { targetOrgId: "", percentage: "" }])}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button onClick={handleSubmit} className="w-full">Create Rule</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function RunAllocationDialog({ open, onOpenChange, onSubmit }: { open: boolean, onOpenChange: any, onSubmit: (amount: number, currency: string) => void }) {
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("USD");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Run Allocation Batch</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">Enter the total source amount to distribute based on the rule percentages.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Total Amount</label>
                            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Currency</label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={() => onSubmit(Number(amount), currency)} className="w-full" disabled={!amount}>
                        <Play className="mr-2 h-4 w-4" /> Generate Batch
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
