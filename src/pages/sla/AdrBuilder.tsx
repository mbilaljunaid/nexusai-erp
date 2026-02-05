
import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AdrFlow } from "@/components/sla/AdrFlow";

export default function AdrBuilder() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

    // Fetch Rules
    const { data: rules, isLoading } = useQuery({
        queryKey: ["/api/sla/rules"],
        queryFn: () => fetch("/api/sla/rules").then(r => r.json())
    });

    // Create/Update Rule (Local State for editing)
    const [editingRule, setEditingRule] = useState<any>({
        code: "", name: "", ruleType: "Account", sourceType: "Constant", constantValue: ""
    });

    const isNew = !selectedRuleId;

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/sla/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to save rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sla/rules"] });
            toast({ title: "Success", description: "Accounting Rule saved successfully." });
            if (isNew) {
                // Reset form or select new rule (simplified)
                setEditingRule({ code: "", name: "", ruleType: "Account", sourceType: "Constant", constantValue: "" });
            }
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to save rule.", variant: "destructive" });
        }
    });

    return (
        <StandardPage
            title="Account Derivation Rules (ADR)"
            description="Configure logic for deriving GL Accounts dynamically."
            breadcrumbs={[{ label: "SLA Rules", href: "/finance/sla/rules" }, { label: "ADR Builder" }]}
            actions={
                <Button onClick={() => { setSelectedRuleId(null); setEditingRule({ code: "", name: "", ruleType: "Account", sourceType: "Constant" }); }}>
                    <Plus className="mr-2 h-4 w-4" /> New Rule
                </Button>
            }
        >
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-14rem)]">
                {/* List Panel */}
                <div className="col-span-4 border rounded-lg overflow-y-auto bg-card">
                    <div className="p-4 border-b bg-muted/30">
                        <Input placeholder="Search rules..." className="h-9" />
                    </div>
                    <div>
                        {isLoading ? <div className="p-4 text-center">Loading...</div> : rules?.map((rule: any) => (
                            <div
                                key={rule.id}
                                onClick={() => { setSelectedRuleId(rule.id); setEditingRule(rule); }}
                                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedRuleId === rule.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="font-medium">{rule.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">{rule.ruleType}</Badge>
                                    <span className="text-xs text-muted-foreground font-mono">{rule.code}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor Panel */}
                <div className="col-span-8 space-y-4">
                    <Card className="h-full border-dashed border-2">
                        <CardHeader>
                            <CardTitle>{isNew ? "New Derivation Rule" : "Edit Rule"}</CardTitle>
                            <CardDescription>Define how the account is determined.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Top Configuration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Rule Type (Output)</label>
                                    <Select value={editingRule.ruleType} onValueChange={v => setEditingRule({ ...editingRule, ruleType: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Account">Full Account</SelectItem>
                                            <SelectItem value="Segment">Segment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Source Type (Input)</label>
                                    <Select value={editingRule.sourceType} onValueChange={v => setEditingRule({ ...editingRule, sourceType: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Constant">Constant</SelectItem>
                                            <SelectItem value="Source">Transaction Source</SelectItem>
                                            <SelectItem value="MappingSet">Mapping Set (Lookup)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Rule Code</label>
                                    <Input
                                        value={editingRule.code}
                                        onChange={e => setEditingRule({ ...editingRule, code: e.target.value })}
                                        placeholder="LIABILITY_RULE"
                                        className="font-mono uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Rule Name</label>
                                    <Input
                                        value={editingRule.name}
                                        onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                                        placeholder="Liability Account Rule"
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Visual Flow */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Derivation Logic Flow</label>
                                <AdrFlow
                                    ruleType={editingRule.ruleType}
                                    sourceType={editingRule.sourceType}
                                    constantValue={editingRule.constantValue}
                                    sourceAttribute={editingRule.sourceAttribute}
                                />
                            </div>

                            {/* Dynamic Fields */}
                            <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Configuration Details</h4>

                                {editingRule.sourceType === "Constant" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Constant Value {editingRule.ruleType === 'Account' ? '(CCID)' : '(Segment Value)'}</label>
                                        <Input
                                            value={editingRule.constantValue || ""}
                                            onChange={e => setEditingRule({ ...editingRule, constantValue: e.target.value })}
                                            placeholder={editingRule.ruleType === 'Account' ? "e.g. 61d41ff0..." : "e.g. 1000"}
                                        />
                                        <p className="text-xs text-muted-foreground">Enter the UUID of the Code Combination or the Segment Value.</p>
                                    </div>
                                )}

                                {editingRule.sourceType === "Source" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Source Attribute</label>
                                        <Select
                                            value={editingRule.sourceAttribute || ""}
                                            onValueChange={v => setEditingRule({ ...editingRule, sourceAttribute: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Source Attribute" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="supplierType">Supplier Type</SelectItem>
                                                <SelectItem value="invoiceCurrency">Invoice Currency</SelectItem>
                                                <SelectItem value="projectType">Project Type</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {editingRule.sourceType === "MappingSet" && (
                                    <div className="text-sm text-amber-600 flex items-center gap-2">
                                        <span className="font-semibold">Note:</span> Mapping Set selection will be enabled in the next update.
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => saveMutation.mutate(editingRule)} disabled={saveMutation.isPending}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {saveMutation.isPending ? "Saving..." : "Save Rule"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card >
                </div >
            </div >
        </StandardPage >
    );
}
