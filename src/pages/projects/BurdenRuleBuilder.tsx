import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, Trash2, Copy, GitBranch, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BurdenRule {
    id: string;
    name: string;
    version: string;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    tiers: any[];
}

export default function BurdenRuleBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newRule, setNewRule] = useState({ name: "", version: "1.0" });

    // Fetch burden rules
    const { data: rules = [] } = useQuery<BurdenRule[]>({
        queryKey: ["/api/ppm/burden-schedules"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/burden-schedules");
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((sch: any) => ({
                id: sch.id,
                name: sch.name,
                version: sch.version,
                status: sch.activeFlag ? "ACTIVE" : "ARCHIVED",
                tiers: (sch.rules || []).map((r: any) => ({
                    id: r.id,
                    name: r.expenditureType || "Base Overhead",
                    order: r.precedence,
                    rate: (parseFloat(r.multiplier || "0") * 100).toFixed(2), // Assumes all percentages for simplicity since schema stores decimal
                    rateType: "PERCENTAGE"
                }))
            }));
        }
    });

    const createRuleMutation = useMutation({
        mutationFn: async (ruleData: typeof newRule) => {
            const res = await fetch("/api/ppm/burden-schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: ruleData.name,
                    version: ruleData.version,
                    activeFlag: true
                })
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ppm/burden-schedules"] });
            setIsCreateDialogOpen(false);
            setNewRule({ name: "", version: "1.0" });
            toast({ title: "Rule Created", description: "New burden rule created." });
        }
    });

    const simulateMutation = useMutation({
        mutationFn: async (ruleId: string) => {
            const res = await fetch(`/api/ppm/burden-schedules/${ruleId}/simulate`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to simulate");
            return res.json();
        },
        onSuccess: (data) => {
            toast({ title: "Simulation Complete", description: `Tested against ${data.simulatedItems} items. Burdened Cost Impact: ${data.simulatedBurdenCostTotal}` });
        }
    });

    const updateTiersMutation = useMutation({
        mutationFn: async (tiersData: any[]) => {
            if (!selectedRuleId) throw new Error("No rule selected");
            const res = await fetch(`/api/ppm/burden-schedules/${selectedRuleId}/tiers`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tiers: tiersData })
            });
            if (!res.ok) throw new Error("Failed to update tiers");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ppm/burden-schedules"] });
            toast({ title: "Tiers Saved", description: "Burden rule tiers have been updated." });
        }
    });

    const selectedRule = rules.find(r => r.id === selectedRuleId);

    const tierColumns = useMemo(() => [
        { id: "order", label: "Processing Order", type: "number" as const, required: true },
        { id: "name", label: "Tier Name", type: "text" as const, required: true },
        {
            id: "rateType",
            label: "Rate Type",
            type: "select" as const,
            options: [
                { value: "PERCENTAGE", label: "Percentage (%)" },
                { value: "FIXED", label: "Fixed Amount" }
            ],
            required: true,
            defaultValue: "PERCENTAGE"
        },
        { id: "rate", label: "Rate Value", type: "number" as const, required: true }
    ], []);

    return (
        <StandardPage
            title="Advanced Burden Rule Builder"
            description="Create multi-tier burden structures with conditional logic and rate tables."
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Rules</CardTitle>
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{rules.length}</div></CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                                {rules.filter(r => r.status === "ACTIVE").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Draft</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                                {rules.filter(r => r.status === "DRAFT").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Avg Tiers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                                {rules.length > 0 ? (rules.reduce((sum, r) => sum + r.tiers.length, 0) / rules.length).toFixed(1) : 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 border-t-4 border-t-blue-500">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <GitBranch className="h-5 w-5" /> Rules
                                    </CardTitle>
                                </div>
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="icon" variant="ghost" aria-label="Add">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Burden Rule</DialogTitle>
                                            <DialogDescription>Define a master rule container</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Rule Name *</Label>
                                                <Input value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Version</Label>
                                                <Input value={newRule.version} onChange={(e) => setNewRule({ ...newRule, version: e.target.value })} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={() => createRuleMutation.mutate(newRule)} disabled={createRuleMutation.isPending || !newRule.name}>
                                                {createRuleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Create
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0">
                            <Table>
                                <TableBody>
                                    {rules.map((rule) => (
                                        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedRuleId(rule.id)}>
                                            <TableRow
                                                key={rule.id}
                                                className={selectedRuleId === rule.id ? "bg-blue-500/10 border-l-4 border-l-blue-600" : "cursor-pointer"}
                                            >
                                                <TableCell className="font-medium p-4 py-3">
                                                    <div className="flex justify-between items-center w-full">
                                                        <div>
                                                            <div className="font-bold">{rule.name}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">v{rule.version} &middot; {rule.tiers.length} Tiers</div>
                                                        </div>
                                                        <Badge variant={rule.status === "ACTIVE" ? "default" : "secondary"}>
                                                            {rule.status}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </Button>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-t-4 border-t-purple-500">
                        <CardHeader className="pb-4">
                            <CardTitle>Tier Configuration</CardTitle>
                            <CardDescription>
                                {selectedRule ? `Defining rules for ${selectedRule.name} (v${selectedRule.version})` : 'Select a rule from the left to edit its tiers.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!selectedRule ? (
                                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No rule selected
                                </div>
                            ) : (
                                <Tabs defaultValue="tiers" className="space-y-4">
                                    <TabsList className="bg-muted">
                                        <TabsTrigger value="tiers">Build Tiers</TabsTrigger>
                                        <TabsTrigger value="simulate">Run Simulation</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="tiers" className="space-y-4">
                                        <div className="border rounded-md h-[400px]">
                                            <InteractiveSpreadsheet
                                                data={selectedRule.tiers}
                                                columns={tierColumns}
                                                onSave={(data) => updateTiersMutation.mutate(data)}
                                                isSaving={updateTiersMutation.isPending}
                                                containerHeight="350px"
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="simulate" className="space-y-4 pt-4 border-t">
                                        <h4 className="font-bold">Test Rule Engine</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Run this rule against historical expenditure item data to dry-run the burden calculations before activating.
                                        </p>
                                        <Button
                                            className="w-full bg-purple-600 hover:bg-purple-700"
                                            onClick={() => simulateMutation.mutate(selectedRule.id)}
                                            disabled={simulateMutation.isPending}
                                        >
                                            {simulateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                                            {simulateMutation.isPending ? "Simulating Projects Costs..." : "Execute Impact Simulation"}
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
