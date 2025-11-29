import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { CheckCircle2, Clock, XCircle, ArrowRight, Users, FileText, DollarSign, Filter } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ApprovalRequest {
  id: string;
  type: "quote" | "order" | "invoice" | "expense";
  referenceId: string;
  amount: string;
  requester: string;
  status: "pending" | "approved" | "rejected";
  approvers: string[];
  currentApprover: string;
  createdAt: string;
}

export default function ApprovalWorkflow() {
  const [activeNav, setActiveNav] = useState("pending");
  const { data: requests = [] } = useQuery<ApprovalRequest[]>({
    queryKey: ["/api/approvals"],
    retry: false,
  });

  const navItems = [
    { id: "pending", label: `Pending (${stats.pending})`, icon: Clock, color: "text-yellow-500" },
    { id: "approved", label: `Approved (${stats.approved})`, icon: CheckCircle2, color: "text-green-500" },
    { id: "rejected", label: `Rejected (${stats.rejected})`, icon: XCircle, color: "text-red-500" },
  ];

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/approvals/${id}/approve`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/approvals"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/approvals/${id}/reject`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/approvals"] }),
  });

  const stats = {
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
    totalAmount: requests.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0),
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "quote": return <FileText className="w-5 h-5" />;
      case "invoice": return <FileText className="w-5 h-5" />;
      case "order": return <FileText className="w-5 h-5" />;
      case "expense": return <DollarSign className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Approval Workflow</h1>
        <p className="text-muted-foreground text-sm">Review and approve quotes, orders, invoices, and expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold font-mono">${(stats.totalAmount / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      <div className="space-y-4">
        {requests
          .filter((r) => r.status === activeNav)
          .map((request) => (
            <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getIcon(request.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold capitalize">{request.type}</p>
                            <Badge variant="outline">{request.referenceId}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Requested by: {request.requester}</p>
                          <p className="text-sm text-muted-foreground">For approval by: {request.currentApprover}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-semibold font-mono">${parseFloat(request.amount).toLocaleString()}</p>
                          <Badge>{request.status.toUpperCase()}</Badge>
                        </div>
                        {status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => approveMutation.mutate(request.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectMutation.mutate(request.id)}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {requests.filter((r) => r.status === status).length === 0 && (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  No {status} approval requests
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
