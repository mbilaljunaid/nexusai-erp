import { useState } from "react";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { StandardPage } from "@/components/layout/StandardPage";

interface SalesStage {
    id: string;
    name: string;
    probability: number;
    active: boolean;
}

interface ScoringRule {
    id: string;
    field: string;
    condition: "contains" | "equals" | "greater_than";
    value: string;
    points: number;
}

interface CrmSettingsData {
    stages: SalesStage[];
    scoringRules: ScoringRule[];
}

export default function CrmSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState<CrmSettingsData>({
        stages: [
            { id: "1", name: "Prospecting", probability: 10, active: true },
            { id: "2", name: "Qualification", probability: 20, active: true },
            { id: "3", name: "Proposal", probability: 50, active: true },
            { id: "4", name: "Negotiation", probability: 80, active: true },
            { id: "5", name: "Closed Won", probability: 100, active: true },
            { id: "6", name: "Closed Lost", probability: 0, active: true }
        ],
        scoringRules: [
            { id: "1", field: "title", condition: "contains", value: "Director", points: 10 },
            { id: "2", field: "annualRevenue", condition: "greater_than", value: "1000000", points: 20 }
        ]
    });

    const { data: tenant, isLoading } = useQuery<any>({
        queryKey: ["/api/tenant/current"],
        queryFn: async () => {
            const res = await fetch("/api/tenant/current");
            if (!res.ok) throw new Error("Failed to fetch tenant");
            return res.json();
        }
    });

    // Populate state from fetched data if available
    // Note: In a real implementation this would use useEffect or onSuccess
    // For now we default to the initial state acting as "seed" if empty

    const updateSettingsMutation = useMutation({
        mutationFn: async (newSettings: CrmSettingsData) => {
            if (!tenant?.id) throw new Error("No tenant ID");
            const res = await fetch(`/api/tenant/${tenant.id}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ crm: newSettings })
            });
            if (!res.ok) throw new Error("Failed to update settings");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tenant/current"] });
            toast({ title: "Settings Saved", description: "CRM configuration has been updated." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        }
    });

    const handleSave = () => {
        updateSettingsMutation.mutate(settings);
    };

    const updateStage = (index: number, field: keyof SalesStage, value: any) => {
        const newStages = [...settings.stages];
        newStages[index] = { ...newStages[index], [field]: value };
        setSettings({ ...settings, stages: newStages });
    };

    const updateRule = (index: number, field: keyof ScoringRule, value: any) => {
        const newRules = [...settings.scoringRules];
        newRules[index] = { ...newRules[index], [field]: value };
        setSettings({ ...settings, scoringRules: newRules });
    };

    if (isLoading) return <PageSkeleton />;

    return (
        <StandardPage
            title="CRM Settings"
            description="Configure sales stages, workflows, and scoring rules."
            className="max-w-4xl pb-10 mx-auto"
            actions={
                <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            }
        >

            <Card>
                <CardHeader>
                    <CardTitle>Sales Stages</CardTitle>
                    <CardDescription>Define the stages of your sales pipeline and their probability of closing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground mb-2">
                        <div className="col-span-1">Active</div>
                        <div className="col-span-6">Stage Name</div>
                        <div className="col-span-3">Probability (%)</div>
                        <div className="col-span-2"></div>
                    </div>
                    {settings.stages.map((stage, index) => (
                        <div key={stage.id} className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-1 flex justify-center">
                                <Switch
                                    checked={stage.active}
                                    onCheckedChange={(c) => updateStage(index, 'active', c)}
                                />
                            </div>
                            <div className="col-span-6">
                                <Input
                                    value={stage.name}
                                    onChange={(e) => updateStage(index, 'name', e.target.value)}
                                />
                            </div>
                            <div className="col-span-3">
                                <Input
                                    type="number"
                                    value={stage.probability}
                                    onChange={(e) => updateStage(index, 'probability', Number(e.target.value))}
                                />
                            </div>
                            <div className="col-span-2 text-right">
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="mr-2 h-4 w-4" /> Add Stage
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lead Scoring Rules</CardTitle>
                    <CardDescription>Define rules to automatically assign scores to new leads.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings.scoringRules.map((rule, index) => (
                        <div key={rule.id} className="flex gap-4 items-center p-4 border rounded-lg bg-card/50">
                            <div className="w-36">
                                <Label className="text-xs text-muted-foreground">Field</Label>
                                <Input value={rule.field} onChange={(e) => updateRule(index, 'field', e.target.value)} />
                            </div>
                            <div className="w-36">
                                <Label className="text-xs text-muted-foreground">Condition</Label>
                                <Input value={rule.condition} disabled />
                            </div>
                            <div className="flex-1">
                                <Label className="text-xs text-muted-foreground">Value</Label>
                                <Input value={rule.value} onChange={(e) => updateRule(index, 'value', e.target.value)} />
                            </div>
                            <div className="w-24">
                                <Label className="text-xs text-muted-foreground">Points</Label>
                                <Input type="number" value={rule.points} onChange={(e) => updateRule(index, 'points', Number(e.target.value))} />
                            </div>
                            <Button variant="ghost" size="icon" className="mt-4 text-destructive" aria-label="Delete">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Rule
                    </Button>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
