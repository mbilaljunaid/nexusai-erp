import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

export default function CampaignDetail() {
    const params = useParams() as any;

    const { data, isLoading } = useQuery<any>({
        queryKey: [`/api/crm/campaigns/${params?.id}/stats`],
        queryFn: async () => {
            const res = await fetch(`/api/crm/campaigns/${params?.id}/stats`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    if (isLoading) return <div className="p-8">Loading stats...</div>;

    const { campaign, stats } = data || {};

    return (
        <StandardPage
            title={campaign?.name || "Campaign Stats"}
            description="Campaign Performance & ROI Analysis"
        >

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className={stats?.roi > 0 ? "bg-green-500/10 border-green-200" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ROI</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">{stats?.roi}%</div>
                        <p className="text-xs text-muted-foreground">Return on Investment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue Won</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${formatNumber(Number(stats?.totalRevenue))}</div>
                        <p className="text-xs text-muted-foreground">From {stats?.wonDeals} deals</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${formatNumber(Number(stats?.totalCost))}</div>
                        <p className="text-xs text-muted-foreground">Actual / Budget</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Members</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalMembers}</div>
                        <p className="text-xs text-muted-foreground">Leads & Contacts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Funnel Visualization */}
            <Card>
                <CardHeader>
                    <CardTitle>Campaign Funnel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Total Opportunities Created</span>
                            <span className="font-bold">{stats?.totalDeals}</span>
                        </div>
                        <Progress value={100} className="h-2 bg-slate-100" indicatorClassName="bg-blue-200" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Won Opportunities</span>
                            <span className="font-bold">{stats?.wonDeals}</span>
                        </div>
                        <Progress value={stats?.conversionRate} className="h-2 bg-slate-100" indicatorClassName="bg-green-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mt-2">Conversion Rate: <span className="font-bold text-foreground">{stats?.conversionRate}%</span></p>
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
