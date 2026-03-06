import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { KanbanBoard } from "@/components/ui/KanbanBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, DollarSign, Calendar, User, Sparkles, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type OpportunityStage = "DISCOVERY" | "QUALIFICATION" | "PROPOSAL" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";

interface Opportunity {
    id: string;
    name: string;
    accountName: string;
    amount: number;
    closeDate: string;
    stage: OpportunityStage;
    probability: number;
    owner: string;
    aiWinProbability?: number;
    productLine?: string;
}

interface StageConfig {
    id: OpportunityStage;
    label: string;
    color: string;
    bgColor: string;
}

const STAGES: StageConfig[] = [
    { id: "DISCOVERY", label: "Discovery", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
    { id: "QUALIFICATION", label: "Qualification", color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200" },
    { id: "PROPOSAL", label: "Proposal", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
    { id: "NEGOTIATION", label: "Negotiation", color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200" },
    { id: "CLOSED_WON", label: "Closed Won", color: "text-green-700", bgColor: "bg-green-50 border-green-200" },
    { id: "CLOSED_LOST", label: "Closed Lost", color: "text-red-700", bgColor: "bg-red-50 border-red-200" }
];

export default function OpportunityPipeline() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedOwner, setSelectedOwner] = useState<string>("all");
    const [selectedProduct, setSelectedProduct] = useState<string>("all");
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

    // Fetch opportunities
    const { data: opportunities = [] } = useQuery<Opportunity[]>({
        queryKey: ["opportunities", selectedOwner, selectedProduct],
        queryFn: async () => {
            let url = "/api/crm/opportunities?";
            if (selectedOwner !== "all") url += `owner=${selectedOwner}&`;
            if (selectedProduct !== "all") url += `product=${selectedProduct}&`;

            const res = await fetch(url);
            return res.json();
        }
    });

    // Fetch AI analysis
    const { data: aiAnalysis } = useQuery<any>({
        queryKey: ["opportunity-ai", selectedOpportunity?.id],
        queryFn: async () => {
            if (!selectedOpportunity) return null;
            const res = await fetch(`/api/crm/opportunities/${selectedOpportunity.id}/analyze`, {
                method: "POST"
            });
            return res.json();
        },
        enabled: !!selectedOpportunity
    });

    // Update stage mutation
    const updateStageMutation = useMutation({
        mutationFn: async ({ id, stage }: { id: string; stage: OpportunityStage }) => {
            const res = await fetch(`/api/crm/opportunities/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stage })
            });
            if (!res.ok) throw new Error("Failed to update");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["opportunities"] });
            toast({
                title: "Stage Updated",
                description: "Opportunity moved successfully"
            });
        }
    });

    // Group opportunities by stage
    const opportunitiesByStage = STAGES.reduce((acc, stage) => {
        const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
        acc[stage.id] = safeOpportunities.filter(opp => opp.stage === stage.id);
        return acc;
    }, {} as Record<OpportunityStage, Opportunity[]>);

    // Calculate stage metrics
    const getStageMetrics = (stage: OpportunityStage) => {
        const opps = opportunitiesByStage[stage] || [];
        const count = opps.length;
        const totalValue = opps.reduce((sum, opp) => sum + opp.amount, 0);
        const avgProbability = count > 0
            ? opps.reduce((sum, opp) => sum + opp.probability, 0) / count
            : 0;

        return { count, totalValue, avgProbability };
    };

    const handleDragEnd = (opportunityId: string, newStage: string) => {
        updateStageMutation.mutate({ id: opportunityId, stage: newStage as OpportunityStage });
    };

    return (
        <StandardPage
            title="Opportunity Pipeline"
            description="Visual sales pipeline with AI-powered insights"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Pipeline" }
            ]}
        >
            <div className="space-y-4">
                {/* Filters */}
                <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Owner:</label>
                        <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Owners</SelectItem>
                                <SelectItem value="john">John Doe</SelectItem>
                                <SelectItem value="jane">Jane Smith</SelectItem>
                                <SelectItem value="bob">Bob Wilson</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Product:</label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Products</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="starter">Starter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                        Total Pipeline: <span className="font-bold text-foreground">${opportunities.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* Kanban Board */}
                <KanbanBoard<Opportunity>
                    columns={STAGES.map(s => ({ id: s.id, title: s.label, color: s.color, bgColor: s.bgColor }))}
                    items={opportunities || []}
                    getColumnId={(opp) => opp.stage}
                    onDragEnd={handleDragEnd}
                    onCardClick={setSelectedOpportunity}
                    renderColumnHeader={(column) => {
                        const metrics = getStageMetrics(column.id as OpportunityStage);
                        return (
                            <Card className={cn(`${column.bgColor} border-2 mb-3`)}>
                                <CardHeader className="pb-3">
                                    <CardTitle className={cn(`text-sm ${column.color}`)}>
                                        {column.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Count:</span>
                                            <span className="font-semibold">{metrics.count}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Value:</span>
                                            <span className="font-semibold">${(metrics.totalValue / 1000).toFixed(0)}K</span>
                                        </div>
                                        {column.id !== "CLOSED_WON" && column.id !== "CLOSED_LOST" && (
                                            <div className="flex justify-between">
                                                <span>Avg %:</span>
                                                <span className="font-semibold">{metrics.avgProbability.toFixed(0)}%</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    }}
                    renderCard={(opp) => (
                        <Card className="cursor-grab active:cursor-grabbing border-none">
                            <CardContent className="p-3 space-y-2">
                                <div className="font-semibold text-sm line-clamp-2">
                                    {opp.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {opp.accountName}
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-green-700">
                                    <DollarSign className="h-3 w-3" />
                                    ${(opp.amount / 1000).toFixed(0)}K
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(opp.closeDate)}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {opp.probability}%
                                    </Badge>
                                </div>
                                {opp.aiWinProbability && (
                                    <div className="flex items-center gap-1 text-xs text-purple-700">
                                        <Sparkles className="h-3 w-3" />
                                        AI: {opp.aiWinProbability}% win
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                />

                {/* Opportunity Detail Dialog */}
                {selectedOpportunity && (
                    <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{selectedOpportunity.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Account</label>
                                        <div className="text-sm text-muted-foreground">{selectedOpportunity.accountName}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Amount</label>
                                        <div className="text-sm font-bold">${selectedOpportunity.amount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Close Date</label>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDate(selectedOpportunity.closeDate)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Owner</label>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {selectedOpportunity.owner}
                                        </div>
                                    </div>
                                </div>

                                {aiAnalysis && (
                                    <Card className="bg-purple-50 border-purple-200">
                                        <CardHeader>
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <Sparkles className="h-4 w-4" />
                                                AI Insights
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <div>
                                                <span className="font-medium">Win Probability: </span>
                                                <span className="text-purple-700 font-bold">{aiAnalysis.winProbability}%</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Next Best Action: </span>
                                                <span>{aiAnalysis.nextAction}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Risk Factors: </span>
                                                <span className="text-red-600">{aiAnalysis.risks?.join(", ")}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </StandardPage>
    );
}
