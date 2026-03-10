import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GitBranch, Plus, Search, Save, Trash2, Database, ShieldCheck, ArrowRight, Settings2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface ADR {
    id: string;
    code: string;
    name: string;
    eventClassId: string;
    ruleType: "Account" | "Segment";
    segmentName?: string;
    sourceType: "Constant" | "MappingSet" | "Source";
    constantValue?: string;
    mappingSetId?: string;
    sourceAttribute?: string;
}

interface EventClass {
    id: string;
    name: string;
}

export default function AdrBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Event Classes
    const { data: eventClasses = [] } = useQuery<any>({
        queryKey: ["sla-event-classes"],
        queryFn: async () => {
            const res = await fetch("/api/sla/event-classes");
            return res.json();
        }
    });

    // Fetch ADRs
    const { data: rules = [], isLoading } = useQuery<any>({
        queryKey: ["sla-rules"],
        queryFn: async () => {
            const res = await fetch("/api/sla/rules");
            return res.json();
        }
    });

    // Fetch Mapping Sets for ADR linking
    const { data: mappingSets = [] } = useQuery<any>({
        queryKey: ["sla-mapping-sets"],
        queryFn: async () => {
            const res = await fetch("/api/sla/mapping-sets");
            return res.json();
        }
    });

    const upsertMutation = useMutation({
        mutationFn: async (data: Partial<ADR>) => {
            const res = await fetch("/api/sla/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sla-rules"] });
            toast({ title: "Rule Saved", description: "Account Derivation Rule updated successfully." });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/sla/rules/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sla-rules"] });
            toast({ title: "Rule Deleted" });
        }
    });

    const filteredRules = rules.filter((r: ADR) => {
        const matchesClass = selectedClassId === "ALL" || r.eventClassId === selectedClassId;
        const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesClass && matchesSearch;
    });

    const handleCreateNew = () => {
        const newRule: Partial<ADR> = {
            code: `NEW_RULE_${Date.now()}`,
            name: "New Account Rule",
            ruleType: "Segment",
            sourceType: "Constant",
            eventClassId: selectedClassId === "ALL" ? "" : selectedClassId
        };
        upsertMutation.mutate(newRule);
    };

    return (
        <StandardPage
            title="Account Derivation Builder"
            description="Visual logic designer for determining dynamic account combinations."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "SLA Config", href: "/finance/gl/config/sla" },
                { label: "ADR Builder" }
            ]}
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Rules Navigator */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-md flex items-center gap-2">
                                <GitBranch className="h-5 w-5 text-primary" />
                                Rule Context
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Subledger Object</Label>
                                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Event Classes</SelectItem>
                                        {eventClasses.map((cls: any) => (
                                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Search Rules</Label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Filter by name..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button className="w-full gap-2" variant="outline" onClick={handleCreateNew}>
                                    <Plus className="h-4 w-4" /> New Derivation Rule
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
                                <Info className="h-3 w-3" /> Quick Tip
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-blue-700 leading-relaxed italic">
                                ADRs are hierarchical. If a segment mapping fails, the engine looks for a "Full Account" override rule.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Rules Editor Workspace */}
                <div className="lg:col-span-3">
                    <Card className="shadow-md border-t-4 border-t-primary min-h-[600px]">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-6 bg-muted/20">
                            <div>
                                <CardTitle>Derivation Registry</CardTitle>
                                <CardDescription>Manage the logical precedence for account segments.</CardDescription>
                            </div>
                            <Badge variant="outline" className="font-mono">{filteredRules.length} Defined</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                                    <ShieldCheck className="h-12 w-12 mb-4 animate-pulse opacity-20" />
                                    <p>Loading ruleset...</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="w-48 font-bold">Rule Definition</TableHead>
                                            <TableHead className="font-bold">Type/Segment</TableHead>
                                            <TableHead className="font-bold">Source Logic</TableHead>
                                            <TableHead className="font-bold">Value Mapping</TableHead>
                                            <TableHead className="text-right font-bold w-28">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRules.map((rule: ADR) => (
                                            <TableRow key={rule.id} className="hover:bg-muted/5 group">
                                                <TableCell className="space-y-1">
                                                    <div className="font-bold text-sm tracking-tight">{rule.name}</div>
                                                    <div className="font-mono text-[10px] text-muted-foreground uppercase">{rule.code}</div>
                                                </TableCell>
                                                <TableCell className="space-y-2">
                                                    <Select
                                                        value={rule.ruleType}
                                                        onValueChange={v => upsertMutation.mutate({ ...rule, ruleType: v as any })}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Segment">Segment</SelectItem>
                                                            <SelectItem value="Account">Account</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {rule.ruleType === 'Segment' && (
                                                        <Input
                                                            placeholder="e.g. Segment1"
                                                            className="h-8 text-xs font-mono"
                                                            value={rule.segmentName || ""}
                                                            onChange={e => upsertMutation.mutate({ ...rule, segmentName: e.target.value })}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={rule.sourceType}
                                                        onValueChange={v => upsertMutation.mutate({ ...rule, sourceType: v as any })}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Constant">Constant</SelectItem>
                                                            <SelectItem value="MappingSet">Mapping Set</SelectItem>
                                                            <SelectItem value="Source">Source Attr</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    {rule.sourceType === 'Constant' && (
                                                        <Input
                                                            placeholder="Constant value"
                                                            className="h-8 text-xs"
                                                            value={rule.constantValue || ""}
                                                            onChange={e => upsertMutation.mutate({ ...rule, constantValue: e.target.value })}
                                                        />
                                                    )}
                                                    {rule.sourceType === 'MappingSet' && (
                                                        <Select
                                                            value={rule.mappingSetId || ""}
                                                            onValueChange={v => upsertMutation.mutate({ ...rule, mappingSetId: v })}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Select Set..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {mappingSets.map((ms: any) => (
                                                                    <SelectItem key={ms.id} value={ms.id}>{ms.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                    {rule.sourceType === 'Source' && (
                                                        <Input
                                                            placeholder="Source Field (e.g. supplier_type)"
                                                            className="h-8 text-xs"
                                                            value={rule.sourceAttribute || ""}
                                                            onChange={e => upsertMutation.mutate({ ...rule, sourceAttribute: e.target.value })}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(rule.id)} aria-label="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Go forward">
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredRules.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic">
                                                    No derivation rules matching criteria. Use the sidebar to add new rules.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
