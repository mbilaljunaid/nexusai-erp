// @ts-nocheck
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  ArrowLeft,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  TrendingUp,
  Plus,
  MoreVertical,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BrainCircuit,
  ShieldAlert
} from "lucide-react";
import { Link } from "wouter";
import { OpportunityForm } from "@/components/forms/OpportunityForm";
import { ActivityTimeline } from "@/components/crm/ActivityTimeline";
import type { Opportunity, Account } from "@shared/schema/crm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunityProductList } from "@/components/crm/OpportunityProductList";
import { OpportunityQuoteList } from "@/components/crm/OpportunityQuoteList";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StandardTable } from "@/components/ui/StandardTable";
import { Progress } from "@/components/ui/progress";
import { CompetitorList } from "@/components/crm/CompetitorList";

// AI Insights Component
function AiInsightsTab({ opportunityId }: { opportunityId: string }) {
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/ api / crm / opportunities / ${opportunityId}/analyze`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Analysis failed");
      return res.json();
    },
    onSuccess: (data) => setAnalysis(data)
  });

  if (!analysis && !analyzeMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 h-full">
        <div className="bg-primary/10 p-4 rounded-full">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Generate AI Insights</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
            Use our advanced AI engine to analyze this deal's win probability, risks, and next best actions.
          </p>
        </div>
        <Button onClick={() => analyzeMutation.mutate()} className="gap-2">
          <BrainCircuit className="h-4 w-4" />
          Analyze Opportunity
        </Button>
      </div>
    );
  }

  if (analyzeMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Analyzing deal dynamics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Win Probability */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Win Probability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between mb-2">
            <span className="text-4xl font-bold">{analysis.winProbability}%</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${analysis.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
              analysis.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
              {analysis.sentiment} Outlook
            </span>
          </div>
          <Progress value={analysis.winProbability} className="h-2" />
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            {analysis.reasoning}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {/* Risks */}
        <Card className="border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4" /> Key Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.risks.map((risk: string, i: number) => (
                <li key={i} className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-blue-100 dark:border-blue-900/20 bg-blue-50/50 dark:bg-blue-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <CheckCircle2 className="h-4 w-4" /> Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.nextSteps.map((step: string, i: number) => (
                <li key={i} className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// AI Insights Component - (kept as is, assuming it was correct above)

const formatCurrency = (val: string | number) => {
  const num = Number(val);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
};

export default function OpportunitiesDetail() {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  // Fetch opportunities with high limit for Kanban view
  const { data: fetchResult, isLoading } = useQuery<{ data: Opportunity[], pagination: any }>({
    queryKey: ["/api/crm/opportunities", "limit=100"],
    queryFn: () => fetch("/api/crm/opportunities?limit=100").then(res => res.json())
  });

  const opportunities = fetchResult?.data || [];

  const { data: accountsData } = useQuery<{ data: Account[] }>({
    queryKey: ["/api/crm/accounts"],
  });
  const accounts = accountsData?.data || [];

  // Calculate stats
  const pipelineValue = opportunities.reduce((acc, opp) => acc + Number(opp.amount), 0);
  const wonValue = opportunities.filter(o => o.stage === 'closed_won').reduce((acc, opp) => acc + Number(opp.amount), 0);
  const avgProbability = opportunities.length > 0 ? (opportunities.reduce((acc, opp) => acc + (opp.probability || 0), 0) / opportunities.length).toFixed(0) : 0;

  const metrics = [
    { label: "Pipeline Value", value: formatCurrency(pipelineValue), icon: TrendingUp, color: "text-blue-600" },
    { label: "Closed Won", value: formatCurrency(wonValue), icon: CheckCircle2, color: "text-green-600" },
    { label: "Avg. Probability", value: `${avgProbability}%`, icon: AlertCircle, color: "text-orange-600" },
  ];

  const filteredOpps = opportunities.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAccountName = (id: string | null) => {
    if (!id) return "Unknown Account";
    const acc = accounts.find(a => a.id === id);
    return acc ? acc.name : "Unknown Account";
  };

  const stages = [
    { id: "qualification", label: "Qualification", color: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-blue-200 dark:border-blue-800" },
    { id: "needs_analysis", label: "Needs Analysis", color: "bg-indigo-50 dark:bg-indigo-950/30", borderColor: "border-indigo-200 dark:border-indigo-800" },
    { id: "proposal", label: "Proposal", color: "bg-purple-50 dark:bg-purple-950/30", borderColor: "border-purple-200 dark:border-purple-800" },
    { id: "negotiation", label: "Negotiation", color: "bg-orange-50 dark:bg-orange-950/30", borderColor: "border-orange-200 dark:border-orange-800" },
    { id: "closed_won", label: "Closed Won", color: "bg-green-50 dark:bg-green-950/30", borderColor: "border-green-200 dark:border-green-800" },
    { id: "closed_lost", label: "Closed Lost", color: "bg-gray-50 dark:bg-gray-900/30", borderColor: "border-gray-200 dark:border-gray-800" },
  ];

  // Kanban Drag & Drop Logic
  const queryClient = useQueryClient();
  const [draggedOpp, setDraggedOpp] = useState<Opportunity | null>(null);

  const handleDragStart = (e: React.DragEvent, opp: Opportunity) => {
    setDraggedOpp(opp);
    e.dataTransfer.effectAllowed = "move";
    // Transparent ghost image or custom logic could go here
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (!draggedOpp || draggedOpp.stage === targetStageId) return;

    const previousOpp = { ...draggedOpp };
    const newStage = targetStageId;

    // Optimistic Update
    queryClient.setQueryData(["/api/crm/opportunities", "limit=100"], (old: any) => {
      if (!old || !old.data) return old;
      return {
        ...old,
        data: old.data.map((o: Opportunity) =>
          o.id === draggedOpp.id ? { ...o, stage: newStage } : o
        )
      };
    });

    try {
      const res = await fetch(`/api/crm/opportunities/${draggedOpp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage })
      });

      if (!res.ok) throw new Error("Failed to update stage");

      // Success toast or sound could go here

    } catch (err) {
      // Rollback
      console.error("Failed to move opportunity", err);
      queryClient.setQueryData(["/api/crm/opportunities", "limit=100"], (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((o: Opportunity) =>
            o.id === previousOpp.id ? previousOpp : o
          )
        };
      });
    } finally {
      setDraggedOpp(null);
      queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
    }
  };


  return (
    <div className="space-y-8 pb-10 flex flex-col flex-1 overflow-y-auto">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/crm">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
            <p className="text-muted-foreground">Manage your sales pipeline and track deal progress.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-muted p-1 rounded-full border border-muted/50">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className={`h-8 px-4 rounded-full transition-all ${viewMode === 'kanban' ? 'shadow-sm bg-background' : ''}`}
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-8 px-4 rounded-full transition-all ${viewMode === 'list' ? 'shadow-sm bg-background' : ''}`}
            >
              <ListIcon className="h-4 w-4 mr-2" /> List
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="shadcn-button-premium rounded-full px-6">
                <Plus className="mr-2 h-4 w-4" />
                Add Opportunity
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Create New Opportunity</SheetTitle>
                <SheetDescription>
                  Start a new deal in your pipeline.
                </SheetDescription>
              </SheetHeader>
              <div className="pt-6">
                <OpportunityForm />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {metrics.map((m, i) => (
          <Card key={i} className="hover-elevate shadow-sm overflow-hidden group border-muted/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
                  <p className="text-2xl font-bold">{m.value}</p>
                </div>
                <div className={`p-2 rounded-xl bg-muted/50 group-hover:scale-110 transition-transform ${m.color}`}>
                  <m.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 items-center shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 flex flex-col gap-6">
        <div className="flex gap-4 items-center shrink-0">
          <div className="relative flex-1 group max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search opportunities by name or account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-muted/30 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-64 animate-pulse bg-muted/20 rounded-2xl" />
            ))}
          </div>
        ) : viewMode === "list" ? (
          <StandardTable
            data={filteredOpps}
            columns={[
              {
                header: "Name",
                accessorKey: "name",
                cell: (opp: Opportunity) => (
                  <div>
                    <div className="font-semibold">{opp.name}</div>
                    <div className="text-xs text-muted-foreground">{getAccountName(opp.accountId)}</div>
                  </div>
                )
              },
              {
                header: "Stage",
                accessorKey: "stage",
                cell: (opp: Opportunity) => <Badge variant="outline" className="capitalize">{opp.stage.replace('_', ' ')}</Badge>
              },
              {
                header: "Amount",
                accessorKey: "amount",
                className: "text-right",
                cell: (opp: Opportunity) => <span className="font-medium">{formatCurrency(opp.amount)}</span>
              },
              {
                header: "Probability",
                accessorKey: "probability",
                className: "text-right",
                cell: (opp: Opportunity) => <span>{opp.probability}%</span>
              },
              {
                header: "Close Date",
                accessorKey: "closeDate",
                cell: (opp: Opportunity) => opp.closeDate ? new Date(opp.closeDate).toLocaleDateString() : '-'
              }
            ]}
            onRowClick={setSelectedOpp}
            keyExtractor={(opp) => opp.id}
          />
        ) : (
          /* Kanban View */
          <div className="flex gap-6 h-full overflow-x-auto pb-4 custom-scrollbar">
            {stages.map(stage => {
              const stageOpps = filteredOpps.filter(o => o.stage === stage.id);
              const stageTotal = stageOpps.reduce((acc, o) => acc + Number(o.amount), 0);
              const isDragTarget = draggedOpp && draggedOpp.stage !== stage.id;

              return (
                <div
                  key={stage.id}
                  className={`min-w-[340px] w-[340px] flex flex-col bg-muted/10 rounded-2xl border border-muted/50 p-3 transition-colors ${isDragTarget ? 'bg-primary/5 border-primary/20 border-dashed' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className={`p-4 mb-4 border-b rounded-xl shadow-sm ${stage.color} ${stage.borderColor} border`}>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-xs uppercase tracking-widest opacity-70">{stage.label}</h3>
                      <Badge variant="secondary" className="text-xs h-5 px-1.5 min-w-[20px] justify-center bg-background/50 border-none shadow-none">
                        {stageOpps.length}
                      </Badge>
                    </div>
                    <p className="text-xl font-black">{formatCurrency(stageTotal)}</p>
                  </div>

                  <div className="space-y-3 overflow-y-auto flex-1 max-h-[800px] px-0.5 min-h-[100px]">
                    {stageOpps.map(opp => (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, opp)}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <Card
                          className={`shadow-sm hover-elevate transition-all border-muted/50 group ${draggedOpp?.id === opp.id ? 'opacity-50 rotate-3 scale-95' : ''}`}
                          onClick={() => setSelectedOpp(opp)}
                        >
                          <CardContent className="p-4">
                            <div className="mb-4">
                              <p className="font-bold leading-tight group-hover:text-primary transition-colors text-[15px]">{opp.name}</p>
                              <p className="text-xs text-muted-foreground mt-1.5 font-medium flex items-center gap-1.5 italic">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                {getAccountName(opp.accountId)}
                              </p>
                            </div>
                            <div className="flex justify-between items-center bg-muted/30 p-2.5 rounded-lg border border-transparent group-hover:border-primary/10 transition-colors">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-none bg-background/50 font-bold">
                                  {opp.probability}%
                                </Badge>
                              </div>
                              <span className="text-[15px] font-black">{formatCurrency(opp.amount)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                    {stageOpps.length === 0 && (
                      <div className="h-24 rounded-xl border-2 border-dashed border-muted/30 flex items-center justify-center pointer-events-none">
                        <p className="text-xs text-muted-foreground font-medium opacity-50 italic">
                          {isDragTarget ? 'Drop Here' : 'Empty Stage'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedOpp} onOpenChange={(open) => !open && setSelectedOpp(null)}>
        <SheetContent className="sm:max-w-xl w-[90vw] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              {selectedOpp?.name}
            </SheetTitle>
            <SheetDescription>
              {getAccountName(selectedOpp?.accountId || null)} • {formatCurrency(selectedOpp?.amount || 0)}
            </SheetDescription>
          </SheetHeader>

          {selectedOpp && (
            <Tabs defaultValue="details" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
                <TabsTrigger value="ai-insights" className="gap-2"><Sparkles className="h-3 w-3" />AI Insights</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-y-auto pt-4 pr-1">
                <TabsContent value="details">
                  {/* ... details content ... */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                      <div>
                        <p className="text-muted-foreground">Stage</p>
                        <p className="font-medium capitalize">{selectedOpp.stage.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Probability</p>
                        <p className="font-medium">{selectedOpp.probability}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Close Date</p>
                        <p className="font-medium">{selectedOpp.closeDate ? new Date(selectedOpp.closeDate).toLocaleDateString() : 'None'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Owner</p>
                        <p className="font-medium">{selectedOpp.ownerId || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="competitors">
                  <CompetitorList opportunityId={selectedOpp.id} />
                </TabsContent>

                <TabsContent value="products">
                  <OpportunityProductList opportunityId={selectedOpp.id} />
                </TabsContent>

                <TabsContent value="quotes">
                  <OpportunityQuoteList opportunityId={selectedOpp.id} />
                </TabsContent>

                <TabsContent value="activity">
                  <ActivityTimeline entityType="opportunity" entityId={selectedOpp.id} />
                </TabsContent>

                <TabsContent value="ai-insights">
                  <AiInsightsTab opportunityId={selectedOpp.id} />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
