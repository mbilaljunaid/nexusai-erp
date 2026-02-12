import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tantml:react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
    Plus,
    Save,
    Play,
    Trash2,
    Copy,
    Calendar,
    ArrowRight,
    Settings,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface TransferRule {
    id?: number;
    name: string;
    description: string;
    sourceLedgerId: number;
    targetLedgerId: number;
    accountRange?: string;
    transferType: 'BALANCE' | 'ACTIVITY' | 'BUDGET';
    offsetAccount?: string;
    schedule: TransferSchedule;
    isActive: boolean;
    conditions: TransferCondition[];
}

interface TransferSchedule {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PERIOD_CLOSE' | 'YEAR_END';
    dayOfMonth?: number;
    dayOfWeek?: number;
    autoRun: boolean;
}

interface TransferCondition {
    id: string;
    field: string;
    operator: 'GT' | 'LT' | 'EQ' | 'NE' | 'CONTAINS';
    value: string;
}

export default function TransferRuleBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRule, setSelectedRule] = useState<number | null>(null);
    const [ruleName, setRuleName] = useState("");
    const [ruleDescription, setRuleDescription] = useState("");
    const [sourceLedger, setSourceLedger] = useState("");
    const [targetLedger, setTargetLedger] = useState("");
    const [accountRange, setAccountRange] = useState("");
    const [transferType, setTransferType] = useState<'BALANCE' | 'ACTIVITY' | 'BUDGET'>('BALANCE');
    const [offsetAccount, setOffsetAccount] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PERIOD_CLOSE' | 'YEAR_END'>('MONTHLY');
    const [autoRun, setAutoRun] = useState(false);
    const [conditions, setConditions] = useState<TransferCondition[]>([]);

    // Fetch transfer rules
    const { data: rules, isLoading } = useQuery({
        queryKey: ["/api/gl/transfer-rules"],
        queryFn: () => apiRequest("/api/gl/transfer-rules"),
    });

    // Fetch ledgers
    const { data: ledgers } = useQuery({
        queryKey: ["/api/gl/ledgers"],
        queryFn: () => apiRequest("/api/gl/ledgers"),
    });

    // Save rule mutation
    const saveMutation = useMutation({
        mutationFn: (data: TransferRule) =>
            selectedRule
                ? apiRequest(`/api/gl/transfer-rules/${selectedRule}`, {
                    method: "PUT",
                    body: JSON.stringify(data),
                })
                : apiRequest("/api/gl/transfer-rules", {
                    method: "POST",
                    body: JSON.stringify(data),
                }),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Transfer rule saved successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/gl/transfer-rules"] });
        },
    });

    // Run rule mutation
    const runMutation = useMutation({
        mutationFn: (ruleId: number) =>
            apiRequest(`/api/gl/transfer-rules/${ruleId}/run`, { method: "POST" }),
        onSuccess: (data) => {
            toast({
                title: "Transfer Complete",
                description: `Transferred ${data.journalCount} journals, ${data.totalAmount} amount`,
            });
        },
    });

    const addCondition = () => {
        setConditions([
            ...conditions,
            {
                id: `cond-${Date.now()}`,
                field: "",
                operator: "EQ",
                value: "",
            },
        ]);
    };

    const updateCondition = (id: string, updates: Partial<TransferCondition>) => {
        setConditions(
            conditions.map((cond) =>
                cond.id === id ? { ...cond, ...updates } : cond
            )
        );
    };

    const deleteCondition = (id: string) => {
        setConditions(conditions.filter((cond) => cond.id !== id));
    };

    const saveRule = () => {
        const rule: TransferRule = {
            name: ruleName,
            description: ruleDescription,
            sourceLedgerId: parseInt(sourceLedger),
            targetLedgerId: parseInt(targetLedger),
            accountRange,
            transferType,
            offsetAccount,
            schedule: {
                frequency,
                autoRun,
            },
            isActive,
            conditions,
        };
        saveMutation.mutate(rule);
    };

    const loadRule = (rule: TransferRule) => {
        setSelectedRule(rule.id || null);
        setRuleName(rule.name);
        setRuleDescription(rule.description);
        setSourceLedger(rule.sourceLedgerId.toString());
        setTargetLedger(rule.targetLedgerId.toString());
        setAccountRange(rule.accountRange || "");
        setTransferType(rule.transferType);
        setOffsetAccount(rule.offsetAccount || "");
        setIsActive(rule.isActive);
        setFrequency(rule.schedule.frequency);
        setAutoRun(rule.schedule.autoRun);
        setConditions(rule.conditions || []);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">GL Transfer Rule Builder</h1>
                    <p className="text-muted-foreground">
                        Automate journal transfers between ledgers
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSelectedRule(null);
                            setRuleName("");
                            setRuleDescription("");
                            setSourceLedger("");
                            setTargetLedger("");
                            setAccountRange("");
                            setConditions([]);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Rule
                    </Button>
                    <Button onClick={saveRule} disabled={saveMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                    {selectedRule && (
                        <Button
                            onClick={() => runMutation.mutate(selectedRule)}
                            disabled={runMutation.isPending}
                        >
                            <Play className="h-4 w-4 mr-2" />
                            Run Now
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Rules List */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Transfer Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {rules?.map((rule: TransferRule) => (
                            <div
                                key={rule.id}
                                className={`p-3 rounded-lg cursor-pointer border ${selectedRule === rule.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:bg-accent"
                                    }`}
                                onClick={() => loadRule(rule)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="font-medium">{rule.name}</div>
                                    <div
                                        className={`px-2 py-0.5 rounded text-xs ${rule.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {rule.isActive ? "Active" : "Inactive"}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {rule.schedule.frequency} • {rule.transferType}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Rule Builder */}
                <Card className="col-span-8">
                    <CardHeader>
                        <CardTitle>Rule Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Rule Name</Label>
                                <Input
                                    value={ruleName}
                                    onChange={(e) => setRuleName(e.target.value)}
                                    placeholder="e.g., Transfer Trial Balance to Consolidation Ledger"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={ruleDescription}
                                    onChange={(e) => setRuleDescription(e.target.value)}
                                    placeholder="Purpose and notes"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Transfer Configuration */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-4">Transfer Configuration</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Source Ledger</Label>
                                    <Select value={sourceLedger} onValueChange={setSourceLedger}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ledger" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ledgers?.map((ledger: any) => (
                                                <SelectItem key={ledger.id} value={ledger.id.toString()}>
                                                    {ledger.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end justify-center">
                                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <Label>Target Ledger</Label>
                                    <Select value={targetLedger} onValueChange={setTargetLedger}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ledger" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ledgers?.map((ledger: any) => (
                                                <SelectItem key={ledger.id} value={ledger.id.toString()}>
                                                    {ledger.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <Label>Transfer Type</Label>
                                    <Select
                                        value={transferType}
                                        onValueChange={(value: any) => setTransferType(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BALANCE">Balance</SelectItem>
                                            <SelectItem value="ACTIVITY">Activity</SelectItem>
                                            <SelectItem value="BUDGET">Budget</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Account Range (Optional)</Label>
                                    <Input
                                        value={accountRange}
                                        onChange={(e) => setAccountRange(e.target.value)}
                                        placeholder="e.g., 1000..9999"
                                    />
                                </div>
                                <div>
                                    <Label>Offset Account (Optional)</Label>
                                    <Input
                                        value={offsetAccount}
                                        onChange={(e) => setOffsetAccount(e.target.value)}
                                        placeholder="e.g., 999999"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-4 flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Transfer Schedule
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Frequency</Label>
                                    <Select
                                        value={frequency}
                                        onValueChange={(value: any) => setFrequency(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAILY">Daily</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="PERIOD_CLOSE">Period Close</SelectItem>
                                            <SelectItem value="YEAR_END">Year End</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={autoRun} onCheckedChange={setAutoRun} />
                                        <Label>Auto-run on schedule</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conditions */}
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Transfer Conditions (Optional)</h3>
                                <Button size="sm" variant="outline" onClick={addCondition}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Condition
                                </Button>
                            </div>
                            {conditions.map((cond) => (
                                <div key={cond.id} className="flex gap-2 mb-2">
                                    <Select
                                        value={cond.field}
                                        onValueChange={(value) =>
                                            updateCondition(cond.id, { field: value })
                                        }
                                    >
                                        <SelectTrigger className="w-1/3">
                                            <SelectValue placeholder="Field" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="amount">Amount</SelectItem>
                                            <SelectItem value="period">Period</SelectItem>
                                            <SelectItem value="account">Account</SelectItem>
                                            <SelectItem value="segment">Segment Value</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={cond.operator}
                                        onValueChange={(value: any) =>
                                            updateCondition(cond.id, { operator: value })
                                        }
                                    >
                                        <SelectTrigger className="w-1/4">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EQ">Equals</SelectItem>
                                            <SelectItem value="NE">Not Equals</SelectItem>
                                            <SelectItem value="GT">Greater Than</SelectItem>
                                            <SelectItem value="LT">Less Than</SelectItem>
                                            <SelectItem value="CONTAINS">Contains</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        value={cond.value}
                                        onChange={(e) =>
                                            updateCondition(cond.id, { value: e.target.value })
                                        }
                                        placeholder="Value"
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteCondition(cond.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Active Status */}
                        <div className="border-t pt-4">
                            <div className="flex items-center space-x-2">
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                                <Label>Rule is Active</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
