import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Search, ArrowLeft, LayoutGrid, List as ListIcon, Loader2, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { OpportunityForm } from "@/components/forms/OpportunityForm";
import { ActivityTimeline } from "@/components/crm/ActivityTimeline";
import type { Opportunity, Account } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunityProductList } from "@/components/crm/OpportunityProductList";
import { OpportunityQuoteList } from "@/components/crm/OpportunityQuoteList";

// Helper to format currency
const formatCurrency = (val: number | string) => {
  const num = Number(val);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
};

export default function OpportunitiesDetail() {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const { data: opportunities = [], isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/crm/opportunities"],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/crm/accounts"],
  });

  // Calculate stats
  const pipelineValue = opportunities.reduce((acc, opp) => acc + Number(opp.amount), 0);
  const wonCount = opportunities.filter(o => o.stage === 'closed_won').length;

  const filteredOpps = opportunities.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAccountName = (id: string | null) => {
    if (!id) return "Unknown Account";
    const acc = accounts.find(a => a.id === id);
    return acc ? acc.name : "Unknown Account";
  };

  const stages = [
    { id: "qualification", label: "Qualification", color: "bg-blue-100 dark:bg-blue-900" },
    { id: "needs_analysis", label: "Needs Analysis", color: "bg-indigo-100 dark:bg-indigo-900" },
    { id: "proposal", label: "Proposal", color: "bg-purple-100 dark:bg-purple-900" },
    { id: "negotiation", label: "Negotiation", color: "bg-orange-100 dark:bg-orange-900" },
    { id: "closed_won", label: "Closed Won", color: "bg-green-100 dark:bg-green-900" },
    { id: "closed_lost", label: "Closed Lost", color: "bg-gray-100 dark:bg-gray-800" },
  ];

  return (
    <div className="space-y-6 flex flex-col flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/crm">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold">Opportunities</h1>
            <p className="text-muted-foreground text-sm">
              Pipeline Value: <strong className="text-foreground">{formatCurrency(pipelineValue)}</strong> • Won: {wonCount}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted p-1 rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-3"
            >
              <ListIcon className="h-4 w-4 mr-2" /> List
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Kanban
            </Button>
          </div>
        </div>
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
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : viewMode === "list" ? (
          <div className="grid gap-2">
            {filteredOpps.map(opp => (
              <Card key={opp.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedOpp(opp)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{opp.name}</p>
                    <p className="text-sm text-muted-foreground">{getAccountName(opp.accountId)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="capitalize">{opp.stage.replace('_', ' ')}</Badge>
                    <p className="font-mono font-medium">{formatCurrency(opp.amount)}</p>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {opp.probability ? `${opp.probability}%` : '-'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredOpps.length === 0 && <p className="text-center text-muted-foreground py-8">No opportunities found.</p>}
          </div>
        ) : (
          /* Kanban View */
          <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {stages.map(stage => {
              const stageOpps = filteredOpps.filter(o => o.stage === stage.id);
              const stageTotal = stageOpps.reduce((acc, o) => acc + Number(o.amount), 0);

              return (
                <div key={stage.id} className="min-w-[300px] w-[300px] flex flex-col bg-muted/30 rounded-lg border">
                  <div className={`p-3 border-b ${stage.color} rounded-t-lg`}>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-sm uppercase tracking-wider">{stage.label}</h3>
                      <Badge variant="secondary" className="text-xs bg-white/50">{stageOpps.length}</Badge>
                    </div>
                    <p className="text-xs font-mono font-medium opacity-80">{formatCurrency(stageTotal)}</p>
                  </div>

                  <div className="p-2 space-y-2 overflow-y-auto flex-1 max-h-[600px]">
                    {stageOpps.map(opp => (
                      <Card
                        key={opp.id}
                        className="shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                        onClick={() => setSelectedOpp(opp)}
                      >
                        <CardContent className="p-3">
                          <div className="mb-2">
                            <p className="font-medium leading-tight">{opp.name}</p>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{getAccountName(opp.accountId)}</p>
                          </div>
                          <div className="flex justify-between items-end mt-3">
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                              {opp.probability}% Prob
                            </Badge>
                            <span className="text-sm font-semibold">{formatCurrency(opp.amount)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-6 border-t mt-4">
        <h2 className="text-xl font-semibold mb-4">+ Add New Opportunity</h2>
        <OpportunityForm />
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-y-auto pt-4 pr-1">
                <TabsContent value="details">
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

                <TabsContent value="products">
                  <OpportunityProductList opportunityId={selectedOpp.id} />
                </TabsContent>

                <TabsContent value="quotes">
                  <OpportunityQuoteList opportunityId={selectedOpp.id} />
                </TabsContent>

                <TabsContent value="activity">
                  <ActivityTimeline entityType="opportunity" entityId={selectedOpp.id} />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
