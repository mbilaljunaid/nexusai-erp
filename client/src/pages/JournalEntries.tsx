
import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/gl/premium/MetricCard";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { SideSheet } from "@/components/gl/premium/SideSheet";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { GlJournal } from "@shared/schema";

export default function JournalEntries() {
  const [, setLocation] = useLocation();
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { toast } = useToast();

  const { data: journalResponse, isLoading } = useQuery<{ data: GlJournal[], total: number }>({
    queryKey: ["/api/gl/journals", { page, search: searchQuery }],
    queryFn: () => api.gl.journals.list({ limit: pageSize, offset: (page - 1) * pageSize, search: searchQuery }),
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/gl/stats"],
    queryFn: () => api.gl.journals.getStats(),
  });

  const postMutation = useMutation({
    mutationFn: (id: string | number) => api.gl.journals.post(id),
    onSuccess: (_, id) => {
      toast({ title: "Posting Initiated", description: `Journal submitted for processing.` });
      queryClient.invalidateQueries({ queryKey: ["/api/gl/journals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gl/stats"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleRowClick = (journal: any) => {
    setSelectedJournal(journal);
    setIsSideSheetOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Posted":
        return <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50"><CheckCircle2 className="w-3 h-3 mr-1" /> Posted</Badge>;
      case "Draft":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100"><FileText className="w-3 h-3 mr-1" /> Draft</Badge>;
      case "Error":
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>;
      case "Processing":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 animate-pulse hover:bg-blue-50"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Posting...</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: Column<GlJournal>[] = [
    {
      header: "Batch #",
      accessorKey: "journalNumber",
      width: "15%",
      cell: (item) => <span className="font-mono font-bold text-indigo-600">{item.journalNumber}</span>
    },
    {
      header: "Effective Date",
      width: "15%",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{format(new Date(item.accountingDate || (item as any).createdAt), "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">Period: {item.periodId}</span>
        </div>
      )
    },
    {
      header: "Description",
      accessorKey: "description",
      width: "35%",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[300px]">{item.description}</span>
          <span className="text-xs text-muted-foreground">{item.source} • {item.category}</span>
        </div>
      )
    },
    {
      header: "Total Amount",
      width: "20%",
      className: "text-right",
      cell: (item) => (
        <div className="flex flex-col items-end">
          <span className="font-bold font-mono">
            {Number(item.totalDebit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-indigo-500 font-semibold">{item.currencyCode}</span>
        </div>
      )
    },
    {
      header: "Status",
      width: "15%",
      className: "text-center",
      cell: (item) => getStatusBadge(item.status)
    }
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Posted (MTD)"
          value={`$${((stats?.postedJournals || 0) * 0.12).toFixed(1)}M`} // Mock derivation for visual
          trend="up"
          trendValue="+12%"
          className="shadow-sm border-slate-200"
        />
        <MetricCard
          title="Active Batches"
          value={journalResponse?.total || 0}
          description="Across all ledgers"
          className="shadow-sm border-slate-200"
        />
        <MetricCard
          title="Unposted"
          value={stats?.unpostedJournals || 0}
          className="shadow-sm border-slate-200"
        />
        <MetricCard
          title="Open Periods"
          value={stats?.openPeriods || 0}
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-slate-400 hover:text-indigo-600">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <StandardTable
            data={journalResponse?.data || []}
            columns={columns}
            isLoading={isLoading}
            onRowClick={handleRowClick}
            page={page}
            pageSize={pageSize}
            totalItems={journalResponse?.total}
            onPageChange={setPage}
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
            <Button
              onClick={() => selectedJournal && postMutation.mutate(selectedJournal.id)}
              disabled={postMutation.isPending || selectedJournal?.status === "Posted"}
            >
              {postMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedJournal?.status === "Posted" ? "Already Posted" : "Post Batch"}
            </Button>
          </div>
        </div>
      </SideSheet>
    </div>
  );
}
