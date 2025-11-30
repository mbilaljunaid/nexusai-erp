import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function ComplianceGovernance() {
  const rules = [
    { id: "c1", name: "Data Privacy Regulation", jurisdiction: "GDPR", status: "active", riskLevel: "high" },
    { id: "c2", name: "Financial Reporting", jurisdiction: "SOX", status: "active", riskLevel: "high" },
    { id: "c3", name: "Labor Compliance", jurisdiction: "Local", status: "active", riskLevel: "medium" },
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><CheckCircle2 className="h-8 w-8" />Compliance & Governance</h1><p className="text-muted-foreground mt-2">Manage regulatory compliance and policies</p></div>
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Active Rules</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">High Risk</p><p className="text-2xl font-bold text-red-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Compliant</p><p className="text-2xl font-bold text-green-600">100%</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Compliance Rules</CardTitle></CardHeader><CardContent className="space-y-3">{rules.map((r) => (<div key={r.id} className="p-3 border rounded-lg hover-elevate" data-testid={`rule-${r.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{r.name}</h3><Badge variant={r.riskLevel === "high" ? "destructive" : "secondary"}>{r.riskLevel}</Badge></div><p className="text-sm text-muted-foreground">Jurisdiction: {r.jurisdiction} • Status: {r.status}</p></div>))}</CardContent></Card>
    </div>
  );
}
