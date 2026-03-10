import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, DollarSign, Filter, PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function MarketingAttribution() {
    const [model, setModel] = useState<"FIRST_TOUCH" | "LAST_TOUCH" | "MULTI_TOUCH">("MULTI_TOUCH");
    const [timeframe, setTimeframe] = useState("Q3_2026");

    const { data: campaignData = [], isLoading } = useQuery({
        queryKey: ['/api/crm/marketing/attribution', timeframe],
        queryFn: async () => {
            const params = new URLSearchParams({ timeframe });
            const res = await fetch(`/api/crm/marketing/attribution?${params}`);
            if (!res.ok) {
                return [];
            }
            return res.json();
        }
    });

    const modelDescription = {
        FIRST_TOUCH: "Assigns 100% of revenue credit to the very first campaign a lead interacted with. Best for measuring brand awareness and lead generation.",
        LAST_TOUCH: "Assigns 100% of revenue credit to the last campaign a lead interacted with before the opportunity was created. Best for measuring bottom-of-funnel conversion.",
        MULTI_TOUCH: "Distributes revenue credit across all touched campaigns evenly (Linear) or weighted (W-Shaped/U-Shaped). Best for long B2B sales cycles."
    };

    const aggregatedData = [
        { name: "First Touch", value: campaignData.reduce((acc, c) => acc + c.firstTouch, 0) },
        { name: "Last Touch", value: campaignData.reduce((acc, c) => acc + c.lastTouch, 0) },
        { name: "Multi-Touch", value: campaignData.reduce((acc, c) => acc + c.multiTouch, 0) }
    ];

    const getAttributedRevenue = (campaign: any) => {
        if (model === "FIRST_TOUCH") return campaign.firstTouch || 0;
        if (model === "LAST_TOUCH") return campaign.lastTouch || 0;
        return campaign.multiTouch || 0;
    };

    const getROI = (campaign: any) => {
        const rev = getAttributedRevenue(campaign);
        if (!campaign.cost || campaign.cost === 0) return "0.0";
        return ((rev - campaign.cost) / campaign.cost * 100).toFixed(1);
    };

    const totalRevenue = campaignData.reduce((acc: number, c: any) => acc + getAttributedRevenue(c), 0);
    const totalCost = campaignData.reduce((acc: number, c: any) => acc + (c.cost || 0), 0);
    const overallROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost * 100).toFixed(1) : "0.0";

    const channelData = [
        { name: "Webinar", value: campaignData.filter((c: any) => c.type === "Webinar").reduce((acc: number, c: any) => acc + getAttributedRevenue(c), 0) },
        { name: "Paid Social", value: campaignData.filter((c: any) => c.type === "Paid Social").reduce((acc: number, c: any) => acc + getAttributedRevenue(c), 0) },
        { name: "Content", value: campaignData.filter((c: any) => c.type === "Content").reduce((acc: number, c: any) => acc + getAttributedRevenue(c), 0) },
        { name: "Email", value: campaignData.filter((c: any) => c.type === "Email").reduce((acc: number, c: any) => acc + getAttributedRevenue(c), 0) },
        { name: "Event", value: campaignData.filter((c: any) => c.type === "Event").reduce((acc: number, c: any) => acc + getAttributedRevenue(c), 0) }
    ].filter(channel => channel.value > 0); // Only show channels with revenue

    return (
        <StandardPage
            title="Marketing Attribution"
            description="Measure campaign ROI and understand which marketing touchpoints drive real revenue."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Marketing", href: "/crm/marketing" },
                { label: "Attribution" }
            ]}
        >
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Card className="flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 dark:from-indigo-950/30 dark:to-blue-950/30 dark:border-indigo-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-800 flex items-center gap-2">
                            <Target className="h-4 w-4" /> Attribution Model
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={model} onValueChange={(v: any) => setModel(v)}>
                            <SelectTrigger className="w-[200px] mb-2 bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FIRST_TOUCH">First-Touch</SelectItem>
                                <SelectItem value="LAST_TOUCH">Last-Touch</SelectItem>
                                <SelectItem value="MULTI_TOUCH">Multi-Touch (Linear)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2 max-w-sm">
                            {modelDescription[model]}
                        </p>
                    </CardContent>
                </Card>

                <Card className="flex-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-500" /> Attributed Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-sm text-green-600 font-medium mt-1">+14.5% vs Prev Quarter</p>
                    </CardContent>
                </Card>

                <Card className="flex-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" /> Overall Marketing ROI
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{overallROI}%</div>
                        <p className="text-sm text-muted-foreground mt-1">Total Spend: {formatCurrency(totalCost)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Campaign</CardTitle>
                        <CardDescription>Top performing campaigns based on {model.replace('_', ' ').toLowerCase()} attribution.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={campaignData} layout="vertical" margin={{ left: 50 }}>
                                <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                <Bar dataKey={model === "FIRST_TOUCH" ? "firstTouch" : model === "LAST_TOUCH" ? "lastTouch" : "multiTouch"} fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Channel</CardTitle>
                        <CardDescription>Attributed revenue split across marketing channels.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={channelData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {channelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Campaign ROI Performance</CardTitle>
                            <CardDescription>Detailed breakdown of spend, attribution and return on investment.</CardDescription>
                        </div>
                        <Select value={timeframe} onValueChange={setTimeframe}>
                            <SelectTrigger className="w-[150px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Q3_2026">Q3 2026</SelectItem>
                                <SelectItem value="Q2_2026">Q2 2026</SelectItem>
                                <SelectItem value="YTD">Year to Date</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Spend</TableHead>
                                <TableHead className="text-right">Attributed Revenue</TableHead>
                                <TableHead className="text-right">Leads</TableHead>
                                <TableHead className="text-right">Wins</TableHead>
                                <TableHead className="text-right">ROI</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaignData.map(campaign => {
                                const roi = parseFloat(getROI(campaign));
                                return (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-medium">{campaign.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{campaign.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{formatCurrency(campaign.cost)}</TableCell>
                                        <TableCell className="text-right font-semibold text-primary">{formatCurrency(getAttributedRevenue(campaign))}</TableCell>
                                        <TableCell className="text-right">{campaign.leads}</TableCell>
                                        <TableCell className="text-right">{campaign.wins}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={`font-bold ${roi > 1000 ? 'text-green-600' : roi > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {roi}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </StandardPage>
    );
}
