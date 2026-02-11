import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Play, Trash2, Edit, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface EliminationRule {
    id: string;
    name: string;
    ledgerSetId: string;
    matchRule: string;
    eliminationLedgerId: string;
    offsetAccount?: string;
    enabled: boolean;
}

interface SimulationResult {
    ruleId: string;
    ruleName: string;
    matchedAmount: number;
    journalLines: {
        account: string;
        debit: number;
        credit: number;
    }[];
}

export default function EliminationRuleBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
    const [newRule, setNewRule] = useState({
        name: "",
        ledgerSetId: "",
        matchRule: "",
        eliminationLedgerId: "",
        offsetAccount: "",
        description: "",
        enabled: true
    });

    // Fetch elimination rules
    const { data: rules = [] } = useQuery<EliminationRule[]>({
        queryKey: ["elimination-rules"],
        queryFn: async () => {
            // Mock - replace with API
            return [
                {
                    id: "1",
                    name: "IC Payables Elimination",
                    ledgerSetId: "GLOBAL_GRP",
                    matchRule: "Segment3=2000",
                    eliminationLedgerId: "ELIM_LEDGER",
                    offsetAccount: "100-00-1000",
                    enabled: true
                },
                {
                    id: "2",
                    name: "IC Receivables Elimination",
                    ledgerSetId: "GLOBAL_GRP",
                    matchRule: "Segment3=1000",
                    eliminationLedgerId: "ELIM_LEDGER",
                    offsetAccount: "200-00-2000",
                    enabled: true
                }
            ];
        }
    });

    // Create rule mutation
    const createRuleMutation = useMutation({
        mutationFn: async (ruleData: typeof newRule) => {
            const res = await fetch("/api/gl/consolidation/elimination-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ruleData)
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elimination-rules"] });
            setIsCreateDialogOpen(false);
            setNewRule({ name: "", ledgerSetId: "", matchRule: "", eliminationLedgerId: "", offsetAccount: "", description: "", enabled: true });
            toast({
                title: "Rule Created",
                description: "Elimination rule created successfully."
            });
        }
    });

    // Toggle enabled mutation
    const toggleEnabledMutation = useMutation({
        mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
            const res = await fetch(`/api/gl/consolidation/elimination-rules/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: !enabled })
            });
            if (!res.ok) throw new Error("Failed to update rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elimination-rules"] });
            toast({
                title: "Rule Updated",
                description: "Rule status changed successfully."
            });
        }
    });

    // Simulate rule mutation
    const simulateMutation = useMutation({
        mutationFn: async (ruleId: string) => {
            const res = await fetch(`/api/gl/consolidation/elimination-rules/${ruleId}/simulate`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Simulation failed");
            return res.json();
        },
        onSuccess: (result: SimulationResult) => {
            toast({
                title: "Simulation Complete",
                description: `Would eliminate $${result.matchedAmount.toFixed(2)}`
            });
        }
    });

    const selectedRule = rules.find(r => r.id === selectedRuleId);

    return (
        <StandardPage
            title="Elimination Rule Builder"
            description="Configure intercompany elimination rules for automated journal generation during consolidation."
            breadcrumbs={[
                { label: "General Ledger", href: "/gl" },
                { label: "Consolidation", href: "/gl/consolidation" },
                { label: "Elimination Rules" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{rules.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Enabled</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">
                                {rules.filter(r => r.enabled).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Disabled</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">
                                {rules.filter(r => !r.enabled).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Ledger Sets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">
                                {new Set(rules.map(r => r.ledgerSetId)).size}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Rules List */}
                    <Card className="lg:col-span-2 border-t-4 border-t-blue-500">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <GitBranch className="h-5 w-5" /> Elimination Rules
                                    </CardTitle>
                                    <CardDescription>Intercompany elimination configuration</CardDescription>
                                </div>
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="h-4 w-4 mr-2" /> New Rule
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Create Elimination Rule</DialogTitle>
                                            <DialogDescription>Define intercompany elimination logic</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="ruleName">Rule Name *</Label>
                                                <Input
                                                    id="ruleName"
                                                    value={newRule.name}
                                                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                                    placeholder="e.g., IC Payables Elimination"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="ledgerSet">Ledger Set</Label>
                                                    <Select
                                                        value={newRule.ledgerSetId}
                                                        onValueChange={(v) => setNewRule({ ...newRule, ledgerSetId: v })}
                                                    >
                                                        <SelectTrigger id="ledgerSet">
                                                            <SelectValue placeholder="Select Set" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="GLOBAL_GRP">Global Group</SelectItem>
                                                            <SelectItem value="NA_GRP">North America</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="elimLedger">Elimination Ledger</Label>
                                                    <Input
                                                        id="elimLedger"
                                                        value={newRule.eliminationLedgerId}
                                                        onChange={(e) => setNewRule({ ...newRule, eliminationLedgerId: e.target.value })}
                                                        placeholder="ELIM_LEDGER"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="matchRule">Match Criteria *</Label>
                                                <Input
                                                    id="matchRule"
                                                    value={newRule.matchRule}
                                                    onChange={(e) => setNewRule({ ...newRule, matchRule: e.target.value })}
                                                    placeholder="e.g., Segment3=2000"
                                                />
                                                <p className="text-xs text-muted-foreground">Segment-based filter to identify accounts</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="offsetAcc">Offset Account</Label>
                                                <Input
                                                    id="offsetAcc"
                                                    value={newRule.offsetAccount}
                                                    onChange={(e) => setNewRule({ ...newRule, offsetAccount: e.target.value })}
                                                    placeholder="e.g., 100-00-1000"
                                                />
                                                <p className="text-xs text-muted-foreground">Account for balancing entry</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={newRule.description}
                                                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                                                    placeholder="Optional notes..."
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                            <Button
                                                onClick={() => createRuleMutation.mutate(newRule)}
                                                disabled={createRuleMutation.isPending || !newRule.name || !newRule.matchRule}
                                            >
                                                {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rule Name</TableHead>
                                        <TableHead>Match Criteria</TableHead>
                                        <TableHead>Ledger Set</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rules.map((rule) => (
                                        <TableRow
                                            key={rule.id}
                                            className={selectedRuleId === rule.id ? "bg-blue-50" : "cursor-pointer hover:bg-muted/50"}
                                            onClick={() => setSelectedRuleId(rule.id)}
                                        >
                                            <TableCell className="font-medium">{rule.name}</TableCell>
                                            <TableCell><Badge variant="outline">{rule.matchRule}</Badge></TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{rule.ledgerSetId}</TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={rule.enabled}
                                                    onCheckedChange={() => toggleEnabledMutation.mutate({ id: rule.id, enabled: rule.enabled })}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Rule Details */}
                    <Card className="lg:col-span-1 border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle className="text-sm">Rule Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedRule ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Select a rule to view details and simulate
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <h4 className="font-bold text-sm mb-2">{selectedRule.name}</h4>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Match:</span>
                                                <span className="font-mono">{selectedRule.matchRule}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Offset:</span>
                                                <span className="font-mono">{selectedRule.offsetAccount || "—"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Elim Ledger:</span>
                                                <span className="font-mono">{selectedRule.eliminationLedgerId}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Simulation</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Test this rule against current balances to preview elimination impact
                                        </p>
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => simulateMutation.mutate(selectedRule.id)}
                                            disabled={simulateMutation.isPending}
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            {simulateMutation.isPending ? "Simulating..." : "Run Simulation"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
