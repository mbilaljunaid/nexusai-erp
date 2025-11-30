import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clipboard } from "lucide-react";

export default function AuditManagement() {
  const audits = [
    { id: "a1", type: "Financial", module: "Finance", findings: "Minor discrepancies in GL", severity: "low", status: "closed" },
    { id: "a2", type: "Operational", module: "HR", findings: "Leave records incomplete", severity: "medium", status: "open" },
    { id: "a3", type: "IT", module: "Security", findings: "Access controls need review", severity: "high", status: "in-progress" },
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><Clipboard className="h-8 w-8" />Audit Management</h1><p className="text-muted-foreground mt-2">Track audit findings and corrective actions</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Audits</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Closed</p><p className="text-2xl font-bold text-green-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-blue-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Open</p><p className="text-2xl font-bold text-red-600">1</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Audit Findings</CardTitle></CardHeader><CardContent className="space-y-3">{audits.map((a) => (<div key={a.id} className="p-3 border rounded-lg hover-elevate" data-testid={`audit-${a.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{a.type} Audit</h3><Badge variant={a.severity === "high" ? "destructive" : a.severity === "medium" ? "secondary" : "default"}>{a.severity}</Badge></div><p className="text-sm text-muted-foreground">Module: {a.module} • Findings: {a.findings} • Status: {a.status}</p></div>))}</CardContent></Card>
    </div>
  );
}
