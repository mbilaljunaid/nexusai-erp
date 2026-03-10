import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Plus, Trash2, ShieldCheck, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function TerritoryRuleBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);

    const { data: territories = [], isLoading: loadingTerritories } = useQuery<any[]>({
        queryKey: ["/api/crm/territories"],
        queryFn: () => fetch("/api/crm/territories").then(r => r.json()),
    });

    const { data: rules = [], isLoading: loadingRules } = useQuery<any[]>({
        queryKey: ["/api/crm/territories", selectedTerritoryId, "rules"],
        queryFn: () => selectedTerritoryId ? fetch(`/api/crm/territories/${selectedTerritoryId}/rules`).then(r => r.json()) : Promise.resolve([]),
        enabled: !!selectedTerritoryId
    });

    const [newTerritory, setNewTerritory] = useState({ name: "" });
    const createTerritoryMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/crm/territories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/territories"] });
            setSelectedTerritoryId(data.id);
            setNewTerritory({ name: "" });
            toast({ title: "Territory Created" });
        }
    });

    const [newRule, setNewRule] = useState({ field: "billingState", operator: "equals", value: "" });
    const createRuleMutation = useMutation({
        mutationFn: (data: any) => fetch(`/api/crm/territories/${selectedTerritoryId}/rules`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/territories", selectedTerritoryId, "rules"] });
            setNewRule({ ...newRule, value: "" });
            toast({ title: "Rule Added" });
        }
    });

    const deleteRuleMutation = useMutation({
        mutationFn: (ruleId: string) => fetch(`/api/crm/territories/${selectedTerritoryId}/rules/${ruleId}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/territories", selectedTerritoryId, "rules"] });
        }
    });

    return (
        <StandardPage
            title="Territory Management"
            description="Define sales territories and configure automatic assignment rules based on account dimensions."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Sales Ops", href: "/crm" },
                { label: "Territories" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Territories List Sidebar */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Sales Territories</CardTitle>
                        <CardDescription>Select a territory to build rules.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input placeholder="New Territory Name" value={newTerritory.name} onChange={e => setNewTerritory({ name: e.target.value })} />
                            <Button onClick={() => createTerritoryMutation.mutate(newTerritory)} disabled={!newTerritory.name || createTerritoryMutation.isPending}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2 mt-4 max-h-[500px] overflow-y-auto">
                            {territories.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTerritoryId(t.id)}
                                    className={`w-full text-left px-4 py-3 rounded-md transition-colors border ${selectedTerritoryId === t.id ? 'bg-primary/10 border-primary shadow-sm' : 'bg-card hover:bg-muted border-transparent'}`}
                                >
                                    <div className="font-medium text-sm flex items-center gap-2">
                                        <MapPin className={`h-4 w-4 ${selectedTerritoryId === t.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                        {t.name}
                                    </div>
                                </button>
                            ))}
                            {territories.length === 0 && !loadingTerritories && (
                                <div className="text-center p-4 text-sm text-muted-foreground border rounded bg-slate-50 border-dashed">No territories defined.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Rule Builder Canvas */}
                <div className="md:col-span-2 space-y-6">
                    {!selectedTerritoryId ? (
                        <Card className="h-full flex items-center justify-center py-24 bg-slate-50 border-dashed shadow-none">
                            <div className="text-center text-muted-foreground">
                                <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No Territory Selected</p>
                                <p className="text-sm">Select or create a territory to configure assignment rules.</p>
                            </div>
                        </Card>
                    ) : (
                        <>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Assignment Rules</CardTitle>
                                            <CardDescription>Accounts matching these conditions will be routed here.</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">{rules.length} Active Rules</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* New Rule Form */}
                                        <div className="flex items-center gap-2 p-3 bg-muted/30 border rounded-md">
                                            <Select value={newRule.field} onValueChange={(val) => setNewRule({ ...newRule, field: val })}>
                                                <SelectTrigger className="w-[180px] bg-background"><SelectValue placeholder="Field" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="billingState">Billing State/Province</SelectItem>
                                                    <SelectItem value="billingCountry">Billing Country</SelectItem>
                                                    <SelectItem value="industry">Industry</SelectItem>
                                                    <SelectItem value="annualRevenue">Annual Revenue</SelectItem>
                                                    <SelectItem value="employeeCount">Employee Count</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={newRule.operator} onValueChange={(val) => setNewRule({ ...newRule, operator: val })}>
                                                <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="Operator" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="equals">Equals</SelectItem>
                                                    <SelectItem value="contains">Contains</SelectItem>
                                                    <SelectItem value="gt">Greater Than</SelectItem>
                                                    <SelectItem value="lt">Less Than</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                placeholder="Value"
                                                className="flex-1 bg-background"
                                                value={newRule.value}
                                                onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                                            />
                                            <Button size="sm" onClick={() => createRuleMutation.mutate(newRule)} disabled={!newRule.value || createRuleMutation.isPending}>
                                                Add Rule
                                            </Button>
                                        </div>

                                        {/* Rules List */}
                                        <div className="space-y-2 mt-6">
                                            {rules.map((rule, idx) => (
                                                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-muted-foreground text-xs font-mono">{idx + 1}.</span>
                                                        <Badge variant="secondary" className="font-mono text-xs">{rule.field}</Badge>
                                                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{rule.operator}</span>
                                                        <span className="text-sm font-semibold">"{rule.value}"</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => deleteRuleMutation.mutate(rule.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {rules.length === 0 && (
                                                <div className="text-center py-6 border border-dashed rounded text-sm text-muted-foreground bg-slate-50">
                                                    No rules active. Territory must be manually assigned.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </StandardPage>
    );
}
