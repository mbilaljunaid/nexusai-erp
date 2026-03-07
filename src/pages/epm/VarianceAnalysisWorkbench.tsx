import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, TrendingUp, TrendingDown, FileText, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface VarianceItem {
    account: string;
    currentAmount: number;
    priorAmount: number;
    variance: number;
    variancePct: number;
    category: string;
}

interface AIExplanation {
    account: string;
    summary: string;
    drivers: string[];
    recommendation: string;
}

export default function VarianceAnalysisWorkbench() {
    const [currentPeriod, setCurrentPeriod] = useState("Jan-2026");
    const [priorPeriod, setPriorPeriod] = useState("Dec-2025");
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    // Fetch variance data
    const { data: variances = [] } = useQuery<VarianceItem[]>({
        queryKey: ["variance-analysis", currentPeriod, priorPeriod],
        queryFn: async () => {
            const res = await fetch(
                `/api/gl/reporting/explain-variance?periodId=${currentPeriod}&benchmarkPeriodId=${priorPeriod}`
            );
            return res.json();
        }
    });

    // Fetch AI explanation for selected account
    const { data: aiExplanation } = useQuery<AIExplanation>({
        queryKey: ["variance-explanation", selectedAccount, currentPeriod, priorPeriod],
        queryFn: async () => {
            if (!selectedAccount) return null;
            const res = await fetch(
                `/api/gl/reporting/explain-variance?periodId=${currentPeriod}&benchmarkPeriodId=${priorPeriod}&account=${selectedAccount}`
            );
            return res.json();
        },
        enabled: !!selectedAccount
    });

    // Calculate summary metrics
    const totalVariance = variances.reduce((sum, v) => sum + v.variance, 0);
    const significantIncreases = variances.filter(v => v.variancePct > 5).length;
    const significantDecreases = variances.filter(v => v.variancePct < -5).length;

    // Prepare chart data (top 10 variances by absolute value)
    const chartData = [...variances]
        .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
        .slice(0, 10)
        .map(v => ({
            account: v.account.length > 20 ? v.account.substring(0, 20) + "..." : v.account,
            variance: v.variance,
            variancePct: v.variancePct
        }));

    return (
        <StandardPage
            title="Variance Analysis Workbench"
            description="Period-over-period variance investigation with AI insights"
            breadcrumbs={[
                { label: "EPM", href: "/epm" },
                { label: "Variance Analysis" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Total Variance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={cn(`text-2xl font-bold flex items-center gap-2 ${totalVariance >= 0 ? 'text-green-900 dark:text-green-200' : 'text-red-900'}`)}>
                                {totalVariance >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                ${(Math.abs(totalVariance) / 1000).toFixed(0)}K
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Significant Increases</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{significantIncreases}</div>
                            <div className="text-xs text-green-600">Accounts &gt;5% increase</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase">Significant Decreases</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900 dark:text-red-200">{significantDecreases}</div>
                            <div className="text-xs text-red-600">Accounts &lt;-5% decrease</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Period Selectors */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Current Period:</label>
                        <Select value={currentPeriod} onValueChange={setCurrentPeriod}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Jan-2026">Jan 2026</SelectItem>
                                <SelectItem value="Dec-2025">Dec 2025</SelectItem>
                                <SelectItem value="Nov-2025">Nov 2025</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <span className="text-muted-foreground">vs</span>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Prior Period:</label>
                        <Select value={priorPeriod} onValueChange={setPriorPeriod}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Dec-2025">Dec 2025</SelectItem>
                                <SelectItem value="Nov-2025">Nov 2025</SelectItem>
                                <SelectItem value="Oct-2025">Oct 2025</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" className="ml-auto">
                        <FileText className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>

                {/* Variance Chart */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Top 10 Variances
                        </CardTitle>
                        <CardDescription>Accounts with highest variance (absolute value)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="account" angle={-45} textAnchor="end" height={100} />
                                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                    <Bar dataKey="variance" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.variance >= 0 ? "#10b981" : "#ef4444"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Variance Detail Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Variance Detail - {currentPeriod} vs {priorPeriod}</CardTitle>
                        <CardDescription>Click on an account for AI-powered explanation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Current</TableHead>
                                    <TableHead className="text-right">Prior</TableHead>
                                    <TableHead className="text-right">Variance ($)</TableHead>
                                    <TableHead className="text-right">Variance (%)</TableHead>
                                    <TableHead>Trend</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {variances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No variance data available for selected periods
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    variances.map((item) => {
                                        const isSignificant = Math.abs(item.variancePct) > 5;
                                        return (
                                            <TableRow
                                                key={item.account}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => setSelectedAccount(item.account)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                            >
                                                <TableCell className="font-medium">{item.account}</TableCell>
                                                <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                                                <TableCell className="text-right font-mono">${item.currentAmount.toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-mono">${item.priorAmount.toLocaleString()}</TableCell>
                                                <TableCell className={cn(`text-right font-mono ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`)}>
                                                    ${Math.abs(item.variance).toLocaleString()}
                                                </TableCell>
                                                <TableCell className={cn(`text-right font-mono ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`)}>
                                                    {item.variancePct.toFixed(1)}%
                                                </TableCell>
                                                <TableCell>
                                                    {isSignificant ? (
                                                        <Badge variant={item.variance >= 0 ? "default" : "destructive"}>
                                                            {Math.abs(item.variancePct) > 10 ? "High" : "Moderate"}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">Normal</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* AI Explanation Panel */}
                {selectedAccount && aiExplanation && (
                    <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                                AI Variance Explanation: {selectedAccount}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertDescription>{aiExplanation.summary}</AlertDescription>
                            </Alert>
                            <div>
                                <h4 className="font-semibold mb-2">Key Drivers:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {aiExplanation.drivers.map((driver, idx) => (
                                        <li key={idx} className="text-sm">{driver}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-3 bg-blue-500/10 border border-blue-100 rounded-lg">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Recommendation</h4>
                                <p className="text-sm text-blue-800">{aiExplanation.recommendation}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
