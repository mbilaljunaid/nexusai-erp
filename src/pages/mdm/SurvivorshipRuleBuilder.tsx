import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";


interface SurvivorshipRule {
    id: string;
    entityType: "PARTY" | "ITEM";
    fieldName: string;
    strategy: "MOST_RECENT" | "MOST_COMPLETE" | "HIGHEST_TRUST" | "MANUAL";
    priority: number;
}

export default function SurvivorshipRuleBuilder() {
    const [editing, setEditing] = useState<SurvivorshipRule | null>(null);
    const [formData, setFormData] = useState({
        entityType: "PARTY" as "PARTY" | "ITEM",
        fieldName: "",
        strategy: "MOST_RECENT" as "MOST_RECENT" | "MOST_COMPLETE" | "HIGHEST_TRUST" | "MANUAL",
        priority: 50,
    });

    const queryClient = useQueryClient();

    const { data: rules = [] } = useQuery({
        queryKey: ["/api/mdm/survivorship-rules"],
    });

    const saveMutation = useMutation({
        mutationFn: async (rule: Partial<SurvivorshipRule>) => {
            if (editing) {
                const res = await fetch(`/api/mdm/survivorship-rules/${editing.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(rule),
                });
                return res.json();
            } else {
                const res = await fetch("/api/mdm/survivorship-rules", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(rule),
                });
                return res.json();
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/survivorship-rules"] });
            resetForm();
        },
    });

    const resetForm = () => {
        setEditing(null);
        setFormData({
            entityType: "PARTY",
            fieldName: "",
            strategy: "MOST_RECENT",
            priority: 50,
        });
    };

    const handleEdit = (rule: SurvivorshipRule) => {
        setEditing(rule);
        setFormData({
            entityType: rule.entityType,
            fieldName: rule.fieldName,
            strategy: rule.strategy,
            priority: rule.priority,
        });
    };

    const strategyDescriptions = {
        MOST_RECENT: "Use the most recently updated value",
        MOST_COMPLETE: "Prefer non-null, longest values",
        HIGHEST_TRUST: "Use value from most trusted source",
        MANUAL: "Require manual selection during merge",
    };

    return (
        <StandardPage title="Survivorship Rule Builder">
            <div>
                
                <p className="text-muted-foreground">
                    Define which field values survive during merge
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rule Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>{editing ? "Edit Rule" : "Create New Rule"}</CardTitle>
                        <CardDescription>
                            Configure field-level merge logic
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="entityType">Entity Type</Label>
                                <Select
                                    value={formData.entityType}
                                    onValueChange={(value: "PARTY" | "ITEM") =>
                                        setFormData({ ...formData, entityType: value })
                                    }
                                >
                                    <SelectTrigger id="entityType">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PARTY">Party</SelectItem>
                                        <SelectItem value="ITEM">Item</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="fieldName">Field Name</Label>
                                <Input
                                    id="fieldName"
                                    value={formData.fieldName}
                                    onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                                    placeholder="e.g., email, phone"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="strategy">Survivorship Strategy</Label>
                            <Select
                                value={formData.strategy}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, strategy: value })
                                }
                            >
                                <SelectTrigger id="strategy">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MOST_RECENT">Most Recent</SelectItem>
                                    <SelectItem value="MOST_COMPLETE">Most Complete</SelectItem>
                                    <SelectItem value="HIGHEST_TRUST">Highest Trust</SelectItem>
                                    <SelectItem value="MANUAL">Manual Selection</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                                {strategyDescriptions[formData.strategy]}
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="priority">Priority: {formData.priority}</Label>
                            <input
                                type="range"
                                id="priority"
                                title="Set rule priority from 0 to 100"
                                min="0"
                                max="100"
                                step="10"
                                value={formData.priority}
                                onChange={(e) =>
                                    setFormData({ ...formData, priority: parseInt(e.target.value) })
                                }
                                className="w-full mt-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Higher priority rules evaluated first
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => saveMutation.mutate(formData)}
                                disabled={!formData.fieldName || saveMutation.isPending}
                                className="flex-1"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {editing ? "Update" : "Create"} Rule
                            </Button>
                            {editing && (
                                <Button variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Rules List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configured Rules</CardTitle>
                        <CardDescription>{rules.length} rules defined</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {rules.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-8 text-center">
                                No survivorship rules configured
                            </p>
                        ) : (
                            rules
                                .sort((a: SurvivorshipRule, b: SurvivorshipRule) => b.priority - a.priority)
                                .map((rule: SurvivorshipRule) => (
                                    <div
                                        key={rule.id}
                                        className="p-4 border rounded-lg space-y-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold">
                                                        {rule.entityType}.{rule.fieldName}
                                                    </h4>
                                                    <Badge variant="outline">Priority: {rule.priority}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {strategyDescriptions[rule.strategy]}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(rule)}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                        <Badge variant="secondary">{rule.strategy}</Badge>
                                    </div>
                                ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
