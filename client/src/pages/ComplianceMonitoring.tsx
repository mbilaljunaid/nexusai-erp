import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function ComplianceMonitoring() {
  const rules = [
    { id: "r1", name: "SoD - Approver cannot be Requestor", module: "Finance", status: "active", violations: 0, lastChecked: "Nov 30, 10:15 AM" },
    { id: "r2", name: "Field Access - Salary restricted to HR", module: "HR", status: "active", violations: 2, lastChecked: "Nov 30, 10:10 AM" },
    { id: "r3", name: "Data Export - Audit trail required", module: "Analytics", status: "active", violations: 0, lastChecked: "Nov 30, 10:05 AM" },
    { id: "r4", name: "Role Change - Manager approval required", module: "Admin", status: "inactive", violations: 0, lastChecked: "Nov 29, 08:00 PM" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          Compliance Monitoring
        </h1>
        <p className="text-muted-foreground mt-2">Monitor compliance rules and violations</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Active Rules</p>
            <p className="text-2xl font-bold">{rules.filter(r => r.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Total Violations</p>
            <p className="text-2xl font-bold text-red-600">{rules.reduce((sum, r) => sum + r.violations, 0)}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Compliance Score</p>
            <p className="text-2xl font-bold text-green-600">98%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Compliance Rules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="p-3 border rounded-lg hover-elevate" data-testid={`rule-${rule.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{rule.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.violations === 0 ? "default" : "destructive"}>
                    {rule.violations} violations
                  </Badge>
                  <Badge variant={rule.status === "active" ? "default" : "secondary"}>{rule.status}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Module: {rule.module} • Last checked: {rule.lastChecked}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
