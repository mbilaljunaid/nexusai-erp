import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Loader2,
  Send,
  AlertTriangle,
  TrendingUp,
  FileText,
  Download
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/tables/StandardTable";
import { MetricCard } from "@/components/MetricCard";
import { useLocation } from "wouter";

export default function ExpenseTracking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"myExpenses" | "approvalQueue">("myExpenses");

  // Fetch current user's expenses
  const { data: myExpenses = [], isLoading: myExpensesLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses", "my-expenses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/expenses");
      return res.json();
    }
  });

  // Fetch expenses pending approval (manager view)
  const { data: pendingApprovals = [], isLoading: pendingLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses", "pending-approvals"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/expenses?status=SUBMITTED");
      return res.json();
    }
  });

  // Fetch analytics summary
  const { data: analytics } = useQuery<any>({
    queryKey: ["/api/expenses/analytics/summary"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/expenses/analytics/summary");
      return res.json();
    }
  });

  // Fetch employee analytics (for managers)
  const { data: employeeStats = [] } = useQuery<any[]>({
    queryKey: ["/api/expenses/analytics/by-employee"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/expenses/analytics/by-employee");
      return res.json();
    }
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/analytics/summary"] });
      toast({
        title: "Approved",
        description: "Expense report approved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Cannot approve (possible SoD violation)",
        variant: "destructive",
      });
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ reportId, reason }: { reportId: string; reason: string }) => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/reject`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Rejected",
        description: "Expense report rejected.",
      });
    }
  });

  const myExpenseColumns: Column<any>[] = [
    {
      header: "Report #",
      accessorKey: "reportNumber",
      cell: (r) => <span className="font-mono font-bold">{r.reportNumber || `EXP-${r.id.slice(0, 6)}`}</span>
    },
    {
      header: "Title",
      accessorKey: "title",
      cell: (r) => r.title || "Untitled Report"
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (r) => {
        const colors = {
          DRAFT: 'outline',
          SUBMITTED: 'default',
          APPROVED: 'secondary',
          REJECTED: 'destructive',
        };
        return <Badge variant={colors[r.status as keyof typeof colors] || 'outline'}>{r.status}</Badge>;
      }
    },
    {
      header: "Amount",
      accessorKey: "totalAmount",
      cell: (r) => <span className="font-mono font-bold">${Number(r.totalAmount || 0).toFixed(2)}</span>
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: (r) => new Date(r.createdAt).toLocaleDateString()
    }
  ];

  const approvalColumns: Column<any>[] = [
    {
      header: "Report #",
      accessorKey: "reportNumber",
      cell: (r) => <span className="font-mono font-bold">{r.reportNumber || `EXP-${r.id.slice(0, 6)}`}</span>
    },
    {
      header: "Employee",
      accessorKey: "employeeId",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{r.employeeName || r.employeeId}</span>
        </div>
      )
    },
    {
      header: "Title",
      accessorKey: "title",
      cell: (r) => r.title || "Untitled Report"
    },
    {
      header: "Amount",
      accessorKey: "totalAmount",
      cell: (r) => <span className="font-mono font-bold">${Number(r.totalAmount || 0).toFixed(2)}</span>
    },
    {
      header: "Submitted",
      accessorKey: "submittedAt",
      cell: (r) => r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() :
        <span className="text-muted-foreground">N/A</span>
    },
    {
      header: "Days Pending",
      accessorKey: "id",
      cell: (r) => {
        if (!r.submittedAt) return "-";
        const days = Math.floor((Date.now() - new Date(r.submittedAt).getTime()) / (1000 * 60 * 60 * 24));
        const color = days > 3 ? 'text-red-500' : days > 1 ? 'text-yellow-500' : 'text-green-500';
        return <span className={`font-bold ${color}`}>{days}d</span>;
      }
    }
  ];

  const myDraft = myExpenses.filter(e => e.status === 'DRAFT').length;
  const mySubmitted = myExpenses.filter(e => e.status === 'SUBMITTED').length;
  const myApproved = myExpenses.filter(e => e.status === 'APPROVED').length;
  const myTotal = myExpenses.reduce((sum, e) => sum + Number(e.totalAmount || 0), 0);

  return (
    <StandardPage
      title="Expense Tracking"
      description="Track your expenses and manage approvals"
      className="space-yted-foreground mt-1 text-lg">
            Track your expenses and manage approvals
          </p>
        </div>
        <div className="flex gap-2 p-1 bg-muted/20 rounded-lg border">
          <Button
            variant={viewMode === "myExpenses" ? "secondary" : "ghost"}
            onClick={() => setViewMode("myExpenses")}
            className="h-9 px-4"
          >
            <FileText className="h-4 w-4 mr-2" />
            My Expenses
          </Button>
          <Button
            variant={viewMode === "approvalQueue" ? "secondary" : "ghost"}
            onClick={() => setViewMode("approvalQueue")}
            className="h-9 px-4"
          >
            <Clock className="h-4 w-4 mr-2" />
            Approval Queue
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {pendingApprovals.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* My Expenses View */}
      {viewMode === "myExpenses" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Draft Reports"
              value={myDraft.toString()}
              icon={FileText}
              loading={myExpensesLoading}
            />
            <MetricCard
              title="Pending Approval"
              value={mySubmitted.toString()}
              icon={Clock}
              iconColor="text-yellow-500"
              loading={myExpensesLoading}
            />
            <MetricCard
              title="Approved This Month"
              value={myApproved.toString()}
              icon={CheckCircle}
              iconColor="text-green-500"
              loading={myExpensesLoading}
            />
            <MetricCard
              title="Total Amount"
              value={`$${myTotal.toFixed(2)}`}
              icon={DollarSign}
              loading={myExpensesLoading}
            />
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <StandardTable
                data={myExpenses}
                columns={myExpenseColumns}
                isLoading={myExpensesLoading}
                actions={(r) => (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/finance/expenses/${r.id}`)}
                  >
                    View
                  </Button>
                )}
                pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => { } }}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Approval Queue View (Manager) */}
      {viewMode === "approvalQueue" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Pending Approvals"
              value={pendingApprovals.length.toString()}
              icon={Clock}
              iconColor="text-yellow-500"
              loading={pendingLoading}
            />
            <MetricCard
              title="Total Pending Amount"
              value={`$${pendingApprovals.reduce((s, e) => s + Number(e.totalAmount || 0), 0).toFixed(2)}`}
              icon={DollarSign}
              loading={pendingLoading}
            />
            <MetricCard
              title="Avg Processing Time"
              value="1.5 days"
              icon={TrendingUp}
              iconColor="text-blue-500"
            />
            <MetricCard
              title="Team Members"
              value={employeeStats.length.toString()}
              icon={Users}
            />
          </div>

          {/* Employee Spending Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Expense Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeStats.slice(0, 5).map((emp: any) => (
                  <div key={emp.employeeId} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{emp.employeeName || emp.employeeId}</p>
                      <p className="text-xs text-muted-foreground">{emp.reportCount} reports</p>
                    </div>
                    <span className="font-mono font-bold">${emp.totalAmount}</span>
                  </div>
                ))}
                {employeeStats.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No employee data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals Table */}
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <StandardTable
                data={pendingApprovals}
                columns={approvalColumns}
                isLoading={pendingLoading}
                actions={(r) => (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(r.id)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const reason = prompt("Enter rejection reason:");
                        if (reason) {
                          rejectMutation.mutate({ reportId: r.id, reason });
                        }
                      }}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/finance/expenses/${r.id}`)}
                    >
                      View
                    </Button>
                  </div>
                )}
                pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => { } }}
              />
            </CardContent>
          </Card>
        </>
      )}
    </StandardPage>
  );
}
