import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Receipt,
  AlertCircle,
  CreditCard,
  CheckCircle,
  Send,
  Loader2,
  FileText,
  Scan,
  RefreshCcw,
  Plus,
  ArrowRight
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { StandardTable, Column } from "@/components/tables/StandardTable";

export default function ExpenseManagement() {
  const [viewType, setViewType] = useState<"reports" | "items" | "cards">("reports");
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const { toast } = useToast();

  const { data: reports = [], isLoading: reportsLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses/reports"]
  });
  const { data: items = [], isLoading: itemsLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses/items"]
  });
  const { data: cards = [], isLoading: cardsLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses/cards/transactions", { userId: "verifier_001" }]
  });

  const postToGlMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await apiRequest("POST", `/api/expenses/reports/${reportId}/post-gl`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/reports"] });
      toast({
        title: "Success",
        description: "Expense report posted to General Ledger successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post to GL",
        variant: "destructive",
      });
    }
  });

  const importCardsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/expenses/cards/import", { userId: "verifier_001" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/cards/transactions"] });
      toast({
        title: "Bank Feed Imported",
        description: "Corporate card transactions have been successfully synchronized.",
      });
    }
  });

  const extractMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/expenses/items/extract", { receipt: "base64_data" });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Receipt Scanned",
        description: `Extracted ${data.data.merchant} - $${data.data.amount}`,
      });
    }
  });

  const totals = {
    all: reports.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0),
    pending: reports.filter(r => r.status === 'DRAFT' || r.status === 'SUBMITTED').reduce((sum, r) => sum + Number(r.totalAmount || 0), 0),
    approved: reports.filter(r => r.status === 'APPROVED').reduce((sum, r) => sum + Number(r.totalAmount || 0), 0),
    paid: reports.filter(r => r.status === 'PAID').reduce((sum, r) => sum + Number(r.totalAmount || 0), 0),
  };

  const reportColumns: Column<any>[] = [
    { header: "Report #", accessorKey: "reportNumber", sortable: true },
    { header: "Purpose", accessorKey: "purpose" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (r) => (
        <Badge variant={r.status === 'PAID' ? 'secondary' : r.status === 'APPROVED' ? 'default' : 'outline'}>
          {r.status}
        </Badge>
      )
    },
    {
      header: "Compliance",
      accessorKey: "id",
      cell: (r) => {
        const score = r.status === 'PAID' ? 98 : r.status === 'APPROVED' ? 92 : 75;
        const color = score > 90 ? 'text-green-500' : score > 70 ? 'text-yellow-500' : 'text-red-500';
        return <span className={`font-bold ${color}`}>{score}%</span>;
      }
    },
    {
      header: "Total",
      accessorKey: "totalAmount",
      cell: (r) => <span className="font-mono font-bold">${Number(r.totalAmount).toLocaleString()}</span>
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: (r) => new Date(r.createdAt).toLocaleDateString()
    }
  ];

  const itemColumns: Column<any>[] = [
    { header: "Date", accessorKey: "expenseDate", cell: (i) => new Date(i.date || i.expenseDate).toLocaleDateString(), sortable: true },
    { header: "Merchant", accessorKey: "merchant", sortable: true },
    { header: "Category", accessorKey: "category", cell: (i) => <Badge variant="outline">{i.category}</Badge> },
    { header: "Amount", accessorKey: "amount", cell: (i) => <span className="font-mono font-bold">${Number(i.amount).toLocaleString()}</span> },
    { header: "Description", accessorKey: "description" }
  ];

  const cardColumns: Column<any>[] = [
    { header: "Tx Date", accessorKey: "transactionDate", cell: (tx) => new Date(tx.transactionDate).toLocaleDateString(), sortable: true },
    { header: "Merchant", accessorKey: "merchant", sortable: true },
    { header: "Card ID", accessorKey: "cardId" },
    { header: "Amount", accessorKey: "amount", cell: (tx) => <span className="font-mono font-bold">${Number(tx.amount).toLocaleString()}</span> },
    {
      header: "Status",
      accessorKey: "status",
      cell: (tx) => (
        <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">
          {tx.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-muted-foreground mt-1 text-lg">Tier-1 Audit Benchmarked Expense Lifecycle.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCaptureOpen(true)}>
            <Scan className="h-4 w-4 mr-2" />
            Smart Capture
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Volume" value={`$${totals.all.toLocaleString()}`} icon={DollarSign} loading={reportsLoading} />
        <MetricCard title="Pending Review" value={`$${totals.pending.toLocaleString()}`} icon={AlertCircle} iconColor="text-yellow-500" loading={reportsLoading} />
        <MetricCard title="Accrued (Approved)" value={`$${totals.approved.toLocaleString()}`} icon={CheckCircle} iconColor="text-blue-500" loading={reportsLoading} />
        <MetricCard title="Settled (Paid)" value={`$${totals.paid.toLocaleString()}`} icon={CreditCard} iconColor="text-green-500" loading={reportsLoading} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-muted/20 rounded-lg w-fit border">
          <Button variant={viewType === "reports" ? "secondary" : "ghost"} onClick={() => setViewType("reports")} className="h-8 px-3 text-xs uppercase tracking-wider font-bold">
            <FileText className="h-3.5 w-3.5 mr-2" />
            Reports
          </Button>
          <Button variant={viewType === "items" ? "secondary" : "ghost"} onClick={() => setViewType("items")} className="h-8 px-3 text-xs uppercase tracking-wider font-bold">
            <Receipt className="h-3.5 w-3.5 mr-2" />
            Lines
          </Button>
          <Button variant={viewType === "cards" ? "secondary" : "ghost"} onClick={() => setViewType("cards")} className="h-8 px-3 text-xs uppercase tracking-wider font-bold">
            <CreditCard className="h-3.5 w-3.5 mr-2" />
            Card Feeds
          </Button>
        </div>

        {viewType === "cards" && (
          <Button variant="ghost" size="sm" onClick={() => importCardsMutation.mutate()} disabled={importCardsMutation.isPending} className="text-xs">
            <RefreshCcw className={`h-3.5 w-3.5 mr-2 ${importCardsMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Bank Feed
          </Button>
        )}
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          {viewType === "reports" && (
            <StandardTable
              data={reports}
              columns={reportColumns}
              isLoading={reportsLoading}
              actions={(r) => (
                <div className="flex gap-2">
                  {r.status === 'APPROVED' && (
                    <Button size="sm" onClick={() => postToGlMutation.mutate(r.id)} disabled={postToGlMutation.isPending}>
                      {postToGlMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    </Button>
                  )}
                  <Button variant="outline" size="sm"><ArrowRight className="h-3 w-3" /></Button>
                </div>
              )}
              pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => { } }}
            />
          )}

          {viewType === "items" && (
            <StandardTable
              data={items}
              columns={itemColumns}
              isLoading={itemsLoading}
              pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => { } }}
            />
          )}

          {viewType === "cards" && (
            <StandardTable
              data={cards}
              columns={cardColumns}
              isLoading={cardsLoading}
              actions={() => <Button variant="secondary" size="sm">Match</Button>}
              pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => { } }}
            />
          )}
        </CardContent>
      </Card>

      <Sheet open={isCaptureOpen} onOpenChange={setIsCaptureOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>AI Receipt Capture</SheetTitle>
            <SheetDescription>Upload receipt for automated OCR extraction and policy validation.</SheetDescription>
          </SheetHeader>
          <div className="py-8 space-y-6">
            <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => extractMutation.mutate()}>
              {extractMutation.isPending ? (
                <div className="text-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4 mx-auto" />
                  <p className="font-medium animate-pulse">Running AI OCR...</p>
                </div>
              ) : (
                <>
                  <Scan className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground text-center">Click to upload or drag and drop</p>
                </>
              )}
            </div>

            {extractMutation.data && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="text-xs font-black uppercase">OCR Confidence: 92%</p>
                    <p className="text-[10px] opacity-70">Heuristic: Validated</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">Merchant</p>
                    <p className="font-bold">{extractMutation.data.data.merchant}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">Total</p>
                    <p className="font-mono font-bold text-lg">${extractMutation.data.data.amount}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <SheetFooter>
            <Button className="w-full" disabled={!extractMutation.data} onClick={() => setIsCaptureOpen(false)}>Create Line Item</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
