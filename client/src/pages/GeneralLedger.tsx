import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus, Layers, ArrowLeftRight, FileText, Calendar,
  DollarSign, TrendingUp, AlertCircle, Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { TrialBalanceGrid } from "@/components/finance/TrialBalanceGrid";
import { FiscalPeriods } from "@/components/finance/FiscalPeriods";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GlJournal, GlJournalBatch } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";


export default function GeneralLedger() {
  const [activeTab, setActiveTab] = useState("journals");

  return (
    <div className="space-y-6 relative min-h-screen pb-20">


      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            General Ledger
          </h1>
          <p className="text-muted-foreground mt-1">
            Financial control center for journals, approvals, and reporting.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "journals" && (
            <Button className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" />
              New Journal
            </Button>
          )}
          <Button variant="outline" className="hidden md:flex">
            <Layers className="mr-2 h-4 w-4" />
            Batch Operations
          </Button>
        </div>
      </div>

      {/* Metric Cards - Premium Look */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Journals"
          value="1,284"
          subtext="+12% from last month"
          icon={FileText}
          trend="up"
        />
        <MetricCard
          title="Open Period"
          value="Jan-2026"
          subtext="Closes in 24 days"
          icon={Calendar}
          color="text-blue-600"
        />
        <MetricCard
          title="Pending Approvals"
          value="3"
          subtext="Requires attention"
          icon={AlertCircle}
          color="text-orange-500"
        />
        <MetricCard
          title="Net Activity"
          value="$2.4M"
          subtext="Current period volume"
          icon={TrendingUp}
          color="text-green-600"
        />
      </div>

      <Tabs defaultValue="journals" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border p-1 h-12 w-full justify-start overflow-x-auto">
          <TabsTrigger value="journals" className="px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Journals</TabsTrigger>
          <TabsTrigger value="batches" className="px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Batches</TabsTrigger>
          <TabsTrigger value="approvals" className="px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Approvals</TabsTrigger>
          <TabsTrigger value="periods" className="px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Fiscal Periods</TabsTrigger>
          <TabsTrigger value="trial-balance" className="px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Trial Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="journals" className="space-y-4">
          <JournalGrid />
        </TabsContent>

        <TabsContent value="batches">
          <BatchList />
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalList />
        </TabsContent>

        <TabsContent value="periods">
          <FiscalPeriods />
        </TabsContent>

        <TabsContent value="trial-balance">
          <TrialBalanceGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable Metric Card Component
function MetricCard({ title, value, subtext, icon: Icon, trend, color }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center">
          {trend === "up" && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
          {subtext}
        </p>
      </CardContent>
    </Card>
  )
}

function JournalGrid() {
  const { data: journals, isLoading } = useQuery<GlJournal[]>({
    queryKey: ["/api/gl/journals"]
  });
  const [selectedJournal, setSelectedJournal] = useState<GlJournal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted/20 animate-pulse rounded-xl" />)}
    </div>
  );

  const filteredJournals = journals?.filter(j =>
    j.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.journalNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 items-center bg-card p-2 rounded-lg border shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input
          placeholder="Search journals..."
          className="border-none shadow-none focus-visible:ring-0 max-w-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="flex-1" />
        <Button variant="ghost" size="sm"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      {/* Grid View */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredJournals?.map((j) => (
          <Card
            key={j.id}
            className="group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
            onClick={() => setSelectedJournal(j)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="font-mono text-xs">{j.journalNumber}</Badge>
                <Badge variant={j.status === "Posted" ? "default" : "secondary"} className={j.status === "Posted" ? "bg-green-600 hover:bg-green-700" : ""}>
                  {j.status}
                </Badge>
              </div>
              <h3 className="font-semibold truncate mb-1">{j.description || "No Description"}</h3>
              <div className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                <Calendar className="h-3 w-3" />
                {j.periodId || "N/A"}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-xs text-muted-foreground">Source: {j.source}</div>
                <Button variant="ghost" size="sm" className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedJournal} onOpenChange={() => setSelectedJournal(null)}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedJournal?.journalNumber}
            </SheetTitle>
            <SheetDescription>
              {selectedJournal?.description}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Period</span>
                <div className="font-medium">{selectedJournal?.periodId}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Source</span>
                <div className="font-medium">{selectedJournal?.source}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <div><Badge variant="outline">{selectedJournal?.status}</Badge></div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Approval</span>
                <div><Badge variant="secondary">{selectedJournal?.approvalStatus}</Badge></div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Journal Lines</h4>
              <div className="rounded-md border">
                <div className="bg-muted/50 p-2 text-xs font-medium grid grid-cols-12 gap-2">
                  <div className="col-span-6">Account</div>
                  <div className="col-span-3 text-right">Debit</div>
                  <div className="col-span-3 text-right">Credit</div>
                </div>
                <ScrollArea className="h-[200px]">
                  {/* Lines would be fetched here in a real app, mocking for UI display */}
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Load lines for {selectedJournal?.id}...
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedJournal(null)}>Close</Button>
              <Button variant="destructive">Reverse Journal</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function BatchList() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <Layers className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Journal Batches</h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          Group multiple journals for efficient processing and approval workflows.
        </p>
        <Button className="mt-4" variant="outline">Create Initial Batch</Button>
      </CardContent>
    </Card>
  );
}

function ApprovalList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-orange-600 mb-1">Pending Approval</div>
              <h3 className="font-bold text-lg">Batch #B-2026-001</h3>
              <p className="text-sm text-muted-foreground">Submitted by verify_script</p>
            </div>
            <Button size="sm">Review</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
