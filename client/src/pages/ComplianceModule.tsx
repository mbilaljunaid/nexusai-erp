import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function ComplianceModule() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance & Risk</h1>
        <p className="text-muted-foreground">Manage controls, policies, and assessments</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Controls</p>
              <p className="text-3xl font-bold mt-2">48</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold mt-1">92%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Risks</p>
                <p className="text-2xl font-bold mt-1">3</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Next Audit</p>
              <p className="text-2xl font-bold mt-1">45 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Frameworks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { framework: "SOC 2 Type II", status: "compliant", lastAudit: "Q3 2023" },
              { framework: "ISO 27001", status: "in-progress", lastAudit: "Q4 2023" },
              { framework: "GDPR", status: "compliant", lastAudit: "Q1 2024" },
            ].map((f) => (
              <div key={f.framework} className="p-3 border rounded">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-sm">{f.framework}</p>
                  <Badge variant={f.status === "compliant" ? "default" : "outline"}>
                    {f.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Assessed: {f.lastAudit}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Register</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { risk: "Data Breach", likelihood: "Medium", impact: "Critical" },
              { risk: "System Downtime", likelihood: "Low", impact: "High" },
              { risk: "Compliance Violation", likelihood: "Low", impact: "Critical" },
            ].map((r) => (
              <div key={r.risk} className="p-3 border rounded">
                <p className="font-medium text-sm">{r.risk}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <Badge variant="outline">{r.likelihood}</Badge>
                  <Badge variant="outline">{r.impact}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
