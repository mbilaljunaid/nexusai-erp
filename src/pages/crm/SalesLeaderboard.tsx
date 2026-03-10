import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Target, TrendingUp, Medal, Flame, Star, Crown } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface LeaderboardEntry {
    id: string;
    rank: number;
    name: string;
    avatar?: string;
    role: string;
    quota: number;
    attainment: number;
    ytdEarnings: number;
    acceleratorTier: number;
    recentWins: number;
}

export default function SalesLeaderboard() {
    const [period, setPeriod] = useState("Q3_2026");

    const leaderboardData: LeaderboardEntry[] = [
        { id: "REP-01", rank: 1, name: "Sarah Jenkins", role: "Enterprise AE", quota: 1500000, attainment: 1850000, ytdEarnings: 215000, acceleratorTier: 3, recentWins: 4 },
        { id: "REP-02", rank: 2, name: "Michael Ross", role: "Enterprise AE", quota: 1500000, attainment: 1450000, ytdEarnings: 145000, acceleratorTier: 1, recentWins: 2 },
        { id: "REP-03", rank: 3, name: "Jessica Day", role: "Mid-Market AE", quota: 800000, attainment: 920000, ytdEarnings: 98000, acceleratorTier: 2, recentWins: 6 },
        { id: "REP-04", rank: 4, name: "David Kim", role: "Mid-Market AE", quota: 800000, attainment: 750000, ytdEarnings: 65000, acceleratorTier: 0, recentWins: 1 },
        { id: "REP-05", rank: 5, name: "Emily Chen", role: "SMB AE", quota: 400000, attainment: 410000, ytdEarnings: 42000, acceleratorTier: 1, recentWins: 12 },
    ];

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2: return <Medal className="h-6 w-6 text-slate-400" />;
            case 3: return <Medal className="h-6 w-6 text-amber-700" />;
            default: return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{rank}</span>;
        }
    };

    const getTierBadge = (tier: number) => {
        switch (tier) {
            case 3: return <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 border-none"><Flame className="h-3 w-3 mr-1" /> 3x Platinum Base</Badge>;
            case 2: return <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 border-none"><Star className="h-3 w-3 mr-1" /> 2x Gold Base</Badge>;
            case 1: return <Badge variant="secondary"><Target className="h-3 w-3 mr-1" /> Silver Target</Badge>;
            default: return <Badge variant="outline" className="text-muted-foreground">Standard Tier</Badge>;
        }
    };

    return (
        <StandardPage
            title="Sales Leaderboard"
            description="Real-time gamification dashboard tracking quota attainment and commission accelerators."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Incentives", href: "/crm/incentives" },
                { label: "Leaderboard" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200 dark:from-yellow-950/20 dark:to-amber-950/20 dark:border-amber-900/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Crown className="w-24 h-24 text-yellow-500" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-1">Top Performer</p>
                        <h3 className="text-2xl font-black mb-1">{leaderboardData[0].name}</h3>
                        <p className="text-sm text-amber-700 font-medium mb-4">{formatCurrency(leaderboardData[0].attainment)} Attained</p>
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                            {((leaderboardData[0].attainment / leaderboardData[0].quota) * 100).toFixed(0)}% to Quota
                        </Badge>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-indigo-200 dark:from-purple-950/20 dark:to-indigo-950/20 dark:border-indigo-900/50">
                    <CardContent className="p-6">
                        <p className="text-sm font-bold text-indigo-800 uppercase tracking-widest mb-1">Highest Accelerator</p>
                        <h3 className="text-2xl font-black mb-1">{leaderboardData[0].name}</h3>
                        <p className="text-sm text-indigo-700 font-medium mb-4">Tier 3 Matrix Reached</p>
                        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200">
                            12% Target Rate
                        </Badge>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-emerald-900/50">
                    <CardContent className="p-6">
                        <p className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-1">Most Deals Closed</p>
                        <h3 className="text-2xl font-black mb-1">{leaderboardData[4].name}</h3>
                        <p className="text-sm text-emerald-700 font-medium mb-4">{leaderboardData[4].recentWins} Deals Closed in {period.split('_')[0]}</p>
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
                            Volume Leader
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Trophy className="h-5 w-5 text-primary" /> Global Standings
                    </CardTitle>
                    <CardDescription>Ranked by Total Quota Attainment Percentage</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {leaderboardData.map((rep, index) => {
                            const attainmentPct = (rep.attainment / rep.quota) * 100;
                            const isOverQuota = attainmentPct >= 100;

                            return (
                                <div key={rep.id} className={`p-4 md:p-6 hover:bg-muted/20 transition-colors flex flex-col md:flex-row items-center gap-6 ${index === 0 ? 'bg-amber-50/10' : ''}`}>
                                    <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[250px]">
                                        <div className="flex-shrink-0 w-8 flex justify-center">
                                            {getRankIcon(rep.rank)}
                                        </div>
                                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                            <AvatarFallback className={index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}>
                                                {rep.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-lg leading-none mb-1">{rep.name}</p>
                                            <p className="text-xs text-muted-foreground">{rep.role}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-muted-foreground">
                                                {formatCurrency(rep.attainment)} <span className="text-xs font-normal text-muted-foreground/70">/ {formatCurrency(rep.quota)}</span>
                                            </span>
                                            <span className={`font-bold ${isOverQuota ? 'text-green-600' : 'text-primary'}`}>
                                                {attainmentPct.toFixed(1)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.min(attainmentPct, 100)}
                                            className="h-2"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between w-full md:w-auto md:min-w-[300px] gap-4">
                                        <div className="text-right flex-1">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">YTD Earnings</p>
                                            <p className="font-black text-lg text-emerald-600">{formatCurrency(rep.ytdEarnings)}</p>
                                        </div>
                                        <div className="w-[140px] flex justify-end">
                                            {getTierBadge(rep.acceleratorTier)}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
