import { cn } from "@/lib/utils";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { PlayCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/dateUtils"; // Added this import
import { StandardPage } from '@/components/layout/StandardPage';
import { formatCurrency } from "@/lib/formatters";

interface RevaluationRun {
    id: string;
    runDate: string;
    status: "completed" | "pending" | "failed";
    totalGainLoss: number;
    currency: string;
    accountsProcessed: number;
}

interface RevaluationHistory extends RevaluationRun {
    createdBy: string;
}

export default function CurrencyRevaluationView() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch revaluation history
    const { data: history = [], isLoading } = useQuery<RevaluationHistory[]>({
        queryKey: ["/api/finance/cash/revaluation/history"],
        queryFn: async () => {
            const res = await fetch("/api/finance/cash/revaluation/history");
            if (!res.ok) throw new Error("Failed to fetch history");
            return res.json();
        }
    });

    // Run revaluation mutation
    const runRevaluationMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/finance/cash/revaluation/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) throw new Error("Revaluation failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Revaluation Complete",
                description: `Processed ${data.accountsProcessed} accounts. Total gain/loss: ${formatCurrency(data.totalGainLoss)}`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/finance/cash/revaluation/history"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Revaluation Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const formatCurrency = (amount: number, currency: string = "USD") => {
        return formatCurrency(amount, currency);
    };

    // Removed the old formatDate function definition

    const formatShortDate = (dateString: string) => {
        return formatDate(new Date(dateString), "MMM d");
    };


    return (
        <StandardPage
            title="Currency Revaluation"
            description="Run foreign currency revaluation and track gain/loss"
            actions={
                <Button
                    onClick={() => runRevaluationMutation.mutate()}
                    disabled={runRevaluationMutation.isPending}
                    size="lg"
                >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    {runRevaluationMutation.isPending ? "Running..." : "Run Revaluation"}
                </Button>
            }
        >
            <div className="space-y-6">

                {/* Info Card */}
                <Card className="border-blue-500 bg-blue-500/10 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>Currency Revaluation</strong> adjusts the value of foreign currency bank accounts
                            based on current exchange rates. Unrealized gains and losses are posted to the General Ledger.
                        </p>
                    </CardContent>
                </Card>

                {/* Revaluation History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revaluation History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <RefreshCw className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No revaluation runs yet</p>
                                <p className="text-sm mt-1">Click "Run Revaluation" to start your first run</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((run) => (
                                    <div
                                        key={run.id}
                                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="font-medium">Revaluation Run</p>
                                                    <StatusBadge status={run.status} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Run Date</p>
                                                        <p className="font-medium">{formatDate(run.runDate)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Accounts Processed</p>
                                                        <p className="font-medium">{run.accountsProcessed}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Total Gain/Loss</p>
                                                        <p className={cn(`font-semibold text-lg ${run.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
                                                            }`)}>
                                                            {formatCurrency(run.totalGainLoss, run.currency)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Created By</p>
                                                        <p className="font-medium">{run.createdBy || "System"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
