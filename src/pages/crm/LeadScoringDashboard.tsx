import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Sparkles, User, Mail, Building, ArrowRight, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    title: string;
    score: number;
    source: string;
    status: "NEW" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED";
    createdAt: string;
    scoringBreakdown: {
        demographic: number;
        behavioral: number;
        firmographic: number;
    };
    aiRecommendation?: {
        nextAction: string;
        contactTime: string;
        priority: "HIGH" | "MEDIUM" | "LOW";
    };
}

interface ScoreDistribution {
    range: string;
    count: number;
    color: string;
}

export default function LeadScoringDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedScore, setSelectedScore] = useState<string>("all");
    const [selectedSource, setSelectedSource] = useState<string>("all");

    // Fetch leads
    const { data: leads = [] } = useQuery<Lead[]>({
        queryKey: ["leads", selectedScore, selectedSource],
        queryFn: async () => {
            let url = "/api/crm/leads?";
            if (selectedScore !== "all") url += `scoreRange=${selectedScore}&`;
            if (selectedSource !== "all") url += `source=${selectedSource}&`;

            const res = await fetch(url);
            return res.json();
        }
    });

    // Bulk assign mutation
    const bulkAssignMutation = useMutation({
        mutationFn: async ({ leadIds, assignTo }: { leadIds: string[]; assignTo: string }) => {
            const res = await fetch("/api/crm/leads/bulk-assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadIds, assignTo })
            });
            if (!res.ok) throw new Error("Failed to assign");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast({
                title: "Leads Assigned",
                description: "Hot leads assigned to sales rep successfully"
            });
        }
    });

    // Calculate score distribution
    const scoreDistribution: ScoreDistribution[] = [
        { range: "0-20", count: leads.filter(l => l.score <= 20).length, color: "#ef4444" },
        { range: "21-40", count: leads.filter(l => l.score > 20 && l.score <= 40).length, color: "#f97316" },
        { range: "41-60", count: leads.filter(l => l.score > 40 && l.score <= 60).length, color: "#eab308" },
        { range: "61-80", count: leads.filter(l => l.score > 60 && l.score <= 80).length, color: "#84cc16" },
        { range: "81-100", count: leads.filter(l => l.score > 80).length, color: "#22c55e" }
    ];

    // Hot leads (score > 80)
    const hotLeads = leads.filter(l => l.score > 80);

    // Conversion funnel
    const funnelData = [
        { stage: "Lead", count: leads.length },
        { stage: "MQL", count: leads.filter(l => l.score > 50).length },
        { stage: "SQL", count: leads.filter(l => l.score > 70).length },
        { stage: "Opp", count: leads.filter(l => l.score > 85).length }
    ];

    const avgScore = leads.length > 0
        ? leads.reduce((sum, l) => sum + l.score, 0) / leads.length
        : 0;

    return (
        <StandardPage
            title="Lead Scoring Dashboard"
            description="AI-powered lead qualification and prioritization"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Lead Scoring" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{leads.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                Hot Leads
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{hotLeads.length}</div>
                            <div className="text-xs text-green-700">Score &gt; 80</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Avg Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">{avgScore.toFixed(0)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase">Conversion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">
                                {leads.length > 0 ? ((funnelData[3].count / leads.length) * 100).toFixed(0) : 0}%
                            </div>
                            <div className="text-xs text-amber-700">Lead → Opportunity</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Score Distribution Chart */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle>Lead Score Distribution</CardTitle>
                        <CardDescription>Distribution of leads across score ranges</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={scoreDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {scoreDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Score:</label>
                        <Select value={selectedScore} onValueChange={setSelectedScore}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Scores</SelectItem>
                                <SelectItem value="hot">Hot (81-100)</SelectItem>
                                <SelectItem value="warm">Warm (61-80)</SelectItem>
                                <SelectItem value="cold">Cold (0-60)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Source:</label>
                        <Select value={selectedSource} onValueChange={setSelectedSource}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="referral">Referral</SelectItem>
                                <SelectItem value="trade-show">Trade Show</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {hotLeads.length > 0 && (
                        <Button
                            className="ml-auto"
                            onClick={() => bulkAssignMutation.mutate({
                                leadIds: hotLeads.map(l => l.id),
                                assignTo: "sales-team"
                            })}
                        >
                            <Target className="h-4 w-4 mr-2" />
                            Assign {hotLeads.length} Hot Leads
                        </Button>
                    )}
                </div>

                {/* Hot Leads Table */}
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-green-600" />
                            Hot Leads (Score &gt; 80)
                        </CardTitle>
                        <CardDescription>High-priority leads requiring immediate attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Breakdown</TableHead>
                                    <TableHead>AI Recommendation</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hotLeads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No hot leads at the moment
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    hotLeads.map((lead) => (
                                        <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {lead.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Building className="h-3 w-3 text-muted-foreground" />
                                                    {lead.company}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{lead.title}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status="active" label={String(lead.score)} />
                                                    <Progress value={lead.score} className="w-20" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-1">
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-muted-foreground">Demo:</span>
                                                        <span className="font-medium">{lead.scoringBreakdown.demographic}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-muted-foreground">Behav:</span>
                                                        <span className="font-medium">{lead.scoringBreakdown.behavioral}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-muted-foreground">Firmo:</span>
                                                        <span className="font-medium">{lead.scoringBreakdown.firmographic}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {lead.aiRecommendation && (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Sparkles className="h-3 w-3 text-purple-600" />
                                                            <span className="font-medium">{lead.aiRecommendation.nextAction}</span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Best time: {lead.aiRecommendation.contactTime}
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                lead.aiRecommendation.priority === "HIGH" ? "text-red-600" :
                                                                    lead.aiRecommendation.priority === "MEDIUM" ? "text-amber-600" :
                                                                        "text-blue-600"
                                                            }
                                                        >
                                                            {lead.aiRecommendation.priority}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={lead.status === "QUALIFIED" ? "default" : "outline"}>
                                                    {lead.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Conversion Funnel */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle>Lead Conversion Funnel</CardTitle>
                        <CardDescription>Lead progression through qualification stages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {funnelData.map((stage, index) => (
                                <div key={stage.stage} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{stage.stage}</span>
                                            {index < funnelData.length - 1 && (
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{stage.count}</span>
                                            {index > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    ({((stage.count / funnelData[index - 1].count) * 100).toFixed(0)}% conversion)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Progress value={(stage.count / funnelData[0].count) * 100} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
