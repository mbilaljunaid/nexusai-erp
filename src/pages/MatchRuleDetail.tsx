// @ts-nocheck
// MatchRuleDetail.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function MatchRuleDetail() {
    const [, params] = useRoute("/mdm/match-rules/:id");
    const ruleId = params?.id;
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: rule, isLoading } = useQuery<any>({
        queryKey: [`/api/mdm/match-rules/${ruleId}`],
        enabled: !!ruleId
    });

    const [formData, setFormData] = useState({
        ruleName: "",
        description: "",
        matchScoreThreshold: 80,
        activeFlag: true
    });

    useEffect(() => {
        if (rule) {
            setFormData({
                ruleName: rule.ruleName,
                description: rule.description || "",
                matchScoreThreshold: rule.matchScoreThreshold || 80,
                activeFlag: rule.activeFlag
            });
        }
    }, [rule]);

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/mdm/match-rules/${ruleId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/mdm/match-rules`] });
            queryClient.invalidateQueries({ queryKey: [`/api/mdm/match-rules/${ruleId}`] });
            toast({ title: "Success", description: "Rule updated successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    if (isLoading) return <div>Loading...</div>;
    if (!rule) return <div>Rule not found</div>;

    return (
        <StandardPage
            title={rule.ruleName}
            description="Configure Match Rule Logic"
            breadcrumbs={[
                { label: "MDM", href: "/mdm/governance" },
                { label: "Match Rules", href: "/mdm/config/match-rules" },
                { label: rule.ruleName }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setLocation("/mdm/config/match-rules")}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={() => updateMutation.mutate(formData)} disabled={updateMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Rule Name</Label>
                            <Input
                                value={formData.ruleName}
                                onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                            <Label>Active Status</Label>
                            <Switch
                                checked={formData.activeFlag}
                                onCheckedChange={(val) => setFormData({ ...formData, activeFlag: val })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Scoring Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Match Score Threshold (0-100)</Label>
                            <div className="flex gap-4 items-center">
                                <Input
                                    type="number"
                                    min={0} max={100}
                                    value={formData.matchScoreThreshold}
                                    onChange={(e) => setFormData({ ...formData, matchScoreThreshold: Number(e.target.value) })}
                                    className="max-w-[100px]"
                                />
                                <span className="text-sm text-muted-foreground">
                                    Records with similarity score &ge; {formData.matchScoreThreshold} will be flagged as duplicates.
                                </span>
                            </div>
                        </div>
                        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded text-sm text-yellow-800">
                            Warning: Lowering the threshold below 70 may generate many false positives.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
