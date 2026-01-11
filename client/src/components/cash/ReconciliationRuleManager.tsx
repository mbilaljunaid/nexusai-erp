
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings2, Plus, Trash2, Edit2, Play, AlertCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReconciliationRule {
    id: string;
    ruleName: string;
    priority: number;
    enabled: boolean;
    matchingCriteria: {
        dateToleranceDays?: number;
        requireRefMatch?: boolean;
        refRegex?: string;
        amountTolerance?: number;
    };
}

export function ReconciliationRuleManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<ReconciliationRule | null>(null);

    const { data: rules, isLoading } = useQuery<ReconciliationRule[]>({
        queryKey: ["/api/cash/reconciliation-rules"]
    });

    const createMutation = useMutation({
        mutationFn: async (newRule: Partial<ReconciliationRule>) => {
            const res = await apiRequest("POST", "/api/cash/reconciliation-rules", newRule);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/cash/reconciliation-rules"] });
            toast({ title: "Rule Created", description: "Successfully added new reconciliation rule." });
            setIsAddOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (rule: ReconciliationRule) => {
            const res = await apiRequest("PATCH", `/api/cash/reconciliation-rules/${rule.id}`, rule);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/cash/reconciliation-rules"] });
            setEditingRule(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/cash/reconciliation-rules/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/cash/reconciliation-rules"] });
            toast({ title: "Rule Deleted" });
        }
    });

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            ruleName: formData.get("ruleName") as string,
            priority: parseInt(formData.get("priority") as string),
            enabled: formData.get("enabled") === "on",
            matchingCriteria: {
                dateToleranceDays: parseInt(formData.get("dateTolerance") as string),
                requireRefMatch: formData.get("requireRef") === "on",
                refRegex: formData.get("refRegex") as string,
            }
        };

        if (editingRule) {
            updateMutation.mutate({ ...editingRule, ...data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Reconciliation Rules</h2>
                    <p className="text-muted-foreground">Configure automated matching logic for bank statements.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Matching Rule</DialogTitle>
                            <DialogDescription>Define criteria for automatic statement reconciliation.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ruleName">Rule Name</Label>
                                <Input id="ruleName" name="ruleName" placeholder="e.g. Standard Reference Match" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Input id="priority" name="priority" type="number" defaultValue="10" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dateTolerance">Date Tolerance (Days)</Label>
                                    <Input id="dateTolerance" name="dateTolerance" type="number" defaultValue="3" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="refRegex">Reference Regex (Optional)</Label>
                                <Input id="refRegex" name="refRegex" placeholder="^REF-[0-9]+$" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="requireRef" name="requireRef" defaultChecked />
                                <Label htmlFor="requireRef">Require Reference Match</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="enabled" name="enabled" defaultChecked />
                                <Label htmlFor="enabled">Enabled</Label>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending}>Save Rule</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Priority</TableHead>
                                <TableHead>Rule Name</TableHead>
                                <TableHead>Criteria Summary</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading rules...</TableCell></TableRow>
                            ) : rules?.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No rules defined.</TableCell></TableRow>
                            ) : (
                                rules?.sort((a, b) => a.priority - b.priority).map((rule) => (
                                    <TableRow key={rule.id}>
                                        <TableCell><Badge variant="outline">{rule.priority}</Badge></TableCell>
                                        <TableCell className="font-medium">{rule.ruleName}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {rule.matchingCriteria.dateToleranceDays}d Tol,
                                            {rule.matchingCriteria.requireRefMatch ? " Ref Required" : " No Ref"}
                                            {rule.matchingCriteria.refRegex && `, Regex: ${rule.matchingCriteria.refRegex}`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={rule.enabled ? "default" : "secondary"}>
                                                {rule.enabled ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => setEditingRule(rule)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(rule.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-4 items-start">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                    <p className="font-semibold text-primary">Matching Logic Order</p>
                    <p className="text-muted-foreground mt-1">
                        Rules are processed in order of Priority (lowest number first).
                        Once a rule finds a unique transaction match for a statement line, subsequent rules are skipped for that line.
                    </p>
                </div>
            </div>
        </div>
    );
}
