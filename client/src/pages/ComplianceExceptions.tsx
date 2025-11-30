import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus } from "lucide-react";

export default function ComplianceExceptions() {
  const exceptions = [
    { id: "e1", rule: "SoD - Approver cannot be Requestor", user: "alice@company.com", status: "pending", reason: "Emergency approval needed", createdAt: "Nov 30, 10:00 AM" },
    { id: "e2", rule: "Field Access - Salary restricted to HR", user: "bob@company.com", status: "approved", reason: "Audit purposes", approvedBy: "admin@company.com", createdAt: "Nov 29, 02:30 PM" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertCircle className="h-8 w-8" />
          Compliance Exceptions
        </h1>
        <p className="text-muted-foreground mt-2">Manage compliance rule exceptions and approvals</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-request-exception">
            <Plus className="h-4 w-4" />
            Request Exception
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Exceptions</p>
            <p className="text-2xl font-bold">{exceptions.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600">{exceptions.filter(e => e.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{exceptions.filter(e => e.status === "approved").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Exception Requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {exceptions.map((exc) => (
            <div key={exc.id} className="p-3 border rounded-lg hover-elevate" data-testid={`exception-${exc.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{exc.rule}</h3>
                <Badge variant={exc.status === "approved" ? "default" : exc.status === "pending" ? "secondary" : "outline"}>{exc.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">User: {exc.user} • Reason: {exc.reason}</p>
              {exc.approvedBy && <p className="text-xs text-muted-foreground mt-1">Approved by: {exc.approvedBy}</p>}
              <p className="text-xs text-muted-foreground mt-1">{exc.createdAt}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
