import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface DataPoint {
    label: string;
    value: number;
}

interface SimpleBarChartProps {
    title: string;
    data: DataPoint[];
    color?: "blue" | "green" | "purple" | "orange";
    icon?: LucideIcon;
}

export function SimpleBarChart({ title, data, color = "blue", icon: Icon }: SimpleBarChartProps) {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
    const total = useMemo(() => data.reduce((sum, d) => d.value + sum, 0), [data]);
    const avgValue = useMemo(() => total / data.length, [total, data.length]);

    const trend = useMemo(() => {
        if (data.length < 2) return null;
        const first = data[0].value;
        const last = data[data.length - 1].value;
        const change = first === 0 ? 0 : ((last - first) / first) * 100;
        return { direction: change >= 0 ? 'up' : 'down', percentage: Math.abs(change).toFixed(1) };
    }, [data]);

    const colorClasses = {
        blue: { bar: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700", light: "bg-blue-200" },
        green: { bar: "bg-green-500", bg: "bg-green-50", text: "text-green-700", light: "bg-green-200" },
        purple: { bar: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700", light: "bg-purple-200" },
        orange: { bar: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700", light: "bg-orange-200" }
    };

    const colors = colorClasses[color];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4" />}
                        {title}
                    </CardTitle>
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {trend.direction === 'up' ? (
                                <TrendingUp className="h-4 w-4" />
                            ) : (
                                <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="font-medium">{trend.percentage}%</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Bar Chart */}
                    <div className="flex items-end gap-2 h-32">
                        {data.map((item, idx) => {
                            const heightPercent = (item.value / maxValue) * 100;
                            const isAboveAvg = item.value > avgValue;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    {/* Bar */}
                                    <div className="w-full flex items-end justify-center h-full">
                                        <div
                                            className={`w-full rounded-t ${isAboveAvg ? colors.bar : colors.light} transition-all hover:opacity-80 relative group`}
                                            style={{ height: `${Math.max(heightPercent, 5)}%` }}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {item.value}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Label */}
                                    <span className="text-xs text-muted-foreground truncate w-full text-center">
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats */}
                    <div className={`flex items-center justify-between p-3 rounded-lg ${colors.bg}`}>
                        <div>
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className={`text-lg font-bold ${colors.text}`}>{total}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Average</p>
                            <p className={`text-lg font-bold ${colors.text}`}>{avgValue.toFixed(1)}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
