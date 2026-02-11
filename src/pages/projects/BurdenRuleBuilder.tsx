import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Play, Save, Trash2, Copy, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BurdenRule {
    id: string;
    name: string;
    version: string;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    tiers: BurdenTier[];
}

interface BurdenTier {
    id: string;
    name: string;
    order: number;
    conditions: BurdenCondition[];
    rate: number;
    rateType: "PERCENTAGE" | "FIXED";
}

interface BurdenCondition {
    field: string;
    operator: string;
    value: string;
}

interface SimulationResult {
    expenditureId: string;
    rawCost: number;
    burdenedCost: number;
    appliedTiers: string[];
}

export default function BurdenRuleBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newRule, setNewRule] = useState({ name: "", version: "1.0" });
    const [newTier, setNewTier] = useState({
        name: "",
        rate: 0,
        rateType: "PERCENTAGE" as const
    });

    // Fetch burden rules
    const { data: rules = [] } = useQuery<BurdenRule[]>({
        queryKey: ["burden-rules"],
        queryFn: async () => {
            // Mock data - replace with actual API
            return [
                {
                    id: "1",
                    name: "Standard Corporate Burden",
                    version: "2.0",
                    status: "ACTIVE",
                    tiers: [
                        { id: "t1", name: "Base Overhead", order: 1, conditions: [], rate: 15, rateType: "PERCENTAGE" },
                        { id: "t2", name: "G&A", order: 2, conditions: [], rate: 10, rateType: "PERCENTAGE" }
                    ]
                }
            ];
        }
    });

    // Create rule mutation
    const createRuleMutation = useMutation({
        mutationFn: async (ruleData: typeof newRule) => {
            const res = await fetch("/api/ppm/burden-rules/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ruleData)
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["burden-rules"] });
            setIsCreateDialogOpen(false);
            setNewRule({ name: "", version: "1.0" });
            toast({
                title: "Rule Created",
                description: "New burden rule created successfully."
            });
        }
    });

    // Simulate rule mutation
    const simulateMutation = useMutation({
        mutationFn: async (ruleId: string) => {
            const res = await fetch(`/api/ppm/burden-rules/${ruleId}/simulate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Simulation failed");
            return res.json();
        },
        onSuccess: (results: SimulationResult[]) => {
            toast({
                title: "Simulation Complete",
                description: `Tested on ${results.length} expenditures.`
            });
        }
    });

    const selectedRule = rules.find(r => r.id === selectedRuleId);

    return (
        <StandardPage
            title="Advanced Burden Rule Builder"
            description="Create multi-tier burden structures with conditional logic and rate tables."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "Burden Rules" }
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
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">
                                {rules.filter(r => r.status === "ACTIVE").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Draft</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">
                                {rules.filter(r => r.status === "DRAFT").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Avg Tiers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">
                                {rules.length > 0 ? (rules.reduce((sum, r) => sum + r.tiers.length, 0) / rules.length).toFixed(1) : 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Rule List */}
                    <Card className="lg:col-span-2 border-t-4 border-t-blue-500">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <GitBranch className="h-5 w-5" /> Burden Rules
                                    </CardTitle>
                                    <CardDescription>Multi-tier burden calculation rules</CardDescription>
                                </div>
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="h-4 w-4 mr-2" /> New Rule
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Burden Rule</DialogTitle>
                                            <DialogDescription>Define a new multi-tier burden structure</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="ruleName">Rule Name *</Label>
                                                <Input
                                                    id="ruleName"
                                                    value={newRule.name}
                                                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                                    placeholder="e.g., Government Contract Burden"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="version">Version</Label>
                                                <Input
                                                    id="version"
                                                    value={newRule.version}
                                                    onChange={(e) => setNewRule({ ...newRule, version: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                            <Button
                                                onClick={() => createRuleMutation.mutate(newRule)}
                                                disabled={createRuleMutation.isPending || !newRule.name}
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
                                        <TableHead>Version</TableHead>
                                        <TableHead>Tiers</TableHead>
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
                                            <TableCell><Badge variant="outline">v{rule.version}</Badge></TableCell>
                                            <TableCell>{rule.tiers.length} tier{rule.tiers.length !== 1 ? 's' : ''}</TableCell>
                                            <TableCell>
                                                <Badge variant={rule.status === "ACTIVE" ? "default" : "secondary"}>
                                                    {rule.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }}>
                                                        <Copy className="h-4 w-4" />
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

                    {/* Rule Editor */}
                    <Card className="lg:col-span-1 border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle className="text-sm">Rule Editor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedRule ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Select a rule to edit tiers and conditions
                                </div>
                            ) : (
                                <Tabs defaultValue="tiers" className="space-y-4">
                                    <TabsList className="w-full">
                                        <TabsTrigger value="tiers" className="flex-1">Tiers</TabsTrigger>
                                        <TabsTrigger value="simulate" className="flex-1">Simulate</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="tiers" className="space-y-4">
                                        <div className="p-3 bg-muted rounded-lg">
                                            <h4 className="font-bold text-sm mb-1">{selectedRule.name}</h4>
                                            <p className="text-xs text-muted-foreground">Version {selectedRule.version}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Burden Tiers</Label>
                                            {selectedRule.tiers.sort((a, b) => a.order - b.order).map((tier) => (
                                                <Card key={tier.id}>
                                                    <CardContent className="pt-3 pb-3">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <Badge variant="outline" className="text-xs mb-1">Tier {tier.order}</Badge>
                                                                <h5 className="font-medium text-sm">{tier.name}</h5>
                                                            </div>
                                                            <span className="font-bold text-purple-600">
                                                                {tier.rate}%
                                                            </span>
                                                        </div>
                                                        {tier.conditions.length > 0 && (
                                                            <div className="text-xs text-muted-foreground mt-2">
                                                                {tier.conditions.length} condition{tier.conditions.length !== 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>

                                        <Button className="w-full" variant="outline" size="sm">
                                            <Plus className="h-4 w-4 mr-2" /> Add Tier
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="simulate" className="space-y-4">
                                        <p className="text-xs text-muted-foreground">
                                            Test this rule against historical expenditure data to preview burden calculations.
                                        </p>
                                        <Button
                                            className="w-full"
                                            onClick={() => simulateMutation.mutate(selectedRule.id)}
                                            disabled={simulateMutation.isPending}
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            {simulateMutation.isPending ? "Simulating..." : "Run Simulation"}
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
