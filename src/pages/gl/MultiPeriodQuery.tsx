import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";
import {
    Download,
    TrendingUp,
    TrendingDown,
    Calendar,
    Filter,
    BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Period {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    year: number;
}

interface QueryColumn {
    id: string;
    periodId: number;
    type: 'ACTUAL' | 'BUDGET' | 'VARIANCE';
}

export default function MultiPeriodQuery() {
    const [ledgerId, setLedgerId] = useState("");
    const [accountFrom, setAccountFrom] = useState("");
    const [accountTo, setAccountTo] = useState("");
    const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
    const [comparisonType, setComparisonType] = useState<'PERIOD_TO_PERIOD' | 'YEAR_OVER_YEAR' | 'BUDGET'>('PERIOD_TO_PERIOD');
    const [showVariance, setShowVariance] = useState(true);
    const [showTrend, setShowTrend] = useState(true);

    // Fetch ledgers
    const { data: ledgers } = useQuery({
        queryKey: ["/api/gl/ledgers"],
        queryFn: () => apiRequest("/api/gl/ledgers"),
    });

    // Fetch periods
    const { data: periods } = useQuery({
        queryKey: ["/api/gl/periods"],
        queryFn: () => apiRequest("/api/gl/periods?status=OPEN,CLOSED"),
    });

    // Fetch multi-period data
    const { data: queryData, isLoading } = useQuery({
        queryKey: [
            "/api/gl/multi-period-query",
            ledgerId,
            accountFrom,
            accountTo,
            selectedPeriods,
            comparisonType,
        ],
        queryFn: () =>
            apiRequest("/api/gl/multi-period-query", {
                method: "POST",
                body: JSON.stringify({
                    ledgerId: parseInt(ledgerId),
                    accountFrom,
                    accountTo,
                    periodIds: selectedPeriods,
                    comparisonType,
                    includeVariance: showVariance,
                    includeTrend: showTrend,
                }),
            }),
        enabled: !!ledgerId && selectedPeriods.length > 0,
    });

    const togglePeriod = (periodId: number) => {
        setSelectedPeriods((prev) =>
            prev.includes(periodId)
                ? prev.filter((id) => id !== periodId)
                : [...prev, periodId]
        );
    };

    const calculateVariance = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / Math.abs(previous)) * 100;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value);
    };

    const formatPercent = (value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Multi-Period Query & Analysis</h1>
                    <p className="text-muted-foreground">
                        Cross-period analysis, trending, and variance reporting
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export to Excel
                    </Button>
                    <Button variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Visualize Trends
                    </Button>
                </div>
            </div>

            {/* Query Builder */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Filter className="h-5 w-5 mr-2" />
                        Query Parameters
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <Label>Ledger</Label>
                            <Select value={ledgerId} onValueChange={setLedgerId}>
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
                        <div>
                            <Label>Account From</Label>
                            <Input
                                value={accountFrom}
                                onChange={(e) => setAccountFrom(e.target.value)}
                                placeholder="e.g., 1000"
                            />
                        </div>
                        <div>
                            <Label>Account To</Label>
                            <Input
                                value={accountTo}
                                onChange={(e) => setAccountTo(e.target.value)}
                                placeholder="e.g., 9999"
                            />
                        </div>
                        <div>
                            <Label>Comparison Type</Label>
                            <Select
                                value={comparisonType}
                                onValueChange={(value: any) => setComparisonType(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERIOD_TO_PERIOD">Period to Period</SelectItem>
                                    <SelectItem value="YEAR_OVER_YEAR">Year over Year</SelectItem>
                                    <SelectItem value="BUDGET">Actual vs Budget</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Period Selector */}
                    <div>
                        <Label>Select Periods for Analysis</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {periods?.map((period: Period) => (
                                <Badge
                                    key={period.id}
                                    variant={selectedPeriods.includes(period.id) ? "default" : "outline"}
                                    className="cursor-pointer px-3 py-1"
                                    onClick={() => togglePeriod(period.id)}
                                >
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {period.name} {period.year}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {selectedPeriods.length} period(s) selected
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {isLoading && (
                <Card>
                    <CardContent className="flex justify-center items-center h-64">
                        <div className="text-muted-foreground">Loading analysis...</div>
                    </CardContent>
                </Card>
            )}

            {queryData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-auto">
                            <table className="w-full">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="text-left p-3 border-r">Account</th>
                                        <th className="text-left p-3 border-r">Description</th>
                                        {queryData.periods.map((period: any) => (
                                            <th key={period.id} className="text-right p-3 border-r">
                                                <div>{period.name}</div>
                                                <div className="text-xs font-normal text-muted-foreground">
                                                    {new Date(period.startDate).toLocaleDateString()}
                                                </div>
                                            </th>
                                        ))}
                                        {showVariance && queryData.periods.length > 1 && (
                                            <th className="text-right p-3 border-r bg-blue-50">
                                                <div>Variance</div>
                                                <div className="text-xs font-normal text-muted-foreground">
                                                    % Change
                                                </div>
                                            </th>
                                        )}
                                        {showTrend && queryData.periods.length > 2 && (
                                            <th className="text-center p-3 bg-purple-50">
                                                <div>Trend</div>
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {queryData.accounts?.map((account: any) => (
                                        <tr key={account.accountCode} className="border-t hover:bg-accent">
                                            <td className="p-3 border-r font-mono">
                                                {account.accountCode}
                                            </td>
                                            <td className="p-3 border-r">{account.description}</td>
                                            {account.periods.map((periodData: any, i: number) => (
                                                <td key={i} className="text-right p-3 border-r">
                                                    <div className="font-medium">
                                                        {formatCurrency(periodData.actual)}
                                                    </div>
                                                    {comparisonType === 'BUDGET' && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Budget: {formatCurrency(periodData.budget)}
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                            {showVariance && account.periods.length > 1 && (
                                                <td className="text-right p-3 border-r bg-blue-50">
                                                    <div
                                                        className={`font-medium ${account.variance >= 0
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                            }`}
                                                    >
                                                        {account.variance >= 0 ? (
                                                            <TrendingUp className="h-4 w-4 inline mr-1" />
                                                        ) : (
                                                            <TrendingDown className="h-4 w-4 inline mr-1" />
                                                        )}
                                                        {formatPercent(account.variance)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatCurrency(account.varianceAmount)}
                                                    </div>
                                                </td>
                                            )}
                                            {showTrend && account.periods.length > 2 && (
                                                <td className="text-center p-3 bg-purple-50">
                                                    <div className="flex justify-center">
                                                        {account.trend === 'INCREASING' && (
                                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                                        )}
                                                        {account.trend === 'DECREASING' && (
                                                            <TrendingDown className="h-5 w-5 text-red-600" />
                                                        )}
                                                        {account.trend === 'STABLE' && (
                                                            <div className="h-1 w-5 bg-gray-400 rounded" />
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                                {queryData.totals && (
                                    <tfoot className="bg-muted font-bold border-t-2">
                                        <tr>
                                            <td className="p-3 border-r" colSpan={2}>TOTAL</td>
                                            {queryData.totals.periods.map((total: number, i: number) => (
                                                <td key={i} className="text-right p-3 border-r">
                                                    {formatCurrency(total)}
                                                </td>
                                            ))}
                                            {showVariance && (
                                                <td className="text-right p-3 border-r bg-blue-50">
                                                    <div
                                                        className={
                                                            queryData.totals.variance >= 0
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }
                                                    >
                                                        {formatPercent(queryData.totals.variance)}
                                                    </div>
                                                </td>
                                            )}
                                            {showTrend && <td className="p-3 bg-purple-50"></td>}
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {/* Summary Statistics */}
                        {queryData.statistics && (
                            <div className="grid grid-cols-4 gap-4 mt-6">
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-sm text-muted-foreground">Avg Period Balance</div>
                                        <div className="text-2xl font-bold mt-1">
                                            {formatCurrency(queryData.statistics.avgBalance)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-sm text-muted-foreground">Max Period</div>
                                        <div className="text-2xl font-bold mt-1">
                                            {formatCurrency(queryData.statistics.maxBalance)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-sm text-muted-foreground">Min Period</div>
                                        <div className="text-2xl font-bold mt-1">
                                            {formatCurrency(queryData.statistics.minBalance)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-sm text-muted-foreground">Avg Growth Rate</div>
                                        <div className="text-2xl font-bold mt-1">
                                            {formatPercent(queryData.statistics.avgGrowth)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
