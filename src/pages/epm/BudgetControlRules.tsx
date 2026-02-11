import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, AlertTriangle, CheckCircle2, PlayCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BudgetRule {
    id: string;
    name: string;
    ledgerId: string;
    accountRange: string;
    threshold: number;
    enforcementLevel: "WARNING" | "HARD_BLOCK" | "SOFT_BLOCK";
    isActive: boolean;
    notifyOnBreach: boolean;
    createdAt: string;
}

interface SimulationResult {
    violations: number;
    warnings: number;
    affectedAccounts: string[];
}

export default function BudgetControlRules() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSimDialogOpen, setIsSimDialogOpen] = useState(false);
    const [simResult, setSimResult] = useState<SimulationResult | null>(null);

    const [newRule, setNewRule] = useState({
        name: "",
        ledgerId: "PRIMARY",
        accountRange: "",
        threshold: "",
        enforcementLevel: "WARNING" as const,
        notifyOnBreach: true
    });

    // Fetch rules
    const { data: rules = [] } = useQuery<BudgetRule[]>({
        queryKey: ["budget-rules"],
        queryFn: async () => {
            const res = await fetch("/api/gl/config/budget-rules");
            return res.json();
        }
    });

    // Create rule mutation
    const createRuleMutation = useMutation({
        mutationFn: async (rule: typeof newRule) => {
            const res = await fetch("/api/gl/config/budget-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rule)
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-rules"] });
            setIsCreateDialogOpen(false);
            setNewRule({
                name: "",
                ledgerId: "PRIMARY",
                accountRange: "",
                threshold: "",
                enforcementLevel: "WARNING",
                notifyOnBreach: true
            });
            toast({
                title: "Rule Created",
                description: "Budget control rule created successfully"
            });
        }
    });

    // Toggle rule mutation
    const toggleRuleMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const res = await fetch(`/api/gl/config/budget-rules/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive })
            });
            if (!res.ok) throw new Error("Failed to update rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-rules"] });
            toast({
                title: "Rule Updated",
                description: "Rule status changed successfully"
            });
        }
    });

    // Simulate rule
    const handleSimulate = async () => {
        // Mock simulation
        const result: SimulationResult = {
            violations: Math.floor(Math.random() * 10),
            warnings: Math.floor(Math.random() * 20),
            affectedAccounts: ["6000-Salaries", "7100-Marketing", "7500-Travel"]
        };
        setSimResult(result);
        setIsSimDialogOpen(true);
    };

    const activeRules = rules.filter(r => r.isActive).length;
    const violations = 3; // Mock - would come from backend
    const totalRules = rules.length;

    return (
        <StandardPage
            title="Budget Control Rules"
            description="Configure budget enforcement policies and spending thresholds"
            breadcrumbs={[
                { label: "EPM", href: "/epm" },
                { label: "Budget Controls" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{totalRules}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Active Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{activeRules}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Violations (MTD)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900">{violations}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Rule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create Budget Control Rule</DialogTitle>
                                <DialogDescription>Define spending thresholds and enforcement policies</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Rule Name *</Label>
                                    <Input
                                        placeholder="e.g., Marketing Budget Limit"
                                        value={newRule.name}
                                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Ledger</Label>
                                        <Select value={newRule.ledgerId} onValueChange={(v) => setNewRule({ ...newRule, ledgerId: v })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PRIMARY">Primary Ledger</SelectItem>
                                                <SelectItem value="SECONDARY">Secondary Ledger</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Account Range *</Label>
                                        <Input
                                            placeholder="e.g., 6000-6999"
                                            value={newRule.accountRange}
                                            onChange={(e) => setNewRule({ ...newRule, accountRange: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Threshold Amount *</Label>
                                        <Input
                                            type="number"
                                            placeholder="100000"
                                            value={newRule.threshold}
                                            onChange={(e) => setNewRule({ ...newRule, threshold: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Enforcement Level</Label>
                                        <Select value={newRule.enforcementLevel} onValueChange={(v: any) => setNewRule({ ...newRule, enforcementLevel: v })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="WARNING">Warning Only</SelectItem>
                                                <SelectItem value="SOFT_BLOCK">Soft Block (Approval Required)</SelectItem>
                                                <SelectItem value="HARD_BLOCK">Hard Block (Reject)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={newRule.notifyOnBreach}
                                        onCheckedChange={(checked) => setNewRule({ ...newRule, notifyOnBreach: checked })}
                                    />
                                    <Label>Send notifications on budget breach</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={() => createRuleMutation.mutate(newRule)}
                                    disabled={!newRule.name || !newRule.accountRange || !newRule.threshold}
                                >
                                    Create Rule
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={handleSimulate}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Simulate Rules
                    </Button>
                </div>

                {/* Simulation Results Dialog */}
                <Dialog open={isSimDialogOpen} onOpenChange={setIsSimDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Simulation Results</DialogTitle>
                        </DialogHeader>
                        {simResult && (
                            <div className="space-y-4 py-4">
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Dry-Run Complete</AlertTitle>
                                    <AlertDescription>
                                        Simulated rule enforcement against current budget balances
                                    </AlertDescription>
                                </Alert>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg bg-red-50">
                                        <div className="text-xs text-red-600 font-semibold">VIOLATIONS</div>
                                        <div className="text-2xl font-bold text-red-900">{simResult.violations}</div>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-amber-50">
                                        <div className="text-xs text-amber-600 font-semibold">WARNINGS</div>
                                        <div className="text-2xl font-bold text-amber-900">{simResult.warnings}</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-semibold">Affected Accounts:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {simResult.affectedAccounts.map(acc => (
                                            <Badge key={acc} variant="outline">{acc}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={() => setIsSimDialogOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Rules Table */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Budget Control Rules
                        </CardTitle>
                        <CardDescription>Manage spending enforcement policies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rule Name</TableHead>
                                    <TableHead>Account Range</TableHead>
                                    <TableHead className="text-right">Threshold</TableHead>
                                    <TableHead>Enforcement</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No budget control rules configured. Create your first rule to start.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rules.map((rule) => (
                                        <TableRow key={rule.id}>
                                            <TableCell className="font-medium">{rule.name}</TableCell>
                                            <TableCell><code className="text-xs">{rule.accountRange}</code></TableCell>
                                            <TableCell className="text-right font-mono">${rule.threshold.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={rule.enforcementLevel === "HARD_BLOCK" ? "destructive" : "default"}>
                                                    {rule.enforcementLevel.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={rule.isActive}
                                                    onCheckedChange={(checked) =>
                                                        toggleRuleMutation.mutate({ id: rule.id, isActive: checked })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
