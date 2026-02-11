import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

interface CostForecast {
    month: string;
    budgeted: number;
    actual: number;
    predicted: number;
    confidence: number; // 0-100
}

interface CostVariance {
    category: string;
    budgeted: number;
    forecasted: number;
    variance: number;
    variancePercent: number;
}

interface CostForecastingPanelProps {
    projectId: string;
}

/**
 * Cost Forecasting Panel
 * 
 * ML-based cost prediction using:
 * - Historical burn rate
 * - Resource utilization trends
 * - Market price predictions
 * - Schedule progress correlation
 * - Change order patterns
 */
export function CostForecastingPanel({ projectId }: CostForecastingPanelProps) {
    const [timeframe, setTimeframe] = useState<string>("6");

    // Mock forecast data - in production, fetch from ML API
    const forecastData: CostForecast[] = [
        { month: "Jan", budgeted: 500000, actual: 520000, predicted: 520000, confidence: 95 },
        { month: "Feb", budgeted: 1200000, actual: 1150000, predicted: 1150000, confidence: 95 },
        { month: "Mar", budgeted: 1800000, actual: 0, predicted: 1920000, confidence: 87 },
        { month: "Apr", budgeted: 2400000, actual: 0, predicted: 2580000, confidence: 82 },
        { month: "May", budgeted: 3000000, actual: 0, predicted: 3280000, confidence: 75 },
        { month: "Jun", budgeted: 3500000, actual: 0, predicted: 3890000, confidence: 68 }
    ];

    const varianceData: CostVariance[] = [
        {
            category: "Labor",
            budgeted: 1500000,
            forecasted: 1680000,
            variance: 180000,
            variancePercent: 12
        },
        {
            category: "Materials",
            budgeted: 2000000,
            forecasted: 2150000,
            variance: 150000,
            variancePercent: 7.5
        },
        {
            category: "Equipment",
            budgeted: 500000,
            forecasted: 480000,
            variance: -20000,
            variancePercent: -4
        },
        {
            category: "Subcontractors",
            budgeted: 1800000,
            forecasted: 1950000,
            variance: 150000,
            variancePercent: 8.3
        }
    ];

    const totalBudgeted = varianceData.reduce((sum, item) => sum + item.budgeted, 0);
    const totalForecasted = varianceData.reduce((sum, item) => sum + item.forecasted, 0);
    const totalVariance = totalForecasted - totalBudgeted;
    const totalVariancePercent = ((totalVariance / totalBudgeted) * 100).toFixed(1);

    const formatCurrency = (value: number) => {
        return `$${(value / 1000).toFixed(0)}k`;
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Total Budget</span>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">${(totalBudgeted / 1000000).toFixed(1)}M</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Forecasted Cost</span>
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                            ${(totalForecasted / 1000000).toFixed(1)}M
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Variance</span>
                            {totalVariance > 0 ? (
                                <ArrowUpRight className="h-4 w-4 text-red-600" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 text-green-600" />
                            )}
                        </div>
                        <div className={cn(
                            "text-2xl font-bold",
                            totalVariance > 0 ? "text-red-600" : "text-green-600"
                        )}>
                            {totalVariance > 0 ? "+" : ""}${(Math.abs(totalVariance) / 1000).toFixed(0)}k
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {totalVariancePercent}% over budget
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">ML Confidence</span>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold">87%</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            High accuracy
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Forecast Chart */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Cost Forecast Over Time</CardTitle>
                        <Select value={timeframe} onValueChange={setTimeframe}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3 Months</SelectItem>
                                <SelectItem value="6">6 Months</SelectItem>
                                <SelectItem value="12">12 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={forecastData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                            <Tooltip
                                formatter={(value: any) => `$${(value / 1000000).toFixed(2)}M`}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="budgeted"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.1}
                                name="Budgeted"
                            />
                            <Area
                                type="monotone"
                                dataKey="actual"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.2}
                                name="Actual"
                            />
                            <Area
                                type="monotone"
                                dataKey="predicted"
                                stroke="#f59e0b"
                                fill="#f59e0b"
                                fillOpacity={0.2}
                                strokeDasharray="5 5"
                                name="Predicted"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Variance by Category */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Forecast Variance by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {varianceData.map(item => {
                            const isOverBudget = item.variance > 0;
                            return (
                                <div key={item.category} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{item.category}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Budget: {formatCurrency(item.budgeted)} •
                                                Forecast: {formatCurrency(item.forecasted)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn(
                                                "font-bold",
                                                isOverBudget ? "text-red-600" : "text-green-600"
                                            )}>
                                                {isOverBudget ? "+" : ""}{formatCurrency(item.variance)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.variancePercent > 0 ? "+" : ""}{item.variancePercent}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 h-2">
                                        <div
                                            className="bg-blue-500 rounded-full"
                                            style={{ width: `${(item.budgeted / totalBudgeted) * 100}%` }}
                                        />
                                        {isOverBudget && (
                                            <div
                                                className="bg-red-500 rounded-full"
                                                style={{ width: `${(item.variance / totalBudgeted) * 100}%` }}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        ML-Generated Insights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                            <div>
                                <span className="font-medium">Labor cost trending 12% over budget</span> due to skilled worker shortage and overtime requirements.
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                            <div>
                                <span className="font-medium">Material costs expected to increase 7.5%</span> based on steel and lumber market forecasts.
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <TrendingDown className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                                <span className="font-medium">Equipment savings of 4%</span> achieved through efficient utilization scheduling.
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
