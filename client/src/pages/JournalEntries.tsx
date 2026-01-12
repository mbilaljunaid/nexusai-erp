import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  Download,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/gl/premium/MetricCard";
import { JournalGrid } from "@/components/gl/premium/JournalGrid";
import { SideSheet } from "@/components/gl/premium/SideSheet";
import { format } from "date-fns";

export default function JournalEntries() {
  const [, setLocation] = useLocation();
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handlePost = async (e: React.MouseEvent, journal: any) => {
    e.stopPropagation();
    try {
      await apiRequest("POST", `/api/finance/gl/journals/${journal.id}/post`);
      toast({ title: "Posting Initiated", description: `Batch ${journal.journalNumber} submitted for processing.` });
      queryClient.invalidateQueries({ queryKey: ["/api/gl/journals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gl/stats"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const { data: journals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/gl/journals"],
  });

  const filteredJournals = journals.filter(j =>
    (j.journalNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (j.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (journal: any) => {
    setSelectedJournal(journal);
    setIsSideSheetOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Posted": return "default";
      case "Draft": return "secondary";
      case "Error": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* Action-centric Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-indigo-600" />
            Journal Batches
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Create, monitor, and audit general ledger transactions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-600">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setLocation("/gl/journals/new")} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 px-6">
            <Plus className="h-4 w-4 mr-2" /> Create Journal
          </Button>
        </div>
      </div>

      {/* Premium Metrics Summary */}
      {/* Premium Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Posted (MTD)"
          value="$4.2M"
          trend="up"
          trendValue="+12%"
          className="shadow-sm border-slate-200"
        />
        <MetricCard
          title="Active Batches"
          value={filteredJournals.length}
          description="Across all ledgers"
          className="shadow-sm border-slate-200"
        />
        <MetricCard
          title="Pending Approval"
          value="3"
          trend="down"
          trendValue="-2"
          className="shadow-sm border-slate-200"
        />
      </div>

      {/* Premium Table Card */}
      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 py-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Recent Transactions</CardTitle>
              <CardDescription className="text-slate-400 mt-1">Audit-ready journal entries from all ledger sources.</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search batches..."
                  className="pl-9 w-64 bg-white border-slate-200 focus-visible:ring-indigo-500 rounded-full h-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-slate-400 hover:text-indigo-600">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <JournalGrid
            data={filteredJournals.map(j => ({
              ...j,
              effectiveDate: j.accountingDate || j.createdAt
            }))}
            onRowClick={handleRowClick}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Side Sheet for Viewing Journal */}
      {/* Side Sheet for Viewing Journal */}
      <SideSheet
        open={isSideSheetOpen}
        onOpenChange={setIsSideSheetOpen}
        title={selectedJournal?.description || "Journal Details"}
        description={`Batch #${selectedJournal?.journalNumber}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Period</span>
              <p className="font-medium">{selectedJournal?.periodId}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Total Debit</span>
              <p className="font-medium">
                {Number(selectedJournal?.totalDebit || 0).toLocaleString()} {selectedJournal?.currencyCode}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Lines</h4>
            <div className="text-sm text-muted-foreground italic">
              {/* In a real scenario, we'd fetch lines here or pass them in */}
              Line details would be loaded here.
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSideSheetOpen(false)}>Close</Button>
            <Button onClick={(e) => selectedJournal && handlePost(e, selectedJournal)}>Post Process</Button>
          </div>
        </div>
      </SideSheet>
    </div>
  );
}
