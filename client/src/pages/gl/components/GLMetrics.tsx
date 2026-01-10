import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
    FileText,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Database,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface GLStats {
    totalJournals: number;
    postedJournals: number;
    unpostedJournals: number;
    openPeriods: number;
    activeLedgers: number;
}

export function GLMetrics() {
    const { data: stats, isLoading } = useQuery<GLStats>({
        queryKey: ["/api/gl/stats"],
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <Skeleton className="h-4 w-24 mb-4" />
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: "Total Journals",
            value: stats?.totalJournals || 0,
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50",
            trend: "+12%",
            trendUp: true
        },
        {
            title: "Posted Batch",
            value: stats?.postedJournals || 0,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            trend: "94%",
            trendUp: true
        },
        {
            title: "Exceptions",
            value: stats?.unpostedJournals || 0,
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-50",
            trend: "Active",
            trendUp: false
        },
        {
            title: "Open Periods",
            value: stats?.openPeriods || 0,
            icon: Calendar,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            trend: "Q1 2024",
            trendUp: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group bg-white/80 backdrop-blur-md overflow-hidden relative">
                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${card.bg}/30 group-hover:scale-110 transition-transform`} />
                    <CardContent className="p-6 relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-xl ${card.bg}`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                            <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full ${card.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {card.trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : null}
                                {card.trend}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</h3>
                        </div>
                        <div className="mt-4">
                            <Progress
                                value={Math.min(100, (card.value / (stats?.totalJournals || 1)) * 100)}
                                className="h-1"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
