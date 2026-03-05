import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconNavigation } from "@/components/IconNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Shield, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

export default function Compliance() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: Shield, color: "text-blue-500" },
    { id: "standards", label: "Standards", icon: CheckCircle, color: "text-green-500" },
    { id: "audits", label: "Audits", icon: AlertTriangle, color: "text-yellow-500" },
    { id: "risks", label: "Risk Assessment", icon: TrendingUp, color: "text-red-500" },
  ];

  return (
    <StandardPage
      title="Compliance & Audits"
      description="Monitor regulatory compliance and audit activities"
    >

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">4</p>
                  <p className="text-xs text-muted-foreground">Certifications</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">98%</p>
                  <p className="text-xs text-muted-foreground">Compliance Score</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">2</p>
                  <p className="text-xs text-muted-foreground">Open Issues</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">1</p>
                  <p className="text-xs text-muted-foreground">Medium Risk</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "SOC 2 Type II", status: "compliant" },
                { name: "GDPR", status: "compliant" },
                { name: "HIPAA", status: "compliant" },
                { name: "ISO 27001", status: "in_progress" },
              ].map((standard) => (
                <div key={standard.name} className="flex items-center justify-between p-3 rounded-md border">
                  <span className="font-medium text-sm">{standard.name}</span>
                  <StatusBadge status={standard.status} label={standard.status === "compliant" ? "Compliant" : "In Progress"} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "standards" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Standards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "SOC 2 Type II", framework: "Security", status: "compliant", expiry: "2025-06-15", coverage: "98%" },
              { name: "GDPR", framework: "Data Privacy", status: "compliant", expiry: "Ongoing", coverage: "100%" },
              { name: "HIPAA", framework: "Healthcare", status: "compliant", expiry: "2025-12-31", coverage: "97%" },
              { name: "ISO 27001", framework: "Security", status: "in_progress", expiry: "2025-03-30", coverage: "82%" },
              { name: "PCI DSS", framework: "Payment", status: "compliant", expiry: "2025-08-20", coverage: "99%" },
            ].map((standard) => (
              <div key={standard.name} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{standard.name}</p>
                    <p className="text-xs text-muted-foreground">{standard.framework}</p>
                  </div>
                  <StatusBadge status={standard.status} label={standard.status === "compliant" ? "Compliant" : "In Progress"} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Coverage: {standard.coverage}</span>
                  <span>Expires: {standard.expiry}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeNav === "audits" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audit Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "A001", name: "Internal Security Audit", type: "Internal", date: "2024-12-15", status: "scheduled", findings: 0 },
              { id: "A002", name: "GDPR Compliance Review", type: "External", date: "2024-11-30", status: "in_progress", findings: 2 },
              { id: "A003", name: "Financial Controls Test", type: "Internal", date: "2024-11-20", status: "completed", findings: 1 },
              { id: "A004", name: "Data Privacy Assessment", type: "Internal", date: "2024-11-10", status: "completed", findings: 0 },
            ].map((audit) => (
              <div key={audit.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{audit.name}</p>
                    <p className="text-xs text-muted-foreground">{audit.type} • {audit.date}</p>
                  </div>
                  <StatusBadge status={audit.status} />
                </div>
                <p className="text-xs text-muted-foreground">{audit.findings} findings</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeNav === "risks" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "R001", name: "Data Breach Risk", severity: "high", probability: "15%", impact: "Critical", status: "active", controls: 4 },
              { id: "R002", name: "Access Control Gap", severity: "medium", probability: "25%", impact: "High", status: "active", controls: 2 },
              { id: "R003", name: "Backup Failure", severity: "medium", probability: "8%", impact: "High", status: "active", controls: 3 },
              { id: "R004", name: "Regulatory Change", severity: "low", probability: "40%", impact: "Medium", status: "monitoring", controls: 1 },
            ].map((risk) => (
              <div key={risk.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{risk.name}</p>
                    <p className="text-xs text-muted-foreground">Impact: {risk.impact} • Probability: {risk.probability}</p>
                  </div>
                  <StatusBadge status={risk.severity} />
                </div>
                <p className="text-xs text-muted-foreground">{risk.controls} controls in place</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </StandardPage>
  );
}
