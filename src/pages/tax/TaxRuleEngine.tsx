import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Code, Play, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from '@/components/layout/StandardPage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TaxRuleEngine() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [conditions, setConditions] = useState([
        { field: "amount", operator: ">", value: "1000" },
    ]);

    const { data: rules } = useQuery<any>({
        queryKey: ["/api/tax/rules"],
        queryFn: () => apiRequest("GET", "/api/tax/rules").then(res => res.json()),
    });

    const testMutation = useMutation({
        mutationFn: async (ruleId: number) => {
            const res = await apiRequest("POST", `/api/tax/rules/${ruleId}/test`, { testData: { amount: 1500, jurisdiction: "CA" } });
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Test Result",
                description: `Rule ${data.passed ? "passed" : "failed"}. Tax: $${data.taxAmount}`,
            });
        },
    });

    return (
        <StandardPage
            title="Tax Determination Rule Engine"
            description="Configure if/then tax rules with priority"
        >
            <div className="container mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rule Builder</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label htmlFor="ruleName" className="text-sm font-medium">Rule Name</label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <input id="ruleName" className="w-full border rounded-md p-2" placeholder="e.g., High Value Tax" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Rule Name</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Conditions (If)</label>
                                {conditions.map((condition, i) => (
                                    <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                                        <Select value={condition.field}>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <SelectTrigger aria-label="Select field">
                                                            <SelectValue placeholder="Field" />
                                                        </SelectTrigger>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Select field</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <SelectContent>
                                                <SelectItem value="amount">Amount</SelectItem>
                                                <SelectItem value="jurisdiction">Jurisdiction</SelectItem>
                                                <SelectItem value="productType">Product Type</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={condition.operator}>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <SelectTrigger aria-label="Select operator">
                                                            <SelectValue placeholder="Operator" />
                                                        </SelectTrigger>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Select operator</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <SelectContent>
                                                <SelectItem value=">">Greater Than</SelectItem>
                                                <SelectItem value="<">Less Than</SelectItem>
                                                <SelectItem value="=">Equals</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <input
                                                        type="text"
                                                        className="border rounded-md p-2"
                                                        value={condition.value}
                                                        placeholder="Value"
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Condition Value</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-sm font-medium">Then (Action)</label>
                                <Select defaultValue="APPLY_RATE">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <SelectTrigger aria-label="Select action">
                                                    <SelectValue placeholder="Action" />
                                                </SelectTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Select action</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <SelectContent>
                                        <SelectItem value="APPLY_RATE">Apply Tax Rate</SelectItem>
                                        <SelectItem value="EXEMPT">Exempt from Tax</SelectItem>
                                        <SelectItem value="OVERRIDE">Override Rate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="rulePriority" className="text-sm font-medium">Priority</label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <input id="rulePriority" type="number" className="w-full border rounded-md p-2" defaultValue="10" placeholder="Priority" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Priority</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
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
        </StandardPage>
    );
}
