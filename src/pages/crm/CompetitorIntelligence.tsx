import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle, DollarSign, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { formatNumber } from "@/lib/formatters";

interface Competitor {
    id: string;
    name: string;
    logo?: string;
    tier: "TIER1" | "TIER2" | "TIER3";
    strengths: string[];
    weaknesses: string[];
    positioning: string;
    avgDealSize: number;
    marketShare: number;
}

interface BattleCard {
    competitorId: string;
    competitorName: string;
    keyDifferentiators: string[];
    commonObjections: { objection: string; response: string }[];
    winningStrategies: string[];
    pricingIntel: {
        avgDiscount: number;
        priceRange: { min: number; max: number };
    };
}

interface WinLossData {
    competitorId: string;
    competitorName: string;
    wins: number;
    losses: number;
    winRate: number;
    totalValue: number;
}

interface WinLossTrend {
    month: string;
    wins: number;
    losses: number;
}

export default function CompetitorIntelligence() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

    // Fetch competitors
    const { data: competitors = [] } = useQuery<Competitor[]>({
        queryKey: ["competitors"],
        queryFn: async () => {
            const res = await fetch("/api/crm/competitors");
            return res.json();
        }
    });

    // Fetch battle card
    const { data: battleCard } = useQuery<BattleCard>({
        queryKey: ["battle-card", selectedCompetitor?.id],
        queryFn: async () => {
            if (!selectedCompetitor) return null;
            const res = await fetch(`/api/crm/competitors/${selectedCompetitor.id}/battle-card`);
            return res.json();
        },
        enabled: !!selectedCompetitor
    });

    // Fetch win/loss analytics
    const { data: winLossData = [] } = useQuery<WinLossData[]>({
        queryKey: ["win-loss"],
        queryFn: async () => {
            const res = await fetch("/api/crm/analytics/win-loss");
            return res.json();
        }
    });

    // Fetch win/loss trends
    const { data: trends = [] } = useQuery<WinLossTrend[]>({
        queryKey: ["win-loss-trends"],
        queryFn: async () => {
            const res = await fetch("/api/crm/analytics/win-loss-trends");
            return res.json();
        }
    });

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "TIER1": return "bg-red-100 text-red-800 border-red-200";
            case "TIER2": return "bg-amber-100 text-amber-800 border-amber-200";
            case "TIER3": return "bg-blue-100 text-blue-800 border-blue-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <StandardPage
            title="Competitive Intelligence"
            description="Battle cards, win/loss analysis, and competitive positioning"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Competitor Intelligence" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Total Wins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">
                                {winLossData.reduce((sum, c) => sum + c.wins, 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase">Total Losses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900">
                                {winLossData.reduce((sum, c) => sum + c.losses, 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Overall Win Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">
                                {winLossData.length > 0
                                    ? formatNumber(((winLossData.reduce((sum, c) => sum + c.wins, 0) /
                                        (winLossData.reduce((sum, c) => sum + c.wins + c.losses, 0))) * 100), 0)
                                    : 0}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Win/Loss Trends */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle>Win/Loss Trends</CardTitle>
                        <CardDescription>Monthly competitive win/loss performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="wins" stroke="#22c55e" strokeWidth={2} name="Wins" />
                                <Line type="monotone" dataKey="losses" stroke="#ef4444" strokeWidth={2} name="Losses" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Tabs defaultValue="competitors" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="competitors">Competitor Overview</TabsTrigger>
                        <TabsTrigger value="winloss">Win/Loss Analysis</TabsTrigger>
                    </TabsList>

                    {/* Competitor Overview Tab */}
                    <TabsContent value="competitors" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {competitors.map((competitor) => (
                                <Card
                                    key={competitor.id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => setSelectedCompetitor(competitor)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg">{competitor.name}</CardTitle>
                                            <Badge className={getTierColor(competitor.tier)}>
                                                {competitor.tier}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-xs mt-2">
                                            {competitor.positioning}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold text-green-700 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Strengths
                                            </div>
                                            <ul className="text-xs space-y-1">
                                                {competitor.strengths.slice(0, 2).map((s, i) => (
                                                    <li key={i} className="text-muted-foreground">• {s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold text-red-700 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Weaknesses
                                            </div>
                                            <ul className="text-xs space-y-1">
                                                {competitor.weaknesses.slice(0, 2).map((w, i) => (
                                                    <li key={i} className="text-muted-foreground">• {w}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="pt-2 border-t flex justify-between text-xs">
                                            <div>
                                                <div className="text-muted-foreground">Avg Deal</div>
                                                <div className="font-bold">${formatNumber(competitor.avgDealSize / 1000, 0)}K</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">Market Share</div>
                                                <div className="font-bold">{competitor.marketShare}%</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Win/Loss Analysis Tab */}
                    <TabsContent value="winloss" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Win/Loss by Competitor</CardTitle>
                                <CardDescription>Head-to-head competitive performance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Competitor</TableHead>
                                            <TableHead className="text-right">Wins</TableHead>
                                            <TableHead className="text-right">Losses</TableHead>
                                            <TableHead className="text-right">Win Rate</TableHead>
                                            <TableHead className="text-right">Total Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {winLossData.map((data) => (
                                            <TableRow key={data.competitorId}>
                                                <TableCell className="font-medium">{data.competitorName}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className="text-green-700 border-green-700">
                                                        <TrendingUp className="h-3 w-3 mr-1" />
                                                        {data.wins}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className="text-red-700 border-red-700">
                                                        <TrendingDown className="h-3 w-3 mr-1" />
                                                        {data.losses}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={`font-bold ${data.winRate >= 70 ? "text-green-700" :
                                                        data.winRate >= 50 ? "text-amber-700" :
                                                            "text-red-700"
                                                        }`}>
                                                        {formatNumber(data.winRate, 0)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ${formatNumber(data.totalValue / 1000, 0)}K
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Battle Card Dialog */}
                {selectedCompetitor && battleCard && (
                    <Dialog open={!!selectedCompetitor} onOpenChange={() => setSelectedCompetitor(null)}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Battle Card: {battleCard.competitorName}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                {/* Key Differentiators */}
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Our Key Differentiators</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {battleCard.keyDifferentiators.map((diff, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <Award className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <span>{diff}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Common Objections */}
                                <Card className="border-l-4 border-l-amber-500">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Common Objections & Responses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {battleCard.commonObjections.map((item, i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                        <span className="font-medium text-sm">{item.objection}</span>
                                                    </div>
                                                    <div className="pl-6 text-sm text-muted-foreground bg-muted p-3 rounded">
                                                        {item.response}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Winning Strategies */}
                                <Card className="border-l-4 border-l-green-500">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Winning Strategies</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {battleCard.winningStrategies.map((strategy, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span>{strategy}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Pricing Intelligence */}
                                <Card className="border-l-4 border-l-purple-500">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Pricing Intelligence</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Average Discount:</span>
                                            <StatusBadge status="info" label={`${battleCard.pricingIntel.avgDiscount}%`} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Price Range:</span>
                                            <span className="font-mono font-medium">
                                                ${formatNumber(battleCard.pricingIntel.priceRange.min / 1000, 0)}K -
                                                ${formatNumber(battleCard.pricingIntel.priceRange.max / 1000, 0)}K
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </StandardPage>
    );
}
