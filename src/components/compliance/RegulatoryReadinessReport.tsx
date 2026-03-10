import { cn } from "@/lib/utils";
import { useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileJson,
    FileText,
    Download,
    ShieldAlert,
    CheckCircle,
    TrendingDown,
    Activity
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

interface RegulatoryReadinessReportProps {
    data: {
        readiness: {
            score: number;
            totalViolations: number;
            resolvedCount: number;
            criticalUnresolved: number;
        };
        riskDistribution: { severity: string; count: string }[];
        auditSummary: { result: string; count: string }[];
    };
}

export function RegulatoryReadinessReport({ data }: RegulatoryReadinessReportProps) {
    const { readiness, riskDistribution, auditSummary } = data;

    const scoreColor = useMemo(() => {
        if (readiness.score >= 85) return "text-emerald-500 border-emerald-500 bg-emerald-500/10";
        if (readiness.score >= 60) return "text-amber-500 border-amber-500 bg-amber-500/10";
        return "text-rose-500 border-rose-500 bg-rose-500/10";
    }, [readiness.score]);

    const chartData = riskDistribution.map(d => ({
        name: d.severity.toUpperCase(),
        count: parseInt(d.count)
    }));

    const COLORS = {
        CRITICAL: "#ef4444",
        HIGH: "#f97316",
        MEDIUM: "#eab308",
        LOW: "#22c55e",
        GLOBAL: "#6366f1"
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-1 bg-card border-2 border-border shadow-sm rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground">Readiness Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-2">
                        <div className={cn(`w-28 h-28 rounded-full border-8 flex items-center justify-center ${scoreColor}`)}>
                            <span className="text-4xl font-extrabold">{readiness.score}%</span>
                        </div>
                        <p className="mt-4 text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            Enterprise Target: 95%
                        </p>
                    </CardContent>
                </Card>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 font-inter">
                    <div className="p-5 bg-indigo-600 rounded-2xl shadow-indigo-100 shadow-xl text-white relative overflow-hidden group">
                        <FileJson className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm font-medium text-indigo-100">Audit Package</h4>
                        <p className="text-2xl font-bold mt-1">Ready</p>
                        <Button variant="secondary" size="sm" className="mt-4 h-8 bg-card/20 text-white border-none hover:bg-card/30 backdrop-blur-md">
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Download JSON
                        </Button>
                    </div>

                    <div className="p-5 bg-card border border-border rounded-2xl shadow-sm flex flex-col justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-rose-500" />
                                Critical Exposures
                            </h4>
                            <p className="text-2xl font-bold mt-2 text-foreground dark:text-slate-200">{readiness.criticalUnresolved}</p>
                        </div>
                        <div className="mt-2">
                            <Badge variant="outline" className="text-rose-600 border-rose-100 bg-rose-500/10 text-[10px]">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Requires Action
                            </Badge>
                        </div>
                    </div>

                    <div className="p-5 bg-card border border-border rounded-2xl shadow-sm flex flex-col justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                Resolution Efficiency
                            </h4>
                            <p className="text-2xl font-bold mt-2 text-foreground dark:text-slate-200">
                                {readiness.totalViolations > 0
                                    ? Math.round((readiness.resolvedCount / readiness.totalViolations) * 100)
                                    : 100}%
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground/70 font-medium">Of total governance events</p>
                    </div>
                </div>
            </div>

            <Card className="rounded-2xl border-none bg-slate-500/10 ring-1 ring-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-card border-b border-border py-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-500" />
                            Risk Distribution & Compliance Health
                        </CardTitle>
                        <CardDescription>Breakdown of active governance rules by inherent risk severity.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 rounded-xl border-border">
                        <FileText className="h-4 w-4 mr-2" />
                        Full Disclosure Report
                    </Button>
                </CardHeader>
                <CardContent className="h-72 pt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.name] || COLORS.GLOBAL} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
