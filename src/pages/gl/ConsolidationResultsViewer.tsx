import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, ChevronRight, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportButton } from "@/components/ExportButton";

interface ConsolidatedBalance {
    account: string;
    preElimination: number;
    eliminations: number;
    consolidated: number;
    entities: EntityBalance[];
}

interface EntityBalance {
    entityName: string;
    currency: string;
    originalAmount: number;
    translatedAmount: number;
    rate: number;
}

interface FxAdjustment {
    account: string;
    entity: string;
    originalCurrency: string;
    fxGainLoss: number;
}

export default function ConsolidationResultsViewer() {
    const { runId } = useParams<{ runId: string }>();
    const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

    // Fetch consolidated balances
    const { data: balances = [] } = useQuery<ConsolidatedBalance[]>({
        queryKey: ["consolidation-results", runId],
        queryFn: async () => {
            // Mock - replace with API
            return [
                {
                    account: "Cash and Cash Equivalents",
                    preElimination: 5000000,
                    eliminations: 0,
                    consolidated: 5000000,
                    entities: [
                        { entityName: "US Operations", currency: "USD", originalAmount: 2000000, translatedAmount: 2000000, rate: 1.0 },
                        { entityName: "UK Operations", currency: "GBP", originalAmount: 1500000, translatedAmount: 1905000, rate: 1.27 },
                        { entityName: "EU Operations", currency: "EUR", originalAmount: 1000000, translatedAmount: 1080000, rate: 1.08 }
                    ]
                },
                {
                    account: "Intercompany Receivables",
                    preElimination: 1000000,
                    eliminations: -1000000,
                    consolidated: 0,
                    entities: [
                        { entityName: "US Operations", currency: "USD", originalAmount: 500000, translatedAmount: 500000, rate: 1.0 },
                        { entityName: "EU Operations", currency: "EUR", originalAmount: 500000, translatedAmount: 540000, rate: 1.08 }
                    ]
                }
            ];
        }
    });

    // Fetch FX adjustments
    const { data: adjustments = [] } = useQuery<FxAdjustment[]>({
        queryKey: ["fx-adjustments", runId],
        queryFn: async () => {
            // Mock
            return [
                { account: "Cash", entity: "UK Operations", originalCurrency: "GBP", fxGainLoss: 50000 },
                { account: "Revenue", entity: "EU Operations", originalCurrency: "EUR", fxGainLoss: -30000 }
            ];
        }
    });

    const totalConsolidated = balances.reduce((sum, b) => sum + b.consolidated, 0);
    const totalEliminations = balances.reduce((sum, b) => sum + Math.abs(b.eliminations), 0);
    const totalFxImpact = adjustments.reduce((sum, a) => sum + a.fxGainLoss, 0);

    const exportData = balances.map(b => ({
        Account: b.account,
        "Pre-Elimination": b.preElimination,
        Eliminations: b.eliminations,
        Consolidated: b.consolidated
    }));

    return (
        <StandardPage
            title={`Consolidation Results - Run #${runId?.substring(0, 8)}`}
            description="View consolidated financial statements with entity drill-down and FX translation details."
            breadcrumbs={[
                { label: "General Ledger", href: "/gl" },
                { label: "Consolidation", href: "/gl/consolidation" },
                { label: "Results" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Consolidated Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">${totalConsolidated.toFixed(0)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Eliminations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">${totalEliminations.toFixed(0)}</div>
                        </CardContent>
                    </Card>
                    <Card className={`${totalFxImpact >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className={`text-xs font-bold uppercase ${totalFxImpact >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                FX Gain/Loss
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${totalFxImpact >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                                {totalFxImpact >= 0 ? '+' : ''}${totalFxImpact.toFixed(0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="consolidated" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="consolidated">Consolidated View</TabsTrigger>
                        <TabsTrigger value="adjustments">FX Adjustments</TabsTrigger>
                    </TabsList>

                    {/* Consolidated Balance Sheet Tab */}
                    <TabsContent value="consolidated">
                        <Card className="border-t-4 border-t-blue-500">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileSpreadsheet className="h-5 w-5" /> Consolidated Balance Sheet
                                        </CardTitle>
                                        <CardDescription>Hierarchical account view with entity drill-down</CardDescription>
                                    </div>
                                    <ExportButton
                                        data={exportData}
                                        filename={`consolidation-${runId}`}
                                    />

                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {balances.map((balance) => (
                                        <div key={balance.account}>
                                            <div
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                                                onClick={() => setExpandedAccount(expandedAccount === balance.account ? null : balance.account)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedAccount === balance.account ? 'rotate-90' : ''}`} />
                                                    <span className="font-medium">{balance.account}</span>
                                                </div>
                                                <div className="flex gap-8 text-sm">
                                                    <div className="text-right">
                                                        <div className="text-xs text-muted-foreground mb-1">Pre-Elim</div>
                                                        <div className="font-mono">${balance.preElimination.toFixed(0)}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-muted-foreground mb-1">Eliminations</div>
                                                        <div className="font-mono text-orange-600">${balance.eliminations.toFixed(0)}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-muted-foreground mb-1">Consolidated</div>
                                                        <div className="font-mono font-bold">${balance.consolidated.toFixed(0)}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {expandedAccount === balance.account && (
                                                <div className="ml-8 mt-2 p-4 bg-muted/50 rounded-lg">
                                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Entity Breakdown</h4>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Entity</TableHead>
                                                                <TableHead>Currency</TableHead>
                                                                <TableHead className="text-right">Original</TableHead>
                                                                <TableHead className="text-right">Rate</TableHead>
                                                                <TableHead className="text-right">Translated (USD)</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {balance.entities.map((entity) => (
                                                                <TableRow key={entity.entityName}>
                                                                    <TableCell className="font-medium">{entity.entityName}</TableCell>
                                                                    <TableCell><Badge variant="outline">{entity.currency}</Badge></TableCell>
                                                                    <TableCell className="text-right font-mono">{entity.originalAmount.toFixed(0)}</TableCell>
                                                                    <TableCell className="text-right font-mono">{entity.rate.toFixed(4)}</TableCell>
                                                                    <TableCell className="text-right font-mono font-bold">${entity.translatedAmount.toFixed(0)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* FX Adjustments Tab */}
                    <TabsContent value="adjustments">
                        <Card className="border-t-4 border-t-purple-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" /> Translation Adjustments
                                </CardTitle>
                                <CardDescription>FX gain/loss by account and entity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Account</TableHead>
                                            <TableHead>Entity</TableHead>
                                            <TableHead>Orig Currency</TableHead>
                                            <TableHead className="text-right">FX Gain/(Loss)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {adjustments.map((adj, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{adj.account}</TableCell>
                                                <TableCell>{adj.entity}</TableCell>
                                                <TableCell><Badge variant="outline">{adj.originalCurrency}</Badge></TableCell>
                                                <TableCell className={`text-right font-mono font-bold ${adj.fxGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {adj.fxGainLoss >= 0 ? '+' : ''}${adj.fxGainLoss.toFixed(0)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
