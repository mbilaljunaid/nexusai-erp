import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
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
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { GitBranch, Plus, Copy, ArrowUpCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Scenario {
    id: string;
    name: string;
    version: string;
    baseScenario?: string;
    createdBy: string;
    createdAt: string;
    status: "DRAFT" | "ACTIVE" | "PUBLISHED";
    isBaseline: boolean;
}

interface ScenarioData {
    scenarioId: string;
    account: string;
    amount: number;
}

export default function ScenarioComparison() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newScenario, setNewScenario] = useState({
        name: "",
        baseScenario: ""
    });

    // Fetch all scenarios
    const { data: scenarios = [] } = useQuery<Scenario[]>({
        queryKey: ["budget-scenarios"],
        queryFn: async () => {
            const res = await fetch("/api/epm/scenarios");
            return res.json();
        }
    });

    // Fetch comparison data
    const { data: comparisonData = [] } = useQuery<ScenarioData[]>({
        queryKey: ["scenario-comparison", selectedScenarios],
        queryFn: async () => {
            if (selectedScenarios.length === 0) return [];
            const params = new URLSearchParams();
            selectedScenarios.forEach(id => params.append("scenarioId", id));
            const res = await fetch(`/api/epm/scenarios/compare?${params}`);
            return res.json();
        },
        enabled: selectedScenarios.length > 0
    });

    // Create scenario mutation
    const createScenarioMutation = useMutation({
        mutationFn: async (scenario: typeof newScenario) => {
            const res = await fetch("/api/epm/scenarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scenario)
            });
            if (!res.ok) throw new Error("Failed to create scenario");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-scenarios"] });
            setIsCreateDialogOpen(false);
            setNewScenario({ name: "", baseScenario: "" });
            toast({
                title: "Scenario Created",
                description: "New budget scenario created successfully"
            });
        }
    });

    // Publish scenario mutation
    const publishScenarioMutation = useMutation({
        mutationFn: async (scenarioId: string) => {
            const res = await fetch(`/api/epm/scenarios/${scenarioId}/publish`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to publish scenario");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-scenarios"] });
            toast({
                title: "Scenario Published",
                description: "Scenario published to actuals successfully"
            });
        }
    });

    const toggleScenarioSelection = (scenarioId: string) => {
        setSelectedScenarios(prev => {
            if (prev.includes(scenarioId)) {
                return prev.filter(id => id !== scenarioId);
            } else if (prev.length < 3) {
                return [...prev, scenarioId];
            } else {
                toast({
                    title: "Maximum Selections",
                    description: "You can compare up to 3 scenarios at once",
                    variant: "destructive"
                });
                return prev;
            }
        });
    };

    // Group comparison data by account
    const groupedData: Record<string, Record<string, number>> = {};
    comparisonData.forEach(item => {
        if (!groupedData[item.account]) {
            groupedData[item.account] = {};
        }
        groupedData[item.account][item.scenarioId] = item.amount;
    });

    const baselineScenario = scenarios.find(s => s.isBaseline);
    const draftCount = scenarios.filter(s => s.status === "DRAFT").length;
    const activeCount = scenarios.filter(s => s.status === "ACTIVE").length;

    return (
        <StandardPage
            title="Scenario Comparison"
            description="Multi-version budget planning and what-if analysis"
            breadcrumbs={[
                { label: "EPM", href: "/epm" },
                { label: "Scenarios" }
            ]}
        >
            <div className="space-y-6">
                {/* Alert for baseline */}
                {baselineScenario && (
                    <Alert>
                        <AlertDescription>
                            <strong>Current Baseline:</strong> {baselineScenario.name} (v{baselineScenario.version})
                        </AlertDescription>
                    </Alert>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Scenarios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{scenarios.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Draft Scenarios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">{draftCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Active Scenarios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{activeCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Scenario
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Scenario</DialogTitle>
                                <DialogDescription>Create a new budget planning scenario</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Scenario Name *</Label>
                                    <Input
                                        placeholder="e.g., Best Case 2026"
                                        value={newScenario.name}
                                        onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Clone From (Optional)</Label>
                                    <Select value={newScenario.baseScenario} onValueChange={(v) => setNewScenario({ ...newScenario, baseScenario: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Start from scratch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Start from scratch</SelectItem>
                                            {scenarios.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={() => createScenarioMutation.mutate(newScenario)} disabled={!newScenario.name}>
                                    Create Scenario
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Scenario Selection */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="h-5 w-5" />
                            Available Scenarios
                        </CardTitle>
                        <CardDescription>Select up to 3 scenarios to compare</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead>Scenario Name</TableHead>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scenarios.map((scenario) => (
                                    <TableRow key={scenario.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedScenarios.includes(scenario.id)}
                                                onCheckedChange={() => toggleScenarioSelection(scenario.id)}
                                                className="h-4 w-4"
                                                aria-label={`Select ${scenario.name}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{scenario.name}</TableCell>
                                        <TableCell><code className="text-xs">v{scenario.version}</code></TableCell>
                                        <TableCell>{scenario.createdBy}</TableCell>
                                        <TableCell>{formatDate(scenario.createdAt)}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={scenario.status} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm">
                                                    <Copy className="h-3 w-3 mr-1" />
                                                    Clone
                                                </Button>
                                                {scenario.status === "DRAFT" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => publishScenarioMutation.mutate(scenario.id)}
                                                    >
                                                        <ArrowUpCircle className="h-3 w-3 mr-1" />
                                                        Publish
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Comparison Table */}
                {selectedScenarios.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Side-by-Side Comparison</CardTitle>
                            <CardDescription>Comparing {selectedScenarios.length} scenarios</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account</TableHead>
                                        {selectedScenarios.map(scenarioId => {
                                            const scenario = scenarios.find(s => s.id === scenarioId);
                                            return <TableHead key={scenarioId} className="text-right">{scenario?.name}</TableHead>;
                                        })}
                                        {selectedScenarios.length === 2 && <TableHead className="text-right">Delta</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(groupedData).map(([account, amounts]) => {
                                        const delta = selectedScenarios.length === 2
                                            ? (amounts[selectedScenarios[1]] || 0) - (amounts[selectedScenarios[0]] || 0)
                                            : 0;
                                        return (
                                            <TableRow key={account}>
                                                <TableCell className="font-medium">{account}</TableCell>
                                                {selectedScenarios.map(scenarioId => (
                                                    <TableCell key={scenarioId} className="text-right font-mono">
                                                        ${(amounts[scenarioId] || 0).toLocaleString()}
                                                    </TableCell>
                                                ))}
                                                {selectedScenarios.length === 2 && (
                                                    <TableCell className={cn(`text-right font-mono flex items-center justify-end gap-1 ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`)}>
                                                        {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                        ${Math.abs(delta).toLocaleString()}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
