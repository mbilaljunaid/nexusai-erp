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
import { EnterpriseContextSwitcher } from "@/components/enterprise/EnterpriseContextSwitcher";
import {
    Download,
    TrendingUp,
    TrendingDown,
    Calendar,
    Filter,
    BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

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

    // Fetch ledgers - handled by EnterpriseContextSwitcher

    // Fetch periods
    const { data: periods } = useQuery({
        queryKey: ["/api/gl/periods"],
        queryFn: () => fetch("/api/gl/periods?status=OPEN,CLOSED").then(r => r.json()),
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
            fetch("/api/gl/multi-period-query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ledgerId: parseInt(ledgerId),
                    accountFrom,
                    accountTo,
                    periodIds: selectedPeriods,
                    comparisonType,
                    includeVariance: showVariance,
                    includeTrend: showTrend,
                }),
            }).then(r => r.json()),
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

    const queryColumns: SpreadsheetColumn<any>[] = [
        { id: "accountCode", header: "Account", width: "150px", cell: (row) => <span className={`font-mono ${row.isTotal ? 'font-bold' : ''}`}>{row.accountCode}</span> },
        { id: "description", header: "Description", width: "200px", cell: (row) => row.description },
        ...(queryData?.periods || []).map((period: any, i: number) => ({
            id: `period_${i}`,
            header: (
                <div className="text-right w-full">
                    <div>{period.name}</div>
                    <div className="text-xs font-normal text-muted-foreground mr-1">
                        {new Date(period.startDate).toLocaleDateString()}
                    </div>
                </div>
            ) as any,
            width: "150px",
            cell: (row: any) => {
                if (row.isTotal) {
                    return <div className="text-right font-bold w-full">{formatCurrency(row.periods[i])}</div>;
                }
                const periodData = row.periods[i];
                return (
                    <div className="text-right w-full">
                        <div className="font-medium">{formatCurrency(periodData.actual)}</div>
                        {comparisonType === 'BUDGET' && (
                            <div className="text-xs text-muted-foreground">
                                Budget: {formatCurrency(periodData.budget)}
                            </div>
                        )}
                    </div>
                );
            }
        })),
        ...(showVariance && (queryData?.periods?.length || 0) > 1 ? [{
            id: "variance",
            header: (
                <div className="text-right w-full">
                    <div>Variance</div>
                    <div className="text-xs font-normal text-muted-foreground mr-1">% Change</div>
                </div>
            ) as any,
            width: "150px",
            cell: (row: any) => {
                if (row.isTotal) {
                    return (
                        <div className={`text-right font-bold w-full ${row.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatPercent(row.variance)}
                        </div>
                    );
                }
                return (
                    <div className="text-right w-full">
                        <div className={`font-medium ${row.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {row.variance >= 0 ? <TrendingUp className="h-4 w-4 inline mr-1" /> : <TrendingDown className="h-4 w-4 inline mr-1" />}
                            {formatPercent(row.variance)}
                        </div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(row.varianceAmount)}</div>
                    </div>
                );
            }
        }] : []),
        ...(showTrend && (queryData?.periods?.length || 0) > 2 ? [{
            id: "trend",
            header: <div className="text-center w-full">Trend</div> as any,
            width: "100px",
            cell: (row: any) => {
                if (row.isTotal) return null;
                return (
                    <div className="flex justify-center w-full items-center h-full">
                        {row.trend === 'INCREASING' && <TrendingUp className="h-5 w-5 text-green-600" />}
                        {row.trend === 'DECREASING' && <TrendingDown className="h-5 w-5 text-red-600" />}
                        {row.trend === 'STABLE' && <div className="h-1 w-5 bg-gray-400 rounded" />}
                    </div>
                );
            }
        }] : [])
    ];

    const tableData = queryData ? [
        ...(queryData.accounts || []).map((account: any) => ({
            ...account,
            id: account.accountCode
        })),
        ...(queryData.totals ? [{
            id: "total_row",
            isTotal: true,
            accountCode: "TOTAL",
            description: "",
            periods: queryData.totals.periods,
            variance: queryData.totals.variance,
            trend: null
        }] : [])
    ] : [];

    return (
        <StandardPage
            title="Multi-Period Query & Analysis"
            description="Cross-period analysis, trending, and variance reporting"
            actions={
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
            }
        >

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
                        <div className="flex flex-col space-y-2 justify-end pb-1">
                            <EnterpriseContextSwitcher
                                type="ledger"
                                value={ledgerId || undefined}
                                onChange={(v) => setLedgerId(v || "")}
                            />
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
                        <div className="min-h-[400px] h-full border border-gray-200 rounded-lg">
                            <InteractiveSpreadsheet
                                columns={queryColumns}
                                data={tableData}
                                onChange={() => { }}
                                containerHeight="500px"
                            />
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
        </StandardPage>
    );
}
