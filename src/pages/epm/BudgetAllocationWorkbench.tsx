import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Plus, PlayCircle, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from '@/lib/formatters';

interface AllocationRule {
    id: string;
    name: string;
    sourceAccount: string;
    totalAmount: number;
    basis: "EQUAL" | "HEADCOUNT" | "REVENUE" | "CUSTOM";
    isActive: boolean;
}

interface AllocationTarget {
    id: string;
    ruleId: string;
    targetAccount: string;
    weight: number;
    allocatedAmount?: number;
    percentage?: number;
}

interface AllocationPreview {
    ruleId: string;
    targets: {
        account: string;
        amount: number;
        percentage: number;
    }[];
    totalAllocated: number;
}

export default function BudgetAllocationWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<AllocationRule | null>(null);
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
    const [previewData, setPreviewData] = useState<AllocationPreview | null>(null);

    const [newRule, setNewRule] = useState({
        name: "",
        sourceAccount: "",
        totalAmount: "",
        basis: "EQUAL" as const
    });

    // Fetch allocation rules
    const { data: rules = [] } = useQuery<AllocationRule[]>({
        queryKey: ["allocation-rules"],
        queryFn: async () => {
            const res = await fetch("/api/epm/allocations");
            return res.json();
        }
    });

    // Fetch targets for selected rule
    const { data: targets = [] } = useQuery<AllocationTarget[]>({
        queryKey: ["allocation-targets", selectedRule?.id],
        queryFn: async () => {
            if (!selectedRule) return [];
            const res = await fetch(`/api/epm/allocations/${selectedRule.id}/targets`);
            return res.json();
        },
        enabled: !!selectedRule
    });

    // Create rule mutation
    const createRuleMutation = useMutation({
        mutationFn: async (rule: typeof newRule) => {
            const res = await fetch("/api/epm/allocations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rule)
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allocation-rules"] });
            setIsCreateDialogOpen(false);
            setNewRule({ name: "", sourceAccount: "", totalAmount: "", basis: "EQUAL" });
            toast({
                title: "Rule Created",
                description: "Allocation rule created successfully"
            });
        }
    });

    // Preview allocation mutation
    const previewMutation = useMutation({
        mutationFn: async (ruleId: string) => {
            const res = await fetch(`/api/epm/allocations/${ruleId}/preview`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to preview");
            return res.json();
        },
        onSuccess: (data) => {
            setPreviewData(data);
            setIsPreviewDialogOpen(true);
        }
    });

    // Execute allocation mutation
    const executeMutation = useMutation({
        mutationFn: async (ruleId: string) => {
            const res = await fetch(`/api/epm/allocations/${ruleId}/execute`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to execute");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allocation-rules"] });
            setIsPreviewDialogOpen(false);
            toast({
                title: "Allocation Executed",
                description: "Budget allocation completed successfully"
            });
        }
    });

    const activeRules = rules.filter(r => r.isActive).length;
    const totalAllocated = rules.reduce((sum, r) => sum + r.totalAmount, 0);

    return (
        <StandardPage
            title="Budget Allocation Workbench"
            description="Rule-based budget redistribution engine"
            breadcrumbs={[
                { label: "EPM", href: "/epm" },
                { label: "Allocations" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{rules.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Active Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{activeRules}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Total Allocated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">${(totalAllocated / 1000000).toFixed(1)}M</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Allocation Rule
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Allocation Rule</DialogTitle>
                                <DialogDescription>Define how budget should be distributed</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Rule Name *</Label>
                                    <Input
                                        placeholder="e.g., Overhead Allocation"
                                        value={newRule.name}
                                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Source Account *</Label>
                                        <Input
                                            placeholder="e.g., 8000-Overhead"
                                            value={newRule.sourceAccount}
                                            onChange={(e) => setNewRule({ ...newRule, sourceAccount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total Amount *</Label>
                                        <Input
                                            type="number"
                                            placeholder="500000"
                                            value={newRule.totalAmount}
                                            onChange={(e) => setNewRule({ ...newRule, totalAmount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Allocation Basis</Label>
                                    <Select value={newRule.basis} onValueChange={(v: any) => setNewRule({ ...newRule, basis: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EQUAL">Equal Distribution</SelectItem>
                                            <SelectItem value="HEADCOUNT">By Headcount</SelectItem>
                                            <SelectItem value="REVENUE">By Revenue %</SelectItem>
                                            <SelectItem value="CUSTOM">Custom Weights</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={() => createRuleMutation.mutate(newRule)}
                                    disabled={!newRule.name || !newRule.sourceAccount || !newRule.totalAmount}
                                >
                                    Create Rule
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Allocation Rules */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            Allocation Rules
                        </CardTitle>
                        <CardDescription>Define and execute budget allocation strategies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rule Name</TableHead>
                                    <TableHead>Source Account</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                    <TableHead>Basis</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No allocation rules configured
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rules.map((rule) => (
                                        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedRule(rule)}>
                                        <TableRow
                                                                                    key={rule.id}
                                                                                    className="cursor-pointer hover:bg-muted/50"
                                                                                >
                                                                                    <TableCell className="font-medium">{rule.name}</TableCell>
                                                                                    <TableCell><code className="text-xs">{rule.sourceAccount}</code></TableCell>
                                                                                    <TableCell className="text-right font-mono">${formatNumber(rule.totalAmount)}</TableCell>
                                                                                    <TableCell>
                                                                                        <Badge variant="outline">{rule.basis.replace("_", " ")}</Badge>
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Badge variant={rule.isActive ? "default" : "outline"}>
                                                                                            {rule.isActive ? "Active" : "Inactive"}
                                                                                        </Badge>
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <div className="flex gap-1">
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    previewMutation.mutate(rule.id);
                                                                                                }}
                                                                                            >
                                                                                                <PlayCircle className="h-3 w-3 mr-1" />
                                                                                                Preview
                                                                                            </Button>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                </TableRow>
                                        </Button>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Allocation Targets */}
                {selectedRule && targets.length > 0 && (
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle>Allocation Targets - {selectedRule.name}</CardTitle>
                            <CardDescription>Budget distribution targets</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Target Account</TableHead>
                                        <TableHead className="text-right">Weight</TableHead>
                                        <TableHead className="text-right">Percentage</TableHead>
                                        <TableHead className="text-right">Allocated Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {targets.map((target) => (
                                        <TableRow key={target.id}>
                                            <TableCell className="font-medium">{target.targetAccount}</TableCell>
                                            <TableCell className="text-right">{target.weight}</TableCell>
                                            <TableCell className="text-right">
                                                {target.percentage ? `${target.percentage.toFixed(1)}%` : "-"}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {target.allocatedAmount ? `$${formatNumber(target.allocatedAmount)}` : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Preview Dialog */}
                <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Allocation Preview</DialogTitle>
                            <DialogDescription>Review allocation before execution</DialogDescription>
                        </DialogHeader>
                        {previewData && (
                            <div className="space-y-4 py-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="text-sm font-semibold mb-1">Total Amount</div>
                                    <div className="text-2xl font-bold">${formatNumber(previewData.totalAllocated)}</div>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Target Account</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">%</TableHead>
                                            <TableHead>Distribution</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.targets.map((target, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{target.account}</TableCell>
                                                <TableCell className="text-right font-mono">${formatNumber(target.amount)}</TableCell>
                                                <TableCell className="text-right">{target.percentage.toFixed(1)}%</TableCell>
                                                <TableCell>
                                                    <Progress value={target.percentage} className="w-24" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={() => {
                                    if (previewData) {
                                        executeMutation.mutate(previewData.ruleId);
                                    }
                                }}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Execute Allocation
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </StandardPage>
    );
}
