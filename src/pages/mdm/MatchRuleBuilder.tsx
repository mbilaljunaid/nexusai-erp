import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MatchRule {
    id: string;
    name: string;
    entityType: "PARTY" | "ITEM";
    fieldName: string;
    matchType: "EXACT" | "FUZZY" | "PHONETIC";
    threshold: number;
    weight: number;
    active: boolean;
}

export default function MatchRuleBuilder() {
    const [editing, setEditing] = useState<MatchRule | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        entityType: "PARTY" as "PARTY" | "ITEM",
        fieldName: "",
        matchType: "FUZZY" as "EXACT" | "FUZZY" | "PHONETIC",
        threshold: 85,
        weight: 50,
    });

    const queryClient = useQueryClient();

    // Fetch rules
    const { data: rules = [] } = useQuery({
        queryKey: ["/api/mdm/match-rules"],
    });

    // Create/update rule
    const saveMutation = useMutation({
        mutationFn: async (rule: Partial<MatchRule>) => {
            if (editing) {
                const res = await fetch(`/api/mdm/match-rules/${editing.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(rule),
                });
                return res.json();
            } else {
                const res = await fetch("/api/mdm/match-rules", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...rule, active: true }),
                });
                return res.json();
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/match-rules"] });
            resetForm();
        },
    });

    const resetForm = () => {
        setEditing(null);
        setFormData({
            name: "",
            entityType: "PARTY",
            fieldName: "",
            matchType: "FUZZY",
            threshold: 85,
            weight: 50,
        });
    };

    const handleEdit = (rule: MatchRule) => {
        setEditing(rule);
        setFormData({
            name: rule.name,
            entityType: rule.entityType,
            fieldName: rule.fieldName,
            matchType: rule.matchType,
            threshold: rule.threshold,
            weight: rule.weight,
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Match Rule Builder</h1>
                <p className="text-muted-foreground">
                    Configure duplicate detection rules
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rule Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>{editing ? "Edit Rule" : "Create New Rule"}</CardTitle>
                        <CardDescription>
                            Define how fields are compared for duplicate detection
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Rule Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Email Exact Match"
                            />
                        </div>

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
                                    placeholder="e.g., email"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="matchType">Match Type</Label>
                            <Select
                                value={formData.matchType}
                                onValueChange={(value: "EXACT" | "FUZZY" | "PHONETIC") =>
                                    setFormData({ ...formData, matchType: value })
                                }
                            >
                                <SelectTrigger id="matchType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EXACT">Exact Match</SelectItem>
                                    <SelectItem value="FUZZY">Fuzzy Match (Levenshtein)</SelectItem>
                                    <SelectItem value="PHONETIC">Phonetic Match (Soundex)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Match Threshold: {formData.threshold}%</Label>
                            <Slider
                                value={[formData.threshold]}
                                onValueChange={(value) => setFormData({ ...formData, threshold: value[0] })}
                                min={50}
                                max={100}
                                step={5}
                                className="mt-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Minimum similarity score to consider a match
                            </p>
                        </div>

                        <div>
                            <Label>Weight: {formData.weight}</Label>
                            <Slider
                                value={[formData.weight]}
                                onValueChange={(value) => setFormData({ ...formData, weight: value[0] })}
                                min={0}
                                max={100}
                                step={10}
                                className="mt-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Importance of this rule in overall match score
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => saveMutation.mutate(formData)}
                                disabled={!formData.name || !formData.fieldName || saveMutation.isPending}
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
                                No rules configured yet
                            </p>
                        ) : (
                            rules.map((rule: MatchRule) => (
                                <div
                                    key={rule.id}
                                    className="p-4 border rounded-lg space-y-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold">{rule.name}</h4>
                                                {rule.active ? (
                                                    <ToggleRight className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                <Badge variant="outline">{rule.entityType}</Badge>
                                                <Badge variant="outline">{rule.fieldName}</Badge>
                                                <Badge variant="secondary">{rule.matchType}</Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(rule)}
                                        >
                                            Edit
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Threshold:</span>
                                            <span className="ml-2 font-mono">{rule.threshold}%</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Weight:</span>
                                            <span className="ml-2 font-mono">{rule.weight}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
