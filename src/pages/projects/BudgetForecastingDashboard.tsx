import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, Sparkles, Play, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ForecastData {
    period: string;
    actual?: number;
    predicted: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
}

interface AIInsight {
    type: "warning" | "opportunity" | "recommendation";
    title: string;
    description: string;
    impact: number;
}

interface ScenarioConfig {
    name: string;
    laborCostMultiplier: number;
    materialCostMultiplier: number;
    overheadMultiplier: number;
    durationAdjustment: number;
}

export default function BudgetForecastingDashboard() {
    const { projectId } = useParams<{ projectId: string }>();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedScenario, setSelectedScenario] = useState<ScenarioConfig>({
        name: "Baseline",
        laborCostMultiplier: 1.0,
        materialCostMultiplier: 1.0,
        overheadMultiplier: 1.0,
        durationAdjustment: 0
    });
    const [forecastHorizon, setForecastHorizon] = useState<number>(6); // months

    // Fetch forecast data
    const { data: forecastData = [], isLoading: forecastLoading } = useQuery<ForecastData[]>({
        queryKey: ["budget-forecast", projectId, forecastHorizon],
        queryFn: async () => {
            const res = await fetch(`/api/ppm/forecasting/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, horizonMonths: forecastHorizon })
            });
            return res.json();
        },
        enabled: !!projectId
    });

    // Fetch AI insights
    const { data: insights = [] } = useQuery<AIInsight[]>({
        queryKey: ["forecast-insights", projectId],
        queryFn: async () => {
            const res = await fetch(`/api/ppm/forecasting/insights?projectId=${projectId}`);
            return res.json();
        },
        enabled: !!projectId
    });

    // Run scenario mutation
    const scenarioMutation = useMutation({
        mutationFn: async (scenario: ScenarioConfig) => {
            const res = await fetch(`/api/ppm/forecasting/scenarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, scenario })
            });
            if (!res.ok) throw new Error("Scenario analysis failed");
            return res.json();
        },
        onSuccess: (result) => {
            toast({
                title: "Scenario Complete",
                description: `Predicted budget: ${formatCurrency(result.totalPredicted)}`
            });
        }
    });

    // Retrain model mutation
    const retrainMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/ppm/forecasting/train`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId })
            });
            if (!res.ok) throw new Error("Model training failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-forecast"] });
            toast({
                title: "Model Retrained",
                description: "Forecast updated with latest data."
            });
        }
    });

    const avgConfidence = forecastData.length > 0
        ? forecastData.reduce((sum, d) => sum + d.confidence, 0) / forecastData.length
        : 0;

    const totalPredicted = forecastData.reduce((sum, d) => sum + d.predicted, 0);
    const totalActual = forecastData.reduce((sum, d) => sum + (d.actual || 0), 0);
    const variance = totalPredicted - totalActual;

    const getInsightIcon = (type: AIInsight["type"]) => {
        if (type === "warning") return <AlertTriangle className="h-4 w-4 text-orange-600" />;
        if (type === "opportunity") return <TrendingUp className="h-4 w-4 text-green-600" />;
        return <Sparkles className="h-4 w-4 text-blue-600" />;
    };

    return (
        <StandardPage
            title="AI Budget Forecasting"
            description="ML-powered budget predictions with scenario modeling and confidence intervals."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "AI Forecasting" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase flex items-center gap-2">
                                <Brain className="h-4 w-4" /> Model Confidence
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">{formatPercent(avgConfidence, 0)}</div>
                            <p className="text-xs text-purple-700 mt-1">Prediction accuracy</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Predicted Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{formatCurrency(totalPredicted)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Actual to Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{formatCurrency(totalActual)}</div>
                        </CardContent>
                    </Card>
                    <Card className={cn(`${variance >= 0 ? 'bg-orange-500/10 border-orange-100' : 'bg-green-500/10 border-green-100'}`)}>
                        <CardHeader className="pb-2">
                            <CardTitle className={cn(`text-xs font-bold uppercase ${variance >= 0 ? 'text-orange-800' : 'text-green-800'}`)}>
                                Variance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={cn(`text-2xl font-bold ${variance >= 0 ? 'text-orange-900 dark:text-orange-200' : 'text-green-900'}`)}>
                                {variance >= 0 ? '+' : ''}{formatCurrency(Math.abs(variance))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="forecast" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="forecast">Forecast Chart</TabsTrigger>
                        <TabsTrigger value="scenarios">Scenario Modeling</TabsTrigger>
                        <TabsTrigger value="insights">AI Insights</TabsTrigger>
                    </TabsList>

                    {/* Forecast Chart Tab */}
                    <TabsContent value="forecast" className="space-y-4">
                        <Card className="border-t-4 border-t-purple-500">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" /> Budget Forecast
                                        </CardTitle>
                                        <CardDescription>ML-predicted budget with confidence intervals</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={forecastHorizon.toString()} onValueChange={(v) => setForecastHorizon(Number(v))}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">3 Months</SelectItem>
                                                <SelectItem value="6">6 Months</SelectItem>
                                                <SelectItem value="12">12 Months</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => retrainMutation.mutate()}
                                            disabled={retrainMutation.isPending}
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            {retrainMutation.isPending ? "Training..." : "Retrain Model"}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <AreaChart data={forecastData}>
                                        <defs>
                                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="upperBound"
                                            stackId="1"
                                            stroke="none"
                                            fill="url(#colorConfidence)"
                                            name="Upper Bound"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="lowerBound"
                                            stackId="2"
                                            stroke="none"
                                            fill="url(#colorConfidence)"
                                            name="Lower Bound"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="predicted"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            name="AI Prediction"
                                            dot={{ fill: '#8b5cf6', r: 5 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="actual"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            name="Actual"
                                            strokeDasharray="5 5"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Scenario Modeling Tab */}
                    <TabsContent value="scenarios" className="space-y-4">
                        <Card className="border-t-4 border-t-blue-500">
                            <CardHeader>
                                <CardTitle>Scenario Builder</CardTitle>
                                <CardDescription>Adjust variables to model different budget scenarios</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Labor Cost Multiplier: {formatNumber(selectedScenario.laborCostMultiplier, 2)}x</Label>
                                            <Slider
                                                value={[selectedScenario.laborCostMultiplier]}
                                                onValueChange={([v]) => setSelectedScenario({ ...selectedScenario, laborCostMultiplier: v })}
                                                min={0.5}
                                                max={2.0}
                                                step={0.1}
                                            />
                                            <p className="text-xs text-muted-foreground">Adjust labor cost assumptions</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Material Cost Multiplier: {formatNumber(selectedScenario.materialCostMultiplier, 2)}x</Label>
                                            <Slider
                                                value={[selectedScenario.materialCostMultiplier]}
                                                onValueChange={([v]) => setSelectedScenario({ ...selectedScenario, materialCostMultiplier: v })}
                                                min={0.5}
                                                max={2.0}
                                                step={0.1}
                                            />
                                            <p className="text-xs text-muted-foreground">Adjust material cost assumptions</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Overhead Multiplier: {formatNumber(selectedScenario.overheadMultiplier, 2)}x</Label>
                                            <Slider
                                                value={[selectedScenario.overheadMultiplier]}
                                                onValueChange={([v]) => setSelectedScenario({ ...selectedScenario, overheadMultiplier: v })}
                                                min={0.5}
                                                max={2.0}
                                                step={0.1}
                                            />
                                            <p className="text-xs text-muted-foreground">Adjust overhead assumptions</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Duration Adjustment: {selectedScenario.durationAdjustment > 0 ? '+' : ''}{selectedScenario.durationAdjustment} months</Label>
                                            <Slider
                                                value={[selectedScenario.durationAdjustment]}
                                                onValueChange={([v]) => setSelectedScenario({ ...selectedScenario, durationAdjustment: v })}
                                                min={-6}
                                                max={6}
                                                step={1}
                                            />
                                            <p className="text-xs text-muted-foreground">Extend or compress timeline</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={() => scenarioMutation.mutate(selectedScenario)}
                                    disabled={scenarioMutation.isPending}
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    {scenarioMutation.isPending ? "Calculating..." : "Run Scenario Analysis"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Insights Tab */}
                    <TabsContent value="insights" className="space-y-4">
                        <Card className="border-t-4 border-t-green-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" /> AI-Powered Insights
                                </CardTitle>
                                <CardDescription>Proactive recommendations from budget analysis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {insights.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No insights available yet. Model needs more data.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {insights.map((insight, idx) => (
                                            <Card key={idx} className={cn(`${insight.type === 'warning' ? 'bg-orange-500/10 border-orange-200' :
                                                insight.type === 'opportunity' ? 'bg-green-500/10 border-green-200' :
                                                    'bg-blue-500/10 border-blue-200'
                                                }`)}>
                                                <CardContent className="pt-4">
                                                    <div className="flex items-start gap-3">
                                                        {getInsightIcon(insight.type)}
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                                                            <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                                                            <Badge variant="outline">
                                                                Impact: {formatCurrency(insight.impact)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
