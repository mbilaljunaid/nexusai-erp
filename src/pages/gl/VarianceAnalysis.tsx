import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, ArrowRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VarianceData {
    account: string;
    currentPeriod: number;
    priorPeriod: number;
    variance: number;
    variancePct: number;
}

export default function VarianceAnalysis() {
    const [currentPeriod, setCurrentPeriod] = useState("Jan-2026");
    const [priorPeriod, setPriorPeriod] = useState("Dec-2025");

    // Fetch variance data
    const { data: variance = [], isLoading } = useQuery<VarianceData[]>({
        queryKey: ["consolidation-variance", currentPeriod, priorPeriod],
        queryFn: async () => {
            // Mock - replace with API
            return [
                { account: "Cash and Cash Equivalents", currentPeriod: 5200000, priorPeriod: 5000000, variance: 200000, variancePct: 4.0 },
                { account: "Accounts Receivable", currentPeriod: 3500000, priorPeriod: 3800000, variance: -300000, variancePct: -7.89 },
                { account: "Inventory", currentPeriod: 2800000, priorPeriod: 2700000, variance: 100000, variancePct: 3.70 },
                { account: "Fixed Assets", currentPeriod: 10200000, priorPeriod: 10000000, variance: 200000, variancePct: 2.0 },
                { account: "Intercompany Receivables", currentPeriod: 0, priorPeriod: 0, variance: 0, variancePct: 0 },
                { account: "Total Assets", currentPeriod: 21700000, priorPeriod: 21500000, variance: 200000, variancePct: 0.93 }
            ];
        }
    });

    // Chart data (top variances)
    const chartData = variance
        .filter(v => v.account !== "Total Assets")
        .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
        .slice(0, 5);

    const totalVariance = variance.find(v => v.account === "Total Assets")?.variance || 0;
    const totalVariancePct = variance.find(v => v.account === "Total Assets")?.variancePct || 0;

    const significantIncreases = variance.filter(v => v.variancePct > 5 && v.account !== "Total Assets").length;
    const significantDecreases = variance.filter(v => v.variancePct < -5 && v.account !== "Total Assets").length;

    return (
        <StandardPage
            title="Period-over-Period Variance Analysis"
            description="Compare consolidated financial results across accounting periods."
            breadcrumbs={[
                { label: "General Ledger", href: "/gl" },
                { label: "Consolidation", href: "/gl/consolidation" },
                { label: "Variance Analysis" }
            ]}
        >
            <div className="space-y-6">
                {/* Period Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Period Comparison</CardTitle>
                        <CardDescription>Select periods to analyze</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Period</label>
                                <Select value={currentPeriod} onValueChange={setCurrentPeriod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Jan-2026">Jan-2026</SelectItem>
                                        <SelectItem value="Feb-2026">Feb-2026</SelectItem>
                                        <SelectItem value="Dec-2025">Dec-2025</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-center">
                                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prior Period</label>
                                <Select value={priorPeriod} onValueChange={setPriorPeriod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dec-2025">Dec-2025</SelectItem>
                                        <SelectItem value="Nov-2025">Nov-2025</SelectItem>
                                        <SelectItem value="Jan-2025">Jan-2025</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={totalVariance >= 0 ? "bg-green-500/10 border-green-100" : "bg-red-500/10 border-red-100"}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase flex items-center gap-2">
                                {totalVariance >= 0 ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                Total Variance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={cn(`text-2xl font-bold ${totalVariance >= 0 ? 'text-green-900 dark:text-green-200' : 'text-red-900'}`)}>
                                {totalVariance >= 0 ? '+' : ''}${totalVariance.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {totalVariancePct >= 0 ? '+' : ''}{totalVariancePct.toFixed(2)}% change
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Significant Increases
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">{significantIncreases}</div>
                            <p className="text-xs text-muted-foreground mt-1">{'>'}5% growth</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
                                <TrendingDown className="h-4 w-4" />
                                Significant Decreases
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{significantDecreases}</div>
                            <p className="text-xs text-muted-foreground mt-1">{'<'}-5% decline</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Variance Chart */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle>Top Variances</CardTitle>
                        <CardDescription>Accounts with largest period-over-period changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="account" angle={-45} textAnchor="end" height={120} />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="variance" name="Variance">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.variance >= 0 ? '#22c55e' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Variance Table */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle>Detailed Variance Analysis</CardTitle>
                        <CardDescription>
                            Comparing {currentPeriod} vs {priorPeriod}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">{currentPeriod}</TableHead>
                                    <TableHead className="text-right">{priorPeriod}</TableHead>
                                    <TableHead className="text-right">Variance ($)</TableHead>
                                    <TableHead className="text-right">Variance (%)</TableHead>
                                    <TableHead>Trend</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {variance.map((row) => (
                                    <TableRow key={row.account} className={row.account === "Total Assets" ? "bg-muted font-bold" : ""}>
                                        <TableCell>{row.account}</TableCell>
                                        <TableCell className="text-right font-mono">${row.currentPeriod.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono">${row.priorPeriod.toLocaleString()}</TableCell>
                                        <TableCell className={cn(`text-right font-mono font-bold ${row.variance >= 0 ? 'text-green-600' : 'text-red-600'}`)}>
                                            {row.variance >= 0 ? '+' : ''}${row.variance.toLocaleString()}
                                        </TableCell>
                                        <TableCell className={cn(`text-right font-mono ${row.variance >= 0 ? 'text-green-600' : 'text-red-600'}`)}>
                                            {row.variancePct >= 0 ? '+' : ''}{row.variancePct.toFixed(2)}%
                                        </TableCell>
                                        <TableCell>
                                            {Math.abs(row.variancePct) > 5 ? (
                                                <Badge variant={row.variancePct > 0 ? "default" : "destructive"} className={row.variancePct > 0 ? "bg-orange-600" : ""}>
                                                    {Math.abs(row.variancePct) > 10 ? "High" : "Moderate"}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Normal</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Alerts for Significant Changes */}
                {(significantIncreases > 0 || significantDecreases > 0) && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Attention Required</AlertTitle>
                        <AlertDescription>
                            {significantIncreases > 0 && `${significantIncreases} account(s) show significant increases (>5%). `}
                            {significantDecreases > 0 && `${significantDecreases} account(s) show significant decreases (<-5%). `}
                            Review these variances for potential issues or business changes.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </StandardPage>
    );
}
