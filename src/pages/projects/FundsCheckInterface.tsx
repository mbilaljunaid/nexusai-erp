import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface FundsCheckResult {
    available: boolean;
    budgetAmount: number;
    actualCost: number;
    committedCost: number;
    remainingFunds: number;
    requestedAmount: number;
    overrunAmount?: number;
}

export default function FundsCheckInterface() {
    const { projectId } = useParams<{ projectId: string }>();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [controlRule, setControlRule] = useState({
        level: "ADVISORY" as "ADVISORY" | "ABSOLUTE" | "TRACKING",
        tolerancePercent: 10
    });
    const [checkAmount, setCheckAmount] = useState<number>(0);
    const [checkResult, setCheckResult] = useState<FundsCheckResult | null>(null);

    // Set control rule mutation
    const setControlMutation = useMutation({
        mutationFn: async (rule: typeof controlRule) => {
            const res = await fetch(`/api/ppm/planning/${projectId}/control-rule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rule)
            });
            if (!res.ok) throw new Error("Failed to set control rule");
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Control Rule Updated",
                description: "Budget control settings have been saved."
            });
        }
    });

    // Check funds mutation
    const checkFundsMutation = useMutation({
        mutationFn: async (amount: number) => {
            const res = await fetch(`/api/ppm/planning/${projectId}/funds-check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestedAmount: amount })
            });
            if (!res.ok) throw new Error("Funds check failed");
            return res.json();
        },
        onSuccess: (result: FundsCheckResult) => {
            setCheckResult(result);
            if (!result.available) {
                toast({
                    title: "Insufficient Funds",
                    description: `Budget overrun of ${formatCurrency(result.overrunAmount || 0)}`,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Funds Available",
                    description: "Budget check passed successfully."
                });
            }
        }
    });

    const handleCheckFunds = () => {
        if (checkAmount <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Enter a valid amount to check.",
                variant: "destructive"
            });
            return;
        }
        checkFundsMutation.mutate(checkAmount);
    };

    const utilizationPercent = checkResult
        ? ((checkResult.actualCost + checkResult.committedCost) / checkResult.budgetAmount) * 100
        : 0;

    return (
        <StandardPage
            title="Funds Check Interface"
            description="Configure budget control rules and check funds availability."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "Funds Check" }
            ]}
        >
            <div className="space-y-6">
                {/* Control Rule Configuration */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" /> Budget Control Rules
                        </CardTitle>
                        <CardDescription>Define how budget overruns should be handled.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="controlLevel">Control Level</Label>
                                <Select
                                    value={controlRule.level}
                                    onValueChange={(v: any) => setControlRule({ ...controlRule, level: v })}
                                >
                                    <SelectTrigger id="controlLevel">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADVISORY">
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">Advisory</span>
                                                <span className="text-xs text-muted-foreground">Warn but allow overruns</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="ABSOLUTE">
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">Absolute</span>
                                                <span className="text-xs text-muted-foreground">Block any overruns</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="TRACKING">
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">Tracking Only</span>
                                                <span className="text-xs text-muted-foreground">No enforcement</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tolerance">Tolerance (%)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="tolerance"
                                        type="number"
                                        value={controlRule.tolerancePercent}
                                        onChange={(e) => setControlRule({ ...controlRule, tolerancePercent: Number(e.target.value) })}
                                        className="w-24"
                                    />
                                    <span className="text-sm text-muted-foreground">Allow up to {controlRule.tolerancePercent}% over budget</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => setControlMutation.mutate(controlRule)}
                            disabled={setControlMutation.isPending}
                        >
                            {setControlMutation.isPending ? "Saving..." : "Save Control Rules"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Funds Check */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-t-4 border-t-blue-500">
                        <CardHeader>
                            <CardTitle>Check Funds Availability</CardTitle>
                            <CardDescription>Verify if funds are available for a transaction.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="checkAmount">Request Amount</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="checkAmount"
                                        type="number"
                                        value={checkAmount}
                                        onChange={(e) => setCheckAmount(Number(e.target.value))}
                                        placeholder="Enter amount..."
                                    />
                                    <Button onClick={handleCheckFunds} disabled={checkFundsMutation.isPending}>
                                        {checkFundsMutation.isPending ? "Checking..." : "Check"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Check Results */}
                    {checkResult && (
                        <Card className={cn(`border-t-4 ${checkResult.available ? "border-t-green-500" : "border-t-red-500"}`)}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {checkResult.available ? (
                                        <>
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            Funds Available
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                            Insufficient Funds
                                        </>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Budget (BAC):</span>
                                        <span className="font-mono">{formatCurrency(checkResult.budgetAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Actual Cost:</span>
                                        <span className="font-mono">{formatCurrency(checkResult.actualCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Committed:</span>
                                        <span className="font-mono">{formatCurrency(checkResult.committedCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold pt-2 border-t">
                                        <span className="text-muted-foreground">Remaining:</span>
                                        <span className={cn(`font-mono ${checkResult.remainingFunds >= 0 ? "text-green-600" : "text-red-600"}`)}>
                                            {formatCurrency(checkResult.remainingFunds)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Requested:</span>
                                        <span className="font-mono">{formatCurrency(checkResult.requestedAmount)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Budget Utilization</span>
                                        <span>{formatPercent(utilizationPercent / 100)}</span>
                                    </div>
                                    <Progress
                                        value={utilizationPercent}
                                        className={utilizationPercent > 100 ? "bg-red-200" : ""}
                                    />
                                </div>

                                {!checkResult.available && checkResult.overrunAmount && (
                                    <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                            <span className="text-sm font-bold text-red-900 dark:text-red-200">Budget Overrun</span>
                                        </div>
                                        <p className="text-sm text-red-700">
                                            This transaction would exceed the budget by {formatCurrency(checkResult.overrunAmount)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </StandardPage>
    );
}
