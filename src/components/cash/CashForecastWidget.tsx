import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, Zap, AlertTriangle, Activity, Plus } from "lucide-react";
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Area
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ForecastDetail {
    source: "AR" | "AP" | "MANUAL";
    reference: string;
    amount: number;
    date: string;
    entityName?: string;
}

interface DailyForecast {
    date: string;
    openingBalance: number;
    inflow: number;
    outflow: number;
    netChange: number;
    closingBalance: number;
    details: ForecastDetail[];
}

export function CashForecastWidget() {
    const [scenario, setScenario] = useState<"BASELINE" | "OPTIMISTIC" | "PESSIMISTIC">("BASELINE");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Form State
    const [formData, setFormData] = useState({
        forecastDate: new Date().toISOString().split('T')[0],
        amount: "",
        type: "MANUAL",
        description: ""
    });

    const { data: forecast = [], isLoading } = useQuery<DailyForecast[]>({
        queryKey: ["/api/cash/forecast", { days: 5, scenario }],
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/cash/forecasts", {
                ...data,
                forecastDate: new Date(data.forecastDate), // Convert string to Date for backend
                amount: Number(data.amount)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/cash/forecast"] });
            setIsAddOpen(false);
            setFormData({
                forecastDate: new Date().toISOString().split('T')[0],
                amount: "",
                type: "MANUAL",
                description: ""
            });
            toast({
                title: "Adjustment Added",
                description: "The forecast has been updated."
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to add adjustment",
                variant: "destructive"
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || !formData.description) return;
        mutation.mutate(formData);
    };

    if (isLoading) {
        return <Skeleton className="w-full h-[400px] rounded-xl" />;
    }

    // Prepare chart data
    const chartData = forecast.map(day => ({
        date: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
        Balance: day.closingBalance,
        Inflow: day.inflow,
        Outflow: day.outflow,
    }));

    return (
        <Card className="col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            5-Day Liquidity Forecast
                            {scenario !== 'BASELINE' && (
                                <Badge variant="secondary" className={scenario === 'OPTIMISTIC' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                                    {scenario} SCENARIO
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Projected cash position including stress-test scenarios.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Adjustment
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Forecast Adjustment</DialogTitle>
                                    <DialogDescription>
                                        Manually add expected inflows or outflows (e.g., Tax, Payroll).
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            type="date"
                                            id="date"
                                            value={formData.forecastDate}
                                            onChange={e => setFormData({ ...formData, forecastDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            type="number"
                                            id="amount"
                                            placeholder="Use positive for Inflow, negative for Outflow"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">Positive for Inflow, Negative for Outflow</p>
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="type">Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={v => setFormData({ ...formData, type: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MANUAL">Manual Adjustment</SelectItem>
                                                <SelectItem value="TAX">Tax Payment</SelectItem>
                                                <SelectItem value="PAYROLL">Payroll</SelectItem>
                                                <SelectItem value="CAPEX">Capex</SelectItem>
                                                <SelectItem value="DIVIDEND">Dividend</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="desc">Description</Label>
                                        <Input
                                            id="desc"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={mutation.isPending}>
                                            {mutation.isPending ? "Adding..." : "Add Forecast"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <div className="flex bg-muted p-1 rounded-lg gap-1">
                            {/* Scenario Buttons */}
                            <Button
                                variant={scenario === "BASELINE" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-7 text-[10px] uppercase font-bold"
                                onClick={() => setScenario("BASELINE")}
                            >
                                <Activity className="w-3 h-3 mr-1" /> Baseline
                            </Button>
                            <Button
                                variant={scenario === "OPTIMISTIC" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-7 text-[10px] uppercase font-bold"
                                onClick={() => setScenario("OPTIMISTIC")}
                            >
                                <Zap className="w-3 h-3 mr-1" /> Optimistic
                            </Button>
                            <Button
                                variant={scenario === "PESSIMISTIC" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-7 text-[10px] uppercase font-bold"
                                onClick={() => setScenario("PESSIMISTIC")}
                            >
                                <AlertTriangle className="w-3 h-3 mr-1" /> Risk
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6B7280", fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                stroke="#6B7280"
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#9CA3AF"
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                            />
                            <Legend />

                            {/* Inflow Bar */}
                            <Bar yAxisId="right" dataKey="Inflow" fill="#22C55E" barSize={20} radius={[4, 4, 0, 0]} name="Inflow (AR + Adj)" />
                            {/* Outflow Bar */}
                            <Bar yAxisId="right" dataKey="Outflow" fill="#EF4444" barSize={20} radius={[4, 4, 0, 0]} name="Outflow (AP + Adj)" />

                            {/* Balance Line */}
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="Balance"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4, stroke: "#fff" }}
                                activeDot={{ r: 6 }}
                                name="Projected Balance"
                            />
                            <Area yAxisId="left" type="monotone" dataKey="Balance" fill="#3B82F6" fillOpacity={0.1} stroke="none" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="border rounded-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right text-green-600">Expected Inflow</TableHead>
                                <TableHead className="text-right text-red-600">Expected Outflow</TableHead>
                                <TableHead className="text-right">Net Change</TableHead>
                                <TableHead className="text-right font-bold">Closing Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {forecast.map((day) => (
                                <TableRow key={day.date}>
                                    <TableCell className="font-medium">
                                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600">
                                        {day.inflow > 0 ? `+${day.inflow.toLocaleString()}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-red-600">
                                        {day.outflow > 0 ? `-${day.outflow.toLocaleString()}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className={`flex items-center justify-end gap-1 ${day.netChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {day.netChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {Math.abs(day.netChange).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        ${day.closingBalance.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
