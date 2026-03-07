import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    ArrowRightLeft,
    CheckCircle,
    Scale,
    Download,
    Loader2,
    TrendingDown,
    AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NettingPosition {
    fromEntity: string;
    toEntity: string;
    currency: string;
    grossPayable: string;
    grossReceivable: string;
    netAmount: string;
    netDirection: string;
}

export function NettingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/treasury/netting/batches", {
                asOfDate: new Date().toISOString(),
            });
            return res.json();
        },
        onSuccess: (data) => {
            setSelectedBatchId(data.id);
            toast({
                title: "Netting Batch Created",
                description: `Batch ${data.batchNumber || data.id} calculated successfully.`,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Netting Cycle Failed",
                description: error.message || "System error.",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Scale className="w-6 h-6 text-primary" />
                        Enhanced Netting Optimization UI
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        In-house banking with net position matrix and settlement impact analysis
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button
                        onClick={() => createMutation.mutate()}
                        disabled={createMutation.isPending}
                        className="gap-2"
                    >
                        {createMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        Run Netting Cycle
                    </Button>
                </div>
            </div>

            {selectedBatchId && <NettingBatchDetail batchId={selectedBatchId} />}

            {!selectedBatchId && (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Scale className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Active Netting Batch</h3>
                        <p className="text-muted-foreground mb-4 text-center max-w-md">
                            Start a new netting cycle to consolidate intercompany positions and optimize cash
                            settlements.
                        </p>
                        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                            {createMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            Run Netting Cycle
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function NettingBatchDetail({ batchId }: { batchId: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: positions = [], isLoading } = useQuery<NettingPosition[]>({
        queryKey: [`/api/treasury/netting/batches/${batchId}/positions`],
        enabled: !!batchId,
    });

    const settleMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", `/api/treasury/netting/batches/${batchId}/settle`, {});
        },
        onSuccess: () => {
            toast({
                title: "Settlement Complete",
                description: "Internal transfers executed successfully.",
            });
            queryClient.invalidateQueries({
                queryKey: [`/api/treasury/netting/batches/${batchId}/positions`],
            });
        },
        onError: (error: any) => {
            toast({
                title: "Settlement Failed",
                description: error.message || "System error.",
                variant: "destructive",
            });
        },
    });

    // Calculate metrics
    const metrics = useMemo(() => {
        const grossPayables = positions.reduce(
            (sum, p) => sum + Math.abs(Number(p.grossPayable || 0)),
            0
        );
        const grossReceivables = positions.reduce(
            (sum, p) => sum + Math.abs(Number(p.grossReceivable || 0)),
            0
        );
        const netSettlements = positions.reduce(
            (sum, p) => sum + Math.abs(Number(p.netAmount || 0)),
            0
        );

        const volumeReduction = grossPayables + grossReceivables > 0
            ? ((grossPayables + grossReceivables - netSettlements) / (grossPayables + grossReceivables)) * 100
            : 0;

        const efficiencyGain = grossPayables + grossReceivables - netSettlements;

        return {
            grossPayables,
            grossReceivables,
            netSettlements,
            volumeReduction,
            efficiencyGain,
            positionCount: positions.length,
        };
    }, [positions]);

    // Build net position matrix
    const entities = useMemo(() => {
        const entitySet = new Set<string>();
        positions.forEach((p) => {
            entitySet.add(p.fromEntity);
            entitySet.add(p.toEntity);
        });
        return Array.from(entitySet).sort();
    }, [positions]);

    const matrix = useMemo(() => {
        const m: Record<string, Record<string, number>> = {};
        entities.forEach((from) => {
            m[from] = {};
            entities.forEach((to) => {
                m[from][to] = 0;
            });
        });

        positions.forEach((p) => {
            const amount = Number(p.netAmount);
            if (p.netDirection === "PAY") {
                m[p.fromEntity][p.toEntity] = -Math.abs(amount);
            } else {
                m[p.fromEntity][p.toEntity] = Math.abs(amount);
            }
        });

        return m;
    }, [entities, positions]);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading netting matrix...</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-transparent border-blue-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-blue-600 flex items-center gap-2">
                            <ArrowRightLeft className="w-3 h-3" />
                            Gross Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-blue-700">
                            ${(metrics.grossPayables + metrics.grossReceivables).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {metrics.positionCount} Positions
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-transparent border-emerald-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-emerald-600 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" />
                            Net Settlements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-emerald-700">
                            ${metrics.netSettlements.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">Optimized Amount</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-primary flex items-center gap-2">
                            <TrendingDown className="w-3 h-3" />
                            Volume Reduction
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black">{metrics.volumeReduction.toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Settlement Efficiency</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-transparent border-purple-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-purple-600 flex items-center gap-2">
                            <Scale className="w-3 h-3" />
                            Efficiency Gain
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-purple-700">
                            ${metrics.efficiencyGain.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">Cash Saved</p>
                    </CardContent>
                </Card>
            </div>

            {/* Settlement Impact Preview */}
            <Card className="bg-amber-500/10 border-amber-200">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Settlement Impact Preview
                    </CardTitle>
                    <CardDescription>Estimated impact on entity cash balances</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <span className="text-xs text-muted-foreground">Pre-Netting Volume:</span>
                            <p className="font-mono font-bold text-sm">
                                ${(metrics.grossPayables + metrics.grossReceivables).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">Post-Netting Volume:</span>
                            <p className="font-mono font-bold text-sm text-emerald-600">
                                ${metrics.netSettlements.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">Transaction Count Reduction:</span>
                            <p className="font-bold text-sm text-primary">
                                {metrics.positionCount} → {positions.filter(p => Number(p.netAmount) !== 0).length}
                            </p>
                        </div>
                    </div>
                    <Button
                        className="mt-4 bg-green-600 hover:bg-green-700"
                        onClick={() => settleMutation.mutate()}
                        disabled={settleMutation.isPending}
                    >
                        {settleMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Execute Settlement
                    </Button>
                </CardContent>
            </Card>

            {/* Net Position Matrix */}
            <Card className="shadow-lg border-primary/20">
                <CardHeader>
                    <CardTitle className="text-sm">Multi-Currency Net Position Matrix</CardTitle>
                    <CardDescription>
                        Consolidated intercompany positions (Green = Receive, Red = Pay)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold">From / To</TableHead>
                                    {entities.map((entity) => (
                                        <TableHead key={entity} className="text-center font-bold">
                                            {entity.slice(0, 10)}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-right font-bold">Net Position</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entities.map((fromEntity) => {
                                    const netPosition = entities.reduce((sum, toEntity) => {
                                        return sum + (matrix[fromEntity][toEntity] || 0);
                                    }, 0);

                                    return (
                                        <TableRow key={fromEntity}>
                                            <TableCell className="font-bold">{fromEntity.slice(0, 15)}</TableCell>
                                            {entities.map((toEntity) => {
                                                const amount = matrix[fromEntity][toEntity] || 0;
                                                if (fromEntity === toEntity) {
                                                    return (
                                                        <TableCell key={toEntity} className="bg-muted/20 text-center">
                                                            —
                                                        </TableCell>
                                                    );
                                                }

                                                return (
                                                    <TableCell
                                                        key={toEntity}
                                                        className={cn(`text-center font-mono text-xs ${amount > 0
                                                                ? "bg-emerald-500/10 text-emerald-700 font-bold"
                                                                : amount < 0
                                                                    ? "bg-red-500/10 text-red-700 font-bold"
                                                                    : "text-muted-foreground"
                                                            }`)}
                                                    >
                                                        {amount !== 0
                                                            ? `${amount > 0 ? "+" : ""}${amount.toLocaleString()}`
                                                            : "—"}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell
                                                className={cn(`text-right font-mono font-bold ${netPosition > 0
                                                        ? "text-emerald-600"
                                                        : netPosition < 0
                                                            ? "text-red-600"
                                                            : "text-muted-foreground"
                                                    }`)}
                                            >
                                                {netPosition > 0 ? "+" : ""}
                                                {netPosition.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Position List */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-sm">Position Detail Breakdown</CardTitle>
                    <CardDescription>Individual netting results by entity pair</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>From Entity</TableHead>
                                <TableHead>To Entity</TableHead>
                                <TableHead className="text-right">Gross Payable</TableHead>
                                <TableHead className="text-right">Gross Receivable</TableHead>
                                <TableHead className="text-right">Net Amount</TableHead>
                                <TableHead>Direction</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {positions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No eligible intercompany transactions found for netting.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                positions.map((pos, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{pos.fromEntity}</TableCell>
                                        <TableCell className="font-medium">{pos.toEntity}</TableCell>
                                        <TableCell className="text-right font-mono text-red-600">
                                            ${Number(pos.grossPayable).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-emerald-600">
                                            ${Number(pos.grossReceivable).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold">
                                            ${Math.abs(Number(pos.netAmount)).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    pos.netDirection === "RECEIVE"
                                                        ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                                        : "bg-red-100 text-red-700 border-red-300"
                                                }
                                            >
                                                {pos.netDirection}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default NettingWorkbench;
