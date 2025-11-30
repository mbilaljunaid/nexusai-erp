import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function RiskManagement() {
  const risks = [
    { id: "r1", description: "Data breach vulnerability", likelihood: "medium", impact: "high", score: "8.5", status: "open" },
    { id: "r2", description: "Supply chain disruption", likelihood: "low", impact: "high", score: "6.0", status: "mitigated" },
    { id: "r3", description: "Regulatory non-compliance", likelihood: "high", impact: "medium", score: "7.5", status: "open" },
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><AlertTriangle className="h-8 w-8" />Risk Management</h1><p className="text-muted-foreground mt-2">Track and mitigate organizational risks</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Risks</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Open</p><p className="text-2xl font-bold text-red-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Mitigated</p><p className="text-2xl font-bold text-green-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Avg Score</p><p className="text-2xl font-bold">7.3</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Risk Register</CardTitle></CardHeader><CardContent className="space-y-3">{risks.map((r) => (<div key={r.id} className="p-3 border rounded-lg hover-elevate" data-testid={`risk-${r.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{r.description}</h3><Badge variant={r.status === "open" ? "destructive" : "default"}>{r.status}</Badge></div><p className="text-sm text-muted-foreground">Likelihood: {r.likelihood} • Impact: {r.impact} • Score: {r.score}</p></div>))}</CardContent></Card>
    </div>
  );
}
