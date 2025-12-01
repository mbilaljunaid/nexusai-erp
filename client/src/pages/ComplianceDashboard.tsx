import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getFormMetadata } from "@/lib/formMetadata";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface ComplianceRule {
  id: string;
  name: string;
  framework: string;
  requirement: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  automationLevel: 'full' | 'partial' | 'manual';
}

interface ComplianceViolation {
  id: string;
  ruleId: string;
  severity: string;
  violationDate: Date;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export default function ComplianceDashboard() {
  const formMetadata = getFormMetadata("compliance");
  
  const { data: rules = [] } = useQuery<ComplianceRule[]>({
    queryKey: ["/api/compliance/rules"]
      fetch("http://localhost:3001/api/compliance/rules", { credentials: "include" }).then((r) =>
        r.json()
      )
  });

  const { data: violations = [] } = useQuery<ComplianceViolation[]>({
    queryKey: ["/api/compliance/violations"]
      fetch("http://localhost:3001/api/compliance/violations", { credentials: "include" }).then((r) =>
        r.json()
      )
  });

  const openViolations = violations.filter((v) => v.status === "open");
  const frameworkSet = new Set(rules.map((r) => r.framework));
  const frameworks = Array.from(frameworkSet);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div>
        <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
        <p className="text-muted-foreground mt-2">Monitor regulatory compliance across your organization</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{rules.length}</div>
              <p className="text-sm text-muted-foreground">Active Rules</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{openViolations.length}</div>
              <p className="text-sm text-muted-foreground">Open Violations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(((rules.length - openViolations.length) / rules.length) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Compliance Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{frameworks.length}</div>
              <p className="text-sm text-muted-foreground">Frameworks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Rules by Framework */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules.length === 0 ? (
              <p className="text-muted-foreground text-sm">Loading compliance rules...</p>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{rule.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{rule.requirement}</div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{rule.framework}</Badge>
                      <Badge className={getSeverityColor(rule.severity)}>{rule.severity}</Badge>
                      <Badge variant="outline">{rule.automationLevel}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-enforce-${rule.id}`}>
                    Enforce
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Open Violations */}
      {openViolations.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Critical Violations Requiring Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openViolations.map((violation) => (
                <div key={violation.id} className="p-3 bg-white border border-red-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-red-700">{violation.description}</div>
                      <div className="text-sm text-muted-foreground mt-1">Rule: {violation.ruleId}</div>
                    </div>
                    <Badge className="bg-red-600">Open</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2" data-testid={`button-resolve-${violation.id}`}>
                    Create Corrective Action
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
