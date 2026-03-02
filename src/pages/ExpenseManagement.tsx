import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Receipt,
  AlertCircle,
  CheckCircle,
  Send,
  Loader2,
  FileText,
  Scan,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { StandardTable, Column } from "@/components/tables/StandardTable";
import { useLocation } from "wouter";

export default function ExpenseManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [buId, setBuId] = useState<string>();

  const scopeHeaders = buildScopeHeaders({ "business-unit": buId });

  // Fetch expense reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses", buId],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/expenses", undefined, scopeHeaders);
      return res.json();
    }
  });

  // Fetch analytics summary
  const { data: analytics } = useQuery<any>({
    queryKey: ["/api/expenses/analytics/summary", buId],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/expenses/analytics/summary", undefined, scopeHeaders);
      return res.json();
    }
  });

  // Fetch category breakdown
  const { data: categoryBreakdown = [] } = useQuery<any[]>({
    queryKey: ["/api/expenses/analytics/by-category", buId],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/expenses/analytics/by-category", undefined, scopeHeaders);
      return res.json();
    }
  });

  // Fetch policy violations
  const { data: violations } = useQuery<any>({
    queryKey: ["/api/expenses/analytics/violations", buId],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/expenses/analytics/violations", undefined, scopeHeaders);
      return res.json();
    }
  });

  // Create expense report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/expenses", data, scopeHeaders);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", buId] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/analytics/summary", buId] });
      toast({
        title: "Expense Report Created",
        description: `Report ${data.reportNumber} has been created successfully.`,
      });
      setIsCreateOpen(false);
      // Navigate to detail page
      setLocation(`/finance/expenses/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create expense report",
        variant: "destructive",
      });
    }
  });

  // Submit report mutation
  const submitReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/submit`, {}, scopeHeaders);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", buId] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/analytics/summary", buId] });
      toast({
        title: "Report Submitted",
        description: `Report ${data.reportNumber} submitted for approval.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit expense report",
        variant: "destructive",
      });
    }
  });

  // Approve report mutation
  const approveReportMutation = useMutation({
    mutationFn: async ({ reportId, comments }: { reportId: string; comments?: string }) => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/approve`, { comments }, scopeHeaders);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", buId] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/analytics/summary", buId] });
      toast({
        title: "Report Approved",
        description: `Report ${data.reportNumber} has been approved.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve report (possible SoD violation)",
        variant: "destructive",
      });
    }
  });

  const reportColumns: Column<any>[] = [
    {
      header: "Report #",
      accessorKey: "reportNumber",
      sortable: true,
      cell: (r) => <span className="font-mono font-bold">{r.reportNumber || `EXP-${r.id.slice(0, 6)}`}</span>
    },
    {
      header: "Title",
      accessorKey: "title",
      cell: (r) => r.title || r.purpose || "Untitled Report"
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (r) => {
        const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "premium"> = {
          DRAFT: 'outline',
          SUBMITTED: 'default',
          APPROVED: 'secondary',
          REJECTED: 'destructive',
        };
        return (
          <Badge variant={statusColors[r.status] || 'outline'}>
            {r.status}
          </Badge>
        );
      }
    },
    {
      header: "Total Amount",
      accessorKey: "totalAmount",
      sortable: true,
      cell: (r) => <span className="font-mono font-bold">${Number(r.totalAmount || 0).toFixed(2)}</span>
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      sortable: true,
      cell: (r) => new Date(r.createdAt).toLocaleDateString()
    },
    {
      header: "Employee",
      accessorKey: "employeeId",
      cell: (r) => r.employeeName || r.employeeId
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            End-to-end expense tracking with policy validation & analytics
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <EnterpriseContextSwitcher type="business-unit" value={buId} onChange={setBuId} className="mr-2" />
          <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Analytics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Reports"
          value={analytics?.totalReports || "0"}
          icon={FileText}
          loading={!analytics}
        />
        <MetricCard
          title="Total Amount"
          value={`$${analytics?.totalAmount || "0.00"}`}
          icon={DollarSign}
          loading={!analytics}
        />
        <MetricCard
          title="Pending Approval"
          value={analytics?.byStatus?.submitted || "0"}
          icon={Clock}
          iconColor="text-yellow-500"
          loading={!analytics}
        />
        <MetricCard
          title="Pending Reimbursement"
          value={`$${analytics?.pendingReimbursement || "0.00"}`}
          icon={AlertCircle}
          iconColor="text-blue-500"
          loading={!analytics}
        />
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Spending Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryBreakdown.slice(0, 5).map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{cat.category}</p>
                      <p className="text-xs text-muted-foreground">{cat.count} expenses</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold">${cat.totalAmount}</span>
                </div>
              ))}
              {categoryBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No expense data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Policy Violations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Policy Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {violations?.violations?.slice(0, 3).map((viol: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between gap-2 p-2 bg-yellow-50 border border-yellow-100 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">{viol.violation}</p>
                    <p className="text-xs text-yellow-700">Report: {viol.reportNumber}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">${viol.amount}</Badge>
                </div>
              ))}
              {(violations?.totalViolations === 0 || !violations) && (
                <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 border border-green-100 rounded">
                  <CheckCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">No policy violations detected</p>
                </div>
              )}
              {violations?.totalViolations > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{violations.totalViolations - 3} more violations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Reports Table */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <StandardTable
            data={reports}
            columns={reportColumns}
            isLoading={reportsLoading}
            actions={(r) => (
              <div className="flex gap-2">
                {r.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    onClick={() => submitReportMutation.mutate(r.id)}
                    disabled={submitReportMutation.isPending}
                  >
                    {submitReportMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                )}
                {r.status === 'SUBMITTED' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => approveReportMutation.mutate({ reportId: r.id })}
                    disabled={approveReportMutation.isPending}
                  >
                    {approveReportMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/finance/expenses/${r.id}`)}
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}
            pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => { } }}
          />
        </CardContent>
      </Card>

      {/* Create Report Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Create Expense Report</SheetTitle>
            <SheetDescription>
              Create a new expense report to track your business expenses.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Business Trip to NYC"
                id="reportTitle"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Additional details..."
                rows={3}
                id="reportDescription"
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              className="w-full"
              onClick={() => {
                const title = (document.getElementById('reportTitle') as HTMLInputElement)?.value;
                const description = (document.getElementById('reportDescription') as HTMLTextAreaElement)?.value;
                createReportMutation.mutate({ title, description });
              }}
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Report"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
