import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Code, Play, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TaxRuleEngine() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [conditions, setConditions] = useState([
        { field: "amount", operator: ">", value: "1000" },
    ]);

    const { data: rules } = useQuery({
        queryKey: ["/api/tax/rules"],
        queryFn: () => apiRequest("/api/tax/rules"),
    });

    const testMutation = useMutation({
        mutationFn: (ruleId: number) =>
            apiRequest(`/api/tax/rules/${ruleId}/test`, {
                method: "POST",
                body: JSON.stringify({ testData: { amount: 1500, jurisdiction: "CA" } }),
            }),
        onSuccess: (data) => {
            toast({
                title: "Test Result",
                description: `Rule ${data.passed ? "passed" : "failed"}. Tax: $${data.taxAmount}`,
            });
        },
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Tax Determination Rule Engine</h1>
                <p className="text-muted-foreground">Configure if/then tax rules with priority</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Rule Builder</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Rule Name</label>
                            <input className="w-full border rounded-md p-2" placeholder="e.g., High Value Tax" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Conditions (If)</label>
                            {conditions.map((condition, i) => (
                                <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                                    <Select value={condition.field}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="amount">Amount</SelectItem>
                                            <SelectItem value="jurisdiction">Jurisdiction</SelectItem>
                                            <SelectItem value="productType">Product Type</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={condition.operator}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=">">Greater Than</SelectItem>
                                            <SelectItem value="<">Less Than</SelectItem>
                                            <SelectItem value="=">Equals</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <input
                                        type="text"
                                        className="border rounded-md p-2"
                                        value={condition.value}
                                        placeholder="Value"
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Then (Action)</label>
                            <Select defaultValue="APPLY_RATE">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="APPLY_RATE">Apply Tax Rate</SelectItem>
                                    <SelectItem value="EXEMPT">Exempt from Tax</SelectItem>
                                    <SelectItem value="OVERRIDE">Override Rate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Priority</label>
                            <input type="number" className="w-full border rounded-md p-2" defaultValue="10" />
                        </div>
                        <Button className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            Save Rule
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {rules?.map((rule: any) => (
                            <div key={rule.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium">{rule.name}</div>
                                    <Badge>Priority: {rule.priority}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mb-3">{rule.description}</div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => testMutation.mutate(rule.id)}>
                                        <Play className="h-3 w-3 mr-1" />
                                        Test
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
