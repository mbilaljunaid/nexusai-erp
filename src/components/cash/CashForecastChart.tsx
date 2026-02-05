
import { useQuery } from "@tanstack/react-query";
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Scenario = "BASELINE" | "CONSERVATIVE" | "OPTIMISTIC";

export function CashForecastChart() {
    const [scenario, setScenario] = useState<Scenario>("BASELINE");

    const { data: forecast, isLoading } = useQuery<any>({
        queryKey: [`/api/cash/forecast`, { days: 30, scenario }],
    });

    const chartConfig = {
        balance: {
            label: "Projected Balance",
            color: "hsl(var(--primary))",
        },
    };

    if (isLoading) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </CardHeader>
                <CardContent className="h-[350px]">
                    <Skeleton className="h-full w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold">Liquidity Projection</CardTitle>
                    <CardDescription>30-day forecasted cash position across all entities</CardDescription>
                </div>
                <div className="flex bg-muted/50 p-1 rounded-lg gap-1 border">
                    {(["BASELINE", "CONSERVATIVE", "OPTIMISTIC"] as Scenario[]).map(s => (
                        <Button
                            key={s}
                            variant={scenario === s ? "secondary" : "ghost"}
                            size="sm"
                            className="text-[10px] h-7 px-2 font-semibold uppercase tracking-wider"
                            onClick={() => setScenario(s)}
                        >
                            {s}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full pt-4">
                    <ChartContainer config={chartConfig}>
                        <AreaChart
                            data={forecast?.dailyForecasts || []}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => format(new Date(date), "MMM dd")}
                                style={{ fontSize: '10px' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                hide
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="var(--color-balance)"
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                                strokeWidth={2.5}
                                animationDuration={1500}
                                animationEasing="ease-in-out"
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>
                <div className="mt-4 flex items-center justify-between px-2">
                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase">Closing Balance</span>
                            <span className="text-lg font-bold">{formatCurrency(forecast?.summary?.closingBalance || 0)}</span>
                        </div>
                        <div className="flex flex-col border-l pl-4">
                            <span className="text-[10px] text-muted-foreground uppercase">Net Change</span>
                            <span className={`text-lg font-bold ${forecast?.summary?.netChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {forecast?.summary?.netChange >= 0 ? '+' : ''}{formatCurrency(forecast?.summary?.netChange || 0)}
                            </span>
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground bg-muted p-1 px-2 rounded font-mono">
                        AI MODEL: L4-TREASURY-QUANT
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
