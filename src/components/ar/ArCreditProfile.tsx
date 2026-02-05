import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArCustomerAccount } from "@shared/schema";
import { AlertCircle, ShieldCheck, TrendingUp, AlertTriangle, Lock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ArCreditProfileProps {
    account: ArCustomerAccount;
}

export function ArCreditProfile({ account }: ArCreditProfileProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const limit = Number(account.creditLimit) || 0;
    const balance = Number(account.balance) || 0;
    const utilization = limit > 0 ? (balance / limit) * 100 : 0;
    const score = account.creditScore || 100;

    const toggleHoldMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/ar/accounts/${account.id}/hold`, { hold: !account.creditHold });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/accounts"] });
            toast({ title: "Updated", description: `Credit hold ${!account.creditHold ? 'enabled' : 'disabled'}` });
        }
    });

    const recalcScoreMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/ar/accounts/${account.id}/score`, {});
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/accounts"] });
            toast({ title: "Score Updated", description: `New Credit Score: ${data.score}` });
        }
    });

    const getScoreColor = (s: number) => {
        if (s >= 75) return "text-emerald-600";
        if (s >= 50) return "text-amber-600";
        return "text-red-600";
    };

    const getScoreBadge = (s: number) => {
        if (s >= 75) return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Excellent</Badge>;
        if (s >= 50) return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Fair</Badge>;
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">High Risk</Badge>;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Credit Profile
                </CardTitle>
                {account.creditHold ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> On Hold
                    </Badge>
                ) : (
                    <Badge variant="outline" className="flex items-center gap-1 text-emerald-600 border-emerald-200 bg-emerald-50">
                        <ShieldCheck className="h-3 w-3" /> Active
                    </Badge>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between mb-2">
                    <div>
                        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                            {score}
                        </div>
                        <div className="text-xs text-muted-foreground">Credit Score</div>
                    </div>
                    <div>
                        {getScoreBadge(score)}
                    </div>
                </div>

                <div className="space-y-4 mt-6">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Utilization</span>
                            <span className={utilization > 90 ? "text-red-600 font-medium" : ""}>{utilization.toFixed(1)}%</span>
                        </div>
                        <Progress value={utilization} className={utilization > 90 ? "h-2 bg-red-100 [&>div]:bg-red-500" : "h-2"} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-2 bg-muted/50 rounded">
                            <div className="text-muted-foreground text-xs">Credit Limit</div>
                            <div className="font-semibold">${limit.toLocaleString()}</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                            <div className="text-muted-foreground text-xs">Current Exposure</div>
                            <div className="font-semibold">${balance.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => recalcScoreMutation.mutate()} disabled={recalcScoreMutation.isPending}>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Recalc Score
                        </Button>
                        <Button
                            variant={account.creditHold ? "secondary" : "destructive"}
                            size="sm"
                            onClick={() => toggleHoldMutation.mutate()}
                            disabled={toggleHoldMutation.isPending}
                        >
                            {account.creditHold ? "Release Hold" : "Place on Hold"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
