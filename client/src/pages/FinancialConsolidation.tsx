import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export default function FinancialConsolidation() {
  const entities = [
    { id: "e1", name: "Acme Corp", parent: "Group", method: "Full", currency: "USD", status: "consolidated" },
    { id: "e2", name: "Acme EU", parent: "Acme Corp", method: "Proportionate", currency: "EUR", status: "pending" },
    { id: "e3", name: "Acme Asia", parent: "Acme Corp", method: "Equity", currency: "SGD", status: "consolidated" },
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><Building2 className="h-8 w-8" />Financial Consolidation</h1><p className="text-muted-foreground mt-2">Manage multi-entity consolidation</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Entities</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Consolidated</p><p className="text-2xl font-bold text-green-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Consolidation</p><p className="text-2xl font-bold">67%</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Entity Hierarchy</CardTitle></CardHeader><CardContent className="space-y-3">{entities.map((e) => (<div key={e.id} className="p-3 border rounded-lg hover-elevate" data-testid={`entity-${e.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{e.name}</h3><Badge variant={e.status === "consolidated" ? "default" : "secondary"}>{e.status}</Badge></div><p className="text-sm text-muted-foreground">Parent: {e.parent} • Method: {e.method} • Currency: {e.currency}</p></div>))}</CardContent></Card>
    </div>
  );
}
