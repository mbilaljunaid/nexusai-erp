import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Search, Megaphone, Calendar, FileText, Plus, CheckCircle2, TrendingUp, Wallet, Target, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { CampaignForm } from "@/components/forms/CampaignForm";
import type { Campaign } from "@shared/schema";

// Helper to format currency
const formatCurrency = (val: number | string | null | undefined) => {
  if (val === null || val === undefined) return "$0";
  const num = Number(val);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
};

export default function CampaignsDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/crm/campaigns"],
  });

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = campaigns.reduce((acc, c) => acc + Number(c.expectedRevenue || 0), 0);
  const totalCost = campaigns.reduce((acc, c) => acc + Number(c.budgetedCost || 0), 0);
  const activeCount = campaigns.filter(c => c.status === 'In Progress').length;

  return (
    <div className="space-y-6 flex flex-col flex-1 overflow-y-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Link href="/crm">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2 italic">
              Execute and monitor multi-channel marketing initiatives
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="shad-primary-btn group transition-all duration-300">
                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                Add Campaign
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-[90vw]">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-bold">New Marketing Campaign</SheetTitle>
                <SheetDescription>Initialize a new initiative and define your success metrics.</SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <CampaignForm />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-100 dark:border-purple-900 overflow-hidden relative">
          <div className="absolute right-[-10px] top-[-10px] opacity-10">
            <TrendingUp className="h-24 w-24" />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Total Exp. Revenue</p>
            <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900 overflow-hidden relative">
          <div className="absolute right-[-10px] top-[-10px] opacity-10">
            <Wallet className="h-24 w-24" />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Budgeted Allocation</p>
            <p className="text-3xl font-bold">{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-100 dark:border-green-900 overflow-hidden relative">
          <div className="absolute right-[-10px] top-[-10px] opacity-10">
            <CheckCircle2 className="h-24 w-24" />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Active Campaigns</p>
            <p className="text-3xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Area */}
      <div className="flex gap-4 items-center shrink-0">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 border-muted-foreground/20 focus-visible:ring-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border-2 border-dashed bg-muted/20">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Megaphone className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-semibold">No campaigns found</h3>
            <p className="text-muted-foreground max-w-xs mt-2">
              {searchQuery ? `No campaigns matching "${searchQuery}"` : "You haven't launched any marketing campaigns yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="group shadow-sm hover:shadow-xl hover:-translate-y-1 border-muted-foreground/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full bg-card"
                onClick={() => setSelectedCampaign(campaign)}
              >
                <div className={`h-1.5 w-full ${campaign.status === 'In Progress' ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-muted'}`} />
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${campaign.status === 'In Progress' ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300' : 'bg-muted text-muted-foreground'}`}>
                      <Megaphone className="h-6 w-6" />
                    </div>
                    <Badge variant={campaign.status === "In Progress" ? "default" : "secondary"} className="font-medium px-2 py-0.5 text-[10px] uppercase tracking-wider">
                      {campaign.status}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">{campaign.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-tighter opacity-70">{campaign.type}</Badge>
                  </div>

                  <div className="flex flex-col gap-1 mb-4">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Expected Revenue</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(campaign.expectedRevenue)}</p>
                  </div>

                  <div className="pt-4 border-t border-muted/20 flex items-center justify-between text-[11px] text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Started: {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Insights <Target className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <SheetContent className="sm:max-w-xl w-[90vw] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              {selectedCampaign?.name}
            </SheetTitle>
            <SheetDescription>
              {selectedCampaign?.id} • {selectedCampaign?.type} • {selectedCampaign?.status}
            </SheetDescription>
          </SheetHeader>

          {selectedCampaign && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background shadow-sm">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Projected Revenue</p>
                      <p className="font-bold text-lg">{formatCurrency(selectedCampaign.expectedRevenue)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background shadow-sm">
                      <Wallet className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Allocated Budget</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedCampaign.budgetedCost)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{selectedCampaign.startDate ? new Date(selectedCampaign.startDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'None'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{selectedCampaign.endDate ? new Date(selectedCampaign.endDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'None'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mt-2">Channel Type</p>
                  <Badge variant="outline" className="mt-1">{selectedCampaign.type}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Actual Cost</p>
                  <p className="font-medium text-amber-600">{formatCurrency(selectedCampaign.actualCost)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Campaign Strategy
                </h3>
                <div className="p-6 rounded-xl bg-card border shadow-sm min-h-[100px]">
                  <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap italic">
                    {selectedCampaign.description || "No strategic overview provided for this campaign yet."}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t flex flex-col gap-3">
                <Button className="w-full shad-primary-btn">View ROI Analysis</Button>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">Edit Settings</Button>
                  <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10">End Campaign</Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
