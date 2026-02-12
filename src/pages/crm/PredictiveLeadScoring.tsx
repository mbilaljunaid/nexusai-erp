import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, Target, Star, Users, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function PredictiveLeadScoring() {
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [minScore, setMinScore] = useState(0);

    const { data: leads } = useQuery({
        queryKey: ["/api/crm/leads-with-scores", filterStatus, minScore],
        queryFn: () => apiRequest(`/api/crm/leads-with-scores?status=${filterStatus}&minScore=${minScore}`),
    });

    const { data: scoringModel } = useQuery({
        queryKey: ["/api/crm/scoring-model"],
        queryFn: () => apiRequest("/api/crm/scoring-model"),
    });

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 bg-green-50";
        if (score >= 60) return "text-blue-600 bg-blue-50";
        if (score >= 40) return "text-orange-600 bg-orange-50";
        return "text-red-600 bg-red-50";
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Predictive Lead Scoring</h1>
                    <p className="text-muted-foreground">AI-powered lead qualification and prioritization</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Leads
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Hot Leads (80+)</div>
                        <div className="text-3xl font-bold mt-1 text-green-600">
                            {leads?.filter((l: any) => l.score >= 80).length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Warm Leads (60-79)</div>
                        <div className="text-3xl font-bold mt-1 text-blue-600">
                            {leads?.filter((l: any) => l.score >= 60 && l.score < 80).length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Cold Leads (40-59)</div>
                        <div className="text-3xl font-bold mt-1 text-orange-600">
                            {leads?.filter((l: any) => l.score >= 40 && l.score < 60).length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Avg Score</div>
                        <div className="text-3xl font-bold mt-1">
                            {leads && leads.length > 0
                                ? (leads.reduce((sum: number, l: any) => sum + l.score, 0) / leads.length).toFixed(0)
                                : 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium">Status Filter</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Leads</SelectItem>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="CONTACTED">Contacted</SelectItem>
                            <SelectItem value="QUALIFIED">Qualified</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium">Min Score</label>
                    <Input
                        type="number"
                        value={minScore}
                        onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
                        min="0"
                        max="100"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Scored Leads</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {leads?.map((lead: any) => (
                            <div key={lead.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="font-semibold text-lg">{lead.name}</div>
                                            <Badge>{lead.status}</Badge>
                                            {lead.score >= 80 && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {lead.company} • {lead.email}
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Lead Score</span>
                                                <span className={`font-bold px-3 py-1 rounded ${getScoreColor(lead.score)}`}>
                                                    {lead.score}/100
                                                </span>
                                            </div>
                                            <Progress value={lead.score} className="h-2" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                            <div>
                                                <div className="text-muted-foreground">Engagement</div>
                                                <div className="font-medium">{lead.engagementScore}/100</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">Fit Score</div>
                                                <div className="font-medium">{lead.fitScore}/100</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">Intent</div>
                                                <div className="font-medium">{lead.intentScore}/100</div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="text-xs text-muted-foreground">Key factors:</div>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {lead.scoringFactors?.map((factor: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {factor}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button size="sm">View Details</Button>
                                        <Button size="sm" variant="outline">Convert</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Scoring Model Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {scoringModel?.factors?.map((factor: any) => (
                            <div key={factor.name} className="border rounded-lg p-4">
                                <div className="font-medium">{factor.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">Weight: {factor.weight}%</div>
                                <Progress value={factor.weight} className="h-2 mt-2" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
