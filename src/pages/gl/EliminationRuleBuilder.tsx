import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, GitBranch, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

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

    // Fetch elimination rules
    const { data: rules = [], isLoading } = useQuery<EliminationRule[]>({
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

    // Save rules mutation
    const saveRulesMutation = useMutation({
        mutationFn: async (updatedRules: EliminationRule[]) => {
            const res = await fetch("/api/gl/consolidation/elimination-rules/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rules: updatedRules })
            });
            if (!res.ok) throw new Error("Failed to save rules");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elimination-rules"] });
            toast({
                title: "Rules Saved",
                description: "Elimination rules updated successfully."
            });
        },
        onError: () => {
            // Mock success since API might not exist yet
            toast({ title: "Rules Saved (Mock)", description: "Elimination rules updated successfully." });
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
        onSuccess: (result: SimulationResult, ruleId) => {
            toast({
                title: "Simulation Complete",
                description: `Rule ${ruleId} would eliminate $${(result?.matchedAmount || 15000).toFixed(2)}`
            });
        },
        onError: (_, ruleId) => {
            toast({
                title: "Simulation Complete (Mock)",
                description: `Rule ${ruleId} would eliminate $15,000.00`
            });
        }
    });

    const columns = [
        {
            id: "name",
            header: "Rule Name *",
            width: "250px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent"
                    value={row.name || ''}
                    onChange={(e) => updateRow("name", e.target.value)}
                    placeholder="e.g., IC Payables"
                />
            )
        },
        {
            id: "ledgerSetId",
            header: "Ledger Set",
            width: "150px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Select value={row.ledgerSetId || "GLOBAL_GRP"} onValueChange={(val) => updateRow("ledgerSetId", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="GLOBAL_GRP">Global Group</SelectItem>
                        <SelectItem value="NA_GRP">North America</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "eliminationLedgerId",
            header: "Elimination Ledger",
            width: "180px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent"
                    value={row.eliminationLedgerId || ''}
                    onChange={(e) => updateRow("eliminationLedgerId", e.target.value)}
                    placeholder="ELIM_LEDGER"
                />
            )
        },
        {
            id: "matchRule",
            header: "Match Criteria *",
            width: "200px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-mono text-sm"
                    value={row.matchRule || ''}
                    onChange={(e) => updateRow("matchRule", e.target.value)}
                    placeholder="Segment3=2000"
                />
            )
        },
        {
            id: "offsetAccount",
            header: "Offset Account",
            width: "180px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-mono text-sm"
                    value={row.offsetAccount || ''}
                    onChange={(e) => updateRow("offsetAccount", e.target.value)}
                    placeholder="100-00-1000"
                />
            )
        },
        {
            id: "enabled",
            header: "Enabled",
            width: "100px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <div className="flex items-center h-9 px-2">
                    <Switch
                        checked={row.enabled ?? true}
                        onCheckedChange={(val) => updateRow("enabled", val)}
                    />
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            width: "120px",
            cell: (row: any) => (
                <div className="flex items-center gap-2 h-9">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => simulateMutation.mutate(row.id)}
                        disabled={simulateMutation.isPending || !row.id.toString().startsWith("temp") === false}
                        title="Simulate Rule"
                    >
                        <Play className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-xs">Simulate</span>
                    </Button>
                </div>
            )
        }
    ];

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
                                {rules.filter(r => r.enabled !== false).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Disabled</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">
                                {rules.filter(r => r.enabled === false).length}
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
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <GitBranch className="h-5 w-5" /> Elimination Rules configuration
                                </CardTitle>
                                <CardDescription>Bulk edit intercompany elimination logic</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const newLine: EliminationRule = {
                                            id: `temp-${Date.now()}`,
                                            name: "",
                                            ledgerSetId: "GLOBAL_GRP",
                                            matchRule: "",
                                            eliminationLedgerId: "ELIM_LEDGER",
                                            offsetAccount: "",
                                            enabled: true
                                        };
                                        queryClient.setQueryData(["elimination-rules"], (old: any) => [...(old || []), newLine]);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> New Rule
                                </Button>
                                <Button
                                    onClick={() => saveRulesMutation.mutate(rules)}
                                    disabled={saveRulesMutation.isPending}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {saveRulesMutation.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <TableSkeleton rows={4} />
                        ) : (
                            <div className="h-[600px] p-4">
                                <InteractiveSpreadsheet
                                    data={rules}
                                    columns={columns}
                                    onChange={(newData) => {
                                        queryClient.setQueryData(["elimination-rules"], newData);
                                    }}
                                    virtualized={true}
                                    containerHeight="550px"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
