
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Activity } from "lucide-react";

interface ProjectHealthCardProps {
    metrics: {
        cpi: number;
        spi: number;
        budget: number;
        actualCost: number;
        earnedValue: number;
        plannedValue: number;
        eac: number;
    };
    alerts: string[];
}

export function ProjectHealthCard({ metrics, alerts }: ProjectHealthCardProps) {
    // Helpers for Status Colors
    const getCpiColor = (val: number) => {
        if (val >= 1.0) return "text-emerald-600";
        if (val >= 0.9) return "text-amber-600";
        return "text-rose-600";
    };

    const getSpiColor = (val: number) => {
        if (val >= 1.0) return "text-emerald-600";
        if (val >= 0.9) return "text-amber-600";
        return "text-rose-600";
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="space-y-4">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-t-4 border-t-primary">
                    <CardHeader className="py-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground">CPI (Cost Performance)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-black ${getCpiColor(metrics.cpi)} flex items-center gap-2`}>
                            {metrics.cpi.toFixed(2)}
                            {metrics.cpi >= 1 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader className="py-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground">SPI (Schedule Performance)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-black ${getSpiColor(metrics.spi)} flex items-center gap-2`}>
                            {metrics.spi.toFixed(2)}
                            {metrics.spi >= 1 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground">Cost Variance (EV - AC)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.earnedValue - metrics.actualCost >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(metrics.earnedValue - metrics.actualCost)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground">Est. at Completion (EAC)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-700">
                            {formatCurrency(metrics.eac)}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Budget: {formatCurrency(metrics.budget)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-rose-800 flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4" /> Project Health Alerts
                    </h4>
                    <div className="space-y-1">
                        {alerts.map((alert, i) => (
                            <div key={i} className="text-xs text-rose-700 flex items-start gap-2">
                                <span>•</span>
                                <span>{alert}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
